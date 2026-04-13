# Graphify 지식베이스 채팅/문서 Low-fi UI Spec

작성일: 2026-04-13
문서 목적: `docs/2026-04-10-knowledgebase-chat-wireframes.md`의 텍스트 와이어프레임을 Figma로 그대로 옮길 수 있는 수준의 low-fi 스펙으로 정리한다. 각 프레임은 크기·레이아웃·주요 컴포넌트·우선순위·상태 변형·인터랙션을 명시한다.
연계 문서:

- [페이지 사양](/mnt/c/workspaceRND/graphify/graphify/docs/PAGE_SPECIFICATIONS.md)
- [컴포넌트 트리](/mnt/c/workspaceRND/graphify/graphify/docs/2026-04-13-component-tree.md)
- [기존 와이어프레임](/mnt/c/workspaceRND/graphify/graphify/docs/2026-04-10-knowledgebase-chat-wireframes.md)

## 0. 공통 규칙

### 0.1 프레임 크기 규약

- Desktop 기본: `1440 x 900` (콘텐츠 최대 폭 1280)
- Desktop narrow: `1280 x 800`
- Mobile: `390 x 844`
- 모든 프레임은 8pt 그리드. 기본 간격 토큰: `4 / 8 / 12 / 16 / 24 / 32 / 48`.

### 0.2 레이아웃 골격

데스크톱 공통 셸:

- 좌측 사이드바 폭: `240`
- 상단 헤더 높이: `56`
- 본문 영역: 나머지 공간, 콘텐츠 최대 폭 1280 + 좌우 패딩 24

채팅 상세만 예외적으로 3열을 사용한다(아래 §3).

### 0.3 우선순위 표기

각 프레임의 영역은 P0(없으면 안 됨) / P1(MVP 포함) / P2(확장) 3단계로 표기한다.

### 0.4 상태 변형 공통 규칙

- `Default`, `Loading`, `Empty`, `Error`, `NoPermission` 5개 상태는 모든 프레임에서 가능한지 점검한다.
- 각 프레임에서 실제로 존재하는 상태만 변형 섹션에 기재한다.

### 0.5 공통 인터랙션 메모

- 기본 hover: 카드/행은 배경 톤 한 단계 강화, 커서 `pointer`.
- 포커스 링: 키보드 탭 시 2px outline (접근성).
- 모달/드로어 오픈 시 배경 scrim은 흑 40% 불투명.
- 스켈레톤은 콘텐츠 형태를 유지하는 blocky 회색 바로 표현.

## 1. 프레임 목록

| # | 이름 | 크기 | 용도 |
|---|---|---|---|
| F1 | Dashboard | 1440×900 | 질문 시작 허브 재정의판 |
| F2 | Chat home | 1440×900 | `/chat` 세션 없음 상태 |
| F3 | Chat session detail | 1440×900 | `/chat/:sessionId` 3열 |
| F4 | Project documents | 1440×900 | `/projects/:projectId/documents` |
| F5 | Upload drawer | 480×900 (우측 드로어) | F4/F1에서 오버레이 |
| F6 | Source preview panel | 360×844 (드로어) | F3 모바일 변형 |
| F7 | Empty state | 1440×900 | F4/F2/F3의 빈 상태 공통 뷰 |
| F8 | Error state | 1440×900 | 전역 로드 실패 공통 뷰 |
| F9 | Mobile chat session | 390×844 | F3의 모바일 변형 |

## 2. F1. Dashboard

### 기본 정보

- 화면 이름: Dashboard (질문 시작 허브)
- 프레임 크기: `1440 x 900`
- 대상 라우트: `/dashboard`

### 레이아웃 구조

```text
┌────────┬───────────────────────────────────────────────┐
│        │ Header (H:56)                                 │
│ Side   ├───────────────────────────────────────────────┤
│ bar    │ [A] Welcome strip (H:64)                      │
│ (240)  │ [B] Ask composer card (H:160)                 │
│        │ [C] Suggested questions (H:120, 3~4 chip 행)  │
│        │ [D] Recent chat sessions (H:220, 3 cards)     │
│        │ [E] Recent uploads (H:220, 3~4 cards)         │
│        │ [F] Stats strip (H:120, 이전 통계 카드 축소)  │
└────────┴───────────────────────────────────────────────┘
```

### 주요 컴포넌트

- `PageHeader` (A)
- `ChatScopeSelector` + `ChatComposer` (B)
- `SuggestedFollowUps` (C) — 대시보드 변형
- `ChatSessionListItem` 카드 × 3 (D)
- `DocumentListItem` 읽기 전용 카드 × 3~4 (E)
- 기존 `Statistics` 요약판 (F)

### 영역별 우선순위

- A · B · D: P0
- C · E: P1
- F: P2 (확장 시 유지 혹은 이동)

### 상태 변형

- Default
- Loading: D/E 스켈레톤, B는 즉시 사용 가능
- Empty(신규 사용자): D·E 빈 메시지 + `Chat 시작하기` / `문서 업로드` CTA
- Error(부분): 카드별 에러 뱃지와 재시도 버튼

### 인터랙션 메모

- B composer Enter 전송 → `POST /chat/sessions` 후 `/chat/:sessionId`로 라우팅.
- C chip 클릭 → B 입력창에 주입 + 포커스.
- D 카드 클릭 → 세션 상세.
- E 카드 클릭 → `/projects/:projectId/documents?documentId=...`.

## 3. F2. Chat home (`/chat`)

### 기본 정보

- 화면 이름: Chat home
- 프레임 크기: `1440 x 900`
- 대상 라우트: `/chat`

### 레이아웃 구조

```text
┌────────┬───────────────────────────────────────────────┐
│        │ Header                                        │
│ Side   ├───────────────┬───────────────────────────────┤
│ bar    │ [L] Session   │ [M] Welcome state             │
│        │  list (280)   │   [M1] Scope selector         │
│        │  + New chat   │   [M2] Composer (large)       │
│        │               │   [M3] Suggested questions    │
│        │               │   [M4] Recent sessions (compact) │
│        │               │                               │
└────────┴───────────────┴───────────────────────────────┘
```

좌측 세션 목록 폭 `280`, 중앙 영역 자동.

### 주요 컴포넌트

- L: `ChatSessionList` + `ChatSessionListItem`
- M1: `ChatScopeSelector`
- M2: `ChatComposer` (큰 사이즈, 최대 8줄)
- M3: `SuggestedFollowUps`
- M4: 최근 세션 축약 (L이 스크롤 길어질 때 중앙에도 노출)

### 영역별 우선순위

- L · M1 · M2: P0
- M3: P1
- M4: P2

### 상태 변형

- Default: 최근 세션 존재
- Empty: M에 일러스트 + "첫 질문을 시작해 보세요" + M3 노출
- Loading: L 스켈레톤
- Error: L 상단 에러 배너 + 재시도
- NoPermission (Workspace-only): viewer이며 접근 가능한 프로젝트가 없는 경우 M1에 `Workspace` 옵션만 노출(`Team`/`Project` disabled, 툴팁으로 사유 설명). `ChatWelcomeState`에 `disabledKinds=['TEAM','PROJECT']`로 전달.

### 인터랙션 메모

- Scope = `Project` 선택 시 M1 우측에 프로젝트 드롭다운 확장.
- M2 전송 → 세션 생성 후 F3(`/chat/:sessionId`)로 push.
- L의 New chat 버튼은 현재 M 상태를 초기화.

## 4. F3. Chat session detail (`/chat/:sessionId`)

### 기본 정보

- 화면 이름: Chat session detail
- 프레임 크기: `1440 x 900` (데스크톱 3열)
- 대상 라우트: `/chat/:sessionId`

### 레이아웃 구조

```text
┌────────┬───────────────────────────────────────────────┐
│        │ Header                                        │
│ Side   ├──────────┬─────────────────────────┬──────────┤
│ bar    │ [L]      │ [C] Conversation        │ [R]      │
│        │ Session  │   [C1] Session header   │ Source   │
│        │ list     │       (title, scope)    │ panel    │
│        │ (280)    │   [C2] Message stream   │ (360)    │
│        │          │     - user bubbles      │   (선택  │
│        │          │     - AnswerCard        │   시만   │
│        │          │     - system msg        │   활성)  │
│        │          │   [C3] Follow-up        │          │
│        │          │       composer (H:96)   │          │
└────────┴──────────┴─────────────────────────┴──────────┘
```

- L 폭 `280`, R 폭 `360`, C 자동.
- R이 닫혀 있으면 C가 R 영역까지 확장.

### AnswerCard 내부 구성

```text
AnswerCard (max-width: 720)
├─ Meta row: model · time · confidence badge · used N docs
├─ Body (markdown)
├─ CitationList (chip형, 3~5개, "more" 펼침)
├─ SuggestedFollowUps (chip)
└─ Action row: [문서 열기] [검색으로 이동] [그래프에서 보기]
```

### 주요 컴포넌트

- L: `ChatSessionList`
- C1: `ChatSessionHeader`
- C2: `ChatConversation` → `ChatMessage` + `AnswerCard` + 시스템 메시지
- C3: `ChatComposer` (small)
- R: `SourcePanel` → `SourcePreviewCard` n개

### 영역별 우선순위

- C1 · C2 · C3: P0
- L: P0 (데스크톱), P1 (모바일에서 드로어)
- R: P0 (인용 클릭 시), P1 (초기 렌더)

### 상태 변형

- Default: 메시지 ≥1건
- Empty (0 messages, 세션은 존재): C2 자리에 "이 세션에서 첫 질문을 시작하세요" 안내 + C3로 포커스 이동
- Loading 메시지 로드: C2 스켈레톤
- Streaming 답변 생성: 마지막 카드 하단에 타이핑 인디케이터; 3초 경과 시 "응답 생성 중..." 문구
- Insufficient evidence: 시스템 메시지 버블 `근거 부족` + `문서 업로드` CTA
- Error 답변 실패: 실패 카드 + 재시도
- NoPermission: 세션 접근 권한 없음 → 404 화면으로 리다이렉트(프레임 외, F8 사용)

### 인터랙션 메모

- AnswerCard의 인용 chip 클릭 → R 오픈 + 해당 `SourcePreviewCard` 스크롤.
- R의 `문서 열기` → `/projects/:projectId/documents?documentId=...&chunkId=...` (deep-link).
- C3 전송 중 버튼 스피너, 낙관적으로 사용자 메시지 즉시 append.
- 세션 제목 인라인 편집: 더블클릭으로 편집 모드.

## 5. F4. Project documents (`/projects/:projectId/documents`)

### 기본 정보

- 화면 이름: Project documents
- 프레임 크기: `1440 x 900`
- 대상 라우트: `/projects/:projectId/documents`

### 레이아웃 구조

```text
┌────────┬───────────────────────────────────────────────┐
│        │ Header                                        │
│ Side   ├───────────────────────────────────────────────┤
│ bar    │ [H] ProjectDocumentsHeader (H:88)             │
│        │    title · totalCount · [Upload documents]    │
│        │ [W] FailedDocumentNotice (조건부, H:48)       │
│        │ [F] Filters bar (H:56)                        │
│        │    state · docType · tags · date · search     │
│        │ ┌──────────────────────┬──────────────────┐   │
│        │ │ [L] DocumentList     │ [S] Summary panel│   │
│        │ │     - rows           │   (360)          │   │
│        │ │                      │                  │   │
│        │ └──────────────────────┴──────────────────┘   │
└────────┴───────────────────────────────────────────────┘
```

- L은 가변, S 폭 `360`.
- L 각 행 높이 `72`, 선택 시 좌측 강조 bar.

### DocumentListItem 행 구성

```text
[icon] [Title                     ] [StatusBadge] [Uploaded at] [⋮]
       [filename · size · tags...                              ]
       [summary 1 line (줄임표)                                ]
```

### 주요 컴포넌트

- H: `ProjectDocumentsHeader`
- W: `FailedDocumentNotice` (조건부)
- F: `DocumentFilters` + `DocumentSearchInput`
- L: `DocumentList` → `DocumentListItem` + `DocumentStatusBadge`
- S: `DocumentSummaryPanel`

### 영역별 우선순위

- H · F · L: P0
- S: P0 (문서 선택 후)
- W: P1 (FAILED 존재 시)

### 상태 변형

- Default
- Loading: L 스켈레톤 6행, S는 "문서를 선택하세요"
- Empty(0건): L 자리에 `EmptyDocumentsState` 대형 드롭존
- PartialFailure: W 배너 + L 상단에 failed 행 pinned
- PollingDisconnected: 작업 상태 폴링/SSE 연결이 끊긴 경우 상단 전역 경고 배너("작업 상태 갱신이 중단됨 — 재연결 중") + 진행 중 행 상태 배지에 `stale` 표시. 재연결 성공 시 배너 자동 해제.
- NoPermission(viewer): H의 Upload 버튼/행 액션 비활성, 마우스오버 시 툴팁
- Error(list load 실패): L 영역에 `재시도` 버튼

### 인터랙션 메모

- H의 Upload 클릭 → F5 드로어 오픈.
- F 검색 입력 300ms 디바운스.
- L 행 클릭 → S 갱신.
- L의 ⋮ 메뉴: `미리보기`, `재실행`, `삭제`(editor+).
- deep-link `?documentId=...&chunkId=...` 진입 시 해당 행 자동 선택/스크롤, S의 청크 프리뷰 하이라이트.

## 6. F5. Upload drawer

### 기본 정보

- 화면 이름: Upload drawer
- 프레임 크기: `480 x 900` (우측 슬라이드 드로어)
- 컨텍스트: F4에서 오픈. 확장 시 F1·프로젝트 상세에서도 동일.

### 레이아웃 구조 (단계별)

```text
Step 1. Select
┌─────────────────────────────┐
│ Drawer header               │
│  "Upload to <project>"      │
├─────────────────────────────┤
│ [FileDropzone]              │
│ [UploadFileList]            │
│                             │
│ [Next] (disabled until ≥1)  │
└─────────────────────────────┘

Step 2. Validate
... [UploadValidationList]
... [Back] [Next]

Step 3. Metadata
... [UploadMetadataForm]
... [Back] [Submit]

Step 4. Submitting
... [UploadProgressList]
... (Cancel per file)

Step 5. Result
... [UploadResultSummary]
... [Retry failed] [Go to documents] [Close]
```

- Header H:56, Footer H:64 (액션 버튼).
- 본문 영역 padding 24, 내부 섹션 간 간격 16.

### 주요 컴포넌트

- `UploadDrawer` (shell)
- `FileDropzone`
- `UploadFileList`
- `UploadValidationList`
- `UploadMetadataForm`
- `UploadProgressList`
- `UploadResultSummary`

### 영역별 우선순위

- Step 1 · 4 · 5: P0
- Step 2 · 3: P1 (MVP는 최소 metadata 없이도 제출 가능)

### 상태 변형

- Default per step
- ValidationBlocked: Step 2에서 파일 제거 안내
- PartialSuccess: Step 5에서 succeeded / failed / cancelled 3분할 표시
- NetworkError: Step 4에서 파일 행에 에러 + 재시도
- PermissionDenied: Drawer 자체 진입 차단(상위 버튼 비활성)

### 인터랙션 메모

- 드래그 시작 시 Step1 dropzone 하이라이트.
- Cancel 버튼은 해당 파일의 `AbortController.abort()` 호출.
- Drawer 바깥 클릭은 진행 중이면 확인 모달 후 닫기.

## 7. F6. Source preview panel (모바일 드로어)

### 기본 정보

- 화면 이름: Source preview panel (mobile drawer)
- 프레임 크기: `360 x 844` (모바일 우측 풀높이 드로어)
- 컨텍스트: F9 Mobile chat session에서 인용 클릭 시 오픈.

### 레이아웃 구조

```text
┌──────────────────────────────┐
│ Drawer header                │
│  "Sources" · [X]             │
├──────────────────────────────┤
│ [R1] SourcePreviewCard #1    │
│   - doc title · project      │
│   - quote block (highlight)  │
│   - page · section           │
│   - [문서 열기]              │
│ [R2] SourcePreviewCard #2    │
│ ...                          │
└──────────────────────────────┘
```

### 주요 컴포넌트

- `SourcePanel` (드로어 변형)
- `SourcePreviewCard` × N

### 영역별 우선순위

- R1~Rn: P0
- Header 닫기: P0

### 상태 변형

- Default (citations ≥ 1)
- Loading: 스켈레톤 카드 2개
- Empty: "이 답변에는 인용이 없습니다"
- PermissionMasked: 카드 자리에 `권한 없음` 플레이스홀더

### 인터랙션 메모

- 드로어 swipe-down/X → 닫기.
- `문서 열기` → deep-link 라우팅 + 드로어 닫기 + 페이지 전환.

## 8. F7. Empty state (공통)

### 기본 정보

- 화면 이름: Empty state (shared)
- 프레임 크기: `1440 x 900`
- 컨텍스트: F4 문서 0건, F2 세션 없음 등에서 공통으로 사용하는 큰 빈 상태 변형 레퍼런스.

### 레이아웃 구조

```text
Centered block (max-width: 560)
├─ Illustration (240×160)
├─ Title (h2, "아직 문서가 없습니다" 등)
├─ Body (2 lines 설명)
├─ Primary CTA (큰 버튼)
└─ Secondary action (text link)
```

### 주요 컴포넌트

- `EmptyDocumentsState` (문서 컨텍스트)
- `ChatWelcomeState` 내 빈 상태 블록 (채팅 컨텍스트)

### 영역별 우선순위

- Illustration 이하 모두 P0

### 상태 변형

- Variant A: 문서 없음 → 드롭존 hint 추가
- Variant B: 채팅 세션 없음 → 추천 질문 chip 노출
- Variant C: 권한 부족 → CTA 대신 "관리자에게 문의" 링크

### 인터랙션 메모

- 전체 블록이 드래그 타겟(variant A)일 때 hover 상태 `isDragging` 스타일.

## 9. F8. Error state (공통)

### 기본 정보

- 화면 이름: Error state (shared)
- 프레임 크기: `1440 x 900`
- 컨텍스트: 페이지 전역 로드 실패, 404/403 공통 뷰.

### 레이아웃 구조

```text
Centered block (max-width: 560)
├─ Status code badge (404 / 403 / 500)
├─ Title
├─ Error message body
├─ [Retry] (복구 가능 시)
├─ [Go back] (secondary)
└─ Support link (text)
```

### 주요 컴포넌트

- `ErrorView` (component-tree §5.1에서 정의된 공통 인프라 컴포넌트)

### 영역별 우선순위

- Title · body · 적어도 하나의 액션: P0
- Support link: P2

### 상태 변형

- 403 (no permission): `Retry` 대신 `Go to dashboard`
- 404: `Go back` + `Go to dashboard`
- 500: `Retry`
- Partial failure (카드 단위): 중앙 블록 대신 해당 카드 내 인라인 에러

### 인터랙션 메모

- Retry 클릭 시 현재 라우트 쿼리 유지 채 다시 페칭.

## 10. F9. Mobile chat session

### 기본 정보

- 화면 이름: Mobile chat session
- 프레임 크기: `390 x 844`
- 대상 라우트: `/chat/:sessionId` (mobile)

### 레이아웃 구조

```text
┌──────────────────────────────┐
│ AppBar (H:56)                │
│  [≡] Session title [•••]     │
├──────────────────────────────┤
│ [C2] Message stream          │
│    (full width, vertical)    │
│                              │
│    AnswerCard full-width,    │
│    citation chips 가로 스크롤│
│                              │
├──────────────────────────────┤
│ [C3] Composer (H:80)         │
│    [input...]         [send] │
└──────────────────────────────┘
```

- Session list(L)는 AppBar 왼쪽 ≡에서 드로어로 오픈.
- Source panel(R)은 인용 chip 탭 시 F6 드로어로 오픈.

### 주요 컴포넌트

- AppBar, `ChatConversation`, `ChatComposer`
- 드로어: `ChatSessionList`, `SourcePanel`

### 영역별 우선순위

- AppBar · C2 · C3: P0
- 드로어 L · R: P0

### 상태 변형

- Default, Loading, Streaming, InsufficientEvidence, Error (F3와 동일한 상태 세트)
- Empty (0 messages): C2 전체 영역에 "이 세션에서 첫 질문을 시작하세요" 안내 + C3 포커스
- NoPermission: 세션 접근 권한 없음 → F8 Error state(`404`) 라우트 전환 (PAGE_SPECIFICATIONS §12 규약: 세션 소유자 아님 또는 세션 범위 접근 권한 상실 시 404)
- Keyboard-open: C3가 키보드 위로 고정, C2 하단 패딩 동적 조정

### 인터랙션 메모

- Citation chip 탭 → F6 드로어 오픈.
- 세션 전환 → 좌측 드로어에서 선택 후 라우트 교체.
- AppBar `•••` 메뉴: 세션 제목 편집 / 삭제(확장).

## 11. Figma 이행 체크리스트

Figma 파일에 프레임을 구성할 때 아래 순서를 따른다.

1. Frame 9개를 한 페이지에 가로로 나열하되, 크기별 그룹(Desktop/Mobile/Drawer)으로 묶는다.
2. 공통 셸(사이드바·헤더)은 컴포넌트화하여 각 프레임에 인스턴스로 배치.
3. 상태 변형은 각 프레임 아래 세로 방향으로 Variant로 추가.
4. 컴포넌트 이름은 본 문서의 컴포넌트명과 1:1 일치(예: `AnswerCard`, `SourcePreviewCard`).
5. 텍스트 플레이스홀더는 실제 한국어 샘플 문장을 사용 (`로렘입숨` 금지).
6. 색상·타이포는 기존 `docs/DESIGN_SYSTEM.md` 토큰을 준수.

## 12. 다음 단계

- `docs/2026-04-13-frontend-task-breakdown.md`: 본 스펙과 컴포넌트 트리를 기반으로 구현 태스크를 codex 실행 단위로 분해.
