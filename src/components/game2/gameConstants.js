// ── 아이템 타입 ───────────────────────────────────────────────────────────────
export const ITEM = {
  NONE: null,
  SMOKE: 'smoke',
  CAP_SMOKE: 'cap_smoke',
  CO2: 'co2',
  HEAVY_METAL: 'heavy_metal',
  WET_ALGAE: 'wet_algae',
  BIOMASS: 'biomass',
  WATER: 'water',
}

export const ITEM_COLOR = {
  smoke: '#6b7280',
  cap_smoke: '#4b5563',
  co2: '#6bfb9a',
  heavy_metal: '#f97316',
  wet_algae: '#22d3ee',
  biomass: '#15803d',
  water: '#60a5fa',
}

export const ITEM_LABEL = {
  smoke: '매연',
  cap_smoke: '포집 매연',
  co2: 'CO₂',
  heavy_metal: '중금속',
  wet_algae: '수분 조류',
  biomass: '바이오매스',
  water: '수분',
}

// ── 장치 타입 ───────────────────────────────────────────────────────────────
export const DEVICE = {
  EMPTY: 'empty',
  FACTORY: 'factory',
  CAPTURER: 'capturer',
  PIPE: 'pipe',
  PURIFIER: 'purifier',    // 2×1 (master+slave)
  TRASH: 'trash',
  CULTIVATOR: 'cultivator',
  MANUFACTURER: 'manufacturer', // 2×1 (master+slave)
  STORAGE: 'storage',
  SLAVE: 'slave',          // occupied by multi-cell device
}

// Devices that occupy 2 cells (master + slave in rotation direction)
export const TWO_CELL_DEVICES = new Set([DEVICE.PURIFIER, DEVICE.MANUFACTURER])

export const DEVICE_ICON = {
  factory: '🏭',
  capturer: '🧲',
  pipe: '⟶',
  purifier: '⚗️',
  trash: '🗑️',
  cultivator: '🌱',
  manufacturer: '⚙️',
  storage: '📦',
}

export const DEVICE_LABEL = {
  capturer: '탄소 포집기',
  pipe: '배관',
  purifier: '정제기 (2×1)',
  trash: '쓰레기통',
  cultivator: '배양기',
  manufacturer: '제조기 (2×1)',
  storage: '저장 창고',
  bulldoze: '철거',
}

export const BUILDABLE = [
  DEVICE.CAPTURER,
  DEVICE.PIPE,
  DEVICE.PURIFIER,
  DEVICE.TRASH,
  DEVICE.CULTIVATOR,
  DEVICE.MANUFACTURER,
  DEVICE.STORAGE,
  'bulldoze',
]

// ── 방향 (0=E 1=S 2=W 3=N) ───────────────────────────────────────────────
export const DIR = { E: 0, S: 1, W: 2, N: 3 }
export const DIR_VEC = [
  { dx: 1, dy: 0 },   // E →
  { dx: 0, dy: 1 },   // S ↓
  { dx: -1, dy: 0 },  // W ←
  { dx: 0, dy: -1 },  // N ↑
]
export const DIR_ARROW = ['→', '↓', '←', '↑']
export const opposite = dir => (dir + 2) % 4
export const clockwise = dir => (dir + 1) % 4

// ── 스테이지 설정 ──────────────────────────────────────────────────────────
// smokeCount: 매 smokeEvery 틱마다 공장당 N개 매연 emit
// Stage1: 30/min = 1개 / 2틱(2s)
// Stage2: 60/min = 1개 / 1틱(1s)
// Stage3: 120/min = 2개 / 1틱(1s)
export const STAGES = [
  { goal: 100,  smokeEvery: 2, smokeCount: 1, label: 'Stage 1' },
  { goal: 300,  smokeEvery: 1, smokeCount: 1, label: 'Stage 2' },
  { goal: 1000, smokeEvery: 1, smokeCount: 2, label: 'Stage 3' },
]

// ── 그리드 ──────────────────────────────────────────────────────────────────
export const GRID_W = 26
export const GRID_H = 18
export const TICK_MS = 1000

// ── 가공 규칙 ───────────────────────────────────────────────────────────────
// capturer: smokeZone 위에서 매연을 자동 수집 → cap_smoke 출력
// 60개/분 → TICK_MS=1000ms → 매 틱 1개 (CAPTURER_RATE=1)
export const CAPTURER_RATE = 1

export const PROCESS = {
  [DEVICE.PURIFIER]:     { ticks: 2, input: ITEM.CAP_SMOKE, outputs: [ITEM.CO2, ITEM.HEAVY_METAL], twoOutputs: true },
  [DEVICE.TRASH]:        { ticks: 1, input: ITEM.HEAVY_METAL, outputs: [] },
  [DEVICE.CULTIVATOR]:   { ticks: 3, input: ITEM.CO2, outputs: [ITEM.WET_ALGAE], danger: ITEM.SMOKE },
  [DEVICE.MANUFACTURER]: { ticks: 2, input: ITEM.WET_ALGAE, outputs: [ITEM.BIOMASS, ITEM.WATER], twoOutputs: true },
  [DEVICE.STORAGE]:      { ticks: 1, input: ITEM.BIOMASS, outputs: [], isStorage: true },
}
