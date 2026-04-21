import { useRef, useEffect, useCallback, useState } from 'react'
import { DEVICE, ITEM_COLOR, DEVICE_ICON, DIR_VEC, GRID_W, GRID_H } from './gameConstants'

const BELT_SPEED = 0.04  // belt animation speed


function drawBelt(ctx, x, y, cs, dir, offset) {
  const { dx, dy } = DIR_VEC[dir]
  // Draw 3 dots moving along belt direction
  ctx.save()
  ctx.strokeStyle = 'rgba(164,201,255,0.3)'
  ctx.lineWidth = 1
  // Center line
  const cx = x + cs / 2, cy = y + cs / 2
  ctx.beginPath()
  if (dir === 0 || dir === 2) { ctx.moveTo(x + 2, cy); ctx.lineTo(x + cs - 2, cy) }
  else { ctx.moveTo(cx, y + 2); ctx.lineTo(cx, y + cs - 2) }
  ctx.stroke()
  // Moving dots
  for (let i = 0; i < 3; i++) {
    let t = ((offset + i / 3) % 1)
    if (dir === 2 || dir === 3) t = 1 - t
    const px = x + (dir === 0 || dir === 2 ? t * cs : cs / 2)
    const py = y + (dir === 1 || dir === 3 ? t * cs : cs / 2)
    ctx.beginPath()
    ctx.arc(px, py, 2, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(164,201,255,0.5)'
    ctx.fill()
  }
  ctx.restore()
}

function drawCell(ctx, cell, x, y, cs, beltOffset) {
  const px = x * cs, py = y * cs

  // Base bg
  ctx.fillStyle = cell.smokeZone && !cell.isFactory
    ? 'rgba(107,114,128,0.18)'
    : 'rgba(20,20,20,0.7)'
  ctx.fillRect(px + 1, py + 1, cs - 2, cs - 2)

  if (cell.device === DEVICE.EMPTY || cell.device === DEVICE.SLAVE) {
    // Show smoke if present
    if (cell.item === 'smoke') {
      ctx.fillStyle = 'rgba(107,114,128,0.5)'
      ctx.beginPath()
      ctx.arc(px + cs / 2, py + cs / 2, cs * 0.25, 0, Math.PI * 2)
      ctx.fill()
    }
    return
  }

  // Device background
  const bgMap = {
    [DEVICE.FACTORY]: 'rgba(75,85,99,0.5)',
    [DEVICE.CAPTURER]: 'rgba(107,251,154,0.12)',
    [DEVICE.PIPE]: 'rgba(100,120,160,0.12)',
    [DEVICE.PURIFIER]: 'rgba(249,115,22,0.12)',
    [DEVICE.TRASH]: 'rgba(239,68,68,0.12)',
    [DEVICE.CULTIVATOR]: cell.dying ? 'rgba(239,68,68,0.25)' : 'rgba(34,211,238,0.12)',
    [DEVICE.MANUFACTURER]: 'rgba(168,85,247,0.12)',
    [DEVICE.STORAGE]: 'rgba(250,204,21,0.12)',
  }
  ctx.fillStyle = bgMap[cell.device] || 'rgba(255,255,255,0.05)'
  ctx.beginPath()
  if (typeof ctx.roundRect === 'function') ctx.roundRect(px + 1, py + 1, cs - 2, cs - 2, 4)
  else ctx.rect(px + 1, py + 1, cs - 2, cs - 2)
  ctx.fill()

  // Pipe: belt animation
  if (cell.device === DEVICE.PIPE) {
    drawBelt(ctx, px, py, cs, cell.rotation, beltOffset)
  } else {
    // Device icon
    ctx.font = `${Math.max(10, cs * 0.38)}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(DEVICE_ICON[cell.device] || '?', px + cs / 2, py + cs / 2 - (cell.device === DEVICE.FACTORY ? 0 : 3))

    // Rotation indicator (small arrow)
    if (cell.device !== DEVICE.FACTORY && cell.device !== DEVICE.TRASH && cell.device !== DEVICE.STORAGE) {
      const arrowMap = ['→', '↓', '←', '↑']
      ctx.fillStyle = 'rgba(107,251,154,0.5)'
      ctx.font = `${Math.max(8, cs * 0.22)}px monospace`
      ctx.fillText(arrowMap[cell.rotation], px + cs - cs * 0.2, py + cs * 0.2)
    }

    // Progress bar
    if (cell.progress > 0) {
      const proc = { capturer: 1, purifier: 2, cultivator: 3, manufacturer: 2, storage: 1 }[cell.device]
      if (proc) {
        ctx.fillStyle = 'rgba(255,255,255,0.08)'
        ctx.fillRect(px + 2, py + cs - 5, cs - 4, 4)
        ctx.fillStyle = '#6bfb9a'
        ctx.fillRect(px + 2, py + cs - 5, (cs - 4) * Math.min(cell.progress / proc, 1), 4)
      }
    }

    // Dying effect
    if (cell.dying) {
      ctx.fillStyle = `rgba(239,68,68,${cell.dyingTimer / 4 * 0.6})`
      ctx.fillRect(px + 1, py + 1, cs - 2, cs - 2)
      ctx.font = `${cs * 0.4}px sans-serif`
      ctx.fillText('💀', px + cs / 2, py + cs / 2)
    }
  }

  // Item dot (top-right corner)
  if (cell.item && cell.item !== 'smoke') {
    const color = ITEM_COLOR[cell.item] || '#fff'
    // On pipe: animated position along belt
    let dotX = px + cs - 7, dotY = py + 7
    if (cell.device === DEVICE.PIPE) {
      const t = beltOffset
      const { dx, dy } = DIR_VEC[cell.rotation]
      dotX = px + cs * 0.15 + t * cs * 0.7 * (dx === 0 ? 0 : dx > 0 ? 1 : -1) + (dx === 0 ? cs * 0.5 : 0)
      dotY = py + cs * 0.15 + t * cs * 0.7 * (dy === 0 ? 0 : dy > 0 ? 1 : -1) + (dy === 0 ? cs * 0.5 : 0)
    }
    ctx.beginPath()
    ctx.arc(dotX, dotY, Math.max(3, cs * 0.14), 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.fill()
    ctx.strokeStyle = 'rgba(0,0,0,0.5)'
    ctx.lineWidth = 1
    ctx.stroke()
  }

  // Smoke item on empty/smoke-zone
  if (cell.item === 'smoke') {
    ctx.globalAlpha = 0.6
    ctx.beginPath()
    ctx.arc(px + cs / 2, py + cs / 2, cs * 0.18, 0, Math.PI * 2)
    ctx.fillStyle = ITEM_COLOR.smoke
    ctx.fill()
    ctx.globalAlpha = 1
  }
}

export default function GameCanvas({ gameState, onCellClick, onCellRightClick, onPipeDrag, selectedTool, cellSize }) {
  const canvasRef = useRef(null)
  const beltRef = useRef(0)
  const rafRef = useRef(null)
  const dragRef = useRef(null)
  const [hoverCell, setHoverCell] = useState(null)
  const gameStateRef = useRef(gameState)
  const hoverCellRef = useRef(hoverCell)

  // Keep refs in sync with latest props/state without restarting RAF loop
  useEffect(() => { gameStateRef.current = gameState }, [gameState])
  useEffect(() => { hoverCellRef.current = hoverCell }, [hoverCell])

  // Animation loop — deps contain only stable values (cellSize, dragRef)
  useEffect(() => {
    const tick = () => {
      beltRef.current = (beltRef.current + BELT_SPEED) % 1
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      const W = GRID_W * cellSize
      const H = GRID_H * cellSize
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#111'
      ctx.fillRect(0, 0, W, H)
      // Grid lines
      ctx.strokeStyle = 'rgba(255,255,255,0.04)'
      ctx.lineWidth = 1
      for (let x = 0; x <= GRID_W; x++) { ctx.beginPath(); ctx.moveTo(x * cellSize, 0); ctx.lineTo(x * cellSize, H); ctx.stroke() }
      for (let y = 0; y <= GRID_H; y++) { ctx.beginPath(); ctx.moveTo(0, y * cellSize); ctx.lineTo(W, y * cellSize); ctx.stroke() }
      const gs = gameStateRef.current
      gs.grid.forEach((row, gy) => row.forEach((cell, gx) => drawCell(ctx, cell, gx, gy, cellSize, beltRef.current)))
      // Effects
      gs.effects.forEach(({ x, y, type, timer }) => {
        if (type === 'store') {
          ctx.fillStyle = `rgba(107,251,154,${timer / 3 * 0.5})`
          ctx.fillRect(x * cellSize + 1, y * cellSize + 1, cellSize - 2, cellSize - 2)
        }
      })
      // Hover highlight
      const hc = hoverCellRef.current
      if (hc) {
        ctx.strokeStyle = 'rgba(107,251,154,0.5)'
        ctx.lineWidth = 2
        ctx.strokeRect(hc.x * cellSize + 1, hc.y * cellSize + 1, cellSize - 2, cellSize - 2)
      }
      // Drag preview for pipes
      if (dragRef.current?.cells) {
        ctx.fillStyle = 'rgba(164,201,255,0.25)'
        dragRef.current.cells.forEach(({ x, y }) => ctx.fillRect(x * cellSize + 2, y * cellSize + 2, cellSize - 4, cellSize - 4))
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [cellSize])

  const cellAt = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const scaleX = (GRID_W * cellSize) / rect.width
    const scaleY = (GRID_H * cellSize) / rect.height
    const x = Math.floor(((e.clientX - rect.left) * scaleX) / cellSize)
    const y = Math.floor(((e.clientY - rect.top) * scaleY) / cellSize)
    if (x < 0 || x >= GRID_W || y < 0 || y >= GRID_H) return null
    return { x, y }
  }, [cellSize])

  const getDragCells = (start, end) => {
    const cells = []
    const dx = end.x - start.x
    const dy = end.y - start.y
    if (Math.abs(dx) >= Math.abs(dy)) {
      const step = dx >= 0 ? 1 : -1
      for (let x = start.x; x !== end.x + step; x += step) cells.push({ x, y: start.y })
    } else {
      const step = dy >= 0 ? 1 : -1
      for (let y = start.y; y !== end.y + step; y += step) cells.push({ x: start.x, y })
    }
    return cells
  }

  const onMouseDown = useCallback((e) => {
    if (e.button !== 0) return
    const pos = cellAt(e)
    if (!pos) return
    if (selectedTool === DEVICE.PIPE) {
      dragRef.current = { start: pos, cells: [pos], rotation: 0 }
    } else {
      onCellClick(pos.x, pos.y)
    }
  }, [cellAt, selectedTool, onCellClick])

  const onMouseMove = useCallback((e) => {
    const pos = cellAt(e)
    setHoverCell(pos)
    if (!dragRef.current || !pos) return
    const cells = getDragCells(dragRef.current.start, pos)
    const dx = pos.x - dragRef.current.start.x
    const dy = pos.y - dragRef.current.start.y
    const rot = Math.abs(dx) >= Math.abs(dy) ? (dx >= 0 ? 0 : 2) : (dy >= 0 ? 1 : 3)
    dragRef.current = { ...dragRef.current, cells, rotation: rot }
  }, [cellAt])

  const onMouseUp = useCallback((e) => {
    if (!dragRef.current) return
    const { cells, rotation } = dragRef.current
    if (cells.length > 0) onPipeDrag(cells, rotation)
    dragRef.current = null
  }, [onPipeDrag])

  const onRightClick = useCallback((e) => {
    e.preventDefault()
    const pos = cellAt(e)
    if (pos) onCellRightClick(pos.x, pos.y)
  }, [cellAt, onCellRightClick])

  return (
    <canvas
      ref={canvasRef}
      width={GRID_W * cellSize}
      height={GRID_H * cellSize}
      className="w-full h-full cursor-crosshair"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={() => { setHoverCell(null); dragRef.current = null }}
      onContextMenu={onRightClick}
    />
  )
}
