import { memo } from 'react'
import { useLanguage } from '../../hooks/useLanguage'

function StatusRow({ icon, label, value, unit, warning }) {
  const isWarning = warning && (value > warning.max || value < warning.min)
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-outline-variant/20 last:border-0">
      <div className="flex items-center gap-2.5">
        <span
          className="material-symbols-outlined text-base"
          style={{ color: 'rgba(5,46,22,0.45)', fontVariationSettings: "'FILL' 1" }}
        >
          {icon}
        </span>
        <span className="text-sm font-medium" style={{ color: 'rgba(5,46,22,0.70)' }}>{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span
          className="text-sm font-bold"
          style={{ color: isWarning ? '#d97706' : 'rgba(5,46,22,0.88)', letterSpacing: '-0.01em' }}
        >
          {typeof value === 'number' ? value.toFixed(1) : value}
        </span>
        <span className="text-xs font-medium" style={{ color: 'rgba(5,46,22,0.40)' }}>{unit}</span>
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: isWarning ? '#d97706' : '#16a34a' }}
        />
      </div>
    </div>
  )
}

function SystemStatus({ data }) {
  const { t } = useLanguage()

  return (
    <div className="glass-panel rounded-2xl p-5 glow-shadow">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-medium text-on-surface/40 uppercase tracking-wider">
          {t.dashboard.systemStatus}
        </p>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-xs text-primary">{t.dashboard.statusNormal}</span>
        </div>
      </div>
      <div>
        <StatusRow
          icon="thermostat"
          label={t.dashboard.captureTemp}
          value={data.captureTemp}
          unit="°C"
          warning={{ min: 35, max: 55 }}
        />
        <StatusRow
          icon="water_ph"
          label={t.dashboard.culturePH}
          value={data.culturePH}
          unit="pH"
          warning={{ min: 7.0, max: 8.5 }}
        />
        <StatusRow
          icon="device_thermostat"
          label={t.dashboard.cultureTemp}
          value={data.cultureTemp}
          unit="°C"
          warning={{ min: 22, max: 30 }}
        />
        <StatusRow
          icon="light_mode"
          label={t.dashboard.lux}
          value={data.lux}
          unit="lux"
        />
        <StatusRow
          icon="compress"
          label={t.dashboard.extractPressure}
          value={data.extractPressure}
          unit="bar"
          warning={{ min: 65, max: 85 }}
        />
      </div>
    </div>
  )
}

export default memo(SystemStatus)
