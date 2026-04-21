import { motion } from 'framer-motion'
import { useScrollAnimation, fadeUpVariants, staggerContainer } from '../../hooks/useScrollAnimation'
import { useLanguage } from '../../hooks/useLanguage'

const flowVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.55 + i * 0.12, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
}

function FlowDiagram({ t }) {
  const steps = [
    { icon: 'factory',    label: t.hero.flowStep1, bg: 'rgba(5,46,22,0.08)',     ic: '#15803d' },
    { icon: 'water_drop', label: t.hero.flowStep2, bg: 'rgba(2,132,199,0.09)',   ic: '#0284c7' },
    { icon: 'science',    label: t.hero.flowStep3, bg: 'rgba(22,163,74,0.10)',   ic: '#16a34a' },
    { icon: 'payments',   label: t.hero.flowStep4, bg: 'rgba(202,138,4,0.10)',   ic: '#b45309' },
  ]

  return (
    <div className="flex items-start gap-1.5">
      {steps.map((step, i) => (
        <div key={i} className="flex items-start gap-1.5 flex-1">
          <motion.div custom={i} variants={flowVariants} className="flex flex-col items-center gap-2 flex-1">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center w-full"
              style={{ background: step.bg, border: `1.5px solid ${step.ic}20` }}
            >
              <span
                className="material-symbols-outlined text-lg"
                style={{ color: step.ic, fontVariationSettings: "'FILL' 1" }}
              >
                {step.icon}
              </span>
            </div>
            <span className="text-[10px] font-semibold text-on-surface/45 text-center leading-tight tracking-wide">
              {step.label}
            </span>
          </motion.div>
          {i < steps.length - 1 && (
            <div className="mt-4 text-on-surface/20 text-sm font-bold shrink-0">›</div>
          )}
        </div>
      ))}
    </div>
  )
}

export default function HeroSection({ id }) {
  const { ref, isInView } = useScrollAnimation({ once: true, amount: 0.08 })
  const { t } = useLanguage()

  return (
    <motion.section
      id={id}
      ref={ref}
      className="relative min-h-screen flex items-center overflow-hidden sky-gradient-bg noise-bg"
      variants={staggerContainer}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
    >
      {/* 환경광 */}
      <div
        className="ambient-glow w-[800px] h-[600px] -top-40 -left-60 opacity-45"
        style={{ background: 'radial-gradient(ellipse, rgba(74,222,128,0.28) 0%, transparent 65%)' }}
      />
      <div
        className="ambient-glow w-[600px] h-[500px] top-0 right-0 opacity-30"
        style={{ background: 'radial-gradient(ellipse, rgba(56,189,248,0.22) 0%, transparent 65%)' }}
      />
      <div
        className="ambient-glow w-[400px] h-[400px] bottom-0 left-1/2 -translate-x-1/2 opacity-18"
        style={{ background: 'radial-gradient(circle, rgba(21,128,61,0.18) 0%, transparent 65%)' }}
      />

      {/* 파티클 */}
      {[
        { s: 8, t: '14%', l: '7%',  d: 0,   c: '#4ade80' },
        { s: 5, t: '28%', l: '74%', d: 1.0, c: '#7dd3fc' },
        { s: 7, t: '68%', l: '17%', d: 2.0, c: '#4ade80' },
        { s: 4, t: '74%', l: '66%', d: 0.5, c: '#7dd3fc' },
        { s: 6, t: '20%', l: '51%', d: 1.5, c: '#4ade80' },
        { s: 3, t: '52%', l: '87%', d: 0.8, c: '#7dd3fc' },
      ].map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{ width: p.s, height: p.s, top: p.t, left: p.l, background: p.c, opacity: 0.20 }}
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 4.5 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: p.d }}
        />
      ))}

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pt-28 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

          {/* ── LEFT: 메시지 ─────────────────────────────── */}
          <div className="flex flex-col gap-7">

            {/* 긴급성 배지 — Why now */}
            <motion.div variants={fadeUpVariants}>
              <span
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold"
                style={{
                  background: 'rgba(194,65,12,0.08)',
                  color: '#c2410c',
                  border: '1px solid rgba(194,65,12,0.16)',
                  letterSpacing: '0.01em',
                }}
              >
                <span
                  className="material-symbols-outlined text-sm"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  schedule
                </span>
                {t.hero.eyebrow}
              </span>
            </motion.div>

            {/* 메인 헤드라인 — What */}
            <motion.div variants={fadeUpVariants}>
              <h1
                className="font-bold leading-[1.04] gradient-text-hero block"
                style={{ fontSize: 'clamp(3rem,7vw,5.25rem)', letterSpacing: '-0.035em' }}
              >
                {t.hero.title1}
              </h1>
              <h1
                className="font-bold leading-[1.04] text-on-surface block"
                style={{ fontSize: 'clamp(3rem,7vw,5.25rem)', letterSpacing: '-0.035em' }}
              >
                {t.hero.title2}
              </h1>
            </motion.div>

            {/* 서브타이틀 — Who + What */}
            <motion.div variants={fadeUpVariants} className="flex flex-col gap-2.5">
              <p className="text-lg font-semibold text-on-surface-variant" style={{ letterSpacing: '-0.01em' }}>
                {t.hero.subtitle}
              </p>
              <p className="text-base text-on-surface/55 leading-relaxed max-w-md">
                {t.hero.desc}
              </p>
            </motion.div>

            {/* 적용 대상 — Who (구체적) */}
            <motion.div variants={fadeUpVariants}>
              <p className="text-[11px] font-semibold text-on-surface/35 uppercase tracking-wider mb-2.5">
                {t.hero.targetLabel}
              </p>
              <div className="flex flex-wrap gap-2">
                {t.hero.targets.map((target, i) => (
                  <span key={i} className="badge-green">
                    <span
                      className="material-symbols-outlined text-[11px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                    {target}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div variants={fadeUpVariants} className="flex gap-3 flex-wrap">
              <a href="#capture" className="btn-primary">
                {t.hero.ctaLabel}
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </a>
              <a href="#game" className="btn-secondary">
                <span className="material-symbols-outlined text-[18px]">videogame_asset</span>
                {t.hero.ctaSecondary}
              </a>
            </motion.div>
          </div>

          {/* ── RIGHT: 수치 + 플로우 ──────────────────────── */}
          <motion.div variants={fadeUpVariants} className="flex flex-col gap-4">

            {/* 핵심 3대 수치 — Why care */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: t.hero.stat1Value, label: t.hero.stat1Label, icon: 'savings',     ic: '#15803d' },
                { value: t.hero.stat2Value, label: t.hero.stat2Label, icon: 'trending_up', ic: '#0284c7' },
                { value: t.hero.stat3Value, label: t.hero.stat3Label, icon: 'air',         ic: '#16a34a' },
              ].map((stat, i) => (
                <div key={i} className="card p-4 flex flex-col items-center text-center gap-2">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: `${stat.ic}12` }}
                  >
                    <span
                      className="material-symbols-outlined text-[18px]"
                      style={{ color: stat.ic, fontVariationSettings: "'FILL' 1" }}
                    >
                      {stat.icon}
                    </span>
                  </div>
                  <span
                    className="font-bold text-on-surface leading-none"
                    style={{ fontSize: 'clamp(1.2rem,2.5vw,1.65rem)', letterSpacing: '-0.025em' }}
                  >
                    {stat.value}
                  </span>
                  <span className="text-[11px] text-on-surface/42 font-medium leading-tight">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

            {/* 전환 플로우 카드 */}
            <div className="card p-5">
              <p className="text-[11px] font-semibold text-on-surface/30 uppercase tracking-wider mb-4">
                Carbon → Revenue Flow
              </p>
              <FlowDiagram t={t} />
            </div>

            {/* 긴급 인사이트 */}
            <div
              className="rounded-2xl p-4 flex items-start gap-3"
              style={{
                background: 'linear-gradient(135deg, rgba(254,252,232,0.95) 0%, rgba(254,249,195,0.80) 100%)',
                border: '1px solid rgba(202,138,4,0.22)',
              }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: 'rgba(202,138,4,0.12)' }}
              >
                <span
                  className="material-symbols-outlined text-base"
                  style={{ color: '#b45309', fontVariationSettings: "'FILL' 1" }}
                >
                  warning
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface mb-0.5">
                  {t.capture.urgencyLabel}
                </p>
                <p className="text-xs text-on-surface/52 leading-relaxed">
                  {t.capture.urgencyDesc}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 스크롤 큐 */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.6 }}
      >
        <span className="text-[10px] text-on-surface/28 tracking-widest uppercase font-semibold">
          {t.hero.scrollCue}
        </span>
        <div className="w-5 h-8 rounded-full border border-outline-variant flex items-start justify-center pt-1.5">
          <motion.div
            className="w-1 h-1.5 rounded-full bg-primary"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </motion.section>
  )
}
