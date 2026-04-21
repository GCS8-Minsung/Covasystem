# TEST_CASE — Atmospheric Vitality 랜딩페이지

> **범례**
> - `[Endpoint]` — 테스트 대상 컴포넌트 / URL / 기능 진입점
> - `[Action]` — 사용자 액션 또는 시스템 트리거
> - `[Expected]` — 기대 결과
> - ✅ 성공 케이스 / ❌ 실패 케이스 / 🔲 미검증 (실행 후 체크)

---

## TC-01 페이지 최초 로드 (FR-01)

**[Endpoint]** `https://{domain}/` — 랜딩페이지 루트

---

### TC-01-S1 ✅ 정상 로드
- **[Action]** 브라우저 주소창에 URL 입력 후 Enter
- **[Expected]**
  - [ ] HTTP 200 응답, 흰 화면(FOUC) 없이 Hero 섹션 즉시 표시
  - [ ] `<title>` = `Atmospheric Vitality`
  - [ ] 배경색 `#131313` (다크 서피스)
  - [ ] "탄소, 새로운 생명의 시작으로" 한국어 텍스트 표시 (기본 언어 KO)
  - [ ] 스크롤 큐 bounce 애니메이션 동작 확인
  - [ ] Navbar 상단 고정 표시, 배경 투명(아직 blur 미적용)
  - [ ] 스크롤 프로그레스 바 0% 상태

### TC-01-S2 ✅ Hero 타이포그래피
- **[Action]** 페이지 로드 완료 후 Hero 섹션 시각 확인
- **[Expected]**
  - [ ] 메인 헤드라인 폰트 크기 ≥ 5rem (80px)
  - [ ] 그라디언트 텍스트 "시작으로" — `#6bfb9a → #4ade80`
  - [ ] 영문 서브헤드라인 "Carbon, to the Start of New Life." 표시
  - [ ] Phase 레이블 "Phase 01: Carbon Capture" (영문 모드) 표시

### TC-01-F1 ❌ 느린 네트워크 환경
- **[Action]** Chrome DevTools → Network → Slow 3G로 설정 후 로드
- **[Expected]**
  - [ ] 레이아웃 시프트(CLS) 없이 점진적 로딩
  - [ ] 배경 텍스처 이미지 로딩 전에도 배경색 `#131313` 유지
  - [ ] 폰트 스왑(FOUT) 시 fallback `sans-serif` 표시 후 Inter로 전환

### TC-01-F2 ❌ JavaScript 비활성화
- **[Action]** Chrome DevTools → Settings → Disable JavaScript 후 로드
- **[Expected]**
  - [ ] 빈 화면이 아닌 기본 HTML 구조 표시 (`<noscript>` 또는 정적 콘텐츠)
  - [ ] _(현재 React SPA 특성상 콘텐츠 미표시 허용, 빈 화면이면 noscript 태그 추가 필요)_

---

## TC-02 스크롤 애니메이션 (FR-02)

**[Endpoint]** `window.scroll` → Intersection Observer → 각 섹션 `motion.div`

---

### TC-02-S1 ✅ 섹션 진입 시 fade-up 등장
- **[Action]** 마우스 휠 또는 터치스와이프로 각 섹션까지 스크롤
- **[Expected]**
  - [ ] Capture 섹션 진입 → 카드들이 아래에서 위로 순차(stagger 0.1s) 등장
  - [ ] Algae 섹션 진입 → 이미지 카드 + 메트릭 카드 순차 등장
  - [ ] HUD 섹션 진입 → 뷰어 + 사이드 패널 등장
  - [ ] Game 섹션 진입 → 게임 캔버스 + 제목 등장

### TC-02-S2 ✅ 애니메이션 once 옵션 (중복 실행 방지)
- **[Action]** 섹션 진입 후 → 다시 위로 스크롤 → 재진입
- **[Expected]**
  - [ ] 두 번째 진입 시 애니메이션 재실행 없음 (이미 표시 상태 유지)

### TC-02-S3 ✅ 스크롤 프로그레스 바
- **[Action]** 페이지를 최상단 → 최하단까지 스크롤
- **[Expected]**
  - [ ] 최상단: 프로그레스 바 0%
  - [ ] 중간 지점: 약 50% 너비
  - [ ] 최하단: 100% 너비
  - [ ] `#6bfb9a → #4ade80` 그라디언트 색상

### TC-02-F1 ❌ 빠른 스크롤 (스크롤 점프)
- **[Action]** 키보드 End 키로 즉시 최하단 이동
- **[Expected]**
  - [ ] 뷰포트에 들어온 섹션들이 모두 visible 상태로 처리
  - [ ] 화면에 보이는 섹션은 올바르게 렌더링 (숨겨진 상태로 남지 않음)

---

## TC-03 Navbar (FR-07)

**[Endpoint]** `<nav>` 고정 상단 바

---

### TC-03-S1 ✅ 스크롤 시 blur 활성화
- **[Action]** 페이지를 40px 이상 아래로 스크롤
- **[Expected]**
  - [ ] Navbar 배경 `bg-neutral-950/60 backdrop-blur-[24px]` 적용
  - [ ] 로고 "VITALITY" `#6bfb9a` 색상 유지

### TC-03-S2 ✅ 섹션 링크 앵커 스크롤
- **[Action]** Navbar의 각 링크 클릭 (Ecosystem / Technology / Impact / HUD)
- **[Expected]**
  - [ ] Ecosystem → `#hero` 섹션 부드러운 스크롤
  - [ ] Technology → `#capture` 섹션 부드러운 스크롤
  - [ ] Impact → `#algae` 섹션 부드러운 스크롤
  - [ ] HUD → `#hud` 섹션 부드러운 스크롤
  - [ ] 클릭한 링크 `text-primary` + `border-b-2 border-primary` 활성 스타일

### TC-03-S3 ✅ CTA 버튼
- **[Action]** Navbar 우측 연결하기(Connect) 버튼 클릭
- **[Expected]**
  - [ ] `#game` 섹션으로 부드러운 스크롤

### TC-03-S4 ✅ 모바일 햄버거 메뉴
- **[Action]** 뷰포트 너비 375px 설정 → 햄버거 아이콘 클릭
- **[Expected]**
  - [ ] 드롭다운 메뉴 표시 (glass-panel 스타일)
  - [ ] 메뉴 항목 클릭 → 해당 섹션으로 스크롤 + 메뉴 닫힘
  - [ ] 햄버거 아이콘 → X 아이콘으로 전환

### TC-03-F1 ❌ 빠른 연속 클릭
- **[Action]** 다른 섹션 링크를 빠르게 연속 클릭
- **[Expected]**
  - [ ] 마지막 클릭한 섹션으로 최종 스크롤 (중간 스크롤 충돌 없음)

### TC-03-F2 ❌ 데스크탑 → 모바일 뷰포트 변경
- **[Action]** DevTools에서 뷰포트를 1280px → 375px로 변경
- **[Expected]**
  - [ ] 데스크탑 메뉴 숨김 (`hidden md:flex`)
  - [ ] 햄버거 버튼 표시 (`md:hidden`)
  - [ ] 레이아웃 깨짐 없음

---

## TC-04 언어 전환 (FR-08)

**[Endpoint]** `LanguageToggle` 컴포넌트 → `LanguageContext`

---

### TC-04-S1 ✅ KO → EN 전환
- **[Action]** Navbar의 KO/EN 토글에서 EN 클릭
- **[Expected]**
  - [ ] Hero 메인 카피: "탄소, 새로운 생명의 시작으로" → "Carbon, to the Start of New Life."
  - [ ] Capture 섹션 헤더: "기술로 잡아두는 탄소" → "Capturing Carbon through Technology"
  - [ ] Algae 섹션 헤더: "미세조류, 산소를 만드는 작은 거인" → "Microalgae, Tiny Giants of Oxygen"
  - [ ] Navbar 메뉴 항목: "생태계" → "Ecosystem" 등 전환
  - [ ] 토글 "EN" 텍스트 `text-primary` 강조, "KO" 비강조

### TC-04-S2 ✅ EN → KO 재전환
- **[Action]** EN 상태에서 KO 클릭
- **[Expected]**
  - [ ] 모든 텍스트 한국어로 복원
  - [ ] 애니메이션/레이아웃 깨짐 없음

### TC-04-S3 ✅ 게임 섹션 언어 전환
- **[Action]** 게임 섹션 진입 후 언어 전환
- **[Expected]**
  - [ ] 게임 제목, 설명, 스코어 레이블 즉시 전환
  - [ ] 게임 진행 중단 없음 (Canvas 게임 상태 유지)

### TC-04-F1 ❌ 빠른 토글 반복
- **[Action]** KO/EN 토글을 0.5초 간격으로 10회 연속 클릭
- **[Expected]**
  - [ ] 최종 언어 상태 정확히 반영
  - [ ] React 렌더링 에러(콘솔 에러) 없음
  - [ ] 레이아웃 시프트 없음

---

## TC-05 Capture 섹션 (FR-03)

**[Endpoint]** `#capture` — Phase 01 Carbon Capture 섹션

---

### TC-05-S1 ✅ 벤토 그리드 렌더링
- **[Action]** `#capture` 섹션까지 스크롤
- **[Expected]**
  - [ ] 대형 카드(col-span-8): "직접 공기 포집 코어" / "Direct Air Capture Core" 표시
  - [ ] Air → Science 플로우 라인 시각화 표시
  - [ ] 효율 메트릭 카드: "94%" 숫자 + Primary 색상
  - [ ] 스마트 그리드 카드: memory 아이콘 + 설명 텍스트

### TC-05-S2 ✅ 카드 hover 효과
- **[Action]** 각 카드에 마우스 호버
- **[Expected]**
  - [ ] `hover:bg-surface-container-highest` 전환 (약 500ms)
  - [ ] 대형 카드 배경 이미지 없음 (opacity-20 장식 이미지는 허용)

### TC-05-S3 ✅ 94% 카운트업 애니메이션
- **[Action]** 섹션 진입 (Intersection Observer 트리거)
- **[Expected]**
  - [ ] 숫자가 0에서 94로 1,200ms 내에 카운트업
  - [ ] 페이지 재로드 없이 위로 스크롤 후 재진입 시 카운트업 재실행 안 됨

### TC-05-F1 ❌ 모바일 뷰포트 (375px)
- **[Action]** 375px 뷰포트에서 Capture 섹션 확인
- **[Expected]**
  - [ ] `grid-cols-1`로 단일 열 배치 (12컬럼 그리드 → 1컬럼)
  - [ ] 카드 가로 스크롤 없음
  - [ ] 텍스트 잘림(overflow) 없음

---

## TC-06 Algae 섹션 (FR-04)

**[Endpoint]** `#algae` — Phase 02 Algae & Oxygen 섹션

---

### TC-06-S1 ✅ 대형 이미지 카드 hover 확대
- **[Action]** 광생물반응기 카드에 마우스 호버
- **[Expected]**
  - [ ] 카드 내부 이미지 `scale(1.05)` 확대 (transition duration-700)
  - [ ] 카드 경계 밖으로 이미지 overflow 없음 (`overflow-hidden` 확인)

### TC-06-S2 ✅ VitalityGauge 0→82% 애니메이션
- **[Action]** Algae 섹션 진입 (뷰포트 10% 이상 진입)
- **[Expected]**
  - [ ] SVG 원형 링 stroke-dashoffset이 0→목표값으로 1,200ms 애니메이션
  - [ ] 중앙 숫자 `0%` → `82%` 카운트업 동기화
  - [ ] 그라디언트: `#a4c9ff` (시작) → `#6bfb9a` (끝)

### TC-06-S3 ✅ O₂ 98.4% 진행 바
- **[Action]** 섹션 진입 확인
- **[Expected]**
  - [ ] 진행 바 너비 98.4%
  - [ ] Secondary(`#a4c9ff`) → Primary(`#6bfb9a`) 그라디언트

### TC-06-F1 ❌ 느린 스크롤 진입 (margin -10%)
- **[Action]** 섹션이 뷰포트 하단 10% 이하에 걸쳐 있을 때 확인
- **[Expected]**
  - [ ] 아직 보이지 않는 상태 (hidden 유지)
  - [ ] 10% 이상 진입 후 visible 전환

---

## TC-07 HUD 섹션 (FR-05)

**[Endpoint]** `#hud` — Phase 03 Interactive Algae HUD 섹션

---

### TC-07-S1 ✅ 레이아웃 구성
- **[Action]** `#hud` 섹션 스크롤 진입
- **[Expected]**
  - [ ] 16:9 비율 중앙 뷰어 (col-span-8)
  - [ ] 우측 데이터 패널 (col-span-4): 산소 94%, 탄소 1,204 KG
  - [ ] HUD 코너 액센트 (좌상단 초록 점 + "REC / LIVE FEED" 또는 한국어 표시)
  - [ ] 미니 바 차트 시각화 표시

### TC-07-S2 ✅ CTA 버튼 동작
- **[Action]** "직접 체험하기 ↓" (또는 "Experience It ↓") 버튼 클릭
- **[Expected]**
  - [ ] `#game` 섹션으로 부드러운 스크롤 이동

### TC-07-S3 ✅ 탄소 흡수 진행 바
- **[Action]** 섹션 진입 확인
- **[Expected]**
  - [ ] 진행 바 너비 약 78% (`1,204 / 1,500 ≈ 80%`)
  - [ ] Primary 그라디언트 배경
  - [ ] "0 ... TARGET: 1500" 레이블 표시

### TC-07-F1 ❌ 태블릿 뷰포트 (768px)
- **[Action]** 768px 뷰포트에서 HUD 섹션 확인
- **[Expected]**
  - [ ] `lg:grid-cols-12` → 단일 열 스택 전환
  - [ ] 뷰어와 데이터 패널이 세로 배치
  - [ ] 데이터 패널 수치 잘림 없음

---

## TC-08 미니게임 — 마우스 모드 (FR-06)

**[Endpoint]** `#game` — Carbon Capture Game, 마우스 폴백

---

### TC-08-S1 ✅ 게임 캔버스 초기화
- **[Action]** `#game` 섹션 진입 또는 CTA 버튼 클릭
- **[Expected]**
  - [ ] Canvas 요소 전체 화면 크기로 렌더링
  - [ ] 탄소 버블 12개 화면 안에서 유영 시작
  - [ ] 스코어 HUD "포집량 0 KG" 표시
  - [ ] 마우스 폴백 안내 텍스트 표시

### TC-08-S2 ✅ 마우스 조준
- **[Action]** 마우스를 Canvas 위에서 이동
- **[Expected]**
  - [ ] 마우스 커서 위치에 조준선(십자선 또는 원형 커서) 표시
  - [ ] 조준선 색상 `#6bfb9a` (Primary)
  - [ ] 커서가 Canvas 영역 이탈 시 조준선 숨김

### TC-08-S3 ✅ 마우스 클릭 발사 + 탄소 포집
- **[Action]** 탄소 버블 위에 마우스 위치 → 클릭
- **[Expected]**
  - [ ] 포집 빔(광선/파티클) 발사 애니메이션
  - [ ] 빔이 버블에 명중 → 버블 포집 효과(사라짐 또는 폭발 애니메이션)
  - [ ] 스코어 증가 (버블 크기 비례 KG 누적)
  - [ ] 새 버블 생성하여 총 개수 12개 유지

### TC-08-S4 ✅ 탄소 버블 벽 반사(bounce)
- **[Action]** 게임 시작 후 30초 이상 관찰
- **[Expected]**
  - [ ] 버블이 Canvas 경계에 닿으면 방향 반전
  - [ ] 버블이 화면 밖으로 이탈하지 않음
  - [ ] 버블끼리 겹침 허용 (충돌 연산 없음)

### TC-08-S5 ✅ 스코어 누적
- **[Action]** 10개 이상 버블 연속 포집
- **[Expected]**
  - [ ] 스코어 숫자 실시간 증가
  - [ ] 단위 "KG" 표시 유지
  - [ ] 스코어가 음수가 되지 않음

### TC-08-F1 ❌ Canvas 영역 밖 클릭
- **[Action]** Canvas 외부(다른 섹션) 클릭
- **[Expected]**
  - [ ] 게임 이벤트 발생 안 함 (발사 없음)
  - [ ] 다른 섹션 UI 정상 동작

### TC-08-F2 ❌ 빠른 연속 클릭 (클릭 스팸)
- **[Action]** 동일 위치에서 0.1초 간격으로 10회 클릭
- **[Expected]**
  - [ ] 각 클릭당 하나의 빔만 생성 (중복 발사 허용)
  - [ ] 프레임 드롭 없음 (60fps 유지)
  - [ ] 스코어 과다 증가 방지 (이미 포집된 버블 재충돌 없음)

### TC-08-F3 ❌ 창 크기 변경
- **[Action]** 게임 진행 중 브라우저 창 크기 변경
- **[Expected]**
  - [ ] Canvas가 새 뷰포트 크기에 맞게 리사이즈
  - [ ] 버블 위치 비율 유지 또는 재배치
  - [ ] 게임 루프 중단 없음

---

## TC-09 미니게임 — 웹캠 모드 (FR-06)

**[Endpoint]** `#game` → 웹캠 활성화 버튼 → MediaPipe Hands

---

### TC-09-S1 ✅ 웹캠 권한 요청
- **[Action]** "웹캠 활성화" 버튼 클릭
- **[Expected]**
  - [ ] 브라우저 카메라 권한 다이얼로그 표시
  - [ ] 권한 요청 전 임의로 웹캠 스트림 시작 안 됨 (HTTPS 환경에서만 동작)

### TC-09-S2 ✅ 웹캠 허용 후 손 인식 시작
- **[Action]** 브라우저 카메라 권한 허용
- **[Expected]**
  - [ ] 웹캠 스트림 시작 (숨겨진 `<video>` 요소)
  - [ ] MediaPipe Hands 초기화 완료 (0.5~2초 이내)
  - [ ] "웹캠 모드" 상태 표시 + 조작 안내 표시

### TC-09-S3 ✅ 총 모양 제스처 조준
- **[Action]** 검지를 펴고 나머지 손가락을 접은 상태(총 모양)로 웹캠에 비춤
- **[Expected]**
  - [ ] 조준선이 검지 끝(랜드마크 #8) 방향으로 표시
  - [ ] 손 이동 시 조준선 실시간 추적
  - [ ] 랜드마크 미러 반전 적용 (웹캠 x 좌우 반전)

### TC-09-S4 ✅ 주먹 쥐기 → 발사
- **[Action]** 총 모양(조준) → 주먹 쥐기로 빠르게 전환
- **[Expected]**
  - [ ] 포집 빔 발사 (이전 프레임 조준 방향 기준)
  - [ ] 빔 경로에 탄소 버블 있으면 포집
  - [ ] 스코어 증가

### TC-09-F1 ❌ 웹캠 권한 거부
- **[Action]** 권한 다이얼로그에서 "차단" 선택
- **[Expected]**
  - [ ] 오류 메시지 없이 마우스 모드로 자동 전환
  - [ ] "웹캠 없음 — 마우스 모드로 전환" 안내 토스트 표시
  - [ ] 게임 정상 진행 (마우스 폴백)

### TC-09-F2 ❌ 웹캠 없는 기기
- **[Action]** 웹캠 미탑재 기기에서 웹캠 활성화 버튼 클릭
- **[Expected]**
  - [ ] `NotFoundError` 감지 → 마우스 모드 자동 전환
  - [ ] 게임 중단 없음

### TC-09-F3 ❌ 손이 화면에서 벗어남
- **[Action]** 웹캠 모드 활성화 후 손을 카메라 밖으로 이동
- **[Expected]**
  - [ ] 조준선 숨김 처리
  - [ ] 게임 루프 계속 동작 (버블 유영 유지)
  - [ ] 손이 다시 등장하면 조준 즉시 재개

### TC-09-F4 ❌ HTTP 환경 (비HTTPS)
- **[Action]** `http://localhost:5173`에서 웹캠 활성화 클릭
- **[Expected]**
  - [ ] localhost는 예외적으로 허용 (브라우저 보안 예외)
  - [ ] 배포 환경(`http://`)에서는 `getUserMedia` 차단 → 마우스 모드 폴백

---

## TC-10 반응형 레이아웃 (NFR)

**[Endpoint]** 전체 페이지 — 뷰포트 크기별

---

### TC-10-S1 ✅ 모바일 (375 × 667px)
- **[Action]** Chrome DevTools iPhone SE 프리셋 설정
- **[Expected]**
  - [ ] Navbar: 햄버거 메뉴만 표시
  - [ ] Hero: 텍스트 크기 축소 (5rem → 3rem), 잘림 없음
  - [ ] 모든 벤토 그리드: 단일 열 스택 (`grid-cols-1`)
  - [ ] HUD 뷰어: 단일 열, 데이터 패널 아래 배치
  - [ ] 게임 Canvas: 전체 너비, 세로 높이 60vh 이상 확보
  - [ ] 가로 스크롤 없음

### TC-10-S2 ✅ 태블릿 (768 × 1024px)
- **[Action]** Chrome DevTools iPad 프리셋 설정
- **[Expected]**
  - [ ] Navbar: 데스크탑 메뉴 표시 (`md:flex`)
  - [ ] 벤토 그리드: `md:grid-cols-12` 활성화
  - [ ] HUD: 뷰어 + 사이드 패널 2열 배치

### TC-10-S3 ✅ 데스크탑 (1280 × 800px+)
- **[Action]** 표준 데스크탑 뷰포트
- **[Expected]**
  - [ ] 전체 레이아웃 `max-w-7xl` 중앙 정렬
  - [ ] Hero 텍스트 5rem 이상
  - [ ] 게임 Canvas 전체 너비 + 충분한 높이 (70vh 이상)

### TC-10-F1 ❌ 초소형 뷰포트 (320px)
- **[Action]** 뷰포트 너비 320px 설정
- **[Expected]**
  - [ ] 가로 스크롤 발생하지 않음
  - [ ] 텍스트 overflow hidden 처리
  - [ ] Navbar 로고와 토글 최소 크기 유지

---

## TC-11 크로스 브라우저 (NFR)

**[Endpoint]** 전체 페이지 — 브라우저별

---

### TC-11-S1 ✅ Chrome 110+
- **[Action]** Chrome 최신 버전에서 전체 기능 테스트
- **[Expected]**
  - [ ] 글래스모피즘 `backdrop-filter: blur` 정상 렌더링
  - [ ] Framer Motion 애니메이션 정상 동작
  - [ ] MediaPipe 웹캠 모드 정상 동작
  - [ ] Canvas 게임 60fps 유지

### TC-11-S2 ✅ Firefox 115+
- **[Action]** Firefox 최신 버전에서 테스트
- **[Expected]**
  - [ ] `backdrop-filter` 정상 동작 (Firefox 103+ 지원)
  - [ ] 애니메이션 및 게임 정상 동작

### TC-11-S3 ✅ Safari 16+
- **[Action]** Safari / iOS Safari에서 테스트
- **[Expected]**
  - [ ] `-webkit-backdrop-filter` 적용 확인
  - [ ] `-webkit-background-clip: text` 그라디언트 텍스트 정상
  - [ ] Canvas 터치 이벤트 정상 동작 (모바일 Safari)

### TC-11-F1 ❌ Internet Explorer / 구형 브라우저
- **[Action]** IE 또는 Chrome 109 이하 접근
- **[Expected]**
  - [ ] 완전한 지원 불필요 — 최소한 "브라우저 업그레이드 권장" 처리

---

## TC-12 성능 (NFR)

**[Endpoint]** Chrome Lighthouse / DevTools Performance

---

### TC-12-S1 ✅ Lighthouse 성능 점수
- **[Action]** 프로덕션 빌드(`npm run build`) 후 Lighthouse 실행
- **[Expected]**
  - [ ] Performance 점수 ≥ 80
  - [ ] LCP(최대 콘텐츠 페인트) ≤ 2.5초
  - [ ] CLS(누적 레이아웃 시프트) ≤ 0.1
  - [ ] FID/INP ≤ 200ms

### TC-12-S2 ✅ 게임 루프 60fps 유지
- **[Action]** 게임 섹션에서 Chrome DevTools → Performance 탭 레코딩 (30초)
- **[Expected]**
  - [ ] 평균 프레임 ≥ 55fps (목표 60fps)
  - [ ] JavaScript 힙 메모리 누수 없음 (10분 후 힙 크기 안정적)
  - [ ] `cancelAnimationFrame` 정리 확인 (다른 섹션 스크롤 시 루프 중단)

### TC-12-F1 ❌ 메모리 누수 (게임 섹션 반복 진입/이탈)
- **[Action]** 게임 섹션 진입 → 다른 섹션으로 이동 → 재진입 (5회 반복)
- **[Expected]**
  - [ ] MediaPipe Camera 인스턴스 중복 생성 없음
  - [ ] rAF 루프 중복 실행 없음
  - [ ] 메모리 사용량 선형 증가 없음

---

## TC-13 빌드 및 배포 (NFR)

**[Endpoint]** CLI → `npm run build` → Vercel 배포

---

### TC-13-S1 ✅ 로컬 빌드
- **[Action]** `npm run build` 실행
- **[Expected]**
  - [ ] 에러 없이 빌드 완료
  - [ ] `dist/` 폴더 생성
  - [ ] `dist/index.html` 존재
  - [ ] `dist/assets/` CSS + JS 번들 존재

### TC-13-S2 ✅ 프로덕션 빌드 미리보기
- **[Action]** `npm run preview` 실행 후 브라우저 확인
- **[Expected]**
  - [ ] `http://localhost:4173`에서 정상 로드
  - [ ] 개발 서버 대비 기능 동일
  - [ ] `import.meta.env.DEV` false → 불필요한 console.log 없음

### TC-13-S3 ✅ Vercel 배포 후 HTTPS
- **[Action]** Vercel 배포 완료 후 배포 URL 접속
- **[Expected]**
  - [ ] HTTPS 자동 적용 확인
  - [ ] 웹캠 권한 요청 다이얼로그 정상 작동 (HTTPS 필수)
  - [ ] `VITE_APP_NAME` 환경변수 반영

### TC-13-F1 ❌ 빌드 오류 시나리오
- **[Action]** 의도적으로 import 경로 오류 삽입 후 `npm run build`
- **[Expected]**
  - [ ] Vite가 명확한 에러 메시지 출력
  - [ ] 빌드 프로세스 non-zero exit code로 종료
  - [ ] `dist/` 부분 생성 없음 (오염된 빌드 방지)

---

## 전체 체크리스트 요약

| TC | 기능 | 성공 케이스 | 실패 케이스 | 상태 |
|----|------|------------|------------|------|
| TC-01 | 페이지 최초 로드 | 2 | 2 | 🔲 |
| TC-02 | 스크롤 애니메이션 | 3 | 1 | 🔲 |
| TC-03 | Navbar | 4 | 2 | 🔲 |
| TC-04 | 언어 전환 | 3 | 1 | 🔲 |
| TC-05 | Capture 섹션 | 3 | 1 | 🔲 |
| TC-06 | Algae 섹션 | 3 | 1 | 🔲 |
| TC-07 | HUD 섹션 | 3 | 1 | 🔲 |
| TC-08 | 게임 (마우스) | 5 | 3 | 🔲 |
| TC-09 | 게임 (웹캠) | 4 | 4 | 🔲 |
| TC-10 | 반응형 | 3 | 1 | 🔲 |
| TC-11 | 크로스 브라우저 | 3 | 1 | 🔲 |
| TC-12 | 성능 | 2 | 1 | 🔲 |
| TC-13 | 빌드 / 배포 | 3 | 1 | 🔲 |
| **합계** | | **41** | **20** | **61개** |
