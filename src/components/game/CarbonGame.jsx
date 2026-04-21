import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../hooks/useLanguage'
import CarbonParticle from './CarbonParticle'
import useGameLoop from './useGameLoop'

const MAX_PARTICLES = 12
const MAX_COMBO = 20
const GAME_DURATION = 60

export default function CarbonGame({ webcamMode, aimPos }) {
  const canvasRef = useRef(null)
  const ctxRef = useRef(null)
  const particlesRef = useRef([])
  const scoreRef = useRef(0)
  const comboRef = useRef(0)
  const capturedRef = useRef(0)
  const timerRef = useRef(null)
  const timeLeftRef = useRef(GAME_DURATION)
  const popupsRef = useRef([]) // { x, y, pts, alpha, vy }
  // Use refs for values that change frequently — avoids resetting game loop effect
  const aimPosRef = useRef(aimPos)
  const webcamModeRef = useRef(webcamMode)

  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [started, setStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [showMaxCombo, setShowMaxCombo] = useState(false)
  const maxComboTimeoutRef = useRef(null)
  const { t } = useLanguage()
  const { start, stop } = useGameLoop()

  // Keep refs in sync without triggering effect re-runs
  useEffect(() => { aimPosRef.current = aimPos }, [aimPos])
  useEffect(() => { webcamModeRef.current = webcamMode }, [webcamMode])

  const isWarning = timeLeft <= 10 && timeLeft > 0

  const startGame = useCallback(() => {
    scoreRef.current = 0
    comboRef.current = 0
    capturedRef.current = 0
    timeLeftRef.current = GAME_DURATION
    popupsRef.current = []
    setScore(0)
    setCombo(0)
    setTimeLeft(GAME_DURATION)
    setGameOver(false)
    setStarted(true)
  }, [])

  // Countdown timer
  useEffect(() => {
    if (!started || gameOver) return
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const next = prev <= 1 ? 0 : prev - 1
        timeLeftRef.current = next
        if (prev <= 1) {
          clearInterval(timerRef.current)
          setGameOver(true)
          stop()
        }
        return next
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [started, gameOver, stop])

  const handleShoot = useCallback((px, py) => {
    let hit = false
    let hitX = px, hitY = py
    particlesRef.current.forEach(p => {
      if (!p.hit && p.contains(px, py)) {
        p.hit = true
        hit = true
        hitX = p.x
        hitY = p.y
        capturedRef.current += 1
      }
    })
    if (hit) {
      const newCombo = Math.min(comboRef.current + 1, MAX_COMBO)
      comboRef.current = newCombo
      const pts = 10 + newCombo * 2
      scoreRef.current += pts
      setScore(scoreRef.current)
      setCombo(newCombo)
      // Add score popup at hit position
      popupsRef.current.push({ x: hitX, y: hitY, pts, alpha: 1.0, vy: -2 })
      if (newCombo === MAX_COMBO) {
        setShowMaxCombo(true)
        if (maxComboTimeoutRef.current) clearTimeout(maxComboTimeoutRef.current)
        maxComboTimeoutRef.current = setTimeout(() => setShowMaxCombo(false), 2000)
      }
    } else {
      comboRef.current = 0
      setCombo(0)
    }
  }, [])

  const handleCanvasClick = useCallback((e) => {
    if (!started || gameOver || webcamModeRef.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    handleShoot((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY)
  }, [started, gameOver, handleShoot])

  // Fire from webcam gesture (uses ref, doesn't add to effect deps)
  useEffect(() => {
    if (webcamMode && aimPos?.fire && started && !gameOver) {
      const canvas = canvasRef.current
      if (!canvas) return
      handleShoot(aimPos.x * canvas.width, aimPos.y * canvas.height)
    }
  }, [webcamMode, aimPos, started, gameOver, handleShoot])

  // Main game loop — deps do NOT include greenIntensity / aimPos to prevent particle reset
  useEffect(() => {
    if (!started || gameOver) return
    const canvas = canvasRef.current
    if (!canvas) return

    ctxRef.current = canvas.getContext('2d')

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      particlesRef.current = Array.from(
        { length: MAX_PARTICLES },
        () => new CarbonParticle(canvas.width, canvas.height)
      )
    }
    resize()

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)

    start(() => {
      const ctx = ctxRef.current
      if (!ctx) return
      const W = canvas.width
      const H = canvas.height
      ctx.clearRect(0, 0, W, H)

      // Green ambient overlay — simple flat fill, no gradient allocation
      const gi = Math.min(scoreRef.current / 600, 1)
      if (gi > 0) {
        ctx.fillStyle = `rgba(107,251,154,${(gi * 0.10).toFixed(3)})`
        ctx.fillRect(0, 0, W, H)
      }

      // Time gauge at top of canvas
      const tRatio = timeLeftRef.current / GAME_DURATION
      const gaugeColor = timeLeftRef.current <= 10 ? '#f87171' : '#6bfb9a'
      ctx.fillStyle = 'rgba(0,0,0,0.35)'
      ctx.fillRect(0, 0, W, 5)
      ctx.fillStyle = gaugeColor
      ctx.fillRect(0, 0, W * tRatio, 5)
      if (timeLeftRef.current <= 10 && timeLeftRef.current > 0) {
        ctx.shadowColor = '#f87171'
        ctx.shadowBlur = 8
        ctx.fillRect(0, 0, W * tRatio, 5)
        ctx.shadowBlur = 0
        ctx.shadowColor = 'transparent'
      }

      // Particles — font/align/baseline set once for all particles
      particlesRef.current = particlesRef.current.filter(p => !p.isOffScreen())
      while (particlesRef.current.length < MAX_PARTICLES) {
        particlesRef.current.push(new CarbonParticle(W, H))
      }
      ctx.font = 'bold 9px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      particlesRef.current.forEach(p => { p.update(); p.draw(ctx) })

      // Score popups — shadow only enabled when popups exist
      popupsRef.current = popupsRef.current.filter(p => p.alpha > 0)
      if (popupsRef.current.length > 0) {
        ctx.font = 'bold 18px Inter, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.shadowColor = '#6bfb9a'
        ctx.shadowBlur = 10
        ctx.fillStyle = '#6bfb9a'
        popupsRef.current.forEach(popup => {
          ctx.globalAlpha = popup.alpha
          ctx.fillText(`+${popup.pts}`, popup.x, popup.y)
          popup.y += popup.vy
          popup.vy *= 0.92
          popup.alpha -= 0.022
        })
        ctx.globalAlpha = 1
        ctx.shadowBlur = 0
      }

      // Webcam crosshair — from ref
      const ap = aimPosRef.current
      if (webcamModeRef.current && ap) {
        const cx = ap.x * W
        const cy = ap.y * H
        ctx.save()
        ctx.strokeStyle = '#6bfb9a'
        ctx.lineWidth = 2
        ctx.globalAlpha = 0.8
        const sz = 16
        ctx.beginPath()
        ctx.moveTo(cx - sz, cy); ctx.lineTo(cx + sz, cy)
        ctx.moveTo(cx, cy - sz); ctx.lineTo(cx, cy + sz)
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(cx, cy, sz * 0.6, 0, Math.PI * 2)
        ctx.stroke()
        ctx.restore()
      }
    })

    return () => { stop(); observer.disconnect() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, gameOver, start, stop])

  useEffect(() => () => {
    if (maxComboTimeoutRef.current) clearTimeout(maxComboTimeoutRef.current)
    if (timerRef.current) clearInterval(timerRef.current)
  }, [])

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ cursor: webcamMode ? 'none' : 'crosshair', background: 'transparent', willChange: 'transform' }}
        onClick={handleCanvasClick}
      />

      {/* HUD overlay — score & combo only (timer is on canvas gauge) */}
      {started && !gameOver && (
        <div className="absolute top-6 left-4 right-4 flex items-start justify-between pointer-events-none">
          <div className="flex gap-3">
            <div className="glass-panel rounded-xl px-4 py-2">
              <span className="text-xs text-on-surface/40 block">{t.game.scoreLabel}</span>
              <span className="text-2xl font-bold text-primary font-mono">{score}</span>
            </div>
            {combo > 1 && (
              <motion.div
                className="glass-panel rounded-xl px-4 py-2"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <span className="text-xs text-on-surface/40 block">{t.game.comboLabel}</span>
                <span className="text-2xl font-bold text-secondary font-mono">
                  x{combo}{combo === MAX_COMBO && '!'}
                </span>
              </motion.div>
            )}
          </div>
          {/* Compact time indicator */}
          <div className={`glass-panel rounded-xl px-3 py-1.5 ${isWarning ? 'border border-red-500/40' : ''}`}>
            <span className={`text-lg font-bold font-mono ${isWarning ? 'text-red-400' : 'text-on-surface/60'}`}>
              {timeLeft}s
            </span>
          </div>
        </div>
      )}

      {/* MAX COMBO — glassmorphism, non-blocking */}
      <AnimatePresence>
        {showMaxCombo && (
          <motion.div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 pointer-events-none z-10"
            initial={{ opacity: 0, scale: 0.6, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1, y: -20 }}
            transition={{ duration: 0.25 }}
          >
            <div className="glass-panel px-6 py-2.5 rounded-full border border-primary/40 shadow-[0_0_24px_rgba(107,251,154,0.35)] backdrop-blur-[20px]">
              <span className="gradient-text font-bold text-base tracking-widest">
                {t.game.maxComboLabel}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Start screen */}
      {!started && !gameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-surface/60 backdrop-blur-sm rounded-[1.5rem]">
          <p className="text-sm text-on-surface/50 text-center max-w-xs px-4">{t.game.instructions}</p>
          <button
            className="px-8 py-3 rounded-xl primary-gradient-bg text-surface font-semibold hover:scale-105 hover:shadow-[0_0_30px_rgba(107,251,154,0.4)] transition-all duration-200"
            onClick={startGame}
          >
            {t.game.startBtn}
          </button>
        </div>
      )}

      {/* Game over screen */}
      <AnimatePresence>
        {gameOver && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-surface/70 backdrop-blur-md rounded-[1.5rem]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div className="text-center" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
              <h3 className="text-2xl font-bold text-on-surface mb-2">{t.game.gameOverTitle}</h3>
              <p className="text-on-surface/50 text-sm mb-4">{t.game.gameOverDesc}</p>
              <div className="flex items-end justify-center gap-2 mb-4">
                <span className="text-[4rem] font-bold gradient-text leading-none">{score}</span>
                <span className="text-xl text-on-surface/40 pb-2">{t.game.scoreLabel}</span>
              </div>
              <p className="text-xs text-on-surface/30 mb-8">{capturedRef.current} {t.game.gameOverUnit}</p>
            </motion.div>
            <motion.button
              className="px-8 py-3 rounded-xl primary-gradient-bg text-surface font-semibold hover:scale-105 transition-all"
              initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
              onClick={startGame}
            >
              {t.game.restartBtn}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
