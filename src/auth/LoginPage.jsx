import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { useLanguage } from '../hooks/useLanguage'

export default function LoginPage() {
  const { login } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError(t.auth.errorEmpty); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    const ok = login(email, password)
    setLoading(false)
    if (!ok) setError(t.auth.errorInvalid)
    else navigate('/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen flex overflow-hidden">

      {/* ── 왼쪽 패널: 브랜드 스토리 ─────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #052e16 0%, #14532d 40%, #166534 100%)',
        }}
      >
        {/* 환경광 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 70% at 20% 20%, rgba(74,222,128,0.15) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(56,189,248,0.10) 0%, transparent 55%)',
          }}
        />

        {/* 상단 로고 */}
        <div className="relative z-10 flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(74,222,128,0.20)', border: '1.5px solid rgba(74,222,128,0.30)' }}
          >
            <span className="text-green-300 text-sm font-black">C</span>
          </div>
          <span className="font-bold text-xl text-white tracking-widest">COVA</span>
        </div>

        {/* 중간 메시지 */}
        <div className="relative z-10 flex flex-col gap-8">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-green-400/70 mb-4">
              Carbon-to-Revenue Platform
            </p>
            <h2
              className="font-bold text-white leading-[1.1] mb-4"
              style={{ fontSize: 'clamp(2rem,3.5vw,2.75rem)', letterSpacing: '-0.03em' }}
            >
              공장 CO₂를<br />수익으로
            </h2>
            <p className="text-green-100/60 text-base leading-relaxed max-w-xs">
              탄소 배출을 미세조류 바이오소재로 전환하는 구독형 플랫폼. 초기 투자 없이 시작하세요.
            </p>
          </div>

          {/* 핵심 수치 3개 */}
          <div className="flex flex-col gap-3">
            {[
              { value: '94%',  label: 'CO₂ 포집 효율',   icon: 'air' },
              { value: '0원',  label: '초기 투자 비용',   icon: 'savings' },
              { value: '3.4년', label: '평균 투자 회수',  icon: 'trending_up' },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <span
                  className="material-symbols-outlined text-green-300/80 text-lg"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {item.icon}
                </span>
                <span className="font-bold text-white text-lg" style={{ letterSpacing: '-0.02em' }}>
                  {item.value}
                </span>
                <span className="text-green-100/50 text-xs font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 하단 */}
        <div className="relative z-10">
          <p className="text-green-100/30 text-xs">© 2026 Cova. All rights reserved.</p>
        </div>
      </div>

      {/* ── 오른쪽 패널: 로그인 폼 ───────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 sky-gradient-bg noise-bg relative">

        {/* 환경광 */}
        <div
          className="ambient-glow w-[400px] h-[400px] top-0 right-0 opacity-25"
          style={{ background: 'radial-gradient(circle, rgba(74,222,128,0.35) 0%, transparent 65%)' }}
        />

        {/* 모바일 로고 */}
        <Link
          to="/"
          className="lg:hidden relative z-10 flex items-center gap-2.5 mb-10 group"
        >
          <div className="w-8 h-8 rounded-xl primary-gradient-bg flex items-center justify-center shadow-md">
            <span className="text-white text-sm font-black">C</span>
          </div>
          <span className="font-bold text-xl tracking-widest text-on-surface">COVA</span>
        </Link>

        {/* 폼 카드 */}
        <div className="relative z-10 w-full max-w-sm">
          <div className="card rounded-2xl p-8">

            <div className="mb-7">
              <h1
                className="text-2xl font-bold text-on-surface mb-1.5"
                style={{ letterSpacing: '-0.025em' }}
              >
                {t.auth.loginTitle}
              </h1>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {t.auth.loginSubtitle}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface/50 uppercase tracking-widest">
                  {t.auth.emailLabel}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={t.auth.emailPlaceholder}
                  autoComplete="email"
                  className="input-field focus-ring"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface/50 uppercase tracking-widest">
                  {t.auth.passwordLabel}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={t.auth.passwordPlaceholder}
                  autoComplete="current-password"
                  className="input-field focus-ring"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200/70 rounded-xl px-4 py-3">
                  <span className="material-symbols-outlined text-sm shrink-0">error</span>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center mt-1"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                    로그인 중...
                  </>
                ) : t.auth.loginBtn}
              </button>
            </form>

            {/* 데모 안내 */}
            <div
              className="mt-5 p-3.5 rounded-xl flex items-start gap-2.5"
              style={{
                background: 'rgba(21,128,61,0.06)',
                border: '1px solid rgba(21,128,61,0.14)',
              }}
            >
              <span
                className="material-symbols-outlined text-primary text-sm shrink-0 mt-0.5"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                info
              </span>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {t.auth.demoNotice}
              </p>
            </div>
          </div>

          {/* 홈으로 */}
          <Link
            to="/"
            className="mt-6 flex items-center justify-center gap-1.5 text-sm text-on-surface/40 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            {t.auth.backToHome}
          </Link>
        </div>
      </div>
    </div>
  )
}
