# Atmospheric Vitality — Claude Code Harness

## 프로젝트 개요

GCS(Green Carbon Solution)의 인터랙티브 랜딩페이지.
탄소 포집 → 미세조류 → 산소 생성 순환 프로세스를 스크롤 기반 스토리텔링과 웹캠 미니게임으로 전달한다.

- **설계 문서**: `docs/PRD.md`, `docs/TSD.md`, `docs/Plan.md`
- **디자인 참조**: `docs/frontend/*/code.html` + `docs/DESIGN.md`

## 기술 스택

| 레이어 | 기술 |
|--------|------|
| 프레임워크 | React 18 + Vite 5 |
| 스타일 | Tailwind CSS v3 (커스텀 디자인 토큰) |
| 애니메이션 | Framer Motion 11 |
| 손 인식 | MediaPipe Hands |
| 게임 | HTML5 Canvas API |
| 배포 | Vercel (HTTPS 필수 — MediaPipe 요구) |

## 디렉토리 구조

```
src/
├── components/
│   ├── layout/      # Navbar, ScrollProgress
│   ├── sections/    # HeroSection, CaptureSection, AlgaeSection, AlgaeHUDSection, GameSection
│   ├── game/        # CarbonGame, useMediaPipe, useGameLoop, CarbonParticle
│   └── ui/          # GlassCard, VitalityGauge, LanguageToggle
├── hooks/           # useLanguage, useScrollAnimation
├── i18n/            # ko.js, en.js
└── styles/          # globals.css
```

## 절대 규칙 (MUST FOLLOW)

1. **파일 크기**: 컴포넌트 파일은 300줄 이하. 초과 시 반드시 분리할 것.
2. **클래스 컴포넌트 금지**: 함수형 컴포넌트 + 훅 전용.
3. **인라인 스타일 금지**: 모든 스타일은 Tailwind 클래스 또는 `globals.css` 유틸리티 클래스 사용.
4. **하드코딩 텍스트 금지**: 모든 사용자 노출 텍스트는 반드시 `src/i18n/ko.js`, `en.js`를 거칠 것.
5. **console.log 금지**: 디버그 로그는 커밋 전 제거. 게임 디버그는 `import.meta.env.DEV` 조건부 사용.
6. **비밀값 금지**: API 키, 토큰은 `.env` 파일에만. `VITE_` 접두사 필수.

## 디자인 시스템 (핵심 토큰)

```
Primary:   #6bfb9a   (성장/액션/강조)
Secondary: #a4c9ff   (산소/데이터/보조)
Surface:   #131313   (배경)
On-Surface: #e5e2e1  (기본 텍스트)

.glass-panel  = bg rgba(53,53,53,0.4) + backdrop-blur-[24px] + border 1.5px rgba(61,74,62,0.2)
.glow-shadow  = box-shadow 0 20px 40px rgba(229,226,225,0.05)
.gradient-text = #6bfb9a → #a4c9ff (선형 그라디언트 텍스트)
```

## 스크롤 애니메이션 패턴

새 섹션을 만들 때 반드시 이 패턴을 따를 것:

```jsx
import { motion } from 'framer-motion'
import { useScrollAnimation, fadeUpVariants, staggerContainer } from '../../hooks/useScrollAnimation'

export default function MySection({ id }) {
  const { ref, isInView } = useScrollAnimation()
  return (
    <motion.section
      id={id}
      ref={ref}
      variants={staggerContainer}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
    >
      <motion.div variants={fadeUpVariants}>...</motion.div>
    </motion.section>
  )
}
```

## 언어 시스템 패턴

```jsx
import { useLanguage } from '../../hooks/useLanguage'
const { t } = useLanguage()
// t.hero.title1, t.capture.dacTitle 등 사용
```

## 미니게임 개발 주의사항

- **MediaPipe 초기화**: 컴포넌트 마운트 시 한 번만. cleanup 시 `camera.stop()` 필수.
- **Canvas 좌표**: MediaPipe 랜드마크 x는 미러 반전 필요 → `canvasX = (1 - lm.x) * width`
- **마우스 폴백**: `getUserMedia` 실패 시 무조건 마우스 모드로 자동 전환.
- **게임 루프 정리**: 컴포넌트 언마운트 시 `cancelAnimationFrame` 호출 필수.
- **성능**: 파티클 수 기본 12개. 디바이스 성능 감지로 조절 불필요.

## 빌드 명령어

```bash
npm run dev      # 개발 서버 (http://localhost:5173)
npm run build    # 프로덕션 빌드 → dist/
npm run preview  # 프로덕션 빌드 로컬 미리보기
```

## 커밋 컨벤션

```
feat(HeroSection): 스크롤 큐 bounce 애니메이션 추가
fix(CarbonGame): 파티클 벽 반사 오류 수정
style(Navbar): 모바일 햄버거 메뉴 간격 조정
refactor(VitalityGauge): SVG 애니메이션 훅 분리
```

## 참조 디자인 파일 위치

| 섹션 | 참조 파일 |
|------|----------|
| Hero | `docs/frontend/hero_carbon_phase/code.html` |
| Capture | `docs/frontend/capture_the_transition/code.html` |
| Algae | `docs/frontend/algae_the_oxygen_phase/code.html` |
| HUD | `docs/frontend/interactive_algae_game/code.html` |
