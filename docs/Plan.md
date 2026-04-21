# Plan — 구현 계획

## 전제 조건

- Node.js 설치 완료 (v24+)
- 작업 디렉토리: `C:\Users\jsiv1\Desktop\GCS-Proj`
- 설계 문서: `docs/PRD.md`, `docs/TSD.md` 확정 후 구현 시작

---

## 구현 단계

### Step 1 — 프로젝트 초기화

```bash
npm create vite@latest . -- --template react
npm install framer-motion @mediapipe/hands @mediapipe/camera_utils
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**산출물**
- `package.json`, `vite.config.js`, `index.html`
- `tailwind.config.js`, `postcss.config.js`
- 기본 `src/` 구조

**완료 기준** — `npm run dev` 실행 후 브라우저에서 React 앱 확인

---

### Step 2 — 글로벌 스타일 & 디자인 토큰

**작업 파일**
- `tailwind.config.js` — `docs/TSD.md §3` 색상·라운드·폰트 토큰 적용
- `src/styles/globals.css` — Tailwind directives + 글래스모피즘 유틸리티 클래스

**유틸리티 클래스**
```css
.glass-panel       /* bg rgba(53,53,53,0.4) + backdrop-blur-[24px] + border */
.glow-shadow       /* box-shadow 0 20px 40px rgba(229,226,225,0.05) */
.gradient-text     /* #6bfb9a → #a4c9ff 그라디언트 텍스트 */
.primary-gradient-bg /* #6bfb9a → #4ade80 */
.btn-primary       /* 그라디언트 버튼 공통 스타일 */
```

**완료 기준** — Tailwind 커스텀 색상 클래스(`bg-primary`, `text-secondary` 등) 적용 확인

---

### Step 3 — 언어 시스템

**작업 파일**
- `src/i18n/ko.js` — 한국어 텍스트 상수
- `src/i18n/en.js` — 영어 텍스트 상수
- `src/hooks/useLanguage.js` — `LanguageProvider` + `useLanguage()` 훅

**구조**
```
LanguageProvider (App.jsx 최상위 래핑)
  → state: lang = 'ko' | 'en'
  → value: { lang, toggle(), t }
  → useLanguage() 훅으로 하위 컴포넌트 접근
```

**완료 기준** — 토글 클릭 시 `t.nav.connect` 등 텍스트 전환 확인

---

### Step 4 — 공통 UI 컴포넌트

**작업 파일**
- `src/components/ui/GlassCard.jsx` — 글래스 카드 래퍼
- `src/components/ui/VitalityGauge.jsx` — SVG 원형 프로그레스 (애니메이션)
- `src/components/ui/LanguageToggle.jsx` — KO/EN 토글 버튼
- `src/hooks/useScrollAnimation.js` — `useInView` 기반 스크롤 훅

**완료 기준** — VitalityGauge 단독 렌더링 시 0→82% 카운트업 확인

---

### Step 5 — 레이아웃 컴포넌트

**작업 파일**
- `src/components/layout/Navbar.jsx`
- `src/components/layout/ScrollProgress.jsx`

**Navbar 동작**
- `scrolled` 상태 → blur 배경 전환
- `active` 상태 → 현재 섹션 링크 강조
- 모바일 햄버거 메뉴

**완료 기준** — 스크롤 시 Navbar 배경 전환, 링크 클릭 시 앵커 이동

---

### Step 6 — HeroSection

**참조 파일**: `docs/frontend/hero_carbon_phase/code.html`

**구현 포인트**
- `min-h-screen` 전체화면 레이아웃
- Framer Motion `variants`: `fadeUpVariants` 텍스트 등장, `staggerChildren` 카드 순차 등장
- 배경: `radial-gradient` + 텍스처 오버레이
- 스크롤 큐: bounce 애니메이션 (`animate-bounce`)

**완료 기준** — 브라우저 접속 시 Hero 화면 렌더, 스크롤 큐 애니메이션 동작

---

### Step 7 — CaptureSection

**참조 파일**: `docs/frontend/capture_the_transition/code.html`

**구현 포인트**
- `grid-cols-1 md:grid-cols-12` 벤토 그리드
- 스크롤 진입 시 카드 `stagger` 등장
- DAC 카드: Air → Science 플로우 SVG 라인
- 94% 메트릭 카운트업 애니메이션

**완료 기준** — 스크롤 진입 시 카드 순차 등장, 숫자 카운트업 동작

---

### Step 8 — AlgaeSection

**참조 파일**: `docs/frontend/algae_the_oxygen_phase/code.html`

**구현 포인트**
- 대형(col-span-8) 이미지 카드 + hover scale 효과
- `VitalityGauge` 컴포넌트 삽입 (82% 성장)
- O₂ 98.4% 카운트업 (Secondary 색상)
- `Biomass` 설명 카드

**완료 기준** — VitalityGauge 스크롤 진입 시 0→82% 애니메이션 동작

---

### Step 9 — AlgaeHUDSection

**참조 파일**: `docs/frontend/interactive_algae_game/code.html`

**구현 포인트**
- `lg:grid-cols-12` (8+4) 레이아웃
- 중앙 시뮬레이션 뷰어: HUD 코너 액센트, 라이브 피드 표시
- 사이드 패널: 산소 94%, 탄소 1,204 KG 진행 바
- CTA 버튼: 게임 섹션 앵커 스크롤

**완료 기준** — 레이아웃 렌더, CTA 클릭 시 게임 섹션으로 스크롤

---

### Step 10 — 미니게임 (마우스 폴백)

**작업 파일**
- `src/components/game/CarbonParticle.js`
- `src/components/game/useGameLoop.js`
- `src/components/game/CarbonGame.jsx` (마우스 모드)
- `src/components/sections/GameSection.jsx`

**구현 순서**
1. `CarbonParticle` 클래스: 랜덤 위치/속도, bounce, 글로우 draw
2. `useGameLoop`: rAF 루프, 파티클 관리, 빔 이동/충돌
3. `CarbonGame`: canvas 렌더, 마우스 이벤트, HUD 오버레이
4. `GameSection`: 전체화면 래퍼, 스코어 표시

**완료 기준** — 마우스 클릭 시 빔 발사, 탄소 버블 충돌 후 제거, 스코어 누적

---

### Step 11 — MediaPipe 손 인식 통합

**작업 파일**
- `src/components/game/useMediaPipe.js`
- `CarbonGame.jsx` 웹캠 모드 분기 추가

**구현 순서**
1. `useMediaPipe`: `@mediapipe/hands` 초기화, Camera 설정
2. 랜드마크 좌표 → Canvas 좌표 변환 (x 미러 반전)
3. 제스처 감지: aim (검지 펼침) / fire (주먹 전환)
4. `CarbonGame`에 웹캠 모드 UI: 조준선, 웹캠 썸네일, 모드 전환 버튼

**완료 기준** — 웹캠 활성화 후 손 총 모양 조준 → 주먹으로 발사 → 탄소 포집 동작

---

### Step 12 — 통합 및 App.jsx 조립

**작업 파일**
- `src/App.jsx`
- `src/main.jsx`
- `index.html` (폰트 링크, 메타 태그)

**App.jsx 구조**
```jsx
<LanguageProvider>
  <ScrollProgress />
  <Navbar />
  <main>
    <HeroSection id="hero" />
    <CaptureSection id="capture" />
    <AlgaeSection id="algae" />
    <AlgaeHUDSection id="hud" />
    <GameSection id="game" />
  </main>
  <Footer />
</LanguageProvider>
```

**완료 기준** — 전체 스크롤 흐름, 언어 전환, 게임 동작 통합 확인

---

### Step 13 — 검증 및 빌드

**체크리스트**

| 항목 | 방법 |
|------|------|
| 스크롤 애니메이션 전 섹션 | 브라우저 수동 스크롤 |
| 언어 전환 | KO→EN→KO 토글 |
| 마우스 게임 | 클릭 발사 → 스코어 누적 |
| 웹캠 게임 | 손 제스처 인식 → 발사 |
| 모바일 반응형 | Chrome DevTools 375px |
| 프로덕션 빌드 | `npm run build && npm run preview` |
| HTTPS 게임 | Vercel 배포 후 웹캠 권한 확인 |

---

## 작업 일정 (참고)

| 단계 | 스텝 | 예상 소요 |
|------|------|-----------|
| 기반 구축 | 1~4 | 1일 |
| 레이아웃 + Hero | 5~6 | 0.5일 |
| 콘텐츠 섹션 | 7~9 | 1일 |
| 미니게임 | 10~11 | 1.5일 |
| 통합 + 검증 | 12~13 | 0.5일 |
| **합계** | | **약 4.5일** |
