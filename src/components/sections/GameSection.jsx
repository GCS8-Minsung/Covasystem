import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useScrollAnimation, fadeUpVariants, staggerContainer } from '../../hooks/useScrollAnimation'
import { useLanguage } from '../../hooks/useLanguage'
import CarbonGame from '../game/CarbonGame'
import useMediaPipe from '../game/useMediaPipe'

// 게임 실제 컨텐츠 — 마운트될 때만 MediaPipe 초기화
function ActiveGame({ t }) {
  const videoRef = useRef(null)
  const [webcamEnabled, setWebcamEnabled] = useState(false)
  const { aimPos, ready } = useMediaPipe(videoRef, webcamEnabled)

  return (
    <>
      <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/20">
        <div className="flex items-center gap-2">
          <motion.div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: webcamEnabled && ready ? '#16a34a' : '#94a3b8' }}
            animate={webcamEnabled && ready ? { opacity: [1, 0.4, 1] } : { opacity: 1 }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="text-xs text-on-surface/40 font-mono">
            {webcamEnabled ? (ready ? 'WEBCAM ACTIVE' : 'WEBCAM LOADING...') : 'MOUSE MODE'}
          </span>
        </div>
        <button
          onClick={() => setWebcamEnabled(v => !v)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl glass-panel text-sm font-semibold text-on-surface/70 hover:text-on-surface transition-all duration-200"
        >
          <span className="material-symbols-outlined text-base">
            {webcamEnabled ? 'videocam_off' : 'videocam'}
          </span>
          {webcamEnabled ? t.game.webcamOffBtn : t.game.webcamBtn}
        </button>
      </div>

      <div className="relative" style={{ height: '480px' }}>
        <CarbonGame webcamMode={webcamEnabled && ready} aimPos={aimPos} />
      </div>

      <div className="px-6 py-3 border-t border-outline-variant/20 flex items-center gap-2">
        <span className="material-symbols-outlined text-on-surface/30 text-sm">info</span>
        <span className="text-xs text-on-surface/30">
          {webcamEnabled ? t.game.gestureHint : t.game.instructions}
        </span>
      </div>

      <video ref={videoRef} className="hidden" autoPlay playsInline muted />
    </>
  )
}

export default function GameSection({ id }) {
  const { ref, isInView } = useScrollAnimation()
  const { t } = useLanguage()
  const [started, setStarted] = useState(false)

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
        className="ambient-glow w-[500px] h-[500px] top-0 right-0 opacity-10"
        style={{ background: 'radial-gradient(circle, rgba(22,163,74,0.4) 0%, transparent 70%)' }}
      />

      <div className="max-w-7xl mx-auto">
        <motion.div variants={fadeUpVariants} className="mb-12 max-w-2xl">
          <span className="section-label block mb-3">{t.game.label}</span>
          <h2 className="section-title text-on-surface mb-4">{t.game.title}</h2>
          <p className="text-on-surface/60 leading-relaxed">{t.game.desc}</p>
        </motion.div>

        <motion.div variants={fadeUpVariants}>
          <div className="rounded-[1.5rem] overflow-hidden" style={{ background: '#ffffff', border: '1px solid rgba(134,239,172,0.35)', boxShadow: '0 1px 2px rgba(5,46,22,0.04), 0 4px 16px rgba(5,46,22,0.07)' }}>
            {started ? (
              <ActiveGame t={t} />
            ) : (
              <div className="flex flex-col items-center justify-center gap-6 py-24">
                <div className="w-20 h-20 rounded-3xl bg-primary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-4xl">videogame_asset</span>
                </div>
                <div className="text-center max-w-sm">
                  <h3 className="text-xl font-bold text-on-surface mb-2">{t.game.title}</h3>
                  <p className="text-sm text-on-surface/50 leading-relaxed">{t.game.desc}</p>
                </div>
                <button
                  onClick={() => setStarted(true)}
                  className="btn-primary px-8 py-3 text-base"
                >
                  <span className="material-symbols-outlined text-base">play_arrow</span>
                  {t.game.startBtn}
                </button>
                <p className="text-xs text-on-surface/30">{t.game.instructions}</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}
