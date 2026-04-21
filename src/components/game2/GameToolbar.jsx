import { DEVICE, DEVICE_ICON, DEVICE_LABEL, BUILDABLE } from './gameConstants'

export default function GameToolbar({ selected, onSelect }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap justify-center">
      {BUILDABLE.map((key) => {
        const icon = key === 'bulldoze' ? '🔨' : DEVICE_ICON[key]
        const label = key === 'bulldoze' ? '철거' : DEVICE_LABEL[key] || key
        const isSelected = selected === key
        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            title={label}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl border transition-all text-xs ${
              isSelected
                ? 'bg-primary/20 border-primary text-primary shadow-[0_0_12px_rgba(107,251,154,0.25)]'
                : 'bg-white/5 border-white/10 text-on-surface/60 hover:border-primary/30 hover:text-on-surface hover:bg-white/10'
            }`}
          >
            <span className="text-lg leading-none">{icon}</span>
            <span className="hidden sm:block whitespace-nowrap">{label}</span>
          </button>
        )
      })}
    </div>
  )
}
