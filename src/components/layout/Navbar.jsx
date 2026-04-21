import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '../../hooks/useLanguage'
import { useAuth } from '../../auth/AuthContext'
import LanguageToggle from '../ui/LanguageToggle'

const NAV_LINKS = [
  { key: 'tech', href: '#capture' },
  { key: 'game', href: '#game' },
  { key: 'contact', href: '#contact' },
]

export default function Navbar() {
  const { t } = useLanguage()
  const { isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
    setMenuOpen(false)
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass-panel border-b border-outline-variant/60'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* 로고 */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg primary-gradient-bg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
            <span className="text-white text-xs font-black">C</span>
          </div>
          <span className="font-bold text-base tracking-widest text-on-surface">COVA</span>
        </Link>

        {/* 데스크탑 링크 */}
        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ key, href }) => (
            <li key={key}>
              <a
                href={href}
                className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors duration-200 relative group"
              >
                {t.nav[key]}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-primary transition-all duration-200 group-hover:w-full" />
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <LanguageToggle />

          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-2">
              <Link
                to="/dashboard"
                className="btn-secondary text-xs px-4 py-2"
              >
                <span className="material-symbols-outlined text-sm">dashboard</span>
                {t.nav.dashboard}
              </Link>
              <button
                onClick={handleLogout}
                className="text-xs text-on-surface-variant hover:text-red-500 transition-colors px-3 py-2"
              >
                {t.nav.logout}
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden md:flex btn-primary text-xs px-4 py-2"
            >
              <span className="material-symbols-outlined text-sm">person</span>
              {t.nav.login}
            </Link>
          )}

          {/* 모바일 햄버거 */}
          <button
            className="md:hidden text-on-surface-variant hover:text-primary transition-colors p-1"
            onClick={() => setMenuOpen(v => !v)}
            aria-label="메뉴 열기"
          >
            <span className="material-symbols-outlined text-2xl">
              {menuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </nav>

      {/* 모바일 드롭다운 */}
      {menuOpen && (
        <div className="md:hidden glass-panel border-t border-outline-variant/40 px-6 py-5">
          <ul className="flex flex-col gap-4">
            {NAV_LINKS.map(({ key, href }) => (
              <li key={key}>
                <a
                  href={href}
                  className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  {t.nav[key]}
                </a>
              </li>
            ))}
            {isAuthenticated ? (
              <>
                <li>
                  <Link
                    to="/dashboard"
                    className="text-sm font-semibold text-primary"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t.nav.dashboard}
                  </Link>
                </li>
                <li>
                  <button onClick={handleLogout} className="text-sm text-red-500">
                    {t.nav.logout}
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-primary"
                  onClick={() => setMenuOpen(false)}
                >
                  {t.nav.login}
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </header>
  )
}
