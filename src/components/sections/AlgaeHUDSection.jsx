import { motion } from 'framer-motion'
import { useScrollAnimation, fadeUpVariants, staggerContainer, scaleUpVariants } from '../../hooks/useScrollAnimation'
import { useLanguage } from '../../hooks/useLanguage'
import GlassCard from '../ui/GlassCard'

const REVENUE_COLORS = {
  primary: '#15803d',
  secondary: '#0284c7',
  'on-surface': '#052e16',
  outline: '#86efac',
}

export default function AlgaeHUDSection({ id }) {
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
        className="ambient-glow w-[600px] h-[600px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10"
        style={{ background: 'radial-gradient(circle, #1a7a3c 0%, transparent 70%)' }}
      />

      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div variants={fadeUpVariants} className="mb-12 max-w-2xl">
          <span className="section-label block mb-3">{t.hud.label}</span>
          <h2 className="section-title text-on-surface mb-4">{t.hud.title}</h2>
          <p className="text-on-surface/60 leading-relaxed">{t.hud.desc}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Viewer panel — 8 cols */}
          <motion.div variants={scaleUpVariants} className="md:col-span-8">
            <GlassCard className="relative overflow-hidden">
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(135deg, rgba(13,19,13,1) 0%, rgba(20,40,25,0.9) 50%, rgba(13,19,13,1) 100%)',
                  }}
                />
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    background: 'radial-gradient(ellipse at 50% 50%, rgba(107,251,154,0.4) 0%, transparent 60%)',
                    mixBlendMode: 'luminosity',
                  }}
                />
                {/* HUD corner — top left */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <motion.div
                    className="w-2 h-2 rounded-full bg-primary"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <span className="text-xs text-primary font-mono font-semibold tracking-widest">
                    {t.hud.recLabel} / {t.hud.liveLabel}
                  </span>
                </div>
                {/* HUD corner — top right */}
                <div className="absolute top-4 right-4">
                  <span className="text-xs font-mono" style={{ color: 'rgba(134,239,172,0.70)' }}>{t.hud.coordLabel}</span>
                </div>
                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="w-16 h-16 rounded-full primary-gradient-bg flex items-center justify-center shadow-[0_0_40px_rgba(107,251,154,0.4)] hover:scale-105 transition-transform duration-200">
                    <span className="material-symbols-outlined text-surface text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      play_arrow
                    </span>
                  </button>
                </div>
                <div className="absolute bottom-4 left-4">
                  <span className="text-xs font-mono" style={{ color: 'rgba(134,239,172,0.55)' }}>{t.hud.playBtn}</span>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Data panel — 4 cols */}
          <div className="md:col-span-4 flex flex-col gap-4">
            {/* BEP card */}
            <motion.div variants={fadeUpVariants}>
              <GlassCard className="p-5 hover:bg-surface-container-highest/50 transition-colors duration-500">
                <span className="section-label block mb-2">{t.hud.bepLabel}</span>
                <div className="flex items-end gap-1">
                  <span className="text-[2.5rem] font-bold gradient-text leading-none">{t.hud.bepValue}</span>
                  <span className="text-lg text-on-surface/50 font-semibold pb-0.5">{t.hud.bepUnit}</span>
                </div>
              </GlassCard>
            </motion.div>

            {/* SROI card */}
            <motion.div variants={fadeUpVariants}>
              <GlassCard className="p-5 hover:bg-surface-container-highest/50 transition-colors duration-500">
                <span className="section-label block mb-2">{t.hud.sroiLabel}</span>
                <div className="flex items-end gap-0.5">
                  <span className="text-[2.5rem] font-bold text-secondary leading-none">{t.hud.sroiValue}</span>
                  <span className="text-lg text-on-surface/50 font-semibold pb-0.5">{t.hud.sroiUnit}</span>
                </div>
              </GlassCard>
            </motion.div>

            {/* Subscription pricing */}
            <motion.div variants={fadeUpVariants}>
              <GlassCard className="p-5 hover:bg-surface-container-highest/50 transition-colors duration-500">
                <span className="section-label block mb-2">{t.hud.subscribeLabel}</span>
                <p className="text-lg font-bold text-on-surface leading-tight">{t.hud.subscribeValue}</p>
                <span className="text-xs text-on-surface/40">{t.hud.subscribeUnit}</span>
              </GlassCard>
            </motion.div>

            {/* CTA button */}
            <motion.div variants={fadeUpVariants} className="flex-1 flex items-end">
              <button className="w-full py-3 px-5 rounded-xl primary-gradient-bg text-surface text-sm font-semibold hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(107,251,154,0.3)] transition-all duration-200 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-base">mail</span>
                {t.hud.systemBtn}
              </button>
            </motion.div>
          </div>

          {/* Revenue mix — full width */}
          <motion.div variants={fadeUpVariants} className="md:col-span-12">
            <GlassCard className="p-8">
              <span className="section-label block mb-6">{t.hud.revenueLabel}</span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {t.hud.revenues.map((rev, i) => (
                  <div key={i} className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-on-surface/60">{rev.label}</span>
                      <span className="text-sm font-bold" style={{ color: REVENUE_COLORS[rev.color] }}>
                        {rev.value}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-outline-variant/20 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: REVENUE_COLORS[rev.color] }}
                        initial={{ width: 0 }}
                        animate={isInView ? { width: `${rev.value}%` } : { width: 0 }}
                        transition={{ duration: 1.0, delay: 0.1 * i + 0.3, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}
