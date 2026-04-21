import MetricCard from './MetricCard'
import AIInsightCard from './AIInsightCard'
import AlgaeViz3D from './AlgaeViz3D'
import { useLanguage } from '../../hooks/useLanguage'

function SpecRow({ label, value, unit, highlight }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-outline-variant/10 last:border-0">
      <span className="text-sm text-on-surface/60">{label}</span>
      <span className={`text-sm font-semibold ${highlight ? 'text-primary' : 'text-on-surface'}`}>
        {value} <span className="text-xs font-normal text-on-surface/40">{unit}</span>
      </span>
    </div>
  )
}

export default function AlgaeDetail({ data }) {
  const { t } = useLanguage()
  const species = [
    { name: 'Spirulina', desc: '식품등급 단백질', price: '$100~244/kg', growth: 88, color: '#16a34a' },
    { name: 'Chlorella', desc: '고농도 CO₂ 내성 90%', price: 'CO₂ 고정용', growth: 72, color: '#86efac' },
    { name: 'Haematococcus', desc: '아스타잔틴 추출원', price: '$2,500~7,000/kg', growth: 55, color: '#22d3ee' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-on-surface mb-1">{t.dashboard.algae}</h2>
        <p className="text-sm text-on-surface/40">Flat-panel PBR · LED+태양광 하이브리드 · 40ft 컨테이너</p>
      </div>
      <AIInsightCard tab="algae" />
      <AlgaeViz3D data={data} />

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon="bubble_chart" label="O₂ 생산 순도" value={data.o2Purity.toFixed(1)} unit="%" accent="secondary" />
        <MetricCard icon="eco" label="이달 바이오매스" value={data.biomassMonth.toFixed(1)} unit="g" accent="primary" />
        <MetricCard icon="water_ph" label="배양기 pH" value={data.culturePH.toFixed(2)} unit="pH" accent="neutral" />
        <MetricCard icon="device_thermostat" label="배양 온도" value={data.cultureTemp.toFixed(1)} unit="°C" accent="neutral" />
      </div>

      {/* Species */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {species.map(sp => (
          <div key={sp.name} className="glass-panel rounded-2xl p-5 glow-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-on-surface">{sp.name}</span>
              <span className="text-xs text-on-surface/40">{sp.desc}</span>
            </div>
            <div className="mb-3">
              <div className="flex justify-between text-xs text-on-surface/40 mb-1">
                <span>생장률</span><span>{sp.growth}%</span>
              </div>
              <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${sp.growth}%`, backgroundColor: sp.color }} />
              </div>
            </div>
            <p className="text-xs font-medium" style={{ color: sp.color }}>{sp.price}</p>
          </div>
        ))}
      </div>

      {/* Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-panel rounded-2xl p-5 glow-shadow">
          <p className="text-xs font-medium text-on-surface/40 uppercase tracking-wider mb-4">배양기 실시간 계측</p>
          <SpecRow label="pH" value={data.culturePH.toFixed(2)} unit="" highlight />
          <SpecRow label="배양 온도" value={`${data.cultureTemp.toFixed(1)}°C`} unit="" />
          <SpecRow label="LED 조도" value={`${data.lux.toLocaleString()} lux`} unit="" />
          <SpecRow label="CO₂ 주입" value="4.2 L/min" unit="" highlight />
          <SpecRow label="O₂ 순도" value={`${data.o2Purity.toFixed(1)}%`} unit="" highlight />
        </div>
        <div className="glass-panel rounded-2xl p-5 glow-shadow">
          <p className="text-xs font-medium text-on-surface/40 uppercase tracking-wider mb-4">바이오소재 생산 사양</p>
          <SpecRow label="CO₂ 고정 비율" value="1.65~2.0 kg" unit="CO₂/kg" highlight />
          <SpecRow label="Spirulina 생산성" value="20~30 g/m²" unit="/day" />
          <SpecRow label="연 생산량 (추정)" value="2~10 t" unit="/컨테이너" />
          <SpecRow label="피코시아닌 E40" value="$500~1,000" unit="/kg" highlight />
          <SpecRow label="아스타잔틴 5%" value="$5,000~7,000" unit="/kg" highlight />
        </div>
      </div>

      {/* Failure cases learned */}
      <div className="glass-panel rounded-2xl p-5 glow-shadow">
        <p className="text-xs font-medium text-on-surface/40 uppercase tracking-wider mb-4">산업 교훈 (IDEA.md §4.4)</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { co: 'Sapphire Energy', lesson: '바이오연료 commodity → 실패. Cova는 고부가 니치 집중' },
            { co: 'DIC·Cyanotech', lesson: '아스타잔틴·스피룰리나 고부가 집중으로 생존 → Cova 전략과 일치' },
          ].map(item => (
            <div key={item.co} className="bg-on-surface/5 rounded-xl p-3">
              <p className="text-xs font-semibold text-secondary mb-1">{item.co}</p>
              <p className="text-xs text-on-surface/50">{item.lesson}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
