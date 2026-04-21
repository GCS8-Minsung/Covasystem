import MetricCard from './MetricCard'
import AIInsightCard from './AIInsightCard'
import { useLanguage } from '../../hooks/useLanguage'

function SensorRow({ label, value, unit, color = 'text-on-surface' }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-outline-variant/10 last:border-0">
      <span className="text-sm text-on-surface/60">{label}</span>
      <span className={`text-sm font-bold ${color}`}>{value} <span className="text-xs font-normal text-on-surface/40">{unit}</span></span>
    </div>
  )
}

export default function CaptureDetail({ data }) {
  const { t } = useLanguage()
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-on-surface mb-1">{t.dashboard.capture}</h2>
        <p className="text-sm text-on-surface/40">포집 모듈 (20ft) · 배양 모듈 (40ft) · 추출 모듈 (40ft)</p>
      </div>
      <AIInsightCard tab="capture" />

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon="air" label="오늘 포집량" value={data.todayCo2.toFixed(1)} unit="kg" accent="primary" />
        <MetricCard icon="calendar_month" label="이달 누적" value={data.monthCo2.toFixed(1)} unit="kg" accent="primary" />
        <MetricCard icon="speed" label="포집 효율" value="94.2" unit="%" accent="secondary" />
        <MetricCard icon="thermostat" label="포집기 온도" value={data.captureTemp.toFixed(1)} unit="°C" accent="neutral" />
      </div>

      {/* Modules status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { name: '포집 모듈 (20ft)', icon: 'air', status: '정상', co2: '배가스 직결', temp: `${data.captureTemp.toFixed(1)}°C`, note: '고체흡착제 기반 포집' },
          { name: '배양 모듈 (40ft)', icon: 'eco', status: '정상', co2: `pH ${data.culturePH.toFixed(2)}`, temp: `${data.cultureTemp.toFixed(1)}°C`, note: 'Spirulina / Chlorella 배양 중' },
          { name: '추출 모듈 (40ft)', icon: 'science', status: '정상', co2: `${data.extractPressure.toFixed(1)} bar`, temp: '31.1°C', note: 'scCO₂ 추출 공정 진행 중' },
        ].map(mod => (
          <div key={mod.name} className="glass-panel rounded-2xl p-5 glow-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">{mod.icon}</span>
                <span className="text-sm font-semibold text-on-surface">{mod.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-xs text-primary">{mod.status}</span>
              </div>
            </div>
            <SensorRow label="주요 지표" value={mod.co2} unit="" />
            <SensorRow label="온도" value={mod.temp} unit="" />
            <p className="text-xs text-on-surface/30 mt-3">{mod.note}</p>
          </div>
        ))}
      </div>

      {/* Flow diagram */}
      <div className="glass-panel rounded-2xl p-5 glow-shadow">
        <p className="text-xs font-medium text-on-surface/40 uppercase tracking-wider mb-4">포집 공정 흐름</p>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {['배가스 입력', 'CO₂ 포집', '미세조류 배양', '바이오매스 추출', '출하'].map((step, i, arr) => (
            <div key={step} className="flex items-center gap-2 shrink-0">
              <div className="bg-primary/15 border border-primary/30 rounded-xl px-4 py-2 text-xs text-primary font-medium">{step}</div>
              {i < arr.length - 1 && <span className="text-on-surface/20 text-lg">→</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Key specs */}
      <div className="glass-panel rounded-2xl p-5 glow-shadow">
        <p className="text-xs font-medium text-on-surface/40 uppercase tracking-wider mb-4">기술 사양 (IDEA.md 기준)</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
          <SensorRow label="CO₂ 포집 효율" value="94" unit="%" color="text-primary" />
          <SensorRow label="연간 CO₂ 감축" value="2~10 t" unit="/컨테이너" />
          <SensorRow label="고정 비율" value="1.65~2.0 kg" unit="CO₂/kg 바이오매스" />
          <SensorRow label="Chlorella CO₂ 내성" value="90" unit="% vol" color="text-primary" />
          <SensorRow label="포집 압력 (scCO₂)" value={data.extractPressure.toFixed(1)} unit="bar" />
          <SensorRow label="LED 조도" value={data.lux.toLocaleString()} unit="lux" />
        </div>
      </div>
    </div>
  )
}
