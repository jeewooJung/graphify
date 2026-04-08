# Graphify - Impeccable UI Guidelines

**설계 철학**: Analytical Minimalism + Precision Intelligence  
**대상**: 기업 내 지식베이스 플랫폼 (팀 협업, 데이터 기반)  
**목표**: 복잡한 그래프를 명확하고 효율적으로 표현

---

## 🎨 Aesthetic Direction: "Analytical Minimalism"

### 핵심 원칙

1. **그래프가 주인공** - UI는 데이터를 돋보이게 함
2. **명확한 계층** - 정보 구조가 시각적으로 드러남
3. **의도적인 공백** - 호흡감 있는 여백
4. **기술적이면서도 따뜻함** - 차갑지 않은 프로페셔널리즘
5. **미세한 상호작용** - 기능성을 높이는 모션

### 감정 표현

```
차갑고 딱딱함 ←→ 따뜻하고 부드러움
     ❌            ✅ (Graphify)
     
과하게 장식적 ←→ 미니멀 하지만 세련됨
     ❌            ✅ (Graphify)

무겁고 둔함 ←→ 가볍고 명확함
     ❌            ✅ (Graphify)
```

---

## 1️⃣ Typography Domain

### 폰트 선택 (Outfit + Fira Sans + Fira Code)

```
Display Font: Outfit
├─ 특징: Geometric, Modern, 개성 있음
├─ 용도: 헤더, 제목, 브랜드 요소
├─ 이유: Inter보다 distinctive, 기술적이면서도 현대적
└─ 예: "Graphify", 페이지 제목 (H1, H2)

Body Font: Fira Sans
├─ 특징: Clear, Warm, Technical, Humanized
├─ 용도: 본문, 설명, 라벨, UI 텍스트
├─ 이유: 기술적이지만 차갑지 않음, 읽기 편함
└─ 예: 설명 텍스트, 폼 라벨, 테이블

Code Font: Fira Code
├─ 특징: Monospace, Clear, With Ligatures
├─ 용도: 파일 경로, 코드, 신뢰도 점수
├─ 이유: 일관성, 가독성
└─ 예: "auth.py:42", "0.95" (신뢰도)
```

### 타이포그래피 스케일 (Modular Scale 1.125)

```
H1: 32px / 700 / Outfit / 40px line-height
    → 페이지 제목, 브랜드

H2: 28px / 600 / Outfit / 36px line-height
    → 섹션 제목, 그래프 제목

H3: 24px / 600 / Outfit / 32px line-height
    → 소제목, 카드 제목

Body Large: 16px / 400 / Fira Sans / 24px line-height
    → 주 설명 텍스트

Body Regular: 14px / 400 / Fira Sans / 20px line-height
    → 기본 텍스트, 폼 라벨, UI

Body Small: 12px / 400 / Fira Sans / 16px line-height
    → 캡션, 조수 텍스트, 메타데이터

Code: 13px / 400 / Fira Code / 18px line-height
    → 파일 경로, 코드, 기술 정보
```

### 접근성 (WCAG 2.1 AA)

```
✅ 명도 대비
   - 본문 텍스트: 4.5:1 이상
   - 큰 텍스트 (18px+): 3:1 이상
   - UI 요소: 3:1 이상

✅ 라인 높이
   - 최소 1.4x (body 텍스트)
   - 1.2x 이상 (헤더)

✅ 문자 간격
   - 메시지 자동 확대 가능
   - 200% 줌에서도 읽을 수 있음

✅ 폰트 무게 구별
   - 만 색상으로 구분하지 않음
   - 무게, 크기로도 구분
```

---

## 2️⃣ Color & Contrast Domain (OKLCH)

### 색상 체계 (OKLCH)

#### 주요 색상

```
Primary: oklch(28% 0.15 240°)
├─ Dark: oklch(22% 0.12 240°)  (#0F4C75)
├─ Base: oklch(28% 0.15 240°)  (#1565C0)
├─ Light: oklch(45% 0.10 240°) (#64B5F6)
└─ Lighter: oklch(70% 0.05 240°) (#E3F2FD)

Accent Red: oklch(45% 0.20 10°)
├─ Dark: oklch(35% 0.18 10°)  (#C62828)
├─ Base: oklch(45% 0.20 10°)  (#D62828)
└─ Light: oklch(70% 0.15 10°) (#EF5350)

Accent Green: oklch(50% 0.15 140°)
├─ Base: oklch(50% 0.15 140°)  (#4CAF50)
└─ Light: oklch(75% 0.10 140°) (#A5D6A7)

Accent Orange: oklch(55% 0.18 60°)
├─ Base: oklch(55% 0.18 60°)  (#FF9800)
└─ Light: oklch(80% 0.12 60°) (#FFE0B2)
```

#### 중립 색상 (Gray Scale)

```
Neutral 900: oklch(15% 0.01 0°)   (#1F2937)  - 강한 텍스트
Neutral 800: oklch(25% 0.01 0°)   (#374151)  - 텍스트
Neutral 700: oklch(35% 0.01 0°)   (#4B5563)  - 보조 텍스트
Neutral 600: oklch(45% 0.01 0°)   (#6B7280)  - 약한 텍스트
Neutral 500: oklch(55% 0.01 0°)   (#9CA3AF)  - 매우 약한
Neutral 400: oklch(65% 0.01 0°)   (#D1D5DB)  - 테두리
Neutral 300: oklch(75% 0.01 0°)   (#E5E7EB)  - 호버
Neutral 200: oklch(85% 0.01 0°)   (#F3F4F6)  - 배경
Neutral 100: oklch(95% 0.01 0°)   (#F9FAFB)  - 라이트 배경
Neutral 50: oklch(98% 0.01 0°)    (#FAFBFC)  - 매우 밝음
```

#### Community Colors (8가지 - 고명도)

```
1. Coral: oklch(60% 0.20 20°)      (#FF6B6B)
2. Teal: oklch(60% 0.15 200°)      (#4ECDC4)
3. Sky: oklch(65% 0.12 250°)       (#45B7D1)
4. Salmon: oklch(70% 0.15 30°)     (#FFA07A)
5. Mint: oklch(70% 0.12 160°)      (#98D8C8)
6. Golden: oklch(75% 0.18 80°)     (#F7DC6F)
7. Lavender: oklch(65% 0.12 300°)  (#BB8FCE)
8. Sky Blue: oklch(70% 0.10 240°)  (#85C1E2)
```

### 명도 대비 (WCAG AA)

```
✅ Primary + White: 5.8:1 (PASS)
✅ Neutral 900 + White: 10.2:1 (PASS)
✅ Neutral 600 + White: 3.7:1 (PASS - 큰 텍스트)
✅ Accent Red + White: 4.1:1 (PASS)

❌ Neutral 400 + White: 2.1:1 (FAIL - 강화 필요)
→ 폼 라벨: Neutral 600 사용
```

### 다크 모드 (향후 확장)

```
Background: oklch(12% 0 0°)        (#121212)
Surface: oklch(16% 0 0°)           (#1E1E1E)
Text: oklch(98% 0 0°)              (#FAFBFC)
Text Secondary: oklch(70% 0 0°)    (#B0B0B0)

명도 대비 유지
- Text + Background: 10:1 이상
```

---

## 3️⃣ Spatial Design Domain

### 그리드 시스템

```
12 Column Grid
├─ Desktop (1440px+): 1368px 컨테이너 (중앙 정렬)
├─ Wide (1024px): 960px 컨테이너
├─ Tablet (768px): 672px 컨테이너
└─ Mobile (320px): 100% - 32px 패딩

Column Width: (container - gutter * 11) / 12
Gutter: 16px
Margin: 24px (desktop), 16px (mobile)
```

### 간격 스케일 (8px base)

```
xs: 4px     - 요소 내부 간격
sm: 8px     - 작은 요소 간 간격
md: 16px    - 기본 간격 ⭐
lg: 24px    - 섹션 간 간격
xl: 32px    - 큰 섹션 간
2xl: 48px   - 페이지 최상위
3xl: 64px   - 큰 제목 위아래
```

### 레이아웃 패턴

```
1. Header (고정)
   ├─ 높이: 56px
   ├─ 패딩: 0 24px
   ├─ 콘텐츠: 로고 | 검색 | 알림 | 프로필
   └─ 테두리: 하단 1px neutral-300

2. Sidebar (고정, 모바일 숨김)
   ├─ 너비: 240px
   ├─ 패딩: 16px
   ├─ 메뉴 항목: 40px, 8px 패딩, 4px radius
   ├─ 호버: neutral-100 배경
   ├─ 활성: primary 배경 + white 텍스트
   └─ 구분선: 1px neutral-300

3. 3-Panel Layout (그래프 페이지)
   ├─ 좌측: 280px (필터)
   ├─ 중앙: flex-grow (그래프)
   └─ 우측: 300px (노드 상세)
   
   모바일: 1-panel (탭으로 전환)
   태블릿: 좌측 숨김 (토글)

4. 콘텐츠 컨테이너
   ├─ 최대 너비: 1368px (그리드 기준)
   ├─ 안쪽 패딩: 24px
   └─ 반응형: 16px (모바일)
```

### 시각적 계층 (Z-Index)

```
Header: 100
Sidebar: 99
Modal Overlay: 98
Modal: 99
Tooltip: 50
Dropdown: 40
Card Hover: 10 (box-shadow)
Default: 1
```

---

## 4️⃣ Motion Design Domain

### 애니메이션 곡선

```
진입 (Enter): cubic-bezier(0.33, 0.66, 0.66, 1)
             ease-out (처음 빠름, 끝 느림)
             → 요소 나타남

퇴출 (Exit): cubic-bezier(0.33, 0, 0.66, 0.33)
             ease-in (처음 느림, 끝 빠름)
             → 요소 사라짐

부드러움 (Smooth): cubic-bezier(0.33, 0, 0.66, 1)
                 ease-in-out
                 → 상태 변화

선형 (Linear): linear
             → 로딩 바, 진행 상황
```

### 지속 시간

```
xs: 100ms  - 버튼 호버, 작은 상태 변화
sm: 200ms  - UI 요소 이동, 페이드 인/아웃
md: 300ms  - 모달 오픈, 탭 전환
lg: 500ms  - 페이지 전환, 큰 애니메이션
```

### 주요 애니메이션

#### 1. 페이지 진입

```css
/* 배경 페이드인 */
opacity: 0 → 1
duration: 300ms
easing: ease-out

/* 콘텐츠 staggered reveal */
.content-item {
  opacity: 0;
  transform: translateY(16px);
  animation: fadeInUp 500ms ease-out forwards;
  animation-delay: calc(var(--index) * 50ms);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

#### 2. 그래프 노드 상호작용

```css
/* Hover: 미세한 확대 + 글로우 */
.node {
  transition: all 200ms ease-out;
}

.node:hover {
  transform: scale(1.05);
  box-shadow: 0 0 12px rgba(21, 101, 192, 0.3);
}

/* 클릭: 펄스 */
.node:active {
  animation: pulse 300ms ease-out;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}
```

#### 3. 모달 오픈

```css
/* 배경 페이드 */
.modal-overlay {
  opacity: 0;
  animation: fadeIn 300ms ease-out forwards;
}

/* 모달 슬라이드 + 페이드 */
.modal {
  opacity: 0;
  transform: translateY(-32px);
  animation: slideInDown 300ms ease-out forwards;
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-32px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

#### 4. 로딩 스피너

```css
.spinner {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

### 모션 최소화

```
✅ 필요한 모션만
   - 페이지 전환: O
   - 호버 피드백: O
   - 로딩 표시: O

❌ 불필요한 모션 제거
   - 과도한 애니메이션: X
   - 광고 스타일 반짝임: X
   - 자동 재생 (사용자 초대 필요)

✅ prefers-reduced-motion 존중
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 5️⃣ Interaction Design Domain

### 폼 & 입력

```
Text Input
├─ 높이: 40px
├─ 패딩: 8px 12px
├─ 테두리: 1px neutral-400
├─ 보더 반지름: 4px
├─ 포커스: 
│  ├─ 테두리: 2px primary
│  ├─ 색상: primary-500
│  ├─ outline: 2px primary, 2px offset
│  └─ 배경: white
├─ 에러:
│  ├─ 테두리: 2px error-500
│  └─ 배경: oklch(98% 0.05 10°) (매우 연한 빨강)
├─ 비활성: 
│  ├─ 배경: neutral-100
│  └─ 색상: neutral-600
└─ 플레이스홀더: neutral-500

Textarea
├─ 최소 높이: 100px
├─ 리사이즈: vertical (높이만)
└─ ... (Input과 동일)

Checkbox / Radio
├─ 크기: 20px
├─ 테두리: 2px neutral-400
├─ 보더 반지름: 2px (checkbox), 50% (radio)
├─ 포커스: 2px primary outline
├─ 체크 표시: 체크 아이콘 (white)
└─ 라벨: 14px, 왼쪽에 8px 간격

Select Dropdown
├─ 높이: 40px
├─ 표시: "선택 안함" (placeholder)
├─ 드롭다운 아이콘: 우측 12px (chevron-down)
└─ ... (Input과 동일)
```

### 로딩 & 피드백

```
로딩 스피너
├─ 크기: 48px
├─ 색상: primary-500
├─ 애니메이션: 2s 회전
└─ 텍스트: "로딩 중..."

프로그레스 바
├─ 높이: 4px
├─ 배경: neutral-200
├─ 진행: primary-500
├─ 지속: smooth transition
└─ 텍스트: "50% 완료"

Toast 알림
├─ 위치: 우측 하단 (16px 마진)
├─ 너비: 360px (최대)
├─ 최소 높이: 52px
├─ 패딩: 16px
├─ 배경: neutral-900
├─ 텍스트: white
├─ 보더 반지름: 4px
├─ 종류:
│  ├─ Success: 좌측 4px 초록색 선
│  ├─ Error: 좌측 4px 빨간색 선
│  └─ Info: 좌측 4px 파란색 선
└─ 지속: 4초 (자동 제거)

Tooltip
├─ 배경: neutral-900
├─ 텍스트: white
├─ 패딩: 8px 12px
├─ 보더 반지름: 4px
├─ 폰트: 12px
└─ 포지셔닝: 요소 상단 8px
```

### 포커스 상태

```css
/* 모든 인터랙티브 요소 */
:focus {
  outline: 2px solid oklch(28% 0.15 240°);  /* primary */
  outline-offset: 2px;
}

/* 버튼 */
button:focus-visible {
  outline: 2px solid primary;
  outline-offset: 2px;
}

/* 링크 */
a:focus-visible {
  outline: 2px solid primary;
  outline-offset: 2px;
  border-radius: 2px;
}

/* 키보드 네비게이션 표시 */
:focus-visible {
  outline: 2px solid primary;
  outline-offset: 2px;
}
```

### 에러 처리

```
❌ 에러 상태
├─ 테두리: 2px error-500
├─ 배경: oklch(98% 0.05 10°) (매우 연한 빨강)
├─ 에러 메시지: 아래 8px, 12px 폰트
└─ 아이콘: ⚠️ (경고 아이콘)

에러 메시지 텍스트
├─ 색상: error-600
├─ 크기: 12px
├─ 무게: 400
└─ 예:
   ✅ "이메일 형식이 올바르지 않습니다"
   ❌ "오류"
   ✅ "이 파일은 이미 업로드되었습니다"
   ❌ "파일 오류"
```

---

## 6️⃣ Responsive Design Domain

### 중단점 & 전략

```
Mobile First Approach

320px - 480px (Mobile)
├─ Sidebar: 숨김 (해버거 메뉴)
├─ 3-Panel Layout: 1-panel (탭)
├─ 최대 너비: 100% - 32px (16px * 2)
├─ 폰트 감소: -2px
├─ 컴포넌트: 전체 너비
└─ 터치 타겟: 44x44px 이상

480px - 768px (Tablet Small)
├─ Sidebar: 여전히 숨김
├─ 3-Panel: 1-panel (토글)
├─ 최대 너비: 100% - 32px
└─ 폰트: 기본 유지

768px - 1024px (Tablet)
├─ Sidebar: 표시 (200px, 토글 가능)
├─ 3-Panel: 좌측 숨김 (토글)
├─ 최대 너비: 672px
└─ 폰트: 기본

1024px - 1440px (Desktop)
├─ Sidebar: 고정 (240px)
├─ 3-Panel: 모두 표시
├─ 최대 너비: 960px
└─ 폰트: 기본

1440px+ (Wide Desktop)
├─ Sidebar: 고정 (240px)
├─ 3-Panel: 모두 표시
├─ 최대 너비: 1368px
└─ 폰트: 기본
```

### 테이블/이미지

```css
/* 반응형 테이블 */
@media (max-width: 768px) {
  table {
    display: block;
    overflow-x: auto;
  }
  
  thead {
    display: none;
  }
  
  tr {
    display: block;
    margin-bottom: 16px;
    border: 1px solid neutral-300;
  }
  
  td {
    display: block;
    padding: 8px;
    text-align: right;
  }
  
  td::before {
    content: attr(data-label);
    float: left;
    font-weight: 600;
  }
}

/* 반응형 이미지 */
img {
  max-width: 100%;
  height: auto;
  display: block;
}

/* 비디오 임베드 */
.video-container {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%;
}

.video-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
```

---

## 7️⃣ UX Writing Domain

### 버튼 라벨

```
❌ 나쁜 예
- "제출"
- "확인"
- "처리"
- "클릭"

✅ 좋은 예
- "로그인"
- "팀 생성"
- "권한 추가"
- "그래프 분석 시작"

원칙:
- 동작 동사 + 대상 (예: "팀원 초대")
- 명사 우선 ("로그인" not "로그인하기")
- 직접적이고 구체적
- 150자 이내
```

### 에러 메시지

```
❌ 나쁜 예
- "오류"
- "작동 안 함"
- "문제 발생"
- "Invalid input"

✅ 좋은 예
- "이메일 주소가 올바르지 않습니다. 다시 확인해주세요."
- "이 팀 이름은 이미 사용 중입니다."
- "파일이 5MB 이상입니다. 더 작은 파일을 선택해주세요."
- "인터넷 연결이 없습니다. 다시 시도해주세요."

원칙:
- 무엇이 잘못됐는지 설명
- 해결 방법 제시
- 친절하고 도움이 되는 톤
- 기술 용어 최소화
```

### 빈 상태 텍스트

```
❌ 나쁜 예
- "데이터 없음"
- "검색 결과 없음"
- "빈 상태"

✅ 좋은 예
- "아직 그래프가 없습니다. 프로젝트를 분석해보세요."
- "검색 결과가 없습니다. 다른 검색어를 시도해보세요."
- "팀원을 초대해서 함께 시작하세요."

구성:
1. 현재 상태 설명
2. 다음 액션 제시 (버튼 포함)
3. 선택적: 힌트나 예시
```

### 로딩 메시지

```
❌ 나쁜 예
- "로딩 중..."
- "처리 중..."

✅ 좋은 예
- "그래프를 분석 중입니다... (2/3)"
- "코드를 파싱하는 중..."
- "임베딩을 생성하는 중..."

원칙:
- 진행률 표시 (프로그레스 바)
- 무엇을 하고 있는지 설명
- 예상 시간 (가능하면)
```

### 확인 대화상자

```
❌ 나쁜 예
Title: "확인"
Message: "계속하시겠습니까?"
Buttons: [예], [아니요]

✅ 좋은 예
Title: "팀 삭제"
Message: "이 팀을 삭제하면 모든 멤버와 그래프가 제거됩니다. 정말 삭제하시겠습니까?"
Buttons: [취소], [삭제]

원칙:
- 명확한 제목 (행동)
- 결과 설명 (부작용 포함)
- 주 버튼: Primary 색상
- 취소 버튼: Secondary 색상
```

---

## 🚫 안티 패턴 체크

### ❌ 과도한 그림자/둥근 모서리

```
Bad:
box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3),
            0 5px 15px rgba(0, 0, 0, 0.2);
border-radius: 20px;

Good:
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
border-radius: 4px;

규칙:
- 섀도우: 매우 미세한 깊이만
- 보더 반지름: 4-8px (8px는 카드, 버튼 호버)
```

### ❌ 일관성 없는 간격

```
Bad:
margin-bottom: 12px;
margin-bottom: 20px;
padding: 15px;
gap: 18px;

Good:
모든 간격은 8px의 배수:
4px, 8px, 16px, 24px, 32px, 48px, 64px

규칙:
- 8px base unit 준수
- 계산 가능해야 함
```

### ❌ 열악한 터치 타겟

```
Bad:
button { width: 30px; height: 30px; }

Good:
button { min-width: 44px; min-height: 44px; }

규칙:
- 최소 44x44px
- 버튼 간 최소 16px
- 터치 디바이스 우선
```

### ❌ 접근성 부족

```
Bad:
<div class="button" onClick={...}>클릭</div>

Good:
<button onClick={...}>클릭</button>

규칙:
- Semantic HTML
- ARIA 라벨
- 키보드 네비게이션
- 포커스 표시
- 스크린 리더 지원
```

### ❌ 텍스트 대비 부족

```
Bad:
color: #999999;  /* neutral-600 on white: 3.1:1 */

Good:
color: #424242;  /* neutral-800 on white: 4.5:1 */

규칙:
- 본문: 4.5:1 이상
- 큰 텍스트: 3:1 이상
- 항상 테스트 (contrast checker)
```

---

## 📋 컴포넌트 체크리스트

```
[ ] 버튼
    [ ] Primary, Secondary, Danger, Outline
    [ ] 4개 상태: default, hover, active, disabled
    [ ] 44x44px 이상
    [ ] 명확한 라벨

[ ] 입력 필드
    [ ] 텍스트, 테스트에어리어, 셀렉트
    [ ] 포커스/에러 상태
    [ ] 40px 높이
    [ ] 플레이스홀더

[ ] 카드
    [ ] 1px 테두리, 4px 반지름
    [ ] 미세한 섀도우
    [ ] 호버 상태

[ ] 테이블
    [ ] 헤더 neutral-100
    [ ] 행 높이 48px
    [ ] 체크박스 열
    [ ] 반응형

[ ] 모달
    [ ] 제목, 본문, 버튼
    [ ] 배경 어둡게
    [ ] Escape 닫기
    [ ] 포커스 가두기

[ ] 네비게이션
    [ ] 헤더 56px
    [ ] 사이드바 240px
    [ ] 활성 표시
    [ ] 모바일 숨김

[ ] 애니메이션
    [ ] 페이지 진입 (staggered)
    [ ] 호버 피드백
    [ ] 로딩 스피너
    [ ] 모션 최소화 존중
```

---

## 📦 CSS 변수

```css
:root {
  /* 색상 */
  --color-primary-900: oklch(22% 0.12 240°);
  --color-primary-700: oklch(28% 0.15 240°);
  --color-primary-500: oklch(35% 0.15 240°);
  --color-primary-300: oklch(45% 0.10 240°);
  --color-primary-100: oklch(70% 0.05 240°);
  
  --color-error-600: oklch(35% 0.18 10°);
  --color-error-500: oklch(45% 0.20 10°);
  
  --color-neutral-900: oklch(15% 0.01 0°);
  --color-neutral-800: oklch(25% 0.01 0°);
  --color-neutral-700: oklch(35% 0.01 0°);
  --color-neutral-600: oklch(45% 0.01 0°);
  --color-neutral-500: oklch(55% 0.01 0°);
  --color-neutral-400: oklch(65% 0.01 0°);
  --color-neutral-300: oklch(75% 0.01 0°);
  --color-neutral-200: oklch(85% 0.01 0°);
  --color-neutral-100: oklch(95% 0.01 0°);
  
  /* 간격 */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  
  /* 타이포그래피 */
  --font-family-display: 'Outfit', sans-serif;
  --font-family-body: 'Fira Sans', sans-serif;
  --font-family-code: 'Fira Code', monospace;
  
  --font-size-h1: 32px;
  --font-size-body: 14px;
  --font-size-small: 12px;
  
  /* 반지름 */
  --radius-sm: 4px;
  --radius-md: 8px;
  
  /* 섀도우 */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  
  /* 트랜지션 */
  --transition-fast: 200ms ease-out;
  --transition-normal: 300ms ease-out;
}
```

---

## ✅ 최종 체크리스트

- [ ] 폰트: Outfit (display) + Fira Sans (body) + Fira Code (code)
- [ ] 색상: OKLCH 시스템, 8가지 커뮤니티 색상
- [ ] 간격: 8px 기본 단위, 12칼럼 그리드
- [ ] 모션: ease-out 진입, ease-in 퇴출, 최소 모션
- [ ] 상호작용: 포커스, 에러, 로딩 상태 처리
- [ ] 반응형: 320px ~ 1440px+ 지원
- [ ] 텍스트: 구체적인 라벨, 도움이 되는 메시지
- [ ] 안티패턴: 섀도우/반지름/간격/대비 확인됨
- [ ] 접근성: WCAG AA, 명도 대비, 키보드 네비게이션

