import { useRef, useEffect } from 'react'
import * as THREE from 'three'

const CELLS = 100   // reduced for performance
const BUBBLES = 30  // reduced for performance

export default function AlgaeViz3D({ data }) {
  const mountRef = useRef(null)
  const cleanupRef = useRef(null)
  const dataRef = useRef(data)

  useEffect(() => { dataRef.current = data })

  useEffect(() => {
    cleanupRef.current?.()
    const el = mountRef.current
    if (!el) return

    let animId
    const W = el.clientWidth || 800, H = el.clientHeight || 400

    // ── Scene ─────────────────────────────────────────────────
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0e2419)  // lighter dark green

    const camera = new THREE.PerspectiveCamera(36, W / H, 0.1, 60)
    camera.position.set(2.6, 1.5, 5.5)
    camera.lookAt(0, 0.2, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.0))
    renderer.setSize(W, H)
    el.appendChild(renderer.domElement)

    // ── Lights (minimal set) ──────────────────────────────────
    scene.add(new THREE.AmbientLight(0x1a4a2e, 1.4))
    const dir = new THREE.DirectionalLight(0xd1fae5, 0.7)
    dir.position.set(3, 5, 3)
    scene.add(dir)
    // Fixed glow inside tank — no per-frame position update
    const glowLight = new THREE.PointLight(0x6bfb9a, 2.5, 5)
    glowLight.position.set(0, 0.3, 0)
    scene.add(glowLight)

    // ── Fixed floor grid ──────────────────────────────────────
    const grid = new THREE.GridHelper(10, 20, 0x1a5c32, 0x0d3320)
    grid.position.y = -2.6
    scene.add(grid)

    // ── Pivot ─────────────────────────────────────────────────
    const pivot = new THREE.Group()
    scene.add(pivot)

    // Glass cylinder
    pivot.add(new THREE.Mesh(
      new THREE.CylinderGeometry(1.0, 1.0, 3.8, 64, 1, true),
      new THREE.MeshStandardMaterial({
        color: 0x88ddc0, transparent: true, opacity: 0.10,
        roughness: 0, side: THREE.DoubleSide, depthWrite: false,
      })
    ))

    // Inner glow sleeve
    pivot.add(new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 3.6, 32, 1, true),
      new THREE.MeshStandardMaterial({
        emissive: 0x0c4a1e, emissiveIntensity: 0.8,
        transparent: true, opacity: 0.12,
        side: THREE.DoubleSide, depthWrite: false,
      })
    ))

    // TOP + BOTTOM structural rim rings
    // ★ rotation.x = PI/2 → lies horizontal in XZ plane (belt around Y-axis cylinder)
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x34d399, metalness: 0.95, roughness: 0.05 })
    ;[-1.9, 1.9].forEach(y => {
      const r = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.025, 12, 64), rimMat)
      r.rotation.x = Math.PI / 2   // fix: horizontal belt
      r.position.y = y
      pivot.add(r)
    })

    // LED ring at top
    const ledRingMat = new THREE.MeshStandardMaterial({
      color: 0x6bfb9a, emissive: 0x6bfb9a, emissiveIntensity: 4,
    })
    const ledRing = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.04, 8, 64), ledRingMat)
    ledRing.rotation.x = Math.PI / 2   // fix: horizontal
    ledRing.position.y = 1.96
    pivot.add(ledRing)

    // Top / bottom caps
    const capMat = new THREE.MeshStandardMaterial({ color: 0x1a3a28, metalness: 0.8, roughness: 0.2 })
    ;[-1.93, 1.93].forEach(y => {
      const c = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.05, 48), capMat)
      c.position.y = y
      pivot.add(c)
    })

    // 4 outer support bars
    const barMat = new THREE.MeshStandardMaterial({ color: 0x166534, metalness: 0.9, roughness: 0.1 })
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 4.2, 6), barMat)
      bar.position.set(Math.cos(a) * 1.12, 0, Math.sin(a) * 1.12)
      pivot.add(bar)
    }

    // LED panels (left & right) — MeshLambertMaterial for perf
    const ledPanelMat = new THREE.MeshLambertMaterial({
      color: 0xd9f99d, emissive: 0x6bfb9a, emissiveIntensity: 2.0,
    })
    ;[[-1.38, 0, 0], [1.38, 0, 0]].forEach(([x, y, z]) => {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(0.06, 3.2, 0.55), ledPanelMat)
      panel.position.set(x, y, z)
      pivot.add(panel)
    })

    // CO₂ sparger disc (bottom)
    const spargerDisc = new THREE.Mesh(
      new THREE.CircleGeometry(0.65, 20),
      new THREE.MeshBasicMaterial({ color: 0x93c5fd, wireframe: true, transparent: true, opacity: 0.7 })
    )
    spargerDisc.rotation.x = -Math.PI / 2
    spargerDisc.position.y = -1.88
    pivot.add(spargerDisc)

    const hubMat = new THREE.MeshLambertMaterial({ color: 0x93c5fd, emissive: 0x93c5fd, emissiveIntensity: 2 })
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 16), hubMat)
    hub.position.y = -1.87
    pivot.add(hub)

    // 3 support legs
    const legMat = new THREE.MeshStandardMaterial({ color: 0x1a3a28, metalness: 0.85, roughness: 0.15 })
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.6, 8), legMat)
      leg.position.set(Math.cos(a) * 0.85, -2.22, Math.sin(a) * 0.85)
      leg.rotation.z = Math.cos(a) * 0.25
      leg.rotation.x = Math.sin(a) * 0.25
      pivot.add(leg)
    }

    // Pipes
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x4ade80, metalness: 0.95, roughness: 0.05 })
    const pipeIn = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.65, 8), pipeMat)
    pipeIn.position.set(0, -2.25, 0)
    pivot.add(pipeIn)
    const pipeH = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.5, 8), pipeMat)
    pipeH.rotation.z = Math.PI / 2
    pipeH.position.set(0.35, -2.35, 0)
    pivot.add(pipeH)
    const pipeOut = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8), pipeMat)
    pipeOut.position.set(0, 2.16, 0)
    pivot.add(pipeOut)

    // Sensor probes
    const sensMat = new THREE.MeshStandardMaterial({ color: 0x93c5fd, metalness: 0.9 })
    const tipMat  = new THREE.MeshLambertMaterial({ color: 0x93c5fd, emissive: 0x93c5fd, emissiveIntensity: 3 })
    ;[[1.02, 0.3, 0], [-1.02, -0.5, 0]].forEach(([x, y, z]) => {
      const s = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.35, 6), sensMat)
      s.position.set(x, y, z); s.rotation.z = x > 0 ? -0.4 : 0.4
      pivot.add(s)
      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 6), tipMat)
      tip.position.set(x + (x > 0 ? -0.09 : 0.09), y, z)
      pivot.add(tip)
    })

    // Scan line
    const scanMat = new THREE.MeshBasicMaterial({
      color: 0x6bfb9a, transparent: true, opacity: 0.09, side: THREE.DoubleSide,
    })
    const scanDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.97, 0.97, 0.01, 32), scanMat)
    pivot.add(scanDisc)

    // ── Algae cells — InstancedMesh + MeshLambertMaterial ─────
    const initBiomass = dataRef.current?.biomassMonth ?? 192
    const cellCount = Math.min(CELLS, Math.round((initBiomass / 200) * CELLS))
    const cellMat = new THREE.MeshLambertMaterial({ emissive: 0x22c55e, emissiveIntensity: 0.5 })
    const cellMesh = new THREE.InstancedMesh(
      new THREE.SphereGeometry(0.026, 4, 4), cellMat, cellCount
    )
    cellMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    pivot.add(cellMesh)
    const cellData = Array.from({ length: cellCount }, () => ({
      r: 0.75 * Math.sqrt(Math.random()), th: Math.random() * Math.PI * 2,
      speed: 0.12 + Math.random() * 0.25,
      phase: Math.random() * Math.PI * 2,
      bob: 0.25 + Math.random() * 0.45,
      baseY: (Math.random() - 0.5) * 2.6,
    }))

    // ── CO₂ bubbles — InstancedMesh + MeshLambertMaterial ─────
    const bubbleMat = new THREE.MeshLambertMaterial({
      color: 0xbae6fd, transparent: true, opacity: 0.50,
      emissive: 0x93c5fd, emissiveIntensity: 0.3,
    })
    const bubbleMesh = new THREE.InstancedMesh(
      new THREE.SphereGeometry(0.018, 4, 4), bubbleMat, BUBBLES
    )
    bubbleMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    pivot.add(bubbleMesh)
    const bubbleData = Array.from({ length: BUBBLES }, () => ({
      r: Math.sqrt(Math.random()) * 0.55, th: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.5,  phase: Math.random() * 3.8,
    }))

    // ── Drag ──────────────────────────────────────────────────
    let drag = false, lx = 0, rotY = 0, targetRotY = 0
    const onDown = e => { drag = true; lx = e.clientX ?? e.touches?.[0]?.clientX }
    const onUp   = () => { drag = false }
    const onMove = e => {
      if (!drag) return
      const x = e.clientX ?? e.touches?.[0]?.clientX
      targetRotY += (x - lx) * 0.01; lx = x
    }
    renderer.domElement.addEventListener('mousedown', onDown)
    renderer.domElement.addEventListener('touchstart', onDown, { passive: true })
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchend', onUp)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('touchmove', onMove, { passive: true })

    // ── Animation loop ────────────────────────────────────────
    const dummy = new THREE.Object3D()
    const liveCol = new THREE.Color()
    let frame = 0

    const tick = () => {
      animId = requestAnimationFrame(tick)
      const t = performance.now() * 0.001
      frame++

      // Live data updates every 6 frames (~10fps for non-critical changes)
      if (frame % 6 === 0) {
        const o2  = dataRef.current?.o2Purity ?? 98.4
        const lux = dataRef.current?.lux      ?? 4200
        liveCol.set(o2 > 97 ? 0x22c55e : o2 > 93 ? 0x4ade80 : 0xfbbf24)
        cellMat.color.set(liveCol)
        cellMat.emissive.set(liveCol)
        ledPanelMat.emissiveIntensity = 0.8 + (lux / 4200) * 2.0
        glowLight.intensity = 2.2 + Math.sin(t * 1.2) * 0.4
      }

      // Rotation
      rotY += (targetRotY - rotY) * 0.06
      pivot.rotation.y = rotY + t * 0.005

      // Cells
      cellData.forEach((c, i) => {
        const y = c.baseY * 0.5 + Math.sin(t * c.speed + c.phase) * c.bob
        dummy.position.set(c.r * Math.cos(c.th), y, c.r * Math.sin(c.th))
        dummy.updateMatrix()
        cellMesh.setMatrixAt(i, dummy.matrix)
      })
      cellMesh.instanceMatrix.needsUpdate = true

      // Bubbles (rise from sparger)
      bubbleData.forEach((b, i) => {
        const y = -1.9 + ((t * b.speed + b.phase) % 3.8)
        dummy.position.set(b.r * Math.cos(b.th), y, b.r * Math.sin(b.th))
        dummy.updateMatrix()
        bubbleMesh.setMatrixAt(i, dummy.matrix)
      })
      bubbleMesh.instanceMatrix.needsUpdate = true

      // Scan line
      scanDisc.position.y = -1.9 + ((t * 0.22) % 3.8)

      // LED ring pulse (every frame is fine, it's cheap)
      ledRingMat.emissiveIntensity = 3.2 + Math.sin(t * 2) * 0.7

      renderer.render(scene, camera)
    }
    tick()

    const onResize = () => {
      const w = el.clientWidth, h = el.clientHeight
      if (!w || !h) return
      camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    cleanupRef.current = () => {
      cancelAnimationFrame(animId)
      renderer.domElement.removeEventListener('mousedown', onDown)
      renderer.domElement.removeEventListener('touchstart', onDown)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchend', onUp)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
      cleanupRef.current = null
    }
    return () => { cleanupRef.current?.() }
  }, [])

  const ph      = data?.culturePH?.toFixed(2)    ?? '7.18'
  const temp    = data?.cultureTemp?.toFixed(1)  ?? '26.5'
  const o2val   = data?.o2Purity?.toFixed(1)     ?? '98.4'
  const biomass = data?.biomassMonth?.toFixed(1) ?? '192.3'
  const ledW    = data?.lux ? Math.round(data.lux * 0.002) : 8
  const co2Flow = data?.extractPressure ? ((data.extractPressure / 73) * 4.2).toFixed(1) : '4.2'

  return (
    <div className="glass-panel rounded-2xl glow-shadow overflow-hidden">
      <div className="px-5 pt-4 pb-2.5 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <p className="text-xs font-semibold text-on-surface/60 uppercase tracking-wider">
            Digital Twin · PBR-01
          </p>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-on-surface/30 uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />미세조류
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-300 inline-block" />CO₂
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-200 inline-block" />LED
          </span>
          <span className="opacity-50">드래그 회전</span>
        </div>
      </div>

      <div ref={mountRef} style={{ height: 400 }} />

      <div className="px-5 py-3 grid grid-cols-3 gap-x-4 gap-y-2.5 border-t border-white/5">
        {[
          { label: 'pH',        value: ph,                 color: 'text-secondary' },
          { label: 'Temp',      value: `${temp} °C`,       color: 'text-orange-300' },
          { label: 'O₂ Purity', value: `${o2val} %`,       color: 'text-primary' },
          { label: 'Biomass',   value: `${biomass} g`,      color: 'text-primary' },
          { label: 'LED Power', value: `${ledW} W`,         color: 'text-yellow-300' },
          { label: 'CO₂ Flow',  value: `${co2Flow} L/min`, color: 'text-sky-300' },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex flex-col gap-0.5">
            <span className="text-[9px] text-on-surface/30 uppercase tracking-wider">{label}</span>
            <span className={`text-sm font-bold font-mono ${color}`}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
