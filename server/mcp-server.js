/**
 * Cova MCP/API 데이터 서버
 * AI 모델(Claude, GPT 등)이 대시보드 데이터를 구조화된 JSON으로 읽을 수 있도록 제공
 *
 * 실행: node server/mcp-server.js
 * 기본 포트: 3001
 * CORS: http://localhost:5173 허용
 */

import http from 'http'

const PORT = process.env.PORT || 3001

// ── 데모 데이터 생성기 ──────────────────────────────────────
function jitter(base, range) {
  return +(base + (Math.random() * 2 - 1) * range).toFixed(3)
}

let state = {
  todayCo2_kg: 13.7,
  monthCo2_kg: 317.4,
  o2Purity_pct: 98.4,
  uptime_pct: 97.2,
  biomassMonth_g: 192.3,
  credits_KAU: 0.4300,
  captureTemp_C: 42.3,
  culturePH: 7.80,
  cultureTemp_C: 26.5,
  lux: 4200,
  extractPressure_bar: 73.2,
  lastUpdated: new Date().toISOString(),
}

// 3초마다 수치 변동
setInterval(() => {
  state = {
    todayCo2_kg:          jitter(13.7, 0.3),
    monthCo2_kg:          +(state.monthCo2_kg + 0.01).toFixed(2),
    o2Purity_pct:         jitter(98.4, 0.2),
    uptime_pct:           jitter(97.2, 0.5),
    biomassMonth_g:       +(state.biomassMonth_g + 0.05).toFixed(2),
    credits_KAU:          +(state.credits_KAU + 0.0001).toFixed(4),
    captureTemp_C:        jitter(42.3, 0.8),
    culturePH:            jitter(7.80, 0.05),
    cultureTemp_C:        jitter(26.5, 0.4),
    lux:                  Math.round(jitter(4200, 150)),
    extractPressure_bar:  jitter(73.2, 0.6),
    lastUpdated:          new Date().toISOString(),
  }
}, 3000)

// ── 라우트 정의 ────────────────────────────────────────────
const ROUTES = {
  'GET /api/status': () => ({
    system: 'Cova Container System',
    site: 'Demo Site — 여수 1호 (발효공장)',
    status: 'normal',
    uptime_pct: state.uptime_pct,
    lastUpdated: state.lastUpdated,
    schema: {
      uptime_pct: 'number — 시스템 가동률 (%)',
      status: 'string — normal|warning|error',
    },
  }),

  'GET /api/co2': () => ({
    capture: {
      today_kg: state.todayCo2_kg,
      month_kg: state.monthCo2_kg,
      efficiency_pct: 94.2,
      captureTemp_C: state.captureTemp_C,
      extractPressure_bar: state.extractPressure_bar,
    },
    credits: {
      accumulated_KAU: state.credits_KAU,
      kETS_price_KRW_per_ton: 16000,
      CBAM_price_EUR_per_ton: 75.36,
    },
    schema: {
      today_kg: 'number — 오늘 포집한 CO₂ (kg)',
      month_kg: 'number — 이달 누적 포집량 (kg)',
      efficiency_pct: 'number — 포집 효율 (%)',
      accumulated_KAU: 'number — 누적 탄소 크레딧 (KAU)',
    },
    lastUpdated: state.lastUpdated,
  }),

  'GET /api/algae': () => ({
    culture: {
      o2Purity_pct: state.o2Purity_pct,
      biomassMonth_g: state.biomassMonth_g,
      pH: state.culturePH,
      temp_C: state.cultureTemp_C,
      lux: state.lux,
      co2Input_L_per_min: 4.2,
      species: ['Spirulina', 'Chlorella', 'Haematococcus'],
    },
    products: [
      { name: 'Spirulina',     priceRange: '$100~244/kg',     grade: 'food-grade' },
      { name: 'Phycocyanin',   priceRange: '$300~1000/kg',    grade: 'E40 food-grade' },
      { name: 'Astaxanthin',   priceRange: '$2500~7000/kg',   grade: 'natural, EU-approved' },
    ],
    schema: {
      o2Purity_pct: 'number — O₂ 생산 순도 (%)',
      biomassMonth_g: 'number — 이달 바이오매스 생산량 (g)',
      pH: 'number — 배양기 pH',
    },
    lastUpdated: state.lastUpdated,
  }),

  'GET /api/revenue': () => ({
    monthly: {
      caas_KRW: 15000000,
      breakdown_pct: { biomass: 50, caas: 30, credits: 5, rnd: 15 },
    },
    financials: {
      bep_years_median: 3.4,
      irr_10yr_pct: 14,
      npv_10yr_KRW_million: 800,
      sroi_20yr: 1.34,
    },
    carbonMarket: {
      kETS_current_KRW_per_ton: 16000,
      kETS_2030_forecast_KRW_per_ton: 30000,
      cbam_q1_2026_EUR_per_ton: 75.36,
    },
    schema: {
      caas_KRW: 'number — 월 CaaS 구독료 (원)',
      bep_years_median: 'number — 손익분기점 (년)',
      sroi_20yr: 'number — 사회적 투자수익률 (20년)',
    },
    lastUpdated: state.lastUpdated,
  }),

  'GET /api/events': () => ({
    events: [
      { time: new Date().toISOString(), type: 'info', msg: '포집기 필터 자동 세척 완료' },
      { time: new Date(Date.now() - 60000).toISOString(), type: 'success', msg: '배양기 pH 자동 보정 완료' },
      { time: new Date(Date.now() - 180000).toISOString(), type: 'info', msg: '시스템 정상 가동 확인' },
    ],
    schema: { type: 'string — info|success|warning|error' },
  }),

  'GET /api/all': () => ({
    system: { status: 'normal', uptime_pct: state.uptime_pct },
    co2: { today_kg: state.todayCo2_kg, month_kg: state.monthCo2_kg, credits_KAU: state.credits_KAU },
    algae: { o2Purity_pct: state.o2Purity_pct, biomassMonth_g: state.biomassMonth_g, pH: state.culturePH },
    revenue: { caas_KRW: 15000000, bep_years: 3.4, sroi_20yr: 1.34 },
    lastUpdated: state.lastUpdated,
  }),
}

// ── HTTP 서버 ───────────────────────────────────────────────
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Content-Type', 'application/json; charset=utf-8')

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return }

  const routeKey = `${req.method} ${req.url.split('?')[0]}`
  const handler = ROUTES[routeKey]

  if (handler) {
    res.writeHead(200)
    res.end(JSON.stringify(handler(), null, 2))
  } else if (req.url === '/' || req.url === '/api') {
    res.writeHead(200)
    res.end(JSON.stringify({
      name: 'Cova MCP Data Server',
      version: '1.0.0',
      endpoints: Object.keys(ROUTES).map(k => k.replace('GET ', '')),
      description: 'AI-readable structured data for Cova Container System dashboard',
    }, null, 2))
  } else {
    res.writeHead(404)
    res.end(JSON.stringify({ error: 'Not found', available: Object.keys(ROUTES) }))
  }
})

server.listen(PORT, () => {
  console.log(`Cova MCP Server running at http://localhost:${PORT}`)
  console.log('Endpoints:', Object.keys(ROUTES).map(k => k.replace('GET ', '')).join(', '))
})
