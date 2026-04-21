export default class CarbonParticle {
  constructor(canvasW, canvasH) {
    this.reset(canvasW, canvasH)
    this.y = Math.random() * canvasH
  }

  reset(canvasW, canvasH) {
    this.canvasW = canvasW
    this.canvasH = canvasH
    this.r = 20 + Math.random() * 25
    this.x = this.r + Math.random() * (canvasW - this.r * 2)
    this.y = -this.r
    this.vx = (Math.random() - 0.5) * 1.5
    this.vy = 0.3 + Math.random() * 1.2
    this.opacity = 0.6 + Math.random() * 0.4
    this.hit = false
    this.hitAlpha = 1
  }

  update() {
    if (this.hit) {
      this.hitAlpha -= 0.06
      this.r += 1
      return
    }
    this.x += this.vx
    this.y += this.vy
    if (this.x - this.r < 0) { this.x = this.r; this.vx = Math.abs(this.vx) }
    if (this.x + this.r > this.canvasW) { this.x = this.canvasW - this.r; this.vx = -Math.abs(this.vx) }
  }

  isOffScreen() {
    return this.y - this.r > this.canvasH || (this.hit && this.hitAlpha <= 0)
  }

  // Caller must set ctx.font, ctx.textAlign, ctx.textBaseline once per frame before calling draw()
  draw(ctx) {
    ctx.globalAlpha = this.hit ? this.hitAlpha * this.opacity : this.opacity

    // Outer glow — flat fill instead of radial gradient (no allocation per frame)
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
    ctx.fillStyle = this.hit ? 'rgba(107,251,154,0.35)' : 'rgba(164,201,255,0.30)'
    ctx.fill()

    // Ring border
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.r * 0.7, 0, Math.PI * 2)
    ctx.strokeStyle = this.hit ? 'rgba(107,251,154,0.80)' : 'rgba(164,201,255,0.50)'
    ctx.lineWidth = 1.5
    ctx.stroke()

    // Label — font/align/baseline pre-set by caller
    ctx.fillStyle = this.hit ? '#6bfb9a' : '#a4c9ff'
    ctx.fillText('CO₂', this.x, this.y)

    ctx.globalAlpha = 1
  }

  contains(px, py) {
    const dx = px - this.x
    const dy = py - this.y
    return dx * dx + dy * dy <= this.r * this.r
  }
}
