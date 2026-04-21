import { useRef, useEffect, useState, memo } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function Co2PredictChart() {
  const canvasRef = useRef(null)
  const [predictions, setPredictions] = useState([])
  const [baseline, setBaseline] = useState(13.7)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch(`${API_URL}/api/predict/co2`)
        if (!res.ok) return
        const data = await res.json()
        setPredictions(data.predictions)
        setBaseline(data.baseline_kg)
      } finally {
        setLoading(false)
      }
    }
    fetch_()
    const timer = setInterval(fetch_, 60000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!predictions.length) return
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = window.devicePixelRatio || 1
    const W = canvas.offsetWidth
    const H = canvas.offsetHeight
    if (!W || !H) return

    canvas.width = W * dpr
    canvas.height = H * dpr
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, W, H)

    const pad = { top: 14, right: 16, bottom: 30, left: 42 }
    const chartW = W - pad.left - pad.right
    const chartH = H - pad.top - pad.bottom
    const n = predictions.length

    const minV = Math.min(baseline * 0.88, ...predictions.map(p => p.lower_kg))
    const maxV = Math.max(baseline * 1.08, ...predictions.map(p => p.upper_kg))
    const range = maxV - minV || 1

    const xS = i => pad.left + (i / (n - 1)) * chartW
    const yS = v => pad.top + chartH - ((v - minV) / range) * chartH

    // Grid — same as Co2TrendChart
    ctx.strokeStyle = 'rgba(5,46,22,0.07)'
    ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (chartH / 4) * i
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + chartW, y); ctx.stroke()
    }

    // Confidence band — muted green fill
    const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH)
    grad.addColorStop(0, 'rgba(21,128,61,0.12)')
    grad.addColorStop(1, 'rgba(21,128,61,0.03)')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.moveTo(xS(0), yS(predictions[0].upper_kg))
    predictions.forEach((p, i) => ctx.lineTo(xS(i), yS(p.upper_kg)))
    predictions.slice().reverse().forEach((p, i) => ctx.lineTo(xS(n - 1 - i), yS(p.lower_kg)))
    ctx.closePath()
    ctx.fill()

    // Upper / lower bound dashes — subtle
    ctx.strokeStyle = 'rgba(21,128,61,0.25)'
    ctx.lineWidth = 1
    ctx.setLineDash([3, 5])
    ;['upper_kg', 'lower_kg'].forEach(key => {
      ctx.beginPath()
      predictions.forEach((p, i) => {
        if (i === 0) ctx.moveTo(xS(i), yS(p[key]))
        else ctx.lineTo(xS(i), yS(p[key]))
      })
      ctx.stroke()
    })
    ctx.setLineDash([])

    // Predicted center line — dark green, dashed
    ctx.strokeStyle = '#16a34a'
    ctx.lineWidth = 2
    ctx.setLineDash([7, 4])
    ctx.lineJoin = 'round'
    ctx.beginPath()
    predictions.forEach((p, i) => {
      if (i === 0) ctx.moveTo(xS(i), yS(p.predicted_kg))
      else ctx.lineTo(xS(i), yS(p.predicted_kg))
    })
    ctx.stroke()
    ctx.setLineDash([])

    // Dots
    predictions.forEach((p, i) => {
      ctx.fillStyle = '#16a34a'
      ctx.beginPath()
      ctx.arc(xS(i), yS(p.predicted_kg), 2.5, 0, Math.PI * 2)
      ctx.fill()
    })

    // Y labels
    ctx.fillStyle = 'rgba(5,46,22,0.40)'
    ctx.font = '10px -apple-system, Inter, sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText(maxV.toFixed(1), pad.left - 5, pad.top + 4)
    ctx.fillText(minV.toFixed(1), pad.left - 5, pad.top + chartH + 4)

    // X labels
    ctx.textAlign = 'center'
    predictions.forEach((p, i) => {
      if (i % 2 === 0 || i === n - 1) {
        ctx.fillText(p.date.slice(5), xS(i), H - 5)
      }
    })
  }, [predictions, baseline])

  return (
    <div className="glass-panel rounded-2xl p-5 glow-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined" style={{ fontSize: 13, color: '#16a34a' }}>trending_up</span>
          <p className="text-xs font-medium text-on-surface/40 uppercase tracking-wider">CO₂ 포집량 7일 예측</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-on-surface/40">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 border-t-2 border-dashed" style={{ borderColor: '#16a34a' }} />
            예측값
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-2 rounded-sm" style={{ background: 'rgba(21,128,61,0.18)' }} />
            신뢰구간
          </span>
        </div>
      </div>
      {loading ? (
        <div className="h-[120px] flex items-center justify-center">
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#16a34a', animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      ) : (
        <canvas ref={canvasRef} className="w-full" style={{ height: 120 }} />
      )}
      {predictions.length > 0 && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-on-surface/30">
          <span className="material-symbols-outlined" style={{ fontSize: 11, color: '#16a34a' }}>auto_awesome</span>
          베이스라인 {baseline.toFixed(1)} kg/일 · 지수평활법
        </div>
      )}
    </div>
  )
}

export default memo(Co2PredictChart)
