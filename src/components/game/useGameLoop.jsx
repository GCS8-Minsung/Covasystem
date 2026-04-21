import { useRef, useCallback, useEffect } from 'react'

export default function useGameLoop() {
  const rafIdRef = useRef(null)
  const callbackRef = useRef(null)

  const loop = useCallback(() => {
    if (callbackRef.current) callbackRef.current()
    rafIdRef.current = requestAnimationFrame(loop)
  }, [])

  const start = useCallback((cb) => {
    callbackRef.current = cb
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current)
    rafIdRef.current = requestAnimationFrame(loop)
  }, [loop])

  const stop = useCallback(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = null
    }
    callbackRef.current = null
  }, [])

  useEffect(() => {
    return () => stop()
  }, [stop])

  return { start, stop }
}
