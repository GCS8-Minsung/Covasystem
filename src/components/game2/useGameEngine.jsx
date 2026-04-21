import { useState, useEffect, useRef, useCallback } from 'react'
import { createGame, gameTick, placeDevice, removeDevice, rotateDevice, placePipes } from './GameEngine'
import { DEVICE, TICK_MS } from './gameConstants'

export function useGameEngine() {
  const [gameState, setGameState] = useState(() => createGame())
  const [started, setStarted] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!started || gameState.won) { clearInterval(intervalRef.current); return }
    intervalRef.current = setInterval(() => {
      setGameState(prev => gameTick(prev))
    }, TICK_MS)
    return () => clearInterval(intervalRef.current)
  }, [started, gameState.won])

  const startGame = useCallback(() => setStarted(true), [])

  const handleCellClick = useCallback((x, y, tool, rotation = 0) => {
    setGameState(prev => {
      const cell = prev.grid[y][x]
      if (tool === 'bulldoze') return removeDevice(prev, x, y)
      if (tool === DEVICE.PIPE && cell.device === DEVICE.PIPE) return rotateDevice(prev, x, y)
      if (cell.device !== DEVICE.EMPTY && cell.device !== DEVICE.SLAVE && tool !== 'bulldoze') {
        return rotateDevice(prev, x, y)
      }
      return placeDevice(prev, x, y, tool, rotation)
    })
  }, [])

  const handleRightClick = useCallback((x, y) => {
    setGameState(prev => removeDevice(prev, x, y))
  }, [])

  // cells: {x, y, rotation}[] — supports L-shaped paths
  const handlePipeDrag = useCallback((cells) => {
    setGameState(prev => placePipes(prev, cells))
  }, [])

  const resetGame = useCallback(() => {
    clearInterval(intervalRef.current)
    setGameState(createGame())
    setStarted(false)
  }, [])

  return { gameState, started, startGame, handleCellClick, handleRightClick, handlePipeDrag, resetGame }
}
