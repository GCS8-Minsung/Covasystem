import { useEffect, useRef, useState, useCallback } from 'react'

function isIndexExtended(lm) {
  // Index tip (8) should be higher (smaller y) than MCP (5)
  return lm[8].y < lm[6].y && lm[6].y < lm[5].y
}

function isFingerFolded(tipId, pipId, mcpId, lm) {
  return lm[tipId].y > lm[pipId].y && lm[pipId].y > lm[mcpId].y
}

function detectGesture(landmarks) {
  const lm = landmarks
  const indexExtended = isIndexExtended(lm)
  const middleFolded = isFingerFolded(12, 11, 9, lm)
  const ringFolded = isFingerFolded(16, 15, 13, lm)
  const pinkyFolded = isFingerFolded(20, 19, 17, lm)

  if (indexExtended && middleFolded && ringFolded && pinkyFolded) {
    return 'aim'
  }
  // All fingers closed = fire
  if (!indexExtended && middleFolded && ringFolded && pinkyFolded) {
    return 'fire'
  }
  return 'none'
}

export default function useMediaPipe(videoRef, enabled) {
  const [aimPos, setAimPos] = useState(null)
  const [ready, setReady] = useState(false)
  const prevGestureRef = useRef('none')
  const cameraRef = useRef(null)
  const handsRef = useRef(null)
  const initializedRef = useRef(false)

  const onResults = useCallback((results) => {
    if (!results.multiHandLandmarks?.length) {
      setAimPos(null)
      prevGestureRef.current = 'none'
      return
    }

    const landmarks = results.multiHandLandmarks[0]
    const gesture = detectGesture(landmarks)
    const indexTip = landmarks[8]

    // Mirror flip X coordinate
    const x = 1 - indexTip.x
    const y = indexTip.y

    const fire = gesture === 'fire' && prevGestureRef.current === 'aim'
    prevGestureRef.current = gesture

    if (gesture === 'aim' || fire) {
      setAimPos({ x, y, fire })
    } else {
      setAimPos(null)
    }
  }, [])

  // One-time initialization — Hands instance persists for component lifetime
  useEffect(() => {
    if (initializedRef.current || !videoRef.current) return
    let cancelled = false

    async function init() {
      try {
        const { Hands } = await import('@mediapipe/hands')
        const { Camera } = await import('@mediapipe/camera_utils')

        if (cancelled) return

        const hands = new Hands({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        })
        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.5,
        })
        hands.onResults(onResults)
        handsRef.current = hands

        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current && handsRef.current) {
              await handsRef.current.send({ image: videoRef.current })
            }
          },
          width: 640,
          height: 480,
        })
        cameraRef.current = camera
        initializedRef.current = true

        if (enabled) {
          await camera.start()
          if (!cancelled) setReady(true)
        }
      } catch (err) {
        if (import.meta.env.DEV) console.warn('MediaPipe init failed, using mouse mode:', err)
      }
    }

    init()

    return () => {
      cancelled = true
      if (cameraRef.current) {
        cameraRef.current.stop()
        cameraRef.current = null
      }
      handsRef.current = null
      initializedRef.current = false
      setReady(false)
      setAimPos(null)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoRef, onResults])

  // Toggle camera start/stop without recreating Hands instance
  useEffect(() => {
    if (!initializedRef.current || !cameraRef.current) return
    if (enabled) {
      cameraRef.current.start().then(() => setReady(true)).catch(() => {})
    } else {
      cameraRef.current.stop()
      setReady(false)
      setAimPos(null)
    }
  }, [enabled])

  return { aimPos, ready }
}
