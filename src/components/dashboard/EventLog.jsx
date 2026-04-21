import { memo } from 'react'
import { useLanguage } from '../../hooks/useLanguage'

const typeStyle = {
  success: 'text-primary',
  info: 'text-secondary',
  warning: 'text-amber-600',
  error: 'text-red-500',
}

const typeIcon = {
  success: 'check_circle',
  info: 'info',
  warning: 'warning',
  error: 'error',
}

function EventLog({ events }) {
  const { t } = useLanguage()

  return (
    <div className="glass-panel rounded-2xl p-5 glow-shadow h-full">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-medium text-on-surface/40 uppercase tracking-wider">
          {t.dashboard.eventLog}
        </p>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs text-on-surface/40">{t.dashboard.liveLabel}</span>
        </div>
      </div>
      <ul className="flex flex-col gap-2 overflow-y-auto max-h-48">
        {events.map(ev => (
          <li key={ev.id} className="flex items-start gap-2.5 text-sm">
            <span
              className={`material-symbols-outlined text-base mt-0.5 shrink-0 ${typeStyle[ev.type]}`}
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {typeIcon[ev.type]}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(5,46,22,0.72)' }}>{ev.msg}</p>
            </div>
            <span className="text-xs shrink-0 font-medium" style={{ color: 'rgba(5,46,22,0.42)' }}>{ev.time}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default memo(EventLog)
