/**
 * 하드코딩 목 데이터 레이어
 * 실제 DB 연동 시 이 파일의 state/jitter 로직을 DB 쿼리로 교체하고
 * repository.js의 인터페이스만 유지하면 됩니다.
 */

function jitter(base, range) {
  return +(base + (Math.random() * 2 - 1) * range).toFixed(3)
}

export let state = {
  todayCo2_kg:         13.7,
  monthCo2_kg:         317.4,
  o2Purity_pct:        98.4,
  uptime_pct:          97.2,
  biomassMonth_g:      192.3,
  credits_KAU:         0.4300,
  captureTemp_C:       42.3,
  culturePH:           7.80,
  cultureTemp_C:       26.5,
  lux:                 4200,
  extractPressure_bar: 73.2,
  lastUpdated:         new Date().toISOString(),
}

setInterval(() => {
  state = {
    todayCo2_kg:         jitter(13.7, 0.3),
    monthCo2_kg:         +(state.monthCo2_kg + 0.01).toFixed(2),
    o2Purity_pct:        jitter(98.4, 0.2),
    uptime_pct:          jitter(97.2, 0.5),
    biomassMonth_g:      +(state.biomassMonth_g + 0.05).toFixed(2),
    credits_KAU:         +(state.credits_KAU + 0.0001).toFixed(4),
    captureTemp_C:       jitter(42.3, 0.8),
    culturePH:           jitter(7.80, 0.05),
    cultureTemp_C:       jitter(26.5, 0.4),
    lux:                 Math.round(jitter(4200, 150)),
    extractPressure_bar: jitter(73.2, 0.6),
    lastUpdated:         new Date().toISOString(),
  }
}, 3000)

export const STATIC = {
  system: {
    name:   'Cova Container System',
    site:   'Demo Site — 여수 1호 (발효공장)',
    siteId: 'demo-site-01',
  },
  capture: {
    efficiency_pct: 94.2,
    co2Input_L_per_min: 4.2,
  },
  algae: {
    species: ['Spirulina', 'Chlorella', 'Haematococcus'],
    products: [
      { name: 'Spirulina',   priceRange: '$100~244/kg',   grade: 'food-grade' },
      { name: 'Phycocyanin', priceRange: '$300~1000/kg',  grade: 'E40 food-grade' },
      { name: 'Astaxanthin', priceRange: '$2500~7000/kg', grade: 'natural, EU-approved' },
    ],
  },
  revenue: {
    caas_KRW:    15_000_000,
    breakdown_pct: { biomass: 50, caas: 30, credits: 5, rnd: 15 },
    financials: {
      bep_years_median:       3.4,
      irr_10yr_pct:           14,
      npv_10yr_KRW_million:   800,
      sroi_20yr:              1.34,
    },
    carbonMarket: {
      kETS_current_KRW_per_ton:       16000,
      kETS_2030_forecast_KRW_per_ton: 30000,
      cbam_q1_2026_EUR_per_ton:       75.36,
    },
  },
}

const EVENT_POOL = [
  { type: 'info',    msg: '포집기 필터 자동 세척 완료' },
  { type: 'success', msg: 'CO₂ 주입량 최적화 적용' },
  { type: 'success', msg: '배양기 pH 자동 보정 완료' },
  { type: 'info',    msg: '시스템 정상 가동 확인' },
  { type: 'info',    msg: '배양기 조도 자동 조절' },
  { type: 'info',    msg: '추출기 압력 정상 범위 유지' },
  { type: 'success', msg: '바이오매스 생산량 목표 80% 달성' },
  { type: 'info',    msg: '탄소크레딧 발행 처리 중' },
]

let _events = [
  { id: 1, time: new Date(Date.now() - 180_000).toISOString(), type: 'success', msg: '배양기 pH 자동 보정 완료' },
  { id: 2, time: new Date(Date.now() - 60_000).toISOString(),  type: 'info',    msg: 'CO₂ 주입량 최적화 적용' },
  { id: 3, time: new Date().toISOString(),                     type: 'info',    msg: '포집기 필터 자동 세척 완료' },
]

setInterval(() => {
  const ev = EVENT_POOL[Math.floor(Math.random() * EVENT_POOL.length)]
  _events = [{ id: Date.now(), time: new Date().toISOString(), ...ev }, ..._events].slice(0, 20)
}, 24_000)

export function getEvents() {
  return _events
}
