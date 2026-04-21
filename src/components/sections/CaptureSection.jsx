import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useScrollAnimation, fadeUpVariants, staggerContainer, scaleUpVariants } from '../../hooks/useScrollAnimation'
import { useLanguage } from '../../hooks/useLanguage'
import GlassCard from '../ui/GlassCard'

function CounterNumber({ target, isInView, suffix = '' }) {
  const [value, setValue] = useState(0)
  const rafRef = useRef(null)

  useEffect(() => {
    if (!isInView) { setValue(0); return }
    const duration = 1400
    const startTime = performance.now()

    const tick = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      setValue(Math.floor(progress * target))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setValue(target)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [isInView, target])

  return <span>{value}{suffix}</span>
}

export default function CaptureSection({ id }) {
  const { ref, isInView } = useScrollAnimation()
  const { t } = useLanguage()

  return (
    <motion.section
      id={id}
      ref={ref}
      className="relative py-24 px-6 overflow-hidden"
      variants={staggerContainer}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
    >
      <div
        className="ambient-glow w-[500px] h-[500px] top-0 right-0 opacity-20"
        style={{ background: 'radial-gradient(circle, #1a7a3c 0%, transparent 70%)' }}
      />

      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div variants={fadeUpVariants} className="mb-4 max-w-2xl">
          <span className="section-label block mb-3">{t.capture.label}</span>
          <h2 className="section-title text-on-surface mb-4">{t.capture.title}</h2>
          <p className="text-on-surface/60 leading-relaxed">{t.capture.desc}</p>
        </motion.div>

        {/* Urgency callout */}
        <motion.div variants={fadeUpVariants} className="mb-10">
          <div className="inline-flex items-center gap-3 glass-panel rounded-full px-5 py-2.5">
            <span className="material-symbols-outlined text-primary text-base">warning</span>
            <span className="text-sm font-semibold text-on-surface/80">{t.capture.urgencyLabel}</span>
            <span className="text-sm text-on-surface/50 hidden md:block">— {t.capture.urgencyDesc}</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* 3-module system — 8 cols */}
          <motion.div variants={scaleUpVariants} className="md:col-span-8">
            <GlassCard className="p-8 h-full">
              <span className="section-label block mb-5">3-MODULE CONTAINER SYSTEM</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {t.capture.modules.map((mod, i) => (
                  <div key={i} className="flex flex-col gap-3 p-4 rounded-xl bg-surface-container-high/40 hover:bg-surface-container-highest/60 transition-colors duration-300">
                    <div className="flex items-center justify-between">
                      <span
                        className="material-symbols-outlined text-primary text-2xl"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {mod.icon}
                      </span>
                      <span className="text-xs font-mono text-on-surface/30 font-semibold">{mod.size}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-on-surface mb-1">{mod.label}</p>
                      <p className="text-xs text-on-surface/50 leading-relaxed">{mod.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Process bar */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-on-surface/40 uppercase tracking-wider">{t.capture.processLabel}</span>
                  <span className="text-xs text-primary font-semibold">75%</span>
                </div>
                <div className="h-1.5 rounded-full bg-outline-variant/20 overflow-hidden">
                  <motion.div
                    className="h-full primary-gradient-bg rounded-full"
                    initial={{ width: 0 }}
                    animate={isInView ? { width: '75%' } : { width: 0 }}
                    transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Right column — 4 cols */}
          <div className="md:col-span-4 flex flex-col gap-6">
            {/* Efficiency metric */}
            <motion.div variants={fadeUpVariants}>
              <GlassCard className="p-6 hover:bg-surface-container-highest/50 transition-colors duration-500">
                <span className="section-label block mb-3">{t.capture.effLabel}</span>
                <div className="flex items-end gap-2">
                  <span className="metric-value gradient-text">
                    <CounterNumber target={94} isInView={isInView} />
                  </span>
                  <span className="text-2xl text-on-surface/50 font-semibold pb-1">{t.capture.effUnit}</span>
                </div>
                <div className="mt-4 h-1 rounded-full bg-outline-variant/20 overflow-hidden">
                  <motion.div
                    className="h-full primary-gradient-bg rounded-full"
                    initial={{ width: 0 }}
                    animate={isInView ? { width: '94%' } : { width: 0 }}
                    transition={{ duration: 1.2, delay: 0.6, ease: 'easeOut' }}
                  />
                </div>
                <div className="mt-4 pt-4 border-t border-outline-variant/20">
                  <span className="text-xs text-on-surface/40 block mb-1">{t.capture.annualLabel}</span>
                  <span className="text-lg font-bold text-secondary">{t.capture.annualValue}</span>
                  <span className="text-xs text-on-surface/40 ml-1">{t.capture.annualUnit}</span>
                </div>
              </GlassCard>
            </motion.div>

            {/* Target industries */}
            <motion.div variants={fadeUpVariants} className="flex-1">
              <GlassCard className="p-6 h-full hover:bg-surface-container-highest/50 transition-colors duration-500">
                <span
                  className="material-symbols-outlined text-secondary text-2xl mb-3 block"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  factory
                </span>
                <h4 className="card-title text-on-surface mb-3">{t.capture.targetLabel}</h4>
                <div className="flex flex-wrap gap-2 mb-3">
                  {t.capture.targets.map((target, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                      {target}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-on-surface/50 leading-relaxed">{t.capture.targetDesc}</p>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
