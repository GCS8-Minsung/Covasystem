import { useState, useEffect, useRef } from 'react'

function jitter(base, range) {
  return +(base + (Math.random() * 2 - 1) * range).toFixed(2)
}

function buildTrend(len = 30) {
  return Array.from({ length: len }, (_, i) => ({
    t: i,
    v: jitter(13.7, 2.5),
  }))
}

export const REVENUE_BREAKDOWN = [
  { label: '바이오매스 판매', labelEn: 'Biomass Sales', value: 50, color: '#16a34a' },
  { label: 'CaaS 구독료',    labelEn: 'CaaS Sub',      value: 30, color: '#0284c7' },
  { label: '탄소 크레딧',    labelEn: 'Carbon Credits', value: 5,  color: '#0ea5e9' },
  { label: 'R&D 지원',       labelEn: 'R&D',            value: 15, color: '#86efac' },
]

export function useDemoData() {
  const [data, setData] = useState({
    todayCo2: 13.7,       // kg
    monthCo2: 317.4,      // kg
    o2Purity: 98.4,       // %
    uptime: 97.2,         // %
    biomassMonth: 192.3,  // g
    credits: 0.43,        // KAU
    monthRevenue: 15000000, // ₩
    captureTemp: 42.3,    // °C
    culturePH: 7.8,
    cultureTemp: 26.5,    // °C
    lux: 4200,            // lux
    extractPressure: 73.2, // bar
    trend: buildTrend(),
    events: [
      { id: 1, time: '10:42', msg: '포집기 필터 자동 세척 완료', type: 'info' },
      { id: 2, time: '10:15', msg: 'CO₂ 주입량 최적화 적용', type: 'info' },
      { id: 3, time: '09:53', msg: '배양기 pH 자동 보정 (7.6 → 7.8)', type: 'success' },
      { id: 4, time: '09:30', msg: '시스템 정상 가동 확인', type: 'success' },
    ],
  })

  const tickRef = useRef(0)
  const eventsRef = useRef(data.events)

  useEffect(() => {
    const EVENT_POOL = [
      { msg: 'CO₂ 포집 효율 94.2% 달성', type: 'success' },
      { msg: '배양기 조도 자동 조절', type: 'info' },
      { msg: '추출기 압력 정상 범위 유지', type: 'info' },
      { msg: '바이오매스 생산량 목표 80% 달성', type: 'success' },
      { msg: '배관 유량 점검 완료', type: 'info' },
      { msg: '탄소크레딧 발행 처리 중', type: 'info' },
    ]

    const interval = setInterval(() => {
      tickRef.current += 1
      const tick = tickRef.current

      setData(prev => {
        const newTrend = [
          ...prev.trend.slice(1),
          { t: prev.trend[prev.trend.length - 1].t + 1, v: jitter(13.7, 2.5) },
        ]

        const newEvents = tick % 8 === 0
          ? (() => {
              const ev = EVENT_POOL[Math.floor(Math.random() * EVENT_POOL.length)]
              const now = new Date()
              const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
              const newEv = { id: Date.now(), time: timeStr, ...ev }
              return [newEv, ...prev.events].slice(0, 8)
            })()
          : prev.events

        return {
          ...prev,
          todayCo2: jitter(13.7, 0.3),
          monthCo2: +(prev.monthCo2 + 0.01).toFixed(2),
          o2Purity: jitter(98.4, 0.2),
          uptime: jitter(97.2, 0.5),
          biomassMonth: +(prev.biomassMonth + 0.05).toFixed(2),
          credits: +((prev.credits) + 0.0001).toFixed(4),
          captureTemp: jitter(42.3, 0.8),
          culturePH: jitter(7.8, 0.05),
          cultureTemp: jitter(26.5, 0.4),
          lux: Math.round(jitter(4200, 150)),
          extractPressure: jitter(73.2, 0.6),
          trend: newTrend,
          events: newEvents,
        }
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return data
}
