import MetricCard from './MetricCard'
import AIInsightCard from './AIInsightCard'
import { useLanguage } from '../../hooks/useLanguage'

function ScenarioCard({ label, bep, irr, npv, sroi, highlight }) {
  return (
    <div className={`glass-panel rounded-2xl p-4 glow-shadow ${highlight ? 'border border-primary/30' : ''}`}>
      <p className={`text-xs font-semibold mb-3 ${highlight ? 'text-primary' : 'text-on-surface/60'}`}>{label}</p>
      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between"><span className="text-on-surface/40">BEP</span><span className="font-mono text-on-surface">{bep}</span></div>
        <div className="flex justify-between"><span className="text-on-surface/40">IRR 10yr</span><span className="font-mono text-on-surface">{irr}</span></div>
        <div className="flex justify-between"><span className="text-on-surface/40">NPV 10yr</span><span className="font-mono text-on-surface">{npv}</span></div>
        <div className="flex justify-between"><span className="text-on-surface/40">SROI 20yr</span><span className={`font-mono ${highlight ? 'text-primary' : 'text-on-surface'}`}>{sroi}</span></div>
      </div>
    </div>
  )
}

export default function RevenueDetail({ data }) {
  const { t } = useLanguage()
  const revenues = [
    { label: '바이오매스 판매', y1: '50%', y3: '60%', price: '$100~7,000/kg',    color: '#16a34a' },
    { label: 'CaaS 구독료',    y1: '30%', y3: '25%', price: '₩500~2,000만/site', color: '#0284c7' },
    { label: '탄소 크레딧',    y1: '5%',  y3: '10%', price: 'K-ETS ₩1~5만/t',   color: '#0ea5e9' },
    { label: 'R&D 지원',       y1: '15%', y3: '5%',  price: '연 5~20억',         color: '#86efac' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-on-surface mb-1">{t.dashboard.revenue}</h2>
        <p className="text-sm text-on-surface/40">CaaS 수익 구조 · K-ETS/CBAM 모멘텀 · SROI 1.34:1 (중도)</p>
      </div>
      <AIInsightCard tab="revenue" />

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon="payments" label="CaaS 월 구독료" value="1,500" unit="만원" accent="secondary" />
        <MetricCard icon="token" label="탄소 크레딧" value={data.credits.toFixed(4)} unit="KAU" accent="neutral" />
        <MetricCard icon="trending_up" label="BEP (중도)" value="3.4" unit="년" accent="primary" />
        <MetricCard icon="social_distance" label="SROI 20yr" value="1.34" unit=":1" accent="primary" />
      </div>

      {/* Revenue mix */}
      <div className="glass-panel rounded-2xl p-5 glow-shadow">
        <p className="text-xs font-medium text-on-surface/40 uppercase tracking-wider mb-4">수익원 구성</p>
        <div className="space-y-4">
          {revenues.map(r => (
            <div key={r.label}>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-on-surface/70 font-medium">{r.label}</span>
                <div className="flex gap-4">
                  <span className="text-on-surface/40">Y1: <span className="font-bold" style={{ color: r.color }}>{r.y1}</span></span>
                  <span className="text-on-surface/40">Y3: <span className="font-bold" style={{ color: r.color }}>{r.y3}</span></span>
                </div>
              </div>
              <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: r.y1, backgroundColor: r.color, opacity: 0.8 }} />
              </div>
              <p className="text-xs text-on-surface/30 mt-1">{r.price}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scenario comparison */}
      <div>
        <p className="text-xs font-medium text-on-surface/40 uppercase tracking-wider mb-3">1-Site 시나리오 비교 (IDEA.md §6)</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ScenarioCard label="보수 시나리오" bep="8.5년" irr="2%" npv="-4억원" sroi="0.4:1" />
          <ScenarioCard label="중도 시나리오 ★" bep="3.4년" irr="14%" npv="+8억원" sroi="1.34:1" highlight />
          <ScenarioCard label="낙관 시나리오" bep="1.9년" irr="29%" npv="+18억원" sroi="3.72:1" />
        </div>
      </div>

      {/* Carbon market */}
      <div className="glass-panel rounded-2xl p-5 glow-shadow">
        <p className="text-xs font-medium text-on-surface/40 uppercase tracking-wider mb-4">탄소 시장 현황</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {[
            { label: 'K-ETS (현재)', value: '₩1.6~1.8만', sub: '/톤 (2026 Q1)' },
            { label: 'K-ETS (2030)', value: '₩3~5만', sub: '/톤 (전망)' },
            { label: 'EU CBAM', value: '€75.36', sub: '/tCO₂ (Q1 2026)' },
            { label: 'US SCC', value: '$190', sub: '/tCO₂ (EPA 2023)' },
          ].map(item => (
            <div key={item.label} className="bg-on-surface/5 rounded-xl p-3">
              <p className="text-xs text-on-surface/40 mb-1">{item.label}</p>
              <p className="text-sm font-bold text-primary">{item.value}</p>
              <p className="text-xs text-on-surface/30">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
