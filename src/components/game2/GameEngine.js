import {
  ITEM, DEVICE, TWO_CELL_DEVICES, DIR_VEC, opposite, clockwise,
  GRID_W, GRID_H, STAGES, CAPTURER_RATE, PROCESS,
} from './gameConstants'

// ── 셀 생성 ──────────────────────────────────────────────────────────────────
export function emptyCell() {
  return {
    device: DEVICE.EMPTY,
    rotation: 0,        // 0=E 1=S 2=W 3=N
    item: null,
    progress: 0,
    captureTimer: 0,
    smokeZone: false,
    isFactory: false,
    dying: false,
    dyingTimer: 0,
    masterX: -1, masterY: -1,
    outputQ: [],
    moved: false,
  }
}

function makeGrid() {
  return Array.from({ length: GRID_H }, () =>
    Array.from({ length: GRID_W }, () => emptyCell())
  )
}

function placeFactories(grid, count) {
  const placed = []
  const margin = 3
  let tries = 0
  while (placed.length < count && tries < 500) {
    tries++
    const x = margin + Math.floor(Math.random() * (GRID_W - margin * 2))
    const y = margin + Math.floor(Math.random() * (GRID_H - margin * 2))
    const tooClose = placed.some(f => Math.abs(f.x - x) < 7 && Math.abs(f.y - y) < 7)
    if (tooClose) continue
    grid[y][x].device = DEVICE.FACTORY
    grid[y][x].isFactory = true
    placed.push({ x, y })
  }
  // Mark 3×3 smoke zones around each factory
  placed.forEach(({ x, y }) => {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy
        if (nx >= 0 && nx < GRID_W && ny >= 0 && ny < GRID_H) {
          grid[ny][nx].smokeZone = true
        }
      }
    }
  })
  return placed
}

export function createGame() {
  const grid = makeGrid()
  const fCount = 2 + Math.floor(Math.random() * 3)
  const factories = placeFactories(grid, fCount)
  return {
    grid, factories,
    stage: 0,
    storageCount: 0,
    tick: 0,
    won: false,
    effects: [],
    factoryTick: 0,
  }
}

// ── 방향 헬퍼 ────────────────────────────────────────────────────────────────
function neighborCell(grid, x, y, dir) {
  const { dx, dy } = DIR_VEC[dir]
  const nx = x + dx, ny = y + dy
  if (nx < 0 || nx >= GRID_W || ny < 0 || ny >= GRID_H) return null
  return { cell: grid[ny][nx], x: nx, y: ny }
}

// ── 틱 로직 ─────────────────────────────────────────────────────────────────
// ── 셀 단위 교체 헬퍼 ───────────────────────────────────────────────────────
function replaceCell(grid, x, y, newCell) {
  return grid.map((row, gy) =>
    gy === y ? row.map((c, gx) => gx === x ? newCell : c) : row
  )
}

export function gameTick(state) {
  const { factories, stage, storageCount: sc } = state
  const stg = STAGES[stage]
  // 변경이 필요한 셀만 새 참조로 교체: outputQ 복사 + moved 초기화
  let grid = state.grid.map(row =>
    row.map(c =>
      c.outputQ.length > 0 || c.moved
        ? { ...c, outputQ: [...c.outputQ], moved: false }
        : c
    )
  )
  let storageCount = sc
  const effects = state.effects.map(e => ({ ...e, timer: e.timer - 1 })).filter(e => e.timer > 0)
  const factoryTick = state.factoryTick + 1

  // 1. Factories emit smoke to smokeZone cells (including capturer cells) periodically
  if (factoryTick % stg.smokeEvery === 0) {
    const emitCount = stg.smokeCount ?? 1
    factories.forEach(({ x, y }) => {
      let emitted = 0
      const neighbors = []
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue
        const nx = x + dx, ny = y + dy
        if (nx >= 0 && nx < GRID_W && ny >= 0 && ny < GRID_H) neighbors.push({ nx, ny })
      }
      neighbors.sort(() => Math.random() - 0.5)
      for (const { nx, ny } of neighbors) {
        if (emitted >= emitCount) break
        const c = grid[ny][nx]
        // Accept EMPTY or CAPTURER cells that are in smokeZone and have no item
        const canReceive = (c.device === DEVICE.EMPTY || c.device === DEVICE.CAPTURER)
          && c.item === null && c.smokeZone
        if (canReceive) {
          grid[ny][nx].item = ITEM.SMOKE
          emitted++
        }
      }
    })
  }

  // 2. Capturer: consume smoke from own cell → output cap_smoke
  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      const cell = grid[y][x]
      if (cell.device !== DEVICE.CAPTURER) continue
      cell.captureTimer = (cell.captureTimer + 1)
      if (cell.captureTimer < CAPTURER_RATE) continue
      if (cell.item !== ITEM.SMOKE) continue
      cell.captureTimer = 0
      cell.item = null
      cell.outputQ.push(ITEM.CAP_SMOKE)
    }
  }

  // 3. Processing devices: consume item → produce output
  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      const cell = grid[y][x]
      const proc = PROCESS[cell.device]
      if (!proc) continue
      // Danger input for cultivator
      if (cell.device === DEVICE.CULTIVATOR && cell.item === proc.danger) {
        cell.dying = true
        cell.dyingTimer = 4
        cell.item = null
        effects.push({ x, y, type: 'dying', timer: 4 })
        continue
      }
      if (cell.dying) { cell.dyingTimer--; if (cell.dyingTimer <= 0) cell.dying = false; continue }
      if (cell.item !== proc.input) continue
      cell.progress++
      if (cell.progress < proc.ticks) continue
      cell.progress = 0
      cell.item = null
      if (proc.isStorage) {
        storageCount++
        effects.push({ x, y, type: 'store', timer: 3 })
        continue
      }
      proc.outputs.forEach(it => cell.outputQ.push(it))
    }
  }

  // 4. Drain outputQ → adjacent pipe or device input
  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      const cell = grid[y][x]
      if (!cell.outputQ.length) continue
      const proc = PROCESS[cell.device]
      // Two-output devices: rotation + clockwise
      const dirs = proc?.twoOutputs
        ? [cell.rotation, clockwise(cell.rotation)]
        : [cell.rotation]

      for (let qi = 0; qi < Math.min(cell.outputQ.length, dirs.length); qi++) {
        const nb = neighborCell(grid, x, y, dirs[qi])
        if (!nb || nb.cell.item !== null) continue
        if (nb.cell.device !== DEVICE.PIPE && nb.cell.device !== DEVICE.EMPTY &&
            nb.cell.device !== DEVICE.PURIFIER && nb.cell.device !== DEVICE.TRASH &&
            nb.cell.device !== DEVICE.CULTIVATOR && nb.cell.device !== DEVICE.MANUFACTURER &&
            nb.cell.device !== DEVICE.STORAGE) continue
        nb.cell.item = cell.outputQ[qi]
        nb.cell.moved = true
        cell.outputQ.splice(qi, 1)
        break
      }
    }
  }

  // 5. Pipe items move in rotation direction (60/min at TICK_MS=1000)
  const scanOrder = []
  for (let y = 0; y < GRID_H; y++) for (let x = 0; x < GRID_W; x++) scanOrder.push({ x, y })
  for (const { x, y } of scanOrder) {
    const cell = grid[y][x]
    if (cell.device !== DEVICE.PIPE || cell.item === null || cell.moved) continue
    const nb = neighborCell(grid, x, y, cell.rotation)
    if (!nb || nb.cell.item !== null || nb.cell.moved) continue
    if (nb.cell.device === DEVICE.SLAVE || nb.cell.device === DEVICE.FACTORY) continue
    nb.cell.item = cell.item
    nb.cell.moved = true
    cell.item = null
  }

  // Stage progression
  const currentGoal = STAGES[stage].goal
  const nextStage = stage < STAGES.length - 1 && storageCount >= currentGoal ? stage + 1 : stage
  const won = stage === STAGES.length - 1 && storageCount >= currentGoal

  return { ...state, grid, storageCount, stage: nextStage, tick: state.tick + 1, won, effects, factoryTick }
}

// ── 배치 / 제거 / 회전 ───────────────────────────────────────────────────────
export function placeDevice(state, x, y, device, rotation = 0) {
  const cell = state.grid[y][x]
  if (cell.isFactory) return state
  if (device === DEVICE.CAPTURER && (!cell.smokeZone || cell.isFactory)) return state

  // 2×1 devices: PURIFIER and MANUFACTURER
  if (TWO_CELL_DEVICES.has(device)) {
    const { dx, dy } = DIR_VEC[rotation]
    const sx = x + dx, sy = y + dy
    if (sx < 0 || sx >= GRID_W || sy < 0 || sy >= GRID_H) return state
    if (state.grid[sy][sx].isFactory || state.grid[sy][sx].device !== DEVICE.EMPTY) return state
    const masterCell = { ...emptyCell(), device, rotation, smokeZone: cell.smokeZone, isFactory: false }
    const slaveCell = { ...emptyCell(), device: DEVICE.SLAVE, rotation, masterX: x, masterY: y, smokeZone: state.grid[sy][sx].smokeZone }
    let grid = replaceCell(state.grid, x, y, masterCell)
    grid = replaceCell(grid, sx, sy, slaveCell)
    return { ...state, grid }
  }

  const newCell = { ...emptyCell(), device, rotation, smokeZone: cell.smokeZone, isFactory: false }
  return { ...state, grid: replaceCell(state.grid, x, y, newCell) }
}

export function removeDevice(state, x, y) {
  const cell = state.grid[y][x]
  if (cell.isFactory) return state
  let grid = state.grid
  // Remove slave too if master of 2×1 device
  if (TWO_CELL_DEVICES.has(cell.device)) {
    const { dx, dy } = DIR_VEC[cell.rotation]
    const sx = x + dx, sy = y + dy
    if (sx >= 0 && sx < GRID_W && sy >= 0 && sy < GRID_H) {
      grid = replaceCell(grid, sx, sy, { ...emptyCell(), smokeZone: state.grid[sy][sx].smokeZone })
    }
  }
  // Remove master if slave
  if (cell.device === DEVICE.SLAVE) {
    const { masterX: mx, masterY: my } = cell
    if (mx >= 0) grid = replaceCell(grid, mx, my, { ...emptyCell(), smokeZone: state.grid[my][mx].smokeZone })
  }
  grid = replaceCell(grid, x, y, { ...emptyCell(), smokeZone: cell.smokeZone })
  return { ...state, grid }
}

export function rotateDevice(state, x, y) {
  const cell = state.grid[y][x]
  if (cell.device === DEVICE.EMPTY || cell.isFactory) return state
  if (cell.device === DEVICE.SLAVE) return rotateDevice(state, cell.masterX, cell.masterY)
  const newState = removeDevice(state, x, y)
  return placeDevice(newState, x, y, cell.device, (cell.rotation + 1) % 4)
}

// placePipes accepts {x, y, rotation}[] for L-shaped path support
export function placePipes(state, cells) {
  let s = state
  cells.forEach(({ x, y, rotation }) => {
    const cell = s.grid[y][x]
    if (cell.device === DEVICE.EMPTY && !cell.isFactory) {
      s = placeDevice(s, x, y, DEVICE.PIPE, rotation)
    } else if (cell.device === DEVICE.PIPE) {
      // Replace existing pipe with new rotation
      s = placeDevice(removeDevice(s, x, y), x, y, DEVICE.PIPE, rotation)
    }
  })
  return s
}
