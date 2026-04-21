/**
 * 데이터 접근 레이어 (Repository Pattern)
 *
 * 현재: mockData.js의 인메모리 상태값 반환
 * 추후 DB 연동 시: 이 파일의 각 함수 내부만 교체 (예: Prisma, Supabase, InfluxDB 등)
 * 인터페이스(함수 시그니처)는 변경하지 않음.
 *
 * Write 확장 시: 아래 주석된 write 함수들을 구현하면 됩니다.
 */

import { state, STATIC, getEvents } from './mockData.js'

// ── Read ──────────────────────────────────────────────────────

export function readStatus() {
  return {
    system:      STATIC.system.name,
    site:        STATIC.system.site,
    siteId:      STATIC.system.siteId,
    status:      'normal',
    uptime_pct:  state.uptime_pct,
    lastUpdated: state.lastUpdated,
  }
}

export function readCo2() {
  return {
    capture: {
      today_kg:            state.todayCo2_kg,
      month_kg:            state.monthCo2_kg,
      efficiency_pct:      STATIC.capture.efficiency_pct,
      captureTemp_C:       state.captureTemp_C,
      extractPressure_bar: state.extractPressure_bar,
    },
    credits: {
      accumulated_KAU:       state.credits_KAU,
      kETS_price_KRW_per_ton: STATIC.revenue.carbonMarket.kETS_current_KRW_per_ton,
      CBAM_price_EUR_per_ton:  STATIC.revenue.carbonMarket.cbam_q1_2026_EUR_per_ton,
    },
    lastUpdated: state.lastUpdated,
  }
}

export function readAlgae() {
  return {
    culture: {
      o2Purity_pct:      state.o2Purity_pct,
      biomassMonth_g:    state.biomassMonth_g,
      pH:                state.culturePH,
      temp_C:            state.cultureTemp_C,
      lux:               state.lux,
      co2Input_L_per_min: STATIC.capture.co2Input_L_per_min,
      species:           STATIC.algae.species,
    },
    products:    STATIC.algae.products,
    lastUpdated: state.lastUpdated,
  }
}

export function readRevenue() {
  return {
    monthly: {
      caas_KRW:      STATIC.revenue.caas_KRW,
      breakdown_pct: STATIC.revenue.breakdown_pct,
    },
    financials:   STATIC.revenue.financials,
    carbonMarket: STATIC.revenue.carbonMarket,
    lastUpdated:  state.lastUpdated,
  }
}

export function readEvents() {
  return {
    events:      getEvents(),
    lastUpdated: new Date().toISOString(),
  }
}

export function readAll() {
  return {
    system:  { status: 'normal', uptime_pct: state.uptime_pct },
    co2:     { today_kg: state.todayCo2_kg, month_kg: state.monthCo2_kg, credits_KAU: state.credits_KAU },
    algae:   { o2Purity_pct: state.o2Purity_pct, biomassMonth_g: state.biomassMonth_g, pH: state.culturePH },
    revenue: { caas_KRW: STATIC.revenue.caas_KRW, bep_years: STATIC.revenue.financials.bep_years_median, sroi_20yr: STATIC.revenue.financials.sroi_20yr },
    lastUpdated: state.lastUpdated,
  }
}

// ── Write (stub — 추후 구현) ──────────────────────────────────
// export async function writeAlarm(type, message) { ... }
// export async function writeThreshold(metric, value) { ... }
