"""
Cova FastAPI 백엔드 서버

실행: uvicorn server.main:app --reload --port 8000
또는: python -m uvicorn server.main:app --reload --port 8000

Swagger UI: http://localhost:8000/docs
ReDoc:       http://localhost:8000/redoc
"""

from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import secrets
import random
import os
import math
from datetime import datetime, timezone
from typing import Optional, Annotated
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

# ── 앱 초기화 ─────────────────────────────────────────────────────

app = FastAPI(
    title="Cova API",
    description="""
## Cova 컨테이너 시스템 — AI 접근 가능 구조화 데이터 API

탄소 포집 → 미세조류 → 바이오소재 전 공정의 실시간 데이터를 제공합니다.

### 인증
모든 데이터 엔드포인트는 `X-API-Key` 헤더가 필요합니다.
키 발급: `POST /api/auth/generate-key`

### MCP 연동
Claude Desktop / Claude Code에서 `server/mcp.js`를 stdio 서버로 연결하면
자연어로 대시보드 데이터를 조회할 수 있습니다.
""",
    version="2.0.0",
    contact={"name": "Cova System", "email": "admin@covasystem.co.kr"},
    openapi_tags=[
        {"name": "auth",   "description": "API 키 발급 및 관리"},
        {"name": "system", "description": "시스템 상태 및 가동률"},
        {"name": "data",   "description": "CO₂·미세조류·수익 실시간 데이터"},
    ],
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── 인메모리 저장소 (데모용) ───────────────────────────────────────

key_store: dict[str, dict] = {}

USERS: dict[str, dict] = {
    "admin@covasystem.co.kr": {
        "password": "1q2w3e4r!",
        "id":       "admin-001",
        "siteId":   "demo-site-01",
        "name":     "Cova Admin",
    },
}

# ── 유틸리티 ─────────────────────────────────────────────────────

def jitter(base: float, range_val: float) -> float:
    return round(base + (random.random() * 2 - 1) * range_val, 3)

def now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

def get_live() -> dict:
    return {
        "todayCo2_kg":         jitter(13.7, 0.3),
        "monthCo2_kg":         317.4,
        "o2Purity_pct":        jitter(98.4, 0.2),
        "uptime_pct":          jitter(97.2, 0.5),
        "biomassMonth_g":      jitter(192.3, 0.5),
        "credits_KAU":         0.4300,
        "captureTemp_C":       jitter(42.3, 0.8),
        "culturePH":           jitter(7.80, 0.05),
        "cultureTemp_C":       jitter(26.5, 0.4),
        "lux":                 round(jitter(4200, 150)),
        "extractPressure_bar": jitter(73.2, 0.6),
    }

# ── 인증 의존성 ───────────────────────────────────────────────────

async def require_api_key(
    x_api_key: Annotated[Optional[str], Header()] = None,
) -> dict:
    if not x_api_key:
        raise HTTPException(
            status_code=401,
            detail="X-API-Key 헤더가 필요합니다. POST /api/auth/generate-key 로 키를 발급받으세요.",
        )
    caller = key_store.get(x_api_key)
    if not caller:
        raise HTTPException(
            status_code=403,
            detail="유효하지 않거나 만료된 API 키입니다.",
        )
    return caller

# ── 인증 엔드포인트 ───────────────────────────────────────────────

class KeyRequest(BaseModel):
    email: str
    password: str

@app.post(
    "/api/auth/generate-key",
    tags=["auth"],
    summary="API 키 발급",
    description="이메일과 비밀번호로 API 키를 발급합니다. 기존 키는 즉시 무효화됩니다.",
)
async def generate_key(req: KeyRequest):
    user = USERS.get(req.email)
    if not user or user["password"] != req.password:
        raise HTTPException(status_code=401, detail="이메일 또는 비밀번호가 올바르지 않습니다.")

    # 이전 키 폐기
    revoke = [k for k, v in key_store.items() if v["email"] == req.email]
    for k in revoke:
        del key_store[k]

    raw     = secrets.token_hex(24)
    api_key = f"cova_live_{raw}"
    created = now_iso()
    key_store[api_key] = {
        "userId":    user["id"],
        "email":     req.email,
        "siteId":    user["siteId"],
        "createdAt": created,
    }

    return {
        "apiKey":    api_key,
        "userId":    user["id"],
        "email":     req.email,
        "siteId":    user["siteId"],
        "createdAt": created,
        "note":      "이 키를 안전하게 보관하세요. 재발급 시 이전 키는 무효화됩니다.",
    }

# ── 데이터 엔드포인트 ─────────────────────────────────────────────

@app.get(
    "/api/status",
    tags=["system"],
    summary="시스템 상태",
    description="Cova 컨테이너 시스템의 전체 상태와 가동률을 반환합니다.",
)
async def get_status(caller: dict = Depends(require_api_key)):
    d = get_live()
    return {
        "system":      "Cova Container System",
        "site":        "Demo Site — 여수 1호 (발효공장)",
        "siteId":      "demo-site-01",
        "status":      "normal",
        "uptime_pct":  d["uptime_pct"],
        "lastUpdated": now_iso(),
    }

@app.get(
    "/api/co2",
    tags=["data"],
    summary="CO₂ 포집 데이터",
    description="CO₂ 포집 현황 (오늘/월간 포집량, 포집 효율, 탄소 크레딧)을 반환합니다.",
)
async def get_co2(caller: dict = Depends(require_api_key)):
    d = get_live()
    return {
        "capture": {
            "today_kg":            d["todayCo2_kg"],
            "month_kg":            d["monthCo2_kg"],
            "efficiency_pct":      94.2,
            "captureTemp_C":       d["captureTemp_C"],
            "extractPressure_bar": d["extractPressure_bar"],
        },
        "credits": {
            "accumulated_KAU":       d["credits_KAU"],
            "kETS_price_KRW_per_ton": 16000,
            "CBAM_price_EUR_per_ton":  75.36,
        },
        "lastUpdated": now_iso(),
    }

@app.get(
    "/api/algae",
    tags=["data"],
    summary="미세조류 배양 데이터",
    description="미세조류 배양 데이터 (O₂ 순도, 바이오매스, pH, 조도, 파생 제품)를 반환합니다.",
)
async def get_algae(caller: dict = Depends(require_api_key)):
    d = get_live()
    return {
        "culture": {
            "o2Purity_pct":       d["o2Purity_pct"],
            "biomassMonth_g":     d["biomassMonth_g"],
            "pH":                 d["culturePH"],
            "temp_C":             d["cultureTemp_C"],
            "lux":                d["lux"],
            "co2Input_L_per_min": 4.2,
            "species":            ["Spirulina", "Chlorella", "Haematococcus"],
        },
        "products": [
            {"name": "Spirulina",   "priceRange": "$100~244/kg",   "grade": "food-grade"},
            {"name": "Phycocyanin", "priceRange": "$300~1000/kg",  "grade": "E40 food-grade"},
            {"name": "Astaxanthin", "priceRange": "$2500~7000/kg", "grade": "natural, EU-approved"},
        ],
        "lastUpdated": now_iso(),
    }

@app.get(
    "/api/revenue",
    tags=["data"],
    summary="수익 현황",
    description="수익 현황 (CaaS 구독료, 탄소 시장 가격, 재무 KPI: BEP·IRR·NPV·SROI)을 반환합니다.",
)
async def get_revenue(caller: dict = Depends(require_api_key)):
    return {
        "monthly": {
            "caas_KRW":     15_000_000,
            "breakdown_pct": {"biomass": 50, "caas": 30, "credits": 5, "rnd": 15},
        },
        "financials": {
            "bep_years_median":      3.4,
            "irr_10yr_pct":          14,
            "npv_10yr_KRW_million":  800,
            "sroi_20yr":             1.34,
        },
        "carbonMarket": {
            "kETS_current_KRW_per_ton":       16000,
            "kETS_2030_forecast_KRW_per_ton": 30000,
            "cbam_q1_2026_EUR_per_ton":       75.36,
        },
        "lastUpdated": now_iso(),
    }

@app.get(
    "/api/events",
    tags=["data"],
    summary="시스템 이벤트 로그",
    description="최근 시스템 이벤트 로그 (포집기 세척, pH 보정, 알람 등)를 반환합니다.",
)
async def get_events(caller: dict = Depends(require_api_key)):
    t = now_iso()
    return {
        "events": [
            {"time": t,  "type": "info",    "msg": "포집기 필터 자동 세척 완료"},
            {"time": t,  "type": "success", "msg": "배양기 pH 자동 보정 완료"},
            {"time": t,  "type": "info",    "msg": "시스템 정상 가동 확인"},
        ],
        "lastUpdated": t,
    }

@app.get(
    "/api/all",
    tags=["data"],
    summary="전체 지표 (단일 호출)",
    description="모든 대시보드 지표를 단일 호출로 반환합니다. 전체 현황 파악에 사용하세요.",
)
async def get_all(caller: dict = Depends(require_api_key)):
    d = get_live()
    return {
        "system":  {"status": "normal", "uptime_pct": d["uptime_pct"]},
        "co2":     {"today_kg": d["todayCo2_kg"], "month_kg": d["monthCo2_kg"], "credits_KAU": d["credits_KAU"]},
        "algae":   {"o2Purity_pct": d["o2Purity_pct"], "biomassMonth_g": d["biomassMonth_g"], "pH": d["culturePH"]},
        "revenue": {"caas_KRW": 15_000_000, "bep_years": 3.4, "sroi_20yr": 1.34},
        "lastUpdated": now_iso(),
    }

# ── AI 엔드포인트 ─────────────────────────────────────────────────

INSIGHT_PROMPTS = {
    "overview": "전체 시스템 현황을 2~3문장으로 요약해주세요. CO₂ 포집량, O₂ 순도, 가동률을 핵심으로 다루되 인사이트와 주의사항을 포함하세요.",
    "capture":  "탄소 포집 현황을 2~3문장으로 분석해주세요. 포집 효율, 온도, 압력 데이터를 바탕으로 최적화 제안을 포함하세요.",
    "algae":    "미세조류 배양 현황을 2~3문장으로 분석해주세요. pH, 온도, 조도, O₂ 순도를 기반으로 배양 상태 평가와 개선점을 제시하세요.",
    "revenue":  "수익 현황을 2~3문장으로 분석해주세요. CaaS 수익, BEP, SROI를 중심으로 재무 건전성과 투자 전략 인사이트를 포함하세요.",
}

def build_system_context(data: dict) -> str:
    return f"""당신은 Cova 탄소 포집 시스템의 AI 어드바이저입니다. 미세조류 기반 탄소 포집·바이오소재 생산 전문 AI입니다.
친절하고 전문적이며 간결하게 답변하세요. 한국어로 답변하세요.

현재 시스템 실시간 데이터:
- 오늘 CO₂ 포집량: {data.get('todayCo2_kg', 13.7):.1f} kg
- 이달 누적 CO₂: {data.get('monthCo2_kg', 317.4):.1f} kg
- O₂ 순도: {data.get('o2Purity_pct', 98.4):.1f}%
- 시스템 가동률: {data.get('uptime_pct', 97.2):.1f}%
- 이달 바이오매스: {data.get('biomassMonth_g', 192.3):.1f} g
- 포집 효율: 94.2%
- 포집기 온도: {data.get('captureTemp_C', 42.3):.1f}°C
- 배양기 pH: {data.get('culturePH', 7.8):.2f}
- 배양기 온도: {data.get('cultureTemp_C', 26.5):.1f}°C
- 조도: {data.get('lux', 4200)} lux
- 추출기 압력: {data.get('extractPressure_bar', 73.2):.1f} bar
- 탄소 크레딧: {data.get('credits_KAU', 0.43):.4f} KAU
- CaaS 월 수익: 1,500만원
- BEP: 3.4년 / IRR: 14% / SROI: 1.34:1"""

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []

class ReportRequest(BaseModel):
    report_type: str = "investor"
    language: str = "ko"

def get_openai_client():
    api_key = os.getenv("OPENAI_API_KEY", "")
    if not api_key:
        raise HTTPException(status_code=503, detail="OPENAI_API_KEY가 설정되지 않았습니다. .env 파일을 확인하세요.")
    return OpenAI(api_key=api_key)

@app.post(
    "/api/ai/chat",
    tags=["ai"],
    summary="AI 탄소 어드바이저 채팅",
    description="현재 시스템 데이터를 기반으로 GPT-5 Mini가 질문에 답변합니다.",
)
async def ai_chat(req: ChatRequest):
    client = get_openai_client()
    data = get_live()

    messages = [{"role": "system", "content": build_system_context(data)}]
    messages += [{"role": m.role, "content": m.content} for m in req.history[-6:]]
    messages.append({"role": "user", "content": req.message})

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        max_tokens=2000,
    )
    content = response.choices[0].message.content or "죄송합니다, 응답을 생성하지 못했습니다."
    return {"reply": content, "model": "gpt-4o-mini"}

@app.get(
    "/api/ai/insight/{tab}",
    tags=["ai"],
    summary="탭별 AI 인사이트",
    description="대시보드 탭에 맞는 AI 인사이트를 현재 데이터 기반으로 생성합니다.",
)
async def ai_insight(tab: str):
    client = get_openai_client()
    prompt = INSIGHT_PROMPTS.get(tab, INSIGHT_PROMPTS["overview"])
    data = get_live()

    response = client.chat.completions.create(
        model="gpt-5-mini",
        messages=[
            {"role": "system", "content": build_system_context(data)},
            {"role": "user", "content": prompt},
        ],
        max_completion_tokens=1000,
    )
    return {"insight": response.choices[0].message.content, "tab": tab}

@app.post(
    "/api/ai/report",
    tags=["ai"],
    summary="ESG 보고서 자동 생성",
    description="현재 데이터 기반으로 ESG 보고서(투자자용/규제용)를 자동 생성합니다.",
)
async def ai_report(req: ReportRequest):
    client = get_openai_client()
    data = get_live()

    type_prompts = {
        "investor": """투자자를 위한 ESG 보고서를 작성해주세요. 다음 섹션을 포함하세요:
1. 경영 요약 (Executive Summary)
2. 탄소 포집 성과 및 환경 임팩트
3. 재무 성과 (수익, BEP, IRR, SROI)
4. 리스크 분석 및 기회 요소
5. 향후 전망 및 투자 포인트
마크다운 형식으로 작성하세요. 한국어로 작성하세요.""",
        "regulatory": """규제 당국(K-ETS, CBAM)을 위한 환경 보고서를 작성해주세요. 다음 섹션을 포함하세요:
1. 탄소 감축 실적 및 검증 데이터
2. 탄소 크레딧 발행 현황 (KAU)
3. CBAM 대응 현황 및 계획
4. 미세조류 배양 환경 데이터
5. 규정 준수 선언
마크다운 형식으로 작성하세요. 한국어로 작성하세요.""",
    }

    prompt = type_prompts.get(req.report_type, type_prompts["investor"])
    response = client.chat.completions.create(
        model="gpt-5-mini",
        messages=[
            {"role": "system", "content": build_system_context(data)},
            {"role": "user", "content": prompt},
        ],
        max_completion_tokens=5000,
    )
    return {
        "report": response.choices[0].message.content,
        "report_type": req.report_type,
        "generated_at": now_iso(),
    }

# ── CO₂ 예측 엔드포인트 ───────────────────────────────────────────

@app.get(
    "/api/predict/co2",
    tags=["data"],
    summary="CO₂ 포집량 7일 예측",
    description="지수평활법 기반 향후 7일 CO₂ 포집량 예측값을 반환합니다.",
)
async def predict_co2():
    base = 13.7
    alpha = 0.3
    history = [jitter(base, 0.5) for _ in range(14)]

    smoothed = history[0]
    for v in history[1:]:
        smoothed = alpha * v + (1 - alpha) * smoothed

    predictions = []
    now = datetime.now(timezone.utc)
    for i in range(1, 8):
        trend = 0.08 * i
        noise = (random.random() - 0.4) * 0.3
        val = round(smoothed + trend + noise, 2)
        predictions.append({
            "day": i,
            "date": now.strftime(f"%m/{(now.day + i) % 31 or 1:02d}"),
            "predicted_kg": val,
            "lower_kg": round(val * 0.92, 2),
            "upper_kg": round(val * 1.08, 2),
        })

    return {
        "baseline_kg": round(smoothed, 2),
        "method": "exponential_smoothing",
        "predictions": predictions,
        "lastUpdated": now_iso(),
    }

# ── 루트 ─────────────────────────────────────────────────────────

@app.get("/", include_in_schema=False)
async def root():
    return {
        "name":        "Cova API Server",
        "version":     "2.0.0",
        "docs":        "http://localhost:8000/docs",
        "redoc":       "http://localhost:8000/redoc",
        "description": "AI-readable structured data for Cova Container System dashboard",
        "auth":        "X-API-Key 헤더 필수. 키 발급: POST /api/auth/generate-key",
        "endpoints":   [
            "/api/status", "/api/co2", "/api/algae",
            "/api/revenue", "/api/events", "/api/all",
        ],
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server.main:app", host="0.0.0.0", port=8000, reload=True)
