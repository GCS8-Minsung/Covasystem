import { useEffect, useState } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'

const SIZE = 160
const STROKE = 10
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function VitalityGauge({ value = 0, label = '', isInView = false }) {
  const progress = useMotionValue(0)
  const dashOffset = useTransform(
    progress,
    [0, 100],
    [CIRCUMFERENCE, CIRCUMFERENCE * (1 - value / 100)]
  )
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (isInView) {
      const ctrl = animate(progress, value, {
        duration: 1.6,
        ease: 'easeOut',
        onUpdate: v => setDisplay(Math.round(v)),
      })
      return () => ctrl.stop()
    } else {
      progress.set(0)
      setDisplay(0)
    }
  }, [isInView, value])

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} className="-rotate-90">
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
          </defs>
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="rgba(134,239,172,0.30)"
            strokeWidth={STROKE}
          />
          <motion.circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            style={{ strokeDashoffset: dashOffset }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-on-surface">{display}</span>
          <span className="text-xs text-on-surface/50 mt-0.5">%</span>
        </div>
      </div>
      {label && (
        <span className="text-sm text-on-surface/60 font-medium">{label}</span>
      )}
    </div>
  )
}
