/**
 * Game 2 — 아이템 & 장치 상수 정의
 */

// ─── 아이템 타입 ────────────────────────────────────────────
export const ITEM = {
  NONE:         'none',
  SMOKE:        'smoke',        // 매연 (공장 출력)
  CAP_SMOKE:    'cap_smoke',    // 포집된 매연
  CO2:          'co2',          // 순수 CO₂
  HEAVY_METAL:  'heavy_metal',  // 중금속
  ALGAE:        'algae',        // 조류
  WET_ALGAE:    'wet_algae',    // 수분을 머금은 조류
  BIOMASS:      'biomass',      // 바이오매스 조류 (최종)
  WATER:        'water',        // 수분
}

export const ITEM_COLORS = {
  [ITEM.SMOKE]:       '#6b7280',
  [ITEM.CAP_SMOKE]:   '#4b5563',
  [ITEM.CO2]:         '#6bfb9a',
  [ITEM.HEAVY_METAL]: '#f97316',
  [ITEM.ALGAE]:       '#86efac',
  [ITEM.WET_ALGAE]:   '#22d3ee',
  [ITEM.BIOMASS]:     '#15803d',
  [ITEM.WATER]:       '#60a5fa',
}

export const ITEM_LABELS = {
  [ITEM.SMOKE]:       '매연',
  [ITEM.CAP_SMOKE]:   '포집 매연',
  [ITEM.CO2]:         'CO₂',
  [ITEM.HEAVY_METAL]: '중금속',
  [ITEM.ALGAE]:       '조류',
  [ITEM.WET_ALGAE]:   '수분 조류',
  [ITEM.BIOMASS]:     '바이오매스',
  [ITEM.WATER]:       '수분',
}

// ─── 장치 타입 ────────────────────────────────────────────
export const DEVICE = {
  EMPTY:        'empty',
  FACTORY:      'factory',      // 공장 (고정 배치)
  CAPTURER:     'capturer',     // 탄소 포집기
  PIPE:         'pipe',         // 배관
  PURIFIER:     'purifier',     // 정제기
  TRASH:        'trash',        // 쓰레기통
  CULTIVATOR:   'cultivator',   // 배양기
  MANUFACTURER: 'manufacturer', // 제조기
  STORAGE:      'storage',      // 저장 창고
}

// 배관 방향: 0=→ 1=↓ 2=← 3=↑
export const PIPE_DIRS = ['→', '↓', '←', '↑']
export const DIR_DELTA = [
  { dx: 1, dy: 0 },   // →
  { dx: 0, dy: 1 },   // ↓
  { dx: -1, dy: 0 },  // ←
  { dx: 0, dy: -1 },  // ↑
]

// 장치별 아이콘 (이모지)
export const DEVICE_ICONS = {
  [DEVICE.FACTORY]:      '🏭',
  [DEVICE.CAPTURER]:     '🧲',
  [DEVICE.PIPE]:         '⟶',
  [DEVICE.PURIFIER]:     '⚗️',
  [DEVICE.TRASH]:        '🗑️',
  [DEVICE.CULTIVATOR]:   '🌱',
  [DEVICE.MANUFACTURER]: '⚙️',
  [DEVICE.STORAGE]:      '📦',
}

// 사용자가 배치 가능한 장치 목록 (툴바)
export const BUILDABLE_DEVICES = [
  DEVICE.CAPTURER,
  DEVICE.PIPE,
  DEVICE.PURIFIER,
  DEVICE.TRASH,
  DEVICE.CULTIVATOR,
  DEVICE.MANUFACTURER,
  DEVICE.STORAGE,
]

// 장치별 처리 로직 정의
// input: 입력 슬롯 아이템들, output: 출력 배열
export const DEVICE_PROCESS = {
  [DEVICE.CAPTURER]: {
    inputs: [ITEM.SMOKE],
    outputs: [ITEM.CAP_SMOKE],
    ticksRequired: 2,
  },
  [DEVICE.PURIFIER]: {
    inputs: [ITEM.CAP_SMOKE],
    outputs: [ITEM.CO2, ITEM.HEAVY_METAL],
    ticksRequired: 3,
  },
  [DEVICE.TRASH]: {
    inputs: [ITEM.HEAVY_METAL],
    outputs: [],
    ticksRequired: 1,
  },
  [DEVICE.CULTIVATOR]: {
    inputs: [ITEM.CO2],
    outputs: [ITEM.WET_ALGAE],
    ticksRequired: 4,
    dangerInput: ITEM.SMOKE, // smoke 입력 시 조류 사멸
  },
  [DEVICE.MANUFACTURER]: {
    inputs: [ITEM.WET_ALGAE],
    outputs: [ITEM.BIOMASS, ITEM.WATER],
    ticksRequired: 3,
  },
  [DEVICE.STORAGE]: {
    inputs: [ITEM.BIOMASS],
    outputs: [],
    ticksRequired: 1,
    isStorage: true,
  },
}

export const GRID_W = 24
export const GRID_H = 16
export const STORAGE_GOAL = 100
