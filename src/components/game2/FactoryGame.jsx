import { useState, useRef, useCallback, useEffect } from 'react'
import { useGameEngine } from './useGameEngine'
import GameCanvas from './GameCanvas'
import GameToolbar from './GameToolbar'
import TutorialOverlay from './TutorialOverlay'
import { DEVICE, STAGES, GRID_W, GRID_H } from './gameConstants'

// Compute cell size to fill the available container while keeping GRID_W:GRID_H aspect
function computeCellSize(containerW, containerH) {
  const byW = Math.floor(containerW / GRID_W)
  const byH = Math.floor(containerH / GRID_H)
  return Math.max(24, Math.min(byW, byH))
}

export default function FactoryGame() {
  const {
    gameState, started,
    startGame, handleCellClick, handleRightClick, handlePipeDrag, resetGame,
  } = useGameEngine()

  const [selectedTool, setSelectedTool] = useState(DEVICE.CAPTURER)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [cellSize, setCellSize] = useState(36)

  const wrapperRef = useRef(null)   // outer flex-col container
  const canvasAreaRef = useRef(null) // the area that canvas fills

  // ── Adaptive cell size via ResizeObserver ────────────────────────────────
  useEffect(() => {
    const el = canvasAreaRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        setCellSize(computeCellSize(width, height))
      }
    })
    ro.observe(el)
    // initial measure
    const rect = el.getBoundingClientRect()
    setCellSize(computeCellSize(rect.width, rect.height))
    return () => ro.disconnect()
  }, [])

  // ── Fullscreen sync ──────────────────────────────────────────────────────
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      wrapperRef.current?.requestFullscreen?.()
    } else {
      document.exitFullscreen()
    }
  }, [])

  // ── Cell click forwarding ────────────────────────────────────────────────
  const onCellClick = useCallback((x, y) => {
    handleCellClick(x, y, selectedTool, 0)
  }, [handleCellClick, selectedTool])

  // ── Stage info ───────────────────────────────────────────────────────────
  const { stage, storageCount, won } = gameState
  const stg = STAGES[stage]
  const nextGoal = stg.goal
  const prevGoal = stage > 0 ? STAGES[stage - 1].goal : 0
  const stageProgress = Math.min((storageCount - prevGoal) / (nextGoal - prevGoal), 1)
  const totalProgress = storageCount / STAGES[STAGES.length - 1].goal

  // Stage bg tint: dim dark → slightly lighter with each stage
  const stageBg = ['#111114', '#131318', '#16161e'][Math.min(stage, 2)]

  return (
    <div
      ref={wrapperRef}
      className="flex flex-col w-full h-full min-h-[520px] rounded-2xl overflow-hidden relative"
      style={{ background: stageBg, transition: 'background 1s' }}
    >
      {/* ── Tutorial overlay ──────────────────────────────────────────────── */}
      {showTutorial && <TutorialOverlay onClose={() => setShowTutorial(false)} />}

      {/* ── HUD bar ──────────────────────────────────────────────────────── */}
      {started && (
        <div className="flex-none flex items-center gap-2 px-3 py-2 bg-black/30 border-b border-white/5">
          {/* Stage badge */}
          <div className="flex items-center gap-2 glass-panel rounded-lg px-3 py-1.5">
            <span className="text-xs text-on-surface/40 font-mono">{stg.label}</span>
            <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${stageProgress * 100}%` }}
              />
            </div>
            <span className="text-xs font-bold text-primary tabular-nums">
              {storageCount}<span className="text-on-surface/30">/{nextGoal}</span>
            </span>
          </div>

          {/* Smoke rate indicator */}
          <div className="hidden sm:flex items-center gap-1 text-xs text-on-surface/30">
            <span>💨</span>
            <span>{stg.smokeEvery === 2 ? '30' : stg.smokeDouble ? '120' : '60'}/min</span>
          </div>

          <div className="flex-1" />

          {/* Tutorial */}
          <button
            onClick={() => setShowTutorial(true)}
            className="text-xs text-on-surface/40 hover:text-primary transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5"
            title="튜토리얼"
          >❓ 도움말</button>

          {/* Reset */}
          <button
            onClick={resetGame}
            className="text-xs text-on-surface/40 hover:text-primary transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5"
          >↺ 새 게임</button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="text-on-surface/40 hover:text-primary transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5"
            title={isFullscreen ? '전체화면 종료' : '전체화면'}
          >
            {isFullscreen ? '⊡' : '⊞'}
          </button>
        </div>
      )}

      {/* ── Canvas area ──────────────────────────────────────────────────── */}
      <div
        ref={canvasAreaRef}
        className="flex-1 flex items-center justify-center overflow-hidden bg-[#0d0d0f]"
      >
        {started
          ? (
            <GameCanvas
              gameState={gameState}
              onCellClick={onCellClick}
              onCellRightClick={handleRightClick}
              onPipeDrag={handlePipeDrag}
              selectedTool={selectedTool}
              cellSize={cellSize}
            />
          )
          : (
            /* ── Start Screen ─────────────────────────────────────────── */
            <div className="flex flex-col items-center justify-center gap-6 p-8 text-center">
              <div className="text-5xl">🏭</div>
              <div>
                <h2 className="text-2xl font-bold gradient-text mb-2">탄소 공장 시뮬레이션</h2>
                <p className="text-sm text-on-surface/50 max-w-sm leading-relaxed">
                  공장 매연을 포집·정제하여 바이오매스를 생산하세요.<br />
                  3단계를 모두 클리어하면 미션 완료!
                </p>
              </div>

              {/* Mini process flow */}
              <div className="flex items-center gap-1 text-xs text-on-surface/40 flex-wrap justify-center">
                {['매연 💨', '→', '포집 🧲', '→', '정제 ⚗️', '→', '배양 🌱', '→', '제조 ⚙️', '→', '창고 📦'].map((s, i) => (
                  <span key={i} className={s === '→' ? 'text-on-surface/20' : 'text-on-surface/60'}>{s}</span>
                ))}
              </div>

              {/* Stage overview */}
              <div className="flex gap-3 text-xs">
                {STAGES.map((s, i) => (
                  <div key={i} className="glass-panel rounded-xl px-4 py-2 text-center">
                    <div className="text-on-surface/30 mb-1">{s.label}</div>
                    <div className="font-bold text-primary">{s.goal}</div>
                    <div className="text-on-surface/30">바이오매스</div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowTutorial(true)}
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-sm text-on-surface/60 hover:text-on-surface hover:border-white/20 transition-all"
                >
                  ❓ 튜토리얼
                </button>
                <button
                  onClick={startGame}
                  className="px-8 py-2.5 rounded-xl bg-primary/20 border border-primary text-primary text-sm font-semibold hover:bg-primary/30 transition-all shadow-[0_0_20px_rgba(107,251,154,0.2)]"
                >
                  시작하기 →
                </button>
              </div>
            </div>
          )
        }
      </div>

      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      {started && (
        <div className="flex-none bg-black/40 border-t border-white/5 px-3 py-2">
          <GameToolbar selected={selectedTool} onSelect={setSelectedTool} />
        </div>
      )}

      {/* ── Victory overlay ───────────────────────────────────────────────── */}
      {won && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel rounded-3xl p-10 text-center glow-shadow max-w-sm mx-4">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold gradient-text mb-2">미션 완료!</h3>
            <p className="text-sm text-on-surface/60 mb-2">
              바이오매스 {STAGES[STAGES.length - 1].goal}개 생산 달성!
            </p>
            <p className="text-xs text-on-surface/30 mb-6">
              총 생산량: <span className="text-primary font-bold">{storageCount}</span>개
            </p>
            <button
              onClick={resetGame}
              className="px-8 py-3 rounded-xl bg-primary/20 border border-primary text-primary text-sm font-semibold hover:bg-primary/30 transition-all"
            >
              다시 하기
            </button>
          </div>
        </div>
      )}

      {/* ── Stage clear toast ─────────────────────────────────────────────── */}
      {started && stage > 0 && storageCount === STAGES[stage - 1]?.goal && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="glass-panel rounded-full px-5 py-2 text-sm font-semibold text-primary border border-primary/40 shadow-[0_0_20px_rgba(107,251,154,0.3)]">
            🎊 {stg.label} 진입!
          </div>
        </div>
      )}
    </div>
  )
}
