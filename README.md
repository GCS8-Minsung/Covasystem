# Cova System — Atmospheric Vitality

> GCS(Green Carbon Solution)의 탄소 포집 컨테이너 시스템을 소개하는 인터랙티브 웹 플랫폼.  
> 탄소 포집 → 미세조류 → 산소/바이오소재 순환 프로세스를 스크롤 스토리텔링·실시간 대시보드·AI 인사이트로 전달합니다.

---

## 목차

- [프로젝트 소개](#프로젝트-소개)
- [현재 구현 현황](#현재-구현-현황)
- [기술 스택](#기술-스택)
- [로컬 실행](#로컬-실행)
- [테스트 계정](#테스트-계정)
- [향후 방향성 — 로드맵](#향후-방향성--로드맵)
  - [Phase 1: 데이터베이스 전환](#phase-1-데이터베이스-전환)
  - [Phase 2: 디지털 트윈](#phase-2-디지털-트윈)
  - [Phase 3: 실사이트 연동 & 확장](#phase-3-실사이트-연동--확장)
- [디렉토리 구조](#디렉토리-구조)
- [환경 변수](#환경-변수)
- [커밋 컨벤션](#커밋-컨벤션)

---

## 프로젝트 소개

Cova System은 두 개의 레이어로 구성됩니다.

| 레이어 | 설명 |
|--------|------|
| **랜딩페이지** | 스크롤 기반 스토리텔링 + 웹캠 손 인식 미니게임 |
| **운영 대시보드** | 로그인 후 접근 가능한 실시간 CO₂·미세조류·수익 모니터링 |

현재는 **데모 데이터(인메모리 Mock)** 로 구동되며, 3초마다 센서값에 미세 지터(jitter)를 적용해 실시간감을 시뮬레이션합니다.

---

## 현재 구현 현황

### 랜딩페이지
- Hero / Capture / Algae / HUD / Game 5개 섹션 스크롤 스토리텔링
- Framer Motion 스크롤 진입 애니메이션 (fade-up + stagger)
- MediaPipe Hands 웹캠 미니게임 (손 제스처 탄소 포집) + 마우스 폴백
- 한/영 실시간 언어 전환
- 다크 글래스모피즘 디자인 시스템

### 운영 대시보드
- JWT 없는 단순 인메모리 인증 (데모용)
- CO₂ 포집 트렌드·예측 차트 (Recharts)
- 미세조류 3D 시각화 (Three.js)
- AI 인사이트 패널 (OpenAI GPT-4o 연동)
- 이벤트 로그, 시스템 상태, 수익 분석
- API 키 발급 및 관리
- 보고서 자동 생성

### 백엔드 API (FastAPI)
- `GET /api/co2`, `/api/algae`, `/api/revenue`, `/api/status`, `/api/events`
- X-API-Key 헤더 인증
- OpenAI 기반 AI 인사이트 생성 (`POST /api/ai/insight`)
- MCP(Model Context Protocol) 서버 통합 — Claude에서 자연어로 데이터 조회 가능

---

## 기술 스택

### 프론트엔드

| 분류 | 기술 | 버전 | 용도 |
|------|------|------|------|
| 프레임워크 | React | 18.3 | 컴포넌트 기반 UI |
| 빌드 도구 | Vite | 5.4 | 빠른 HMR, 경량 번들 |
| 라우팅 | React Router DOM | 7.14 | SPA 페이지 전환 (랜딩 ↔ 대시보드) |
| 스타일 | Tailwind CSS | 3.4 | 유틸리티 클래스 + 커스텀 디자인 토큰 |
| 애니메이션 | Framer Motion | 11.0 | 스크롤 진입 애니메이션, spring 물리 |
| 3D 렌더링 | Three.js | 0.184 | 미세조류 3D 시각화 |
| 3D React 바인딩 | React Three Fiber | 8.18 | Three.js를 React 컴포넌트로 사용 |
| 3D 헬퍼 | @react-three/drei | 9.122 | OrbitControls, 조명 프리셋 등 |
| 손 인식 | MediaPipe Hands | 0.4 | 웹캠 21개 랜드마크 실시간 인식 |
| 게임 렌더링 | HTML5 Canvas API | 네이티브 | 60fps 파티클 탄소 포집 게임 |
| 국제화 | React Context | 자체 구현 | 한/영 실시간 전환 (외부 라이브러리 없음) |

### 백엔드

| 분류 | 기술 | 버전 | 용도 |
|------|------|------|------|
| 프레임워크 | FastAPI | 0.110+ | REST API 서버, Swagger 자동 생성 |
| 서버 | Uvicorn | 0.29+ | ASGI 고성능 서버 |
| AI | OpenAI SDK | 1.0+ | GPT-4o 기반 AI 인사이트·보고서 생성 |
| 환경 변수 | python-dotenv | 1.0+ | `.env` 로드 |
| MCP 서버 | @modelcontextprotocol/sdk | 1.29 | Claude에서 자연어로 데이터 조회 |

### 인프라 / 도구

| 분류 | 기술 | 용도 |
|------|------|------|
| 패키지 관리 | npm | 프론트엔드 의존성 |
| 배포 대상 | Vercel | HTTPS 자동 제공 (MediaPipe 웹캠 보안 요구) |
| 버전 관리 | Git + GitHub | 소스 코드 관리 |

---

## 로컬 실행

### 1. 환경 변수 설정

```bash
cp .env.example .env
# .env 편집: OPENAI_API_KEY 입력
```

### 2. 프론트엔드

```bash
npm install
npm run dev
# → http://localhost:5173
```

### 3. 백엔드 API (선택)

```bash
pip install -r requirements.txt
uvicorn server.main:app --reload --port 8000
# Swagger UI → http://localhost:8000/docs
```

> 백엔드 없이도 대시보드는 Mock 데이터로 동작합니다.

---

## 테스트 계정

대시보드 로그인에 사용할 수 있는 데모 계정입니다.

| 항목 | 값 |
|------|-----|
| **이메일** | `admin@covasystem.co.kr` |
| **비밀번호** | `1q2w3e4r!` |
| **역할** | Admin |
| **사이트** | Demo Site — 여수 1호 (발효공장) |

> 이 계정은 데모 전용이며, 실제 운영 환경에서는 DB 기반 해시 인증으로 교체됩니다.

---

## 향후 방향성 — 로드맵

### Phase 1: 데이터베이스 전환

현재 모든 데이터는 인메모리 Mock(`server/data/mockData.js`)에서 생성됩니다.  
실사이트 연동을 위해 다음 구조로 전환할 계획입니다.

```
인메모리 Mock (현재)
    ↓
PostgreSQL + TimescaleDB (시계열 센서 데이터)
    ↓
Redis (실시간 캐시 / 알림 큐)
```

**구현 방향**

| 테이블 | 용도 |
|--------|------|
| `sites` | 사이트(컨테이너) 마스터 |
| `users` | 사용자 + bcrypt 해시 비밀번호 |
| `api_keys` | 발급된 API 키 + 권한 범위 |
| `sensor_logs` | CO₂·온도·pH·조도 시계열 (TimescaleDB hypertable) |
| `events` | 알림 이벤트 로그 |
| `revenue_snapshots` | 일별 크레딧·수익 스냅샷 |

`server/data/repository.js`의 인터페이스(get/set 함수 시그니처)를 유지한 채 내부 구현만 DB 쿼리로 교체하면 API 레이어는 수정 없이 전환 가능하도록 설계되어 있습니다.

---

### Phase 2: 디지털 트윈

Cova 컨테이너의 **물리적 공정 전체를 웹에서 실시간으로 재현**하는 디지털 트윈을 구축합니다.

#### 아키텍처 개요

```
[물리 센서] ──MQTT/WebSocket──▶ [Edge Gateway]
                                      │
                              [데이터 수집 서버]
                             (TimescaleDB 적재)
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                   ▼
             [REST API]        [WebSocket]         [AI 분석엔진]
                    │                 │                   │
                    └─────────────────┴─────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                   ▼
           [3D 트윈 뷰어]     [대시보드 차트]      [AI 인사이트]
           (Three.js/R3F)    (Recharts RT)       (GPT-4o)
```

#### 디지털 트윈 3D 뷰어

- **Three.js / React Three Fiber** 기반 컨테이너 3D 모델
- 각 공정 구역(포집부·배양부·추출부)을 클릭하면 해당 센서 패널 팝업
- 센서 수치에 따라 색상 히트맵 실시간 변화 (정상: 녹색 → 경고: 황색 → 위험: 적색)
- 현재 구현된 `AlgaeViz3D.jsx`를 확장하여 전체 컨테이너 모델로 발전

#### 공정별 모니터링 대상

| 공정 | 주요 파라미터 |
|------|-------------|
| CO₂ 포집부 | 포집 온도, 포집 압력, 일일 CO₂ 처리량(kg) |
| 미세조류 배양부 | 배양액 pH, 배양 온도, 조도(lux), 바이오매스(g/월) |
| 바이오소재 추출부 | 추출 압력(bar), O₂ 순도(%), 수율 |
| 시스템 전체 | 가동률(uptime), 탄소 크레딧(KAU), 월 수익 |

#### 예측 모델 (AI 트윈)

- 과거 센서 데이터로 **7일 후 CO₂ 포집량·수익 예측** (현재 `Co2PredictChart.jsx`에 Mock 구현)
- GPT-4o에 시계열 데이터를 컨텍스트로 제공 → 이상 징후 조기 탐지 및 운영 제언
- 향후 **Prophet / LSTM 기반 자체 예측 엔진**으로 전환

---

### Phase 3: 실사이트 연동 & 확장

| 항목 | 내용 |
|------|------|
| **다중 사이트** | 여수 1호 외 추가 컨테이너를 하나의 대시보드에서 관리 |
| **모바일 앱** | React Native로 현장 작업자용 알림·점검 앱 |
| **탄소 크레딧 마켓** | KAU 크레딧 거래 내역 연동 및 자동 정산 |
| **외부 인증** | OAuth 2.0 (Google / Kakao) + RBAC 권한 체계 |
| **Vercel 배포** | HTTPS + Edge Network → MediaPipe 웹캠 HTTPS 요구 충족 |

---

## 디렉토리 구조

```
GCS-Proj/
├── src/
│   ├── components/
│   │   ├── dashboard/       # 운영 대시보드 컴포넌트
│   │   ├── game/            # 미니게임 1 (MediaPipe 탄소 포집)
│   │   ├── game2/           # 미니게임 2 (팩토리 시뮬레이션)
│   │   ├── layout/          # Navbar, ScrollProgress
│   │   ├── sections/        # 랜딩페이지 섹션 5개
│   │   └── ui/              # GlassCard, VitalityGauge, LanguageToggle
│   ├── auth/                # 인증 컨텍스트 + 로그인 페이지
│   ├── hooks/               # useLanguage, useScrollAnimation
│   ├── i18n/                # ko.js, en.js (다국어)
│   └── styles/              # globals.css (글래스모피즘 유틸리티)
├── server/
│   ├── main.py              # FastAPI 앱 + 엔드포인트
│   ├── mcp.js               # MCP stdio 서버 (Claude 연동)
│   ├── data/
│   │   ├── mockData.js      # 인메모리 Mock 상태 + jitter
│   │   └── repository.js    # 데이터 접근 인터페이스 (DB 전환 대상)
│   └── middleware/
│       └── auth.js          # API 키 발급·검증
├── docs/                    # PRD, TSD, 설계 문서, 참조 HTML
├── .env.example             # 환경 변수 템플릿
└── .gitignore
```

---

## 환경 변수

`.env.example`을 복사해 `.env`로 생성 후 값을 입력하세요.

```env
VITE_API_URL=http://localhost:8000   # 백엔드 API 주소
OPENAI_API_KEY=your_openai_api_key   # AI 인사이트·보고서 생성에 필요
```

> `.env`는 `.gitignore`에 등록되어 있어 절대 커밋되지 않습니다.

---

## 커밋 컨벤션

```
feat(HeroSection): 스크롤 큐 bounce 애니메이션 추가
fix(CarbonGame): 파티클 벽 반사 오류 수정
style(Navbar): 모바일 햄버거 메뉴 간격 조정
refactor(VitalityGauge): SVG 애니메이션 훅 분리
docs(README): 로드맵 업데이트
```

---

> **Cova System** — Carbon to Life.  
> Green Carbon Solution · GCS8 Team · 2025
