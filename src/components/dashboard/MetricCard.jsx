import { memo } from 'react'

const ACCENT = {
  primary: {
    iconColor: '#15803d',
    iconBg:    'rgba(21,128,61,0.10)',
    value:     '#052e16',
    barColor:  '#15803d',
    barBg:     'rgba(21,128,61,0.12)',
  },
  sky: {
    iconColor: '#0284c7',
    iconBg:    'rgba(2,132,199,0.10)',
    value:     '#052e16',
    barColor:  '#0284c7',
    barBg:     'rgba(2,132,199,0.10)',
  },
  neutral: {
    iconColor: '#166534',
    iconBg:    'rgba(21,128,61,0.07)',
    value:     '#052e16',
    barColor:  '#86efac',
    barBg:     'rgba(134,239,172,0.20)',
  },
}

function MetricCard({ icon, label, value, unit, sub, accent = 'primary', trend }) {
  const a = ACCENT[accent] ?? ACCENT.primary

  return (
    <div className="card rounded-2xl p-5 flex flex-col gap-4 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
      {/* 아이콘 + 트렌드 */}
      <div className="flex items-center justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: a.iconBg }}
        >
          <span
            className="material-symbols-outlined text-lg"
            style={{ color: a.iconColor, fontVariationSettings: "'FILL' 1" }}
          >
            {icon}
          </span>
        </div>
        {trend !== undefined && (
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={trend >= 0
              ? { color: '#15803d', background: 'rgba(21,128,61,0.10)' }
              : { color: '#dc2626', background: 'rgba(220,38,38,0.08)' }
            }
          >
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>

      {/* 수치 */}
      <div className="flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'rgba(5,46,22,0.42)' }}>
          {label}
        </p>
        <div className="flex items-end gap-1.5">
          <span
            className="text-2xl font-bold leading-none"
            style={{ letterSpacing: '-0.025em', color: a.value }}
          >
            {value}
          </span>
          {unit && (
            <span className="text-xs pb-0.5 font-medium" style={{ color: 'rgba(5,46,22,0.45)' }}>
              {unit}
            </span>
          )}
        </div>
        {sub && (
          <p className="text-xs mt-1.5" style={{ color: 'rgba(5,46,22,0.42)' }}>{sub}</p>
        )}
      </div>

      {/* 하단 컬러 바 */}
      <div
        className="h-0.5 w-full rounded-full"
        style={{ background: a.barBg }}
      >
        <div className="h-full w-3/4 rounded-full" style={{ background: a.barColor, opacity: 0.45 }} />
      </div>
    </div>
  )
}

export default memo(MetricCard)
