import { useRef, useEffect, memo } from 'react'
import { useLanguage } from '../../hooks/useLanguage'

function Co2TrendChart({ trend }) {
  const { t } = useLanguage()
  const canvasRef = useRef(null)
  // Store DPR-scaled dimensions so redraw effect can read them without re-running setup
  const dimsRef = useRef({ W: 0, H: 0, dpr: 1 })

  // Canvas size setup — runs once on mount only
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const W = canvas.offsetWidth
    const H = canvas.offsetHeight
    canvas.width = W * dpr
    canvas.height = H * dpr
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)
    dimsRef.current = { W, H, dpr }
  }, [])

  // Chart redraw — runs whenever trend data changes
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !trend.length) return
    const ctx = canvas.getContext('2d')
    const { W, H } = dimsRef.current
    if (!W || !H) return
    ctx.clearRect(0, 0, W, H)

    const pad = { top: 10, right: 12, bottom: 24, left: 36 }
    const chartW = W - pad.left - pad.right
    const chartH = H - pad.top - pad.bottom

    const vals = trend.map(d => d.v)
    const minV = Math.min(...vals) - 1
    const maxV = Math.max(...vals) + 1

    const xScale = i => pad.left + (i / (trend.length - 1)) * chartW
    const yScale = v => pad.top + chartH - ((v - minV) / (maxV - minV)) * chartH

    // Grid lines — 라이트 테마
    ctx.strokeStyle = 'rgba(5,46,22,0.07)'
    ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (chartH / 4) * i
      ctx.beginPath()
      ctx.moveTo(pad.left, y)
      ctx.lineTo(pad.left + chartW, y)
      ctx.stroke()
    }

    // Gradient fill — 라이트 그린
    const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH)
    grad.addColorStop(0, 'rgba(21,128,61,0.18)')
    grad.addColorStop(1, 'rgba(21,128,61,0.01)')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.moveTo(xScale(0), yScale(trend[0].v))
    trend.forEach((d, i) => ctx.lineTo(xScale(i), yScale(d.v)))
    ctx.lineTo(xScale(trend.length - 1), pad.top + chartH)
    ctx.lineTo(xScale(0), pad.top + chartH)
    ctx.closePath()
    ctx.fill()

    // Line — 선명한 초록
    ctx.strokeStyle = '#16a34a'
    ctx.lineWidth = 2
    ctx.lineJoin = 'round'
    ctx.beginPath()
    trend.forEach((d, i) => {
      if (i === 0) ctx.moveTo(xScale(i), yScale(d.v))
      else ctx.lineTo(xScale(i), yScale(d.v))
    })
    ctx.stroke()

    // Y-axis labels — 가독성 있는 다크 텍스트
    ctx.fillStyle = 'rgba(5,46,22,0.40)'
    ctx.font = '10px -apple-system, Inter, sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText(maxV.toFixed(0), pad.left - 4, pad.top + 4)
    ctx.fillText(minV.toFixed(0), pad.left - 4, pad.top + chartH)

    // X labels
    ctx.textAlign = 'center'
    ctx.fillText('-30m', xScale(0), H - 4)
    ctx.fillText('Now', xScale(trend.length - 1), H - 4)
  }, [trend])

  return (
    <div className="glass-panel rounded-2xl p-5 glow-shadow">
      <p className="text-xs font-medium text-on-surface/40 uppercase tracking-wider mb-3">
        {t.dashboard.co2Trend}
      </p>
      <canvas ref={canvasRef} className="w-full h-[120px]" />
    </div>
  )
}

export default memo(Co2TrendChart)
