# Graphify Design System

**목적**: 일관된 UI/UX를 위한 디자인 원칙, 컴포넌트, 스타일 정의

---

## 📑 목차

1. [디자인 원칙](#디자인-원칙)
2. [색상 체계](#색상-체계)
3. [타이포그래피](#타이포그래피)
4. [간격 & 레이아웃](#간격--레이아웃)
5. [컴포넌트](#컴포넌트)
6. [아이콘](#아이콘)
7. [다크 모드](#다크-모드)
8. [반응형 디자인](#반응형-디자인)

---

## 🎨 디자인 원칙

### 1. 명확성 (Clarity)
- 정보 계층이 명확함
- 사용자가 다음 액션을 쉽게 찾을 수 있음
- 복잡한 그래프는 필터와 검색으로 단순화

### 2. 효율성 (Efficiency)
- 자주 사용하는 기능은 우선순위 높음
- 최소 클릭으로 주요 작업 완료
- 마우스와 키보드 단축키 모두 지원

### 3. 신뢰성 (Trustworthiness)
- 모든 데이터의 출처를 명시 (EXTRACTED vs INFERRED)
- 신뢰도 점수로 정보의 정확성 표시
- 에러는 친절하고 명확하게 표시

### 4. 응답성 (Responsiveness)
- 로딩 상태를 명확히 표시
- 대기 시간이 길면 프로그레스 바 표시
- 모든 인터랙션은 100ms 이내 피드백

### 5. 통일성 (Consistency)
- 모든 페이지에서 헤더/사이드바 동일
- 같은 액션은 같은 UI로 표시
- 색상, 폰트, 간격 일관된 사용

---

## 🎭 색상 체계

### 라이트 모드 (기본)

```
Primary Color (메인)
├─ primary-900: #0D47A1 (가장 진함)
├─ primary-700: #1565C0 
├─ primary-500: #2196F3 (메인 액션)
├─ primary-300: #64B5F6
└─ primary-100: #E3F2FD (가장 연함)

Success (성공)
├─ success-600: #2E7D32
└─ success-500: #4CAF50

Warning (경고)
├─ warning-600: #F57C00
└─ warning-500: #FF9800

Error (에러)
├─ error-600: #C62828
└─ error-500: #F44336

Neutral (중립)
├─ neutral-900: #1A1A1A (텍스트)
├─ neutral-700: #424242 (텍스트 보조)
├─ neutral-500: #9E9E9E (텍스트 약함)
├─ neutral-300: #BDBDBD (경계선)
└─ neutral-100: #F5F5F5 (배경)

Background
├─ bg-primary: #FFFFFF
├─ bg-secondary: #F5F5F5 (사이드바)
└─ bg-tertiary: #EEEEEE (호버)

Community Colors (커뮤니티별 색상 - 8가지 순환)
├─ #FF6B6B (Red)
├─ #4ECDC4 (Teal)
├─ #45B7D1 (Blue)
├─ #FFA07A (Salmon)
├─ #98D8C8 (Green)
├─ #F7DC6F (Yellow)
├─ #BB8FCE (Purple)
└─ #85C1E2 (Sky Blue)
```

### 다크 모드 (향후 확장)

```
배경: #121212
표면: #1E1E1E
텍스트: #FFFFFF
텍스트 보조: #B0B0B0
```

---

## 📝 타이포그래피

### 폰트 패밀리
- **기본**: `Inter`, `-apple-system`, `BlinkMacSystemFont`, sans-serif
- **코드**: `JetBrains Mono`, `Monaco`, monospace

### 텍스트 스타일

```
Heading 1 (H1)
├─ 크기: 28px
├─ 무게: 700 (Bold)
├─ 라인 높이: 36px
└─ 사용: 페이지 제목

Heading 2 (H2)
├─ 크기: 24px
├─ 무게: 600 (SemiBold)
├─ 라인 높이: 32px
└─ 사용: 섹션 제목

Heading 3 (H3)
├─ 크기: 20px
├─ 무게: 600 (SemiBold)
├─ 라인 높이: 28px
└─ 사용: 소제목

Body Large
├─ 크기: 16px
├─ 무게: 400 (Regular)
├─ 라인 높이: 24px
└─ 사용: 본문 텍스트

Body Regular
├─ 크기: 14px
├─ 무게: 400 (Regular)
├─ 라인 높이: 20px
└─ 사용: 설명 텍스트

Body Small
├─ 크기: 12px
├─ 무게: 400 (Regular)
├─ 라인 높이: 16px
└─ 사용: 캡션, 레이블

Code
├─ 크기: 13px
├─ 무게: 400 (Regular)
├─ 라인 높이: 18px
├─ 파밀리: Monospace
└─ 사용: 코드, 파일 경로
```

---

## 📐 간격 & 레이아웃

### 간격 스케일 (8px 기반)

```
xs: 4px      (간단한 갭)
sm: 8px      (요소 간 작은 여백)
md: 16px     (기본 여백)
lg: 24px     (섹션 간 여백)
xl: 32px     (큰 섹션 간)
2xl: 48px    (페이지 최상위)
```

### 그리드

```
컨테이너: 12 칼럼 그리드
가트터: 16px
마진: 안쪽 24px

중단점:
├─ mobile: 320px
├─ tablet: 768px
├─ desktop: 1024px
└─ wide: 1440px
```

### 레이아웃 패턴

```
1. 3-panel Layout (그래프 페이지)
   ┌─────┬──────────────┬─────┐
   │좌측 │   중앙 그래프  │우측 │
   │패널 │   (주요)      │패널 │
   └─────┴──────────────┴─────┘

2. 사이드바 + 콘텐츠
   ┌───┬────────────────────┐
   │   │                    │
   │   │   메인 콘텐츠      │
   │   │                    │
   └───┴────────────────────┘
   사이드바: 280px (고정)

3. 헤더 + 콘텐츠
   ┌──────────────────────┐
   │      헤더 (56px)     │
   ├──────────────────────┤
   │                      │
   │   메인 콘텐츠        │
   │                      │
   └──────────────────────┘
```

---

## 🧩 컴포넌트

### 버튼

```
Primary Button (기본)
├─ 배경: primary-500
├─ 텍스트: white
├─ 높이: 40px
├─ 패딩: 12px 24px
├─ 보더 반지름: 4px
├─ 폰트: 14px SemiBold
└─ 상태:
   ├─ default: primary-500
   ├─ hover: primary-600
   ├─ active: primary-700
   └─ disabled: neutral-400

Secondary Button
├─ 배경: neutral-100
├─ 텍스트: primary-500
├─ 테두리: 1px primary-500
└─ ... (Primary와 동일한 상태)

Danger Button
├─ 배경: error-500
├─ 텍스트: white
└─ ... (Primary와 동일)

Outline Button
├─ 배경: transparent
├─ 테두리: 1px neutral-300
├─ 텍스트: neutral-900
└─ ... (상태)

Icon Button
├─ 크기: 40px x 40px
├─ 배경: neutral-100 (호버)
└─ 아이콘: 24px
```

### 입력 필드

```
Text Input
├─ 높이: 40px
├─ 패딩: 8px 12px
├─ 테두리: 1px neutral-300
├─ 보더 반지름: 4px
├─ 폰트: 14px
├─ 상태:
│  ├─ default: neutral-300 테두리
│  ├─ focus: primary-500 테두리 (2px)
│  ├─ error: error-500 테두리
│  └─ disabled: neutral-100 배경
├─ 플레이스홀더: neutral-500
└─ 라벨: 12px SemiBold, margin-bottom 8px

Textarea
├─ 최소 높이: 100px
├─ 리사이즈: vertical
└─ ... (Text Input과 동일)

Checkbox
├─ 크기: 20px x 20px
├─ 보더 반지름: 2px
├─ 테두리: 1px neutral-300
└─ 체크 아이콘: 14px

Radio
├─ 크기: 20px x 20px (원형)
└─ ... (Checkbox와 동일)

Select Dropdown
├─ 높이: 40px
├─ 기본 텍스트: "선택 안함"
├─ 드롭다운 아이콘: 우측 12px
└─ ... (Text Input과 동일)
```

### 카드

```
Card (기본)
├─ 배경: white
├─ 테두리: 1px neutral-300
├─ 보더 반지름: 8px
├─ 패딩: 16px
├─ 박스 섀도우: 0 1px 3px rgba(0,0,0,0.1)
└─ 호버: 박스 섀도우 상승

Graph Node Card
├─ Card 기본 스타일
├─ 좌측 색상 바: 4px (커뮤니티별)
├─ 제목: H3 (truncate)
├─ 부제: Body Small, neutral-500
└─ 신뢰도 배지: 우측 상단
```

### 배지/칩

```
Badge (라벨)
├─ 높이: 24px
├─ 패딩: 4px 8px
├─ 보더 반지름: 12px
├─ 폰트: 12px
├─ 종류:
│  ├─ primary: primary-500 배경, white 텍스트
│  ├─ success: success-500 배경
│  ├─ warning: warning-500 배경
│  └─ error: error-500 배경

Confidence Badge
├─ EXTRACTED: success-500
├─ INFERRED: warning-500 (+ 신뢰도 점수)
└─ AMBIGUOUS: error-500
```

### 테이블

```
Table
├─ 헤더 행:
│  ├─ 배경: neutral-100
│  ├─ 텍스트: 14px SemiBold, neutral-900
│  └─ 패딩: 12px
├─ 데이터 행:
│  ├─ 높이: 48px
│  ├─ 패딩: 12px
│  ├─ 테두리: 1px neutral-300 (하단)
│  └─ 호버: neutral-50 배경
├─ 체크박스: 좌측 16px
└─ 정렬: 좌측 정렬
```

### 모달/다이얼로그

```
Modal
├─ 배경: rgba(0,0,0,0.5) (세미투명)
├─ 컨텐츠 배경: white
├─ 보더 반지름: 12px
├─ 최대 너비: 500px (데스크톱)
├─ 패딩: 32px
├─ 구조:
│  ├─ 제목 (H2) + 닫기 버튼 (X)
│  ├─ 본문 (Body Regular)
│  └─ 버튼 그룹 (하단)
│     ├─ 취소 (Secondary)
│     └─ 확인 (Primary)
└─ 애니메이션: fade-in 200ms
```

### 네비게이션

```
헤더 (고정)
├─ 높이: 56px
├─ 배경: white
├─ 테두리 하단: 1px neutral-300
├─ 패딩: 0 24px
├─ 컨텐츠:
│  ├─ 좌측: 로고 + 페이지 제목
│  ├─ 중앙: 검색 바
│  └─ 우측: 알림, 사용자 메뉴

좌측 사이드바 (고정)
├─ 너비: 280px
├─ 배경: neutral-50
├─ 테두리 우측: 1px neutral-300
├─ 패딩: 16px
├─ 메뉴 항목:
│  ├─ 높이: 40px
│  ├─ 패딩: 8px 12px
│  ├─ 보더 반지름: 4px
│  ├─ 폰트: 14px
│  ├─ 기본: neutral-700
│  ├─ 호버: neutral-100 배경
│  └─ 활성: primary-500 배경 + white 텍스트

탭 네비게이션
├─ 높이: 44px
├─ 패딩: 0 16px
├─ 테두리: 1px neutral-300
├─ 탭 항목:
│  ├─ 패딩: 12px 16px
│  ├─ 텍스트: 14px
│  ├─ 기본: neutral-700
│  ├─ 호버: neutral-500
│  ├─ 활성: primary-500 + 하단 테두리 2px
```

### 로딩 & 피드백

```
로딩 스피너
├─ 크기: 48px
├─ 색상: primary-500
├─ 애니메이션: 2s 회전

프로그레스 바
├─ 높이: 4px
├─ 배경: neutral-200
├─ 진행 부분: primary-500
├─ 애니메이션: smooth

Toast 알림
├─ 위치: 우측 하단
├─ 너비: 360px
├─ 최소 높이: 52px
├─ 패딩: 16px
├─ 배경: neutral-900
├─ 텍스트: white
├─ 보더 반지름: 4px
├─ 종류:
│  ├─ success: success-500 좌측 선
│  ├─ error: error-500 좌측 선
│  └─ warning: warning-500 좌측 선
└─ 지속 시간: 4초

Tooltip
├─ 배경: neutral-900
├─ 텍스트: white
├─ 패딩: 8px 12px
├─ 폰트: 12px
├─ 보더 반지름: 4px
└─ 화살표: 4px 포인터
```

---

## 🎯 아이콘

### 아이콘 시스템
- 라이브러리: `Heroicons v2` (또는 `Feather Icons`)
- 크기: 16px, 20px, 24px
- 색상: 텍스트 색상 상속 (currentColor)
- 스트로크: 2px (일관성)

### 자주 사용하는 아이콘
```
네비게이션
├─ Home (홈)
├─ Search (검색)
├─ Settings (설정)
├─ Menu (메뉴)
└─ X (닫기)

액션
├─ Plus (추가)
├─ Edit (수정)
├─ Trash (삭제)
├─ Share (공유)
├─ Download (다운로드)
└─ Copy (복사)

상태
├─ Check (완료)
├─ AlertCircle (경고)
├─ Info (정보)
└─ Clock (대기 중)

사용자
├─ User (사용자)
├─ Users (그룹)
├─ LogOut (로그아웃)
└─ Settings (프로필)

그래프
├─ Network (그래프)
├─ Maximize (확대)
├─ Filter (필터)
└─ ZoomIn/ZoomOut (확대/축소)
```

---

## 🌓 다크 모드 (향후 확장)

### 색상 매핑
- 라이트 모드의 배경색 ↔ 어두운 색상
- 라이트 모드의 텍스트색 ↔ 밝은 색상
- 명도 대비 유지 (WCAG AA 표준)

### CSS 변수 활용
```css
:root {
  --color-primary: #2196F3;
  --color-bg-primary: #FFFFFF;
  --color-text: #1A1A1A;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg-primary: #121212;
    --color-text: #FFFFFF;
  }
}
```

---

## 📱 반응형 디자인

### 중단점별 레이아웃

```
Mobile (< 768px)
├─ 사이드바: 숨김 (해버거 메뉴)
├─ 그래프 3-panel: → 1-panel (탭으로 전환)
├─ 최대 너비: 100% - 32px
└─ 폰트 크기: -2px

Tablet (768px - 1024px)
├─ 사이드바: 표시 (너비 200px)
├─ 그래프 3-panel: 좌측 숨김 (토글)
└─ 폰트 크기: 기본

Desktop (> 1024px)
├─ 사이드바: 고정 (280px)
├─ 그래프 3-panel: 모두 표시
└─ 최대 너비: 1400px (중앙 정렬)
```

### 터치 친화적 디자인
- 터치 타겟: 최소 44x44px
- 버튼 간격: 최소 16px
- 호버 효과는 터치 환경에서 클릭 후 표시

---

## 🎬 애니메이션 & 트랜지션

### 기본 easing
```
ease-out: cubic-bezier(0.33, 0.66, 0.66, 1)  (진입)
ease-in: cubic-bezier(0.33, 0, 0.66, 0.33)   (퇴출)
ease-in-out: cubic-bezier(0.33, 0, 0.66, 1)  (부드러운)
```

### 지속 시간
```
xs: 100ms (간단한 상태 변화)
sm: 200ms (UI 요소 이동)
md: 300ms (모달 오픈/클로즈)
lg: 500ms (페이지 전환)
```

### 예시
```
버튼 호버: background-color 200ms ease-out
모달 오픈: opacity + transform 300ms ease-out
페이지 전환: opacity 500ms ease-in-out
```

---

## ♿ 접근성 (WCAG 2.1 AA)

### 색상 명도 대비
- 정상 텍스트: 4.5:1 이상
- 큰 텍스트: 3:1 이상
- UI 컴포넌트: 3:1 이상

### 포커스 상태
```
outline: 2px solid primary-500;
outline-offset: 2px;
```

### 키보드 네비게이션
- Tab: 다음 요소로 이동
- Shift+Tab: 이전 요소로 이동
- Enter: 버튼 활성화
- Space: 체크박스 토글
- Escape: 모달 닫기

### 스크린 리더
- 모든 이미지: alt 텍스트
- 폼 레이블: `<label>` 연결
- 아이콘 버튼: aria-label 지정
- 목록: semantic HTML (`<ul>`, `<li>`)

---

## 📦 CSS 아키텍처

### 폴더 구조
```
styles/
├─ variables.css (색상, 간격, 폰트)
├─ reset.css (기본 스타일 초기화)
├─ typography.css (폰트 스타일)
├─ components/
│  ├─ button.css
│  ├─ input.css
│  ├─ card.css
│  ├─ modal.css
│  └─ ...
├─ layouts/
│  ├─ header.css
│  ├─ sidebar.css
│  └─ ...
└─ utilities/ (Tailwind 유사)
   ├─ spacing.css
   ├─ display.css
   └─ ...
```

### CSS 변수
```css
:root {
  /* 색상 */
  --color-primary-500: #2196F3;
  --color-neutral-900: #1A1A1A;
  
  /* 간격 */
  --spacing-sm: 8px;
  --spacing-md: 16px;
  
  /* 타이포그래피 */
  --font-family-base: 'Inter', sans-serif;
  --font-size-body: 14px;
  
  /* 조면 반지름 */
  --radius-sm: 4px;
  --radius-md: 8px;
  
  /* 섀도우 */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  
  /* 트랜지션 */
  --transition-base: 200ms ease-out;
}
```

---

## 🚀 구현 가이드

### React 컴포넌트 예시

```jsx
// Button Component
<Button variant="primary" size="md" disabled={false}>
  클릭하세요
</Button>

// Card Component
<Card className="graph-node">
  <CardHeader>
    <h3>Function.login</h3>
    <Badge type="extracted">EXTRACTED</Badge>
  </CardHeader>
  <CardBody>
    <p>설명 텍스트</p>
  </CardBody>
</Card>
```

### Tailwind CSS (선택사항)
```jsx
<button className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors">
  버튼
</button>
```

---

## 📚 참고 자료

- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [Material Design](https://m3.material.io/)
- [Heroicons](https://heroicons.com/)
- [Inter Font](https://fonts.google.com/specimen/Inter)

