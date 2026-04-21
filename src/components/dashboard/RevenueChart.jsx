import { useRef, useEffect } from 'react'
import { useLanguage } from '../../hooks/useLanguage'

export default function RevenueChart({ breakdown }) {
  const { t } = useLanguage()
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const W = canvas.offsetWidth
    const H = canvas.offsetHeight
    canvas.width = W * dpr
    canvas.height = H * dpr
    ctx.scale(dpr, dpr)

    ctx.clearRect(0, 0, W, H)

    // Bar chart
    const barH = 24
    const gap = 16
    const labelW = 100
    const chartW = W - labelW - 60

    breakdown.forEach((item, i) => {
      const y = i * (barH + gap) + 10
      // Label — 가독성 있는 다크 텍스트
      ctx.fillStyle = 'rgba(5,46,22,0.55)'
      ctx.font = '11px -apple-system, Inter, sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText(item.label, labelW - 8, y + barH / 2 + 4)

      // Bar bg — 연한 녹색 트랙
      ctx.fillStyle = 'rgba(5,46,22,0.06)'
      ctx.beginPath()
      ctx.roundRect(labelW, y, chartW, barH, 6)
      ctx.fill()

      // Bar fill
      const fillW = (item.value / 100) * chartW
      ctx.fillStyle = item.color
      ctx.globalAlpha = 0.90
      ctx.beginPath()
      ctx.roundRect(labelW, y, fillW, barH, 6)
      ctx.fill()
      ctx.globalAlpha = 1

      // Percentage — 명확한 텍스트
      ctx.fillStyle = 'rgba(5,46,22,0.60)'
      ctx.textAlign = 'left'
      ctx.fillText(`${item.value}%`, labelW + fillW + 6, y + barH / 2 + 4)
    })
  }, [breakdown])

  return (
    <div className="glass-panel rounded-2xl p-5 glow-shadow">
      <p className="text-xs font-medium text-on-surface/40 uppercase tracking-wider mb-4">
        {t.dashboard.revenueChart}
      </p>
      <canvas ref={canvasRef} className="w-full" style={{ height: `${4 * (24 + 16) + 10}px` }} />
    </div>
  )
}
