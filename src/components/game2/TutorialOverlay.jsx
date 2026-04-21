import { useState } from 'react'
import { DEVICE_ICON, ITEM_COLOR, ITEM_LABEL } from './gameConstants'

const STEPS = [
  {
    title: '🏭 공장과 매연',
    content: '회색 공장(🏭)은 주변 3×3 칸에 매연(💨)을 내뿜습니다. 매연 구역(어두운 배경)에만 포집기를 설치할 수 있어요.',
    visual: 'smoke',
  },
  {
    title: '🧲 탄소 포집기',
    content: '매연 구역 위에 탄소 포집기를 설치하면 자동으로 매연을 흡수해 포집 매연으로 변환합니다. 클릭으로 출력 방향을 바꿀 수 있어요.',
    visual: 'capturer',
  },
  {
    title: '⟶ 배관',
    content: '배관은 아이템을 한 방향으로 이동시킵니다. 드래그해서 여러 칸에 한 번에 설치하세요! 배관 클릭으로 방향을 바꿀 수 있어요.',
    visual: 'pipe',
  },
  {
    title: '⚗️ 정제기',
    content: '정제기(2칸 크기)는 포집 매연을 CO₂와 중금속으로 분리합니다. CO₂는 위쪽, 중금속은 옆쪽으로 출력돼요.',
    visual: 'purifier',
  },
  {
    title: '🗑️ 쓰레기통 · 🌱 배양기',
    content: '쓰레기통은 중금속을 폐기합니다. 배양기는 CO₂를 수분 조류로 변환하지만, 매연이 들어오면 위험해요!',
    visual: 'cultivator',
  },
  {
    title: '⚙️ 제조기 · 📦 저장 창고',
    content: '제조기는 수분 조류를 바이오매스와 수분으로 변환합니다. 바이오매스를 저장 창고에 넣으면 점수가 올라요!',
    visual: 'storage',
  },
  {
    title: '🎯 전체 공정',
    content: '매연 → 포집기 → 배관 → 정제기 → CO₂ → 배양기 → 수분 조류 → 제조기 → 바이오매스 → 저장 창고!\n\n우클릭으로 장치를 제거할 수 있어요.',
    visual: 'flow',
  },
]

const FLOW = [
  { item: 'smoke',      label: '매연',       color: '#6b7280' },
  { item: 'cap_smoke',  label: '포집 매연',  color: '#4b5563' },
  { item: 'co2',        label: 'CO₂',        color: '#6bfb9a' },
  { item: 'wet_algae',  label: '수분 조류',  color: '#22d3ee' },
  { item: 'biomass',    label: '바이오매스', color: '#15803d' },
]

function VisualSmoke() {
  return (
    <div className="flex items-center justify-center gap-3 py-2">
      <div className="relative w-16 h-16 rounded-xl bg-gray-700/50 border border-white/10 flex items-center justify-center text-2xl">
        🏭
      </div>
      {['↙', '↓', '↘'].map((a, i) => (
        <span key={i} className="text-gray-400 text-xl">{a}</span>
      ))}
      <div className="flex flex-col gap-1">
        {[0, 1, 2].map(i => (
          <div key={i} className="flex gap-1">
            {[0, 1, 2].map(j => (
              <div key={j} className="w-8 h-8 rounded bg-gray-600/40 border border-gray-500/20 flex items-center justify-center">
                {i === 1 && j === 1
                  ? <div className="w-3 h-3 rounded-full bg-gray-500 opacity-60" />
                  : <div className="w-2 h-2 rounded-full bg-gray-600 opacity-30" />
                }
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function VisualCapturer() {
  return (
    <div className="flex items-center justify-center gap-4 py-2">
      <div className="flex flex-col items-center gap-1">
        <div className="w-14 h-14 rounded-xl bg-gray-600/30 border border-white/10 flex items-center justify-center text-2xl">
          🧲
        </div>
        <span className="text-xs text-on-surface/40">매연 구역</span>
      </div>
      <span className="text-primary text-2xl">→</span>
      <div className="flex flex-col items-center gap-1">
        <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center"
          style={{ borderColor: ITEM_COLOR.cap_smoke, backgroundColor: ITEM_COLOR.cap_smoke + '20' }}>
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ITEM_COLOR.cap_smoke }} />
        </div>
        <span className="text-xs text-on-surface/40">포집 매연</span>
      </div>
    </div>
  )
}

function VisualPipe() {
  return (
    <div className="flex items-center justify-center gap-1 py-2">
      {[0, 1, 2, 3, 4].map(i => (
        <div key={i} className="w-10 h-10 rounded-lg border border-[#a4c9ff]/20 bg-[#6488a0]/10 flex items-center justify-center">
          <div className="w-full h-0.5 bg-[#a4c9ff]/30 relative">
            <div className="absolute w-1.5 h-1.5 rounded-full bg-[#a4c9ff]/50"
              style={{ left: `${(i * 20) % 80}%`, top: '-3px' }} />
          </div>
        </div>
      ))}
      <span className="text-xl ml-1">→</span>
    </div>
  )
}

function VisualPurifier() {
  return (
    <div className="flex items-center justify-center gap-3 py-2">
      <div className="flex items-center gap-0.5">
        <div className="w-14 h-14 rounded-l-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-2xl">⚗️</div>
        <div className="w-14 h-14 rounded-r-xl bg-orange-500/5 border border-orange-500/10 border-l-0 flex items-center justify-center text-xs text-on-surface/30">slave</div>
      </div>
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ITEM_COLOR.co2 }} />
          <span className="text-on-surface/60">CO₂</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ITEM_COLOR.heavy_metal }} />
          <span className="text-on-surface/60">중금속</span>
        </div>
      </div>
    </div>
  )
}

function VisualCultivator() {
  return (
    <div className="flex items-center justify-center gap-6 py-2">
      <div className="flex flex-col items-center gap-1">
        <div className="w-14 h-14 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-2xl">🗑️</div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ITEM_COLOR.heavy_metal }} />
          <span className="text-xs text-on-surface/40">중금속 폐기</span>
        </div>
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="w-14 h-14 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-2xl">🌱</div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ITEM_COLOR.co2 }} />
          <span className="text-xs text-on-surface/40">→</span>
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ITEM_COLOR.wet_algae }} />
        </div>
      </div>
    </div>
  )
}

function VisualStorage() {
  return (
    <div className="flex items-center justify-center gap-6 py-2">
      <div className="flex flex-col items-center gap-1">
        <div className="w-14 h-14 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-2xl">⚙️</div>
        <div className="flex items-center gap-1 text-xs text-on-surface/40">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ITEM_COLOR.wet_algae }} />
          → 2out
        </div>
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="w-14 h-14 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-2xl">📦</div>
        <div className="flex items-center gap-1 text-xs text-on-surface/40">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ITEM_COLOR.biomass }} />
          +1점
        </div>
      </div>
    </div>
  )
}

function VisualFlow() {
  return (
    <div className="flex items-center justify-center gap-1 flex-wrap py-2">
      {FLOW.map((f, i) => (
        <div key={f.item} className="flex items-center gap-1">
          <div className="flex flex-col items-center gap-0.5">
            <div className="w-5 h-5 rounded-full border" style={{ backgroundColor: f.color + '30', borderColor: f.color }}>
              <div className="w-full h-full rounded-full" style={{ backgroundColor: f.color, opacity: 0.7 }} />
            </div>
            <span className="text-[9px] text-on-surface/40 whitespace-nowrap">{f.label}</span>
          </div>
          {i < FLOW.length - 1 && <span className="text-on-surface/20 text-xs mb-3">→</span>}
        </div>
      ))}
    </div>
  )
}

const VISUALS = {
  smoke: VisualSmoke,
  capturer: VisualCapturer,
  pipe: VisualPipe,
  purifier: VisualPurifier,
  cultivator: VisualCultivator,
  storage: VisualStorage,
  flow: VisualFlow,
}

export default function TutorialOverlay({ onClose }) {
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const Visual = VISUALS[current.visual]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}>
      <div
        className="glass-panel rounded-3xl p-6 max-w-md w-full glow-shadow"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold gradient-text">튜토리얼</h2>
          <button
            onClick={onClose}
            className="text-on-surface/40 hover:text-on-surface/80 transition-colors text-xl leading-none"
          >✕</button>
        </div>

        {/* Step indicator */}
        <div className="flex gap-1.5 mb-5">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`h-1 rounded-full transition-all ${
                i === step ? 'bg-primary flex-1' : 'bg-white/20 w-4'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="mb-4">
          <h3 className="text-base font-semibold text-on-surface mb-2">{current.title}</h3>
          <p className="text-sm text-on-surface/60 leading-relaxed whitespace-pre-line">{current.content}</p>
        </div>

        {/* Visual */}
        <div className="bg-black/30 rounded-xl border border-white/5 mb-5 min-h-[80px]">
          <Visual />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setStep(s => Math.max(0, s - 1))}
            disabled={step === 0}
            className="text-sm text-on-surface/40 hover:text-on-surface/80 disabled:opacity-20 transition-colors px-3 py-1.5"
          >← 이전</button>

          <span className="text-xs text-on-surface/30">{step + 1} / {STEPS.length}</span>

          {step < STEPS.length - 1
            ? <button
                onClick={() => setStep(s => s + 1)}
                className="text-sm text-primary hover:text-primary/80 transition-colors px-3 py-1.5"
              >다음 →</button>
            : <button
                onClick={onClose}
                className="text-sm bg-primary/20 text-primary hover:bg-primary/30 transition-colors px-4 py-1.5 rounded-xl border border-primary/30"
              >시작!</button>
          }
        </div>
      </div>
    </div>
  )
}
