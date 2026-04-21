/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // ── Primary: Forest Green ───────────────────────────────
        primary:                   '#1a7a3c',   // 버튼, 액션, 강조
        'primary-container':       '#d1f5e0',   // 카드 배경, 배지
        'on-primary':              '#ffffff',
        'on-primary-container':    '#0a3d1c',

        // ── Secondary: Sky Blue ─────────────────────────────────
        secondary:                 '#2b8ac5',   // 보조 액션, 데이터
        'secondary-container':     '#dceeff',   // 하늘색 배경
        'on-secondary':            '#ffffff',
        'on-secondary-container':  '#0a2d45',

        // ── Accent: Lime (생동감 포인트) ────────────────────────
        accent:                    '#4ade80',   // 호버, 글로우, 하이라이트

        // ── Surface (라이트 모드) ───────────────────────────────
        surface:                   '#f4faf6',   // 페이지 배경 (아주 연한 민트 화이트)
        'surface-container-low':   '#eef7f2',
        'surface-container':       '#ffffff',   // 카드, 패널
        'surface-container-high':  '#e8f5ee',
        'surface-container-highest':'#ddeee5',

        // ── Text ────────────────────────────────────────────────
        'on-surface':              '#14291c',   // 주 텍스트 (진한 포레스트)
        'on-surface-variant':      '#3d6649',   // 보조 텍스트

        // ── Borders ─────────────────────────────────────────────
        outline:                   '#8cb89a',
        'outline-variant':         '#c8e2d0',

        // ── Sky palette (히어로/섹션 배경) ──────────────────────
        sky: {
          50:  '#f0f9ff',
          100: '#e0f3fd',
          200: '#bae8fb',
        },
        forest: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
      },
      borderRadius: {
        DEFAULT: '0.75rem',   // 12px — Apple HIG 기본
        lg:      '1.25rem',   // 20px — 시트
        xl:      '1.75rem',   // 28px — 대형 카드
        '2xl':   '2rem',      // 32px
        full:    '9999px',
      },
      fontFamily: {
        // Apple HIG: 시스템 폰트 최우선
        sans: [
          '-apple-system', 'BlinkMacSystemFont', 'SF Pro Display',
          'Inter', 'Apple SD Gothic Neo', 'Pretendard', 'sans-serif',
        ],
        mono: ['SF Mono', 'JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        // Apple HIG 레이어드 섀도
        sm:   '0 1px 2px rgba(20,41,28,0.06)',
        DEFAULT:'0 1px 3px rgba(20,41,28,0.08), 0 4px 12px rgba(20,41,28,0.06)',
        md:   '0 2px 8px rgba(20,41,28,0.08), 0 8px 24px rgba(20,41,28,0.06)',
        lg:   '0 4px 16px rgba(20,41,28,0.08), 0 16px 48px rgba(20,41,28,0.06)',
        xl:   '0 8px 32px rgba(20,41,28,0.10), 0 24px 64px rgba(20,41,28,0.08)',
        // 컬러 글로우
        'green-glow': '0 0 24px rgba(74,222,128,0.35)',
        'sky-glow':   '0 0 24px rgba(43,138,197,0.25)',
      },
      backgroundImage: {
        // 히어로 스카이 그라디언트
        'sky-hero':  'linear-gradient(160deg, #e8f9f0 0%, #d0eef8 45%, #edfaf2 100%)',
        // 섹션 그라디언트
        'section-green': 'linear-gradient(180deg, #f4faf6 0%, #eef7f2 100%)',
        'section-sky':   'linear-gradient(180deg, #f0f9ff 0%, #f4faf6 100%)',
      },
      animation: {
        'float-slow':  'float 6s ease-in-out infinite',
        'pulse-green': 'pulse-green 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        'pulse-green': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
}
