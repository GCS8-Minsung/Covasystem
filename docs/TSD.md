# TSD — Technical Specification Document

## 1. 기술 스택

| 레이어 | 기술 | 버전 | 선택 이유 |
|--------|------|------|-----------|
| 프레임워크 | React | 18.x | 컴포넌트 기반 UI, 상태 관리 용이 |
| 빌드 도구 | Vite | 5.x | 빠른 HMR, 경량 번들 |
| 스타일링 | Tailwind CSS | 3.x | 기존 디자인 파일과 동일 스택 |
| 애니메이션 | Framer Motion | 11.x | InView 트리거, spring 애니메이션 |
| 손 인식 | MediaPipe Hands | 0.4.x | Google 실시간 21개 랜드마크 인식 |
| 게임 렌더링 | HTML5 Canvas API | 네이티브 | 60fps 파티클 렌더링 |
| 국제화 | React Context + 정적 객체 | — | 외부 라이브러리 없이 경량 구현 |
| 배포 | Vercel | — | React+Vite 최적화, HTTPS 자동 제공 |

---

## 2. 프로젝트 구조

```
GCS-Proj/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx              # 고정 상단 바, 언어 토글
│   │   │   └── ScrollProgress.jsx      # 상단 프로그레스 바
│   │   ├── sections/
│   │   │   ├── HeroSection.jsx         # Phase 01 Hero (전체화면)
│   │   │   ├── CaptureSection.jsx      # Phase 02 DAC 벤토 그리드
│   │   │   ├── AlgaeSection.jsx        # Phase 03 조류/산소 벤토 그리드
│   │   │   ├── AlgaeHUDSection.jsx     # Phase 04 인터랙티브 HUD
│   │   │   └── GameSection.jsx         # 미니게임 래퍼 섹션
│   │   ├── game/
│   │   │   ├── CarbonGame.jsx          # Canvas 게임 메인 컴포넌트
│   │   │   ├── useMediaPipe.js         # 웹캠 + MediaPipe 훅
│   │   │   ├── useGameLoop.js          # rAF 기반 게임 루프 훅
│   │   │   └── CarbonParticle.js       # 탄소 버블 클래스
│   │   └── ui/
│   │       ├── GlassCard.jsx           # 재사용 글래스모피즘 카드
│   │       ├── VitalityGauge.jsx       # 원형 프로그레스 링
│   │       └── LanguageToggle.jsx      # KO/EN 전환 버튼
│   ├── hooks/
│   │   ├── useLanguage.js              # 언어 Context + 훅
│   │   └── useScrollAnimation.js       # Intersection Observer 훅
│   ├── i18n/
│   │   ├── ko.js                       # 한국어 텍스트
│   │   └── en.js                       # 영어 텍스트
│   ├── styles/
│   │   └── globals.css                 # Tailwind + 글래스/글로우 유틸리티
│   ├── App.jsx
│   └── main.jsx
├── docs/                               # 기획·설계 문서
├── index.html
├── tailwind.config.js
├── vite.config.js
├── postcss.config.js
└── package.json
```

---

## 3. 디자인 토큰 (tailwind.config.js)

```js
colors: {
  // 핵심 색상
  'primary':                '#6bfb9a',   // 성장/액션
  'primary-container':      '#4ade80',
  'secondary':              '#a4c9ff',   // 산소/데이터
  // 서피스
  'surface':                '#131313',   // 딥 카본 배경
  'surface-dim':            '#131313',
  'surface-container':      '#20201f',
  'surface-container-low':  '#1c1b1b',
  'surface-container-high': '#2a2a2a',
  'surface-container-highest':'#353535',
  'surface-container-lowest':'#0e0e0e',
  'surface-variant':        '#353535',
  // 텍스트
  'on-surface':             '#e5e2e1',
  'on-surface-variant':     '#bccabb',
  // 테두리
  'outline':                '#869486',
  'outline-variant':        '#3d4a3e',
}

borderRadius: {
  DEFAULT: '1rem',   // 카드 기본
  lg:      '2rem',   // 대형 카드, 모달
  xl:      '3rem',   // 메인 컨테이너, 버튼
  full:    '9999px', // 원형
}
```

---

## 4. 컴포넌트 상세 명세

### 4.1 언어 시스템

```
LanguageContext
  state: lang ('ko' | 'en')
  value: { lang, toggle(), t }
  → t 는 ko.js 또는 en.js 객체를 바인딩
  → 하위 모든 컴포넌트는 useLanguage() 훅으로 접근
```

### 4.2 스크롤 애니메이션

```
useScrollAnimation(options)
  → useRef + framer-motion useInView 조합
  → { ref, isInView } 반환
  → once: true, margin: '-10% 0px' 기본값

애니메이션 variants:
  fadeUpVariants  : opacity 0→1, y 40→0, spring(stiffness:60)
  staggerContainer: staggerChildren 0.1s
  fadeInVariants  : opacity 0→1, duration 0.6s
```

### 4.3 VitalityGauge

```
props: value(number), label(string)
동작:
  1. isInView 진입 시 카운터 0 → value 애니메이션 (1200ms, 60 steps)
  2. SVG circle의 stroke-dashoffset을 실시간 업데이트
  3. linearGradient: #a4c9ff → #6bfb9a
```

### 4.4 Navbar

```
상태:
  scrolled: window.scrollY > 40 → 배경 blur 활성화
  active  : 현재 스크롤 위치 기준 섹션 ID

섹션 앵커: hero / capture / algae / hud / game
모바일: 햄버거 → 드롭다운 오버레이
```

---

## 5. 미니게임 — 기술 명세

### 5.1 아키텍처

```
GameSection.jsx
  └─ CarbonGame.jsx
       ├─ <canvas> (전체 화면)
       ├─ <video> (웹캠, 숨김)
       ├─ useGameLoop(gameState, render) → rAF 루프
       └─ useMediaPipe(videoRef) → { landmarks, mode }
```

### 5.2 CarbonParticle 클래스

```js
class CarbonParticle {
  constructor(canvasWidth, canvasHeight)
  properties:
    x, y          : 랜덤 초기 위치
    vx, vy        : 랜덤 속도 벡터 (0.3~1.5 px/frame)
    radius        : 20~45px 랜덤
    opacity       : 0.6~1.0
    captured      : false

  update()        : 위치 갱신, 벽 반사 (bounce)
  draw(ctx)       : 반투명 녹색 원 + CO₂ 텍스트 + 글로우 효과
  isHit(x, y)     : 발사체와 충돌 판정 (원 내부 좌표 확인)
}
```

### 5.3 게임 루프 (useGameLoop)

```
매 프레임:
  1. ctx.clearRect
  2. 모든 CarbonParticle.update() + draw()
  3. 발사체(beam) 존재 시 이동 + 충돌 감지
     → isHit() true: particle.captured = true, score += particle.radius * 0.5
  4. HUD 렌더(score, 조준선)
  5. 잡힌 파티클 제거 후 새 파티클 생성하여 개수 유지 (기본 12개)
```

### 5.4 MediaPipe 손 인식 (useMediaPipe)

```
초기화:
  new Hands({ modelComplexity: 1, maxNumHands: 1 })
  new Camera(videoEl, { onFrame: hands.send })

랜드마크 활용:
  ID 5 (검지 MCP) → ID 8 (검지 끝): 조준 방향 벡터
  
제스처 감지:
  총 모양(aim): 검지(6→7→8) 펼쳐짐 + 나머지 손가락 접힘
    → 검지 끝 y < 검지 MCP y (상대 좌표 기준)
    → 중지/약지/소지 끝 y > 해당 MCP y
  
  발사(fire): 이전 프레임 aim=true → 현재 모든 손가락 접힘
    → onFire 콜백 호출, 조준 방향 벡터 전달

  좌표 반전: MediaPipe 미러 좌표 → Canvas 좌표 변환
    canvasX = (1 - landmark.x) * canvasWidth
    canvasY = landmark.y * canvasHeight
```

### 5.5 마우스 폴백

```
mousemove: aimX, aimY 업데이트 → 조준선 표시
click    : 현재 aimX, aimY 방향으로 beam 생성

모드 전환 조건:
  - getUserMedia() 실패 (NotAllowedError, NotFoundError)
  - 사용자가 "웹캠 없음" 버튼 클릭
  → mode = 'mouse'로 전환, 안내 토스트 표시
```

---

## 6. 섹션 렌더링 흐름

```
App.jsx
  <LanguageProvider>
    <ScrollProgress />
    <Navbar />
    <main>
      <HeroSection   id="hero" />
      <CaptureSection id="capture" />
      <AlgaeSection   id="algae" />
      <AlgaeHUDSection id="hud" />
      <GameSection    id="game" />
    </main>
    <footer />
  </LanguageProvider>
```

각 섹션은 `motion.div`로 래핑 → `useScrollAnimation()` ref 연결 → `variants` 적용

---

## 7. 배포 명세

```
빌드: npm run build → dist/ 폴더
배포: vercel deploy (또는 Netlify drag-and-drop)

환경 요구사항:
  - HTTPS 필수 (MediaPipe getUserMedia 보안 요구)
  - Vercel 자동 HTTPS 제공

빌드 최적화:
  - Vite 코드 스플리팅 (MediaPipe 지연 로드)
  - 이미지: WebP 변환 권장
  - Tailwind CSS purge로 미사용 클래스 제거
```

---

## 8. 의존성 목록

```json
"dependencies": {
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "framer-motion": "^11.3.0",
  "@mediapipe/hands": "^0.4.1646424915",
  "@mediapipe/camera_utils": "^0.3.1675466862"
},
"devDependencies": {
  "@vitejs/plugin-react": "^4.3.1",
  "autoprefixer": "^10.4.19",
  "postcss": "^8.4.40",
  "tailwindcss": "^3.4.7",
  "vite": "^5.4.1"
}
```
