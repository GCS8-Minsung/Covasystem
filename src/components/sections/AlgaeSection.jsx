import { motion } from 'framer-motion'
import { useScrollAnimation, fadeUpVariants, staggerContainer, scaleUpVariants } from '../../hooks/useScrollAnimation'
import { useLanguage } from '../../hooks/useLanguage'
import GlassCard from '../ui/GlassCard'
import VitalityGauge from '../ui/VitalityGauge'

const TELEMETRY_ROWS = ['temp', 'light', 'co2', 'ph']

export default function AlgaeSection({ id }) {
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
        className="ambient-glow w-[500px] h-[500px] bottom-0 left-0 opacity-15"
        style={{ background: 'radial-gradient(circle, #2b8ac5 0%, transparent 70%)' }}
      />

      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div variants={fadeUpVariants} className="mb-12 max-w-2xl">
          <span className="section-label block mb-3">{t.algae.label}</span>
          <h2 className="section-title text-on-surface mb-4">{t.algae.title}</h2>
          <p className="text-on-surface/60 leading-relaxed">{t.algae.desc}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Feature card — 8 cols */}
          <motion.div variants={scaleUpVariants} className="md:col-span-8">
            <GlassCard className="relative overflow-hidden group min-h-[320px]">
              {/* Light botanical gradient overlay */}
              <div
                className="absolute inset-0 rounded-[1.5rem] group-hover:scale-105 transition-transform duration-700"
                style={{
                  background: 'linear-gradient(135deg, rgba(26,122,60,0.08) 0%, rgba(43,138,197,0.05) 60%, rgba(209,245,224,0.6) 100%)',
                }}
              />
              <div className="absolute inset-0 rounded-[1.5rem]" style={{
                background: 'radial-gradient(ellipse at 30% 50%, rgba(26,122,60,0.12) 0%, transparent 60%)',
              }} />
              <div className="relative z-10 p-8 h-full flex flex-col justify-end min-h-[320px]">
                <span
                  className="material-symbols-outlined text-primary text-3xl mb-3 block"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  water_drop
                </span>
                {/* CO₂ fixation metric */}
                <div className="flex items-center gap-6 mb-5">
                  <div>
                    <span className="text-xs text-on-surface-variant block mb-1">{t.algae.fixationLabel}</span>
                    <span className="text-2xl font-bold gradient-text">{t.algae.fixationValue}</span>
                  </div>
                  <div className="w-px h-10 bg-outline-variant/60" />
                  <div>
                    <span className="text-xs text-on-surface-variant block mb-1">{t.algae.o2Label}</span>
                    <span className="text-2xl font-bold text-secondary">{t.algae.o2Rate}<span className="text-base font-medium text-on-surface-variant ml-0.5">{t.algae.o2Unit}</span></span>
                  </div>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed max-w-sm mb-5">{t.algae.fixationDesc}</p>
                <a
                  href="#hud"
                  className="self-start btn-primary"
                >
                  {t.algae.learnMore}
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </a>
              </div>
            </GlassCard>
          </motion.div>

          {/* Right column — 4 cols */}
          <div className="md:col-span-4 flex flex-col gap-6">
            {/* O₂ Yield card */}
            <motion.div variants={fadeUpVariants}>
              <GlassCard className="p-6 hover:bg-surface-container-highest/50 transition-colors duration-500">
                <span className="section-label block mb-3">{t.algae.o2Label}</span>
                <div className="flex items-end gap-1">
                  <span className="metric-value gradient-text">{t.algae.o2Rate}</span>
                  <span className="text-2xl text-on-surface/50 font-semibold pb-1">{t.algae.o2Unit}</span>
                </div>
                <div className="mt-4 h-1 rounded-full bg-outline-variant/20 overflow-hidden">
                  <motion.div
                    className="h-full primary-gradient-bg rounded-full"
                    initial={{ width: 0 }}
                    animate={isInView ? { width: '98.4%' } : { width: 0 }}
                    transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
                  />
                </div>
              </GlassCard>
            </motion.div>

            {/* Biomass card */}
            <motion.div variants={fadeUpVariants} className="flex-1">
              <GlassCard className="p-6 h-full hover:bg-surface-container-highest/50 transition-colors duration-500">
                <span
                  className="material-symbols-outlined text-secondary text-2xl mb-3 block"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  grass
                </span>
                <h4 className="card-title text-on-surface mb-2">{t.algae.biomassTitle}</h4>
                <p className="text-sm text-on-surface/60 leading-relaxed">{t.algae.biomassDesc}</p>
              </GlassCard>
            </motion.div>
          </div>

          {/* Products row — full width */}
          <motion.div variants={fadeUpVariants} className="md:col-span-12">
            <GlassCard className="p-6">
              <span className="section-label block mb-5">{t.algae.productsLabel}</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {t.algae.products.map((product, i) => (
                  <div
                    key={i}
                    className="p-5 rounded-xl bg-surface-container-high/40 hover:bg-surface-container-highest/60 transition-colors duration-300"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-on-surface">{product.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'rgba(5,46,22,0.62)' }}>{product.grade}</p>
                      </div>
                      <span className="material-symbols-outlined text-primary/60 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                        eco
                      </span>
                    </div>
                    <div className="flex items-end gap-0.5">
                      <span className="text-xl font-bold gradient-text">{product.price}</span>
                      <span className="text-xs pb-0.5" style={{ color: 'rgba(5,46,22,0.55)' }}>{product.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Vitality Gauge card — 8 cols */}
          <motion.div variants={fadeUpVariants} className="md:col-span-8">
            <GlassCard className="p-8">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1 w-full">
                  <span className="section-label block mb-4">{t.algae.gaugeLabel}</span>
                  <div className="flex flex-col divide-y divide-outline-variant/20">
                    {TELEMETRY_ROWS.map(key => (
                      <div key={key} className="flex justify-between items-center py-3">
                        <span className="text-sm text-on-surface/50">{t.algae.telemetry[key]}</span>
                        <span className="text-sm font-semibold text-on-surface font-mono">
                          {t.algae.telemetry[`${key}Val`]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <VitalityGauge value={82} label={t.algae.gaugeLabel} isInView={isInView} />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}
