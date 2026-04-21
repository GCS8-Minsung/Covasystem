# Game 2 — 탄소 공장 시뮬레이션 설계 문서

## 1. 게임 개요

| 항목 | 내용 |
|------|------|
| 장르 | 웹 기반 2D 건설 경영 시뮬레이션 |
| 모델 | shapez.io 스타일 (그리드 기반, 자원 흐름) |
| 목적 | 탄소 포집 → 정제 → 배양 → 제조 전체 공정 체험 |
| 승리 조건 | 저장 창고에 바이오매스 100개 누적 |
| 전체화면 | `requestFullscreen()` 지원 |

---

## 2. 맵 구성

- **그리드**: 24 × 16 타일
- **셀 크기**: 36px (기본)
- **공장**: 2~4개 랜덤 배치 (맵 고정, 제거 불가)
  - 간격 제약: 인접 공장 간 최소 5칸 이격
  - 외곽 3칸 마진 내 미배치

---

## 3. 아이템 타입

| ID | 이름 | 색상 | 설명 |
|----|------|------|------|
| `smoke` | 매연 | 회색 `#6b7280` | 공장 자동 출력 |
| `cap_smoke` | 포집된 매연 | 짙은 회색 `#4b5563` | 탄소 포집기 출력 |
| `co2` | 순수 CO₂ | 초록 `#6bfb9a` | 정제기 출력 (주) |
| `heavy_metal` | 중금속 | 주황 `#f97316` | 정제기 출력 (부) |
| `algae` | 조류 | 밝은 초록 `#86efac` | (향후 확장용) |
| `wet_algae` | 수분 조류 | 청록 `#22d3ee` | 배양기 출력 |
| `biomass` | 바이오매스 | 진초록 `#15803d` | 제조기 출력 (최종) |
| `water` | 수분 | 파랑 `#60a5fa` | 제조기 부산물 |

---

## 4. 장치 타입

| ID | 이름 | 배치 | 입력 → 출력 | 처리 틱 |
|----|------|------|-------------|---------|
| `factory` | 공장 | 맵 고정 | 없음 → smoke | 2틱/출력 |
| `capturer` | 탄소 포집기 | 사용자 | smoke → cap_smoke | 2 |
| `pipe` | 배관 | 사용자 | 통과 (방향 있음) | 1(이동) |
| `purifier` | 정제기 | 사용자 | cap_smoke → co2 + heavy_metal | 3 |
| `trash` | 쓰레기통 | 사용자 | heavy_metal → 제거 | 1 |
| `cultivator` | 배양기 | 사용자 | co2 → wet_algae | 4 |
| `manufacturer` | 제조기 | 사용자 | wet_algae → biomass + water | 3 |
| `storage` | 저장 창고 | 사용자 | biomass → 누적 | 1 |

---

## 5. 게임 루프

```
틱 주기: 800ms
1. 공장 smoke 출력 (2틱마다)
2. 배관 내 아이템 한 칸 이동 (방향에 따라)
3. 장치 출력 슬롯 → 인접 배관 push
4. 장치 처리 (입력 충족 시 → 처리 → 출력)
5. 효과(effects) 타이머 감소
```

---

## 6. 특수 인터랙션

### 배양기 smoke 입력 (사멸 인터랙션)
- smoke 아이템이 배양기에 도달 시:
  - `dying = true`, `dyingTimer = 5틱`
  - 빨간 오버레이 + 💀 이모지 표시
  - 아이템 소멸, 출력 없음

### 배관 방향 전환
- 배관이 이미 배치된 셀 클릭 → 방향 순환 (→ ↓ ← ↑)
- 우클릭 → 장치 제거

---

## 7. 파일 구조

```
src/components/game2/
├── gameItems.js         # 아이템/장치 상수 (ITEM, DEVICE, DEVICE_PROCESS)
├── GameEngine.js        # 핵심 게임 로직 (순수 함수, immutable state)
├── useGameEngine.jsx    # React 훅 (setInterval 게임 루프)
├── GameCanvas.jsx       # Canvas 렌더링 (그리드 + 장치 + 아이템 + 이펙트)
├── GameToolbar.jsx      # 하단 툴바 (장치 선택)
└── FactoryGame.jsx      # 메인 게임 컴포넌트 (HUD + 전체화면 + 승리 오버레이)

src/components/sections/
└── GameSection2.jsx     # 랜딩페이지 섹션 래퍼
```

---

## 8. 아키텍처 원칙

- **GameEngine.js**: 순수 함수 (부작용 없음), React 의존성 없음
- **useGameEngine.jsx**: React 상태 + setInterval 브릿지
- **GameCanvas.jsx**: Canvas imperative 렌더링 (React re-render와 분리)
- **CLAUDE.md 규칙 준수**: 파일 300줄 이하, 함수형 컴포넌트, Tailwind 클래스, i18n

---

## 9. 구현 단계

| 단계 | 작업 | 완료 |
|------|------|------|
| 1 | gameItems.js — 상수 정의 | ✅ |
| 2 | GameEngine.js — 게임 로직 | ✅ |
| 3 | useGameEngine.jsx — React 훅 | ✅ |
| 4 | GameCanvas.jsx — Canvas 렌더링 | ✅ |
| 5 | GameToolbar.jsx — 툴바 | ✅ |
| 6 | FactoryGame.jsx — 메인 컴포넌트 | ✅ |
| 7 | GameSection2.jsx — 섹션 래퍼 | ✅ |
| 8 | i18n 텍스트 추가 (ko.js, en.js) | ✅ |
| 9 | LandingPage.jsx 삽입 | ✅ |
