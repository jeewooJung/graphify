# Graphify 지식베이스 채팅/문서 컴포넌트 트리 설계

작성일: 2026-04-13
문서 목적: `/chat`, `/chat/:sessionId`, `/projects/:projectId`, `/projects/:projectId/documents` 및 Upload Drawer의 구현 전 컴포넌트 분해를 정의한다. 각 컴포넌트의 역할·props·내부 상태·외부 의존 데이터·이벤트·재사용성을 정리하여 후속 구현 태스크 분해의 기반으로 삼는다.
기준 디렉터리 규약: `web-app/app/<route>/page.tsx`, `web-app/components/<domain>/<Component>.tsx`
연계 문서:

- [지식베이스 채팅/업로드 설계](/mnt/c/workspaceRND/graphify/graphify/docs/2026-04-10-knowledgebase-chat-and-upload-design.md)
- [페이지 사양](/mnt/c/workspaceRND/graphify/graphify/docs/PAGE_SPECIFICATIONS.md)
- [핸드오프](/mnt/c/workspaceRND/graphify/graphify/docs/handoff/2026-04-10-knowledgebase-chat-handoff-and-next-steps.md)

## 0. 공통 규칙

- 모든 컴포넌트는 React 함수 컴포넌트 + TypeScript.
- 데이터 페칭은 페이지 또는 컨테이너 레벨에서 수행하고 하위 프레젠테이셔널 컴포넌트는 props로만 의존한다.
- 서버 상태는 `@tanstack/react-query` 또는 Next.js `fetch` + `use()` 기반. 캐시 키는 `['chat','sessions']`, `['chat','session',id,'messages']`, `['project',id,'documents']` 로 통일.
- 권한 분기는 상위 page에서 계산해 자식에 `readOnly: boolean` 형태로 주입한다. 자식이 `user` 객체를 직접 조회하지 않는다.
- 폴링/SSE 구독(업로드 작업 상태)은 `UploadDrawer` / `DocumentList`에서만 수행한다.
- `ui/` 프리미티브(Button, Card, Badge, Input, PageHeader)는 기존 것을 재사용한다. 새 프리미티브는 추가하지 않는다.

## 1. Chat

### 1.1 라우트 → 페이지

```text
web-app/app/chat/page.tsx                      # 채팅 홈 (세션 없음 상태)
web-app/app/chat/[sessionId]/page.tsx          # 채팅 세션 상세
```

두 페이지는 `ChatLayout`을 공유한다. 페이지는 데이터 페칭만 담당하고 레이아웃/UI는 `ChatLayout`에 위임한다.

### 1.2 컴포넌트 트리

```text
ChatLayout
├── ChatSessionList
│   └── ChatSessionListItem (n개)
├── (중앙 슬롯)
│   ├── ChatWelcomeState                 # /chat (세션 선택 전)
│   │   ├── ChatScopeSelector
│   │   ├── ChatComposer
│   │   └── SuggestedFollowUps           # "추천 질문" 재사용
│   └── ChatConversation                 # /chat/:sessionId
│       ├── ChatSessionHeader
│       ├── ChatMessage (user, n개)
│       ├── AnswerCard (assistant, n개)
│       │   ├── CitationList
│       │   └── SuggestedFollowUps
│       └── ChatComposer (follow-up)
└── SourcePanel
    └── SourcePreviewCard (n개)
```

### 1.3 컴포넌트 사양

#### ChatLayout

- **역할**: 데스크톱 3열(좌: 세션 목록, 중앙: 대화, 우: 출처) / 모바일 단일열 + 드로어로 반응형 전환.
- **props**: `{ sessionId?: string; scope?: ChatScope; children: ReactNode; rightSlot?: ReactNode }`
- **내부 상태**: `isSessionListOpen`, `isSourcePanelOpen` (모바일 드로어 토글).
- **외부 의존 데이터**: 없음 (레이아웃만).
- **이벤트**: 드로어 open/close 콜백 옵션.
- **재사용성**: 중. 채팅 전용이지만 유사한 3열 화면(예: 그래프 탐색)에 패턴 이식 가능.

#### ChatSessionList

- **역할**: 좌측 세션 목록 컨테이너. 새 세션 버튼 포함.
- **props**: `{ sessions: ChatSessionSummary[]; activeSessionId?: string; isLoading: boolean; error?: Error; onCreateSession: () => void; onSelect: (id: string) => void }`
- **내부 상태**: `searchQuery` (세션 제목 필터, 선택적).
- **외부 의존 데이터**: 없음 (상위에서 `GET /chat/sessions` 결과 전달).
- **이벤트**: `onCreateSession`, `onSelect`.
- **재사용성**: 낮음 (채팅 전용).

#### ChatSessionListItem

- **역할**: 세션 한 건 표현. 제목, 범위 배지, 마지막 메시지 시각, 선택 상태.
- **props**: `{ session: ChatSessionSummary; isActive: boolean; onClick: () => void }`
- **내부 상태**: 없음 (순수).
- **외부 의존 데이터**: 없음.
- **이벤트**: `onClick`.
- **재사용성**: 낮음.

#### ChatWelcomeState

- **역할**: 세션 없을 때 첫 질문 유도 화면. 범위 선택 + composer + 추천 질문.
- **props**: `{ defaultScope: ChatScope; projects: ProjectOption[]; teams: TeamOption[]; disabledKinds?: ScopeKind[]; suggestions: SuggestedQuestion[]; isSubmitting: boolean; error?: Error; onSubmit: (input: ChatAnswerRequest) => void }` — 내부의 `ChatScopeSelector`가 필요한 옵션은 반드시 props로 주입해야 한다(컴포넌트는 프레젠테이셔널 규칙 유지). `disabledKinds`로 viewer(프로젝트 접근 없음) 같은 권한 케이스를 처리한다(내부 `ChatScopeSelector`에 그대로 전달).
- **내부 상태**: `scope`, `draftText` (controlled composer).
- **외부 의존 데이터**: 없음 (상위 페이지가 `/api/backend/projects`, `/api/backend/teams/current/members`로 프리페치 후 주입).
- **이벤트**: `onSubmit` → 상위에서 `POST /chat/sessions` 후 `/chat/:id`로 라우팅.
- **재사용성**: 낮음.

#### ChatScopeSelector

- **역할**: `Workspace` / `Team` / `Project` 3택 + Project 선택 시 프로젝트 드롭다운.
- **props**: `{ value: ChatScope; projects: ProjectOption[]; teams: TeamOption[]; disabledKinds?: ScopeKind[]; onChange: (next: ChatScope) => void }`
- **내부 상태**: 없음 (제어 컴포넌트).
- **외부 의존 데이터**: 상위가 프로젝트/팀 목록 제공. 실제 호출 원본은 `/api/backend/projects`, `/api/backend/teams/current/members`.
- **이벤트**: `onChange`.
- **재사용성**: 중. Dashboard의 `Ask Graphify...` CTA, Search에서도 동일 UI 가능.

#### ChatComposer

- **역할**: 멀티라인 입력창 + 전송 버튼. Enter 전송, Shift+Enter 줄바꿈.
- **props**: `{ value: string; placeholder?: string; isSubmitting: boolean; disabled?: boolean; onChange: (v: string) => void; onSubmit: () => void }`
- **내부 상태**: `rows` (자동 높이 조절).
- **외부 의존 데이터**: 없음.
- **이벤트**: `onChange`, `onSubmit`.
- **재사용성**: 높음. Welcome 상태·follow-up·Dashboard CTA 모두 재사용.

#### ChatConversation

- **역할**: 세션 상세 대화 스트림 컨테이너. 메시지 순서 렌더 + 자동 스크롤.
- **props**: `{ session: ChatSession; messages: ConversationMessage[]; isStreaming: boolean; error?: Error; onSelectCitation: (ref: CitationRef) => void; onFollowUp: (text: string) => void }` — `messages`는 `role` 기준 discriminated union이므로 `ChatConversation`이 내부에서 분기 렌더(`user`→`ChatMessage`, `system`→`ChatMessage variant="system"`, `assistant`→`AnswerCard`)한다.
- **내부 상태**: `scrollAnchorRef`, `isAutoScrollEnabled`.
- **외부 의존 데이터**: 없음 (props).
- **이벤트**: `onSelectCitation`, `onFollowUp`.
- **재사용성**: 낮음.

#### ChatSessionHeader

- **역할**: 세션 상단 바. 제목(편집 가능), 범위 배지, 메타(생성자/시각).
- **props**: `{ session: ChatSession; onRename: (title: string) => void; readOnly?: boolean }`
- **내부 상태**: `isEditing`, `draftTitle`.
- **외부 의존 데이터**: 없음.
- **이벤트**: `onRename`.
- **재사용성**: 낮음.

#### ChatMessage

- **역할**: 사용자 메시지 버블. 시스템 메시지(근거 부족/권한 경고)도 이 컴포넌트의 `variant` 분기로 처리.
- **props**: `{ message: UserMessage | SystemMessage; variant: 'user' | 'system'; }` — assistant는 `AnswerCard`가 담당하므로 이 컴포넌트는 user/system 전용.
- **내부 상태**: 없음.
- **외부 의존 데이터**: 없음.
- **이벤트**: 없음.
- **재사용성**: 낮음.

#### AnswerCard

- **역할**: assistant 메시지 카드. 본문, 생성 시각, 모델명, confidence 배지, 인용 요약, follow-up 제안, 액션 버튼(`문서 열기`, `검색으로 이동`, `그래프에서 보기`).
- **props**: `{ answer: AssistantAnswer; onSelectCitation: (ref: CitationRef) => void; onFollowUpSelect: (text: string) => void; onNavigate: (target: NavigationTarget) => void }`
- **내부 상태**: `expanded` (본문 접기/펼치기).
- **외부 의존 데이터**: 없음.
- **이벤트**: `onSelectCitation`, `onFollowUpSelect`, `onNavigate`.
- **재사용성**: 중. 대시보드 "최근 답변" 카드에서 읽기 전용 변형 재사용 가능.

#### CitationList

- **역할**: 답변 카드 내부의 출처 요약 리스트 (문서명·프로젝트·페이지·relevance).
- **props**: `{ citations: Citation[]; onSelect: (ref: CitationRef) => void; maxVisible?: number }`
- **내부 상태**: `showAll`.
- **외부 의존 데이터**: 없음.
- **이벤트**: `onSelect`.
- **재사용성**: 중. Search 결과 상세에서도 활용 가능.

#### SuggestedFollowUps

- **역할**: 추천 질문/후속 질문 칩 리스트. Welcome과 AnswerCard 양쪽에서 사용.
- **props**: `{ items: SuggestedQuestion[]; onSelect: (text: string) => void; isLoading?: boolean }`
- **내부 상태**: 없음.
- **외부 의존 데이터**: 없음.
- **이벤트**: `onSelect`.
- **재사용성**: 높음.

#### SourcePanel

- **역할**: 우측 패널. 현재 선택된 인용의 상세 미리보기 컨테이너.
- **props**: `{ selection?: CitationRef; previews: CitationPreview[]; isLoading: boolean; error?: Error; onClose: () => void; onOpenDocument: (nav: CitationNavigation) => void }` — `CitationNavigation`은 `projectId` + `documentId` (+선택 `chunkId`)를 동반하여 `/projects/:projectId/documents`로의 라우팅과 문서 하이라이트를 가능하게 한다.
- **내부 상태**: 없음.
- **외부 의존 데이터**: 선택 변경 시 `GET /documents/{id}/chunks?chunkId=...` 프리페치(상위에서 처리).
- **이벤트**: `onClose`, `onOpenDocument`.
- **재사용성**: 낮음.

#### SourcePreviewCard

- **역할**: 인용 청크 1건 미리보기. 문서명, 섹션/페이지, 발췌문(하이라이트), 액션.
- **props**: `{ preview: CitationPreview; onOpenDocument: (nav: CitationNavigation) => void }` — 내부에서 `preview.projectId` / `preview.documentId`로 `CitationNavigation`을 구성해 호출한다.
- **내부 상태**: 없음.
- **외부 의존 데이터**: 없음.
- **이벤트**: `onOpenDocument`.
- **재사용성**: 중. Documents 요약 패널의 인용 통계에서도 재사용 가능.

## 2. Project Detail

### 2.1 라우트 → 페이지

```text
web-app/app/projects/[projectId]/page.tsx
```

이 페이지는 단일 프로젝트의 개요 허브다. 문서/채팅 서브 데이터를 요약해 렌더하고, `Ask this project` / `Open documents` / `Upload documents` 진입점을 제공한다.

### 2.2 컴포넌트 트리

```text
ProjectDetailPage
├── ProjectDetailHeader                 # 이름, 설명, 소유자, 팀, 상태 배지, 편집 버튼(확장)
├── ProjectMetricCards                  # 문서 수, 최근 업로드 시각, 처리 중 작업 수, 멤버 수
├── ProjectCtaRow                       # Ask this project / Open documents / Upload documents
├── RecentProjectUploads
│   └── DocumentListItem (read-only, 상위 5건)  # §3 컴포넌트 재사용
│       └── DocumentStatusBadge                # §3 재사용
├── RecentProjectChatSessions
│   └── ChatSessionListItem (읽기 전용, 상위 5건) # §1 재사용
├── EmptyDocumentsState (조건부)                # §3 재사용
└── UploadDrawer (조건부 오픈, §4 참고)
```

### 2.3 컴포넌트 사양

#### ProjectDetailHeader

- **역할**: 프로젝트 메타(이름·설명·소유자·팀·상태) 표시. `ui/PageHeader` 위에 얹는다.
- **props**: `{ project: ProjectDetail; canEdit: boolean; onEdit?: () => void }`
- **내부 상태**: 없음.
- **외부 의존 데이터**: 없음.
- **이벤트**: `onEdit` (확장).
- **재사용성**: 낮음.

#### ProjectMetricCards

- **역할**: 4개 지표 카드(문서·최근 업로드·진행 중 작업·멤버).
- **props**: `{ metrics: ProjectMetrics; isLoading: boolean }`
- **내부 상태**: 없음.
- **외부 의존 데이터**: 없음 (상위에서 `GET /projects/{id}`, `GET /projects/{id}/jobs?status=RUNNING,PENDING` 결과 합산).
- **이벤트**: 없음.
- **재사용성**: 낮음.

#### ProjectCtaRow

- **역할**: 3개 CTA 버튼을 가로 정렬. 권한에 따라 일부 버튼 비활성화.
- **props**: `{ projectId: string; canUpload: boolean; onAsk: () => void; onOpenDocuments: () => void; onOpenUpload: () => void }`
- **내부 상태**: 없음.
- **외부 의존 데이터**: 없음.
- **이벤트**: `onAsk`(→ `/chat?scope=project&projectId=...`), `onOpenDocuments`, `onOpenUpload`.
- **재사용성**: 낮음.

#### RecentProjectUploads

- **역할**: 최근 업로드 문서 상위 5건. 리스트 아이템은 `DocumentListItem`을 `readOnly=true`로 재사용.
- **props**: `{ documents: DocumentSummary[]; isLoading: boolean; onSelect: (doc: DocumentSummary) => void; onOpenAll: () => void }`
- **내부 상태**: 없음.
- **외부 의존 데이터**: 상위에서 `GET /projects/{id}/documents?limit=5&sort=recent` 결과 전달.
- **이벤트**: `onSelect`(→ 문서 화면으로 이동하며 해당 문서 하이라이트), `onOpenAll`(→ `/projects/:id/documents`).
- **재사용성**: 중 (대시보드의 "최근 업로드" 카드에 동일 패턴 이식 가능).

#### RecentProjectChatSessions

- **역할**: 이 프로젝트 범위로 진행된 최근 채팅 세션 상위 5건. `ChatSessionListItem`을 읽기 전용으로 재사용.
- **props**: `{ sessions: ChatSessionSummary[]; isLoading: boolean; onSelect: (id: string) => void; onStartNew: () => void }`
- **내부 상태**: 없음.
- **외부 의존 데이터**: 상위에서 `GET /chat/sessions?scopeType=PROJECT&scopeId=:id&limit=5` 결과 전달.
- **이벤트**: `onSelect`(→ `/chat/:sessionId`), `onStartNew`(→ `/chat?scope=project&projectId=...`).
- **재사용성**: 중.

### 2.4 상태 분기

- 문서 0건: `EmptyDocumentsState`(§3 재사용) + `Upload documents` CTA 강조.
- 채팅 세션 0건: `RecentProjectChatSessions`가 빈 상태 안내 + `Ask this project` CTA.
- 로딩: 각 카드 스켈레톤 개별 렌더.
- 오류: 프로젝트 조회 실패 시 전체 에러 화면 + 재시도; 부분 카드 실패는 카드 내부 에러.
- 권한: viewer는 `ProjectCtaRow.canUpload=false`로 업로드 CTA 비활성화.

## 3. Documents

### 3.1 라우트 → 페이지

```text
web-app/app/projects/[projectId]/documents/page.tsx
```

페이지는 프로젝트 메타·문서 리스트·작업 상태 폴링을 소유하고, 하위 프레젠테이셔널 컴포넌트에 전달.

**Deep-link 규약**: 이 페이지는 쿼리 파라미터 `?documentId=...&chunkId=...`(선택)를 받아 다음을 수행한다.
- 초기 렌더 시 `documentId`가 있으면 해당 행을 `DocumentList`의 `selectedId`로 설정하고 스크롤 포커스.
- `DocumentSummaryPanel`에 해당 문서를 주입하고, `chunkId`가 있으면 해당 청크 프리뷰를 하이라이트된 상태로 렌더.
- 이 경로가 `SourcePanel.onOpenDocument(nav: CitationNavigation)`의 소비 지점이다. `CitationNavigation` → `router.push('/projects/{projectId}/documents?documentId={documentId}&chunkId={chunkId?}')`.

### 3.2 컴포넌트 트리

```text
ProjectDocumentsPage
├── ProjectDocumentsHeader
├── FailedDocumentNotice (조건부)
├── DocumentFilters
│   └── DocumentSearchInput
├── (레이아웃 2열)
│   ├── DocumentList
│   │   └── DocumentListItem (n개)
│   │       └── DocumentStatusBadge
│   └── DocumentSummaryPanel
├── EmptyDocumentsState (조건부)
└── UploadDrawer (조건부 오픈, §4 참고)
```

### 3.3 컴포넌트 사양

#### ProjectDocumentsHeader

- **역할**: 프로젝트명, 설명, 전체 문서 수 배지, `Upload documents` CTA.
- **props**: `{ project: ProjectSummary; totalCount: number; canUpload: boolean; onOpenUpload: () => void }`
- **내부 상태**: 없음.
- **외부 의존 데이터**: 없음.
- **이벤트**: `onOpenUpload`.
- **재사용성**: 낮음 (프로젝트 도메인 전용). `PageHeader` 프리미티브 위에 얹는다.

#### FailedDocumentNotice

- **역할**: `FAILED` 상태 문서가 1건 이상일 때 상단 경고 배너. 개수·"실패 건만 보기" 필터 숏컷.
- **props**: `{ failedCount: number; onFilterFailed: () => void; onDismiss?: () => void }`
- **내부 상태**: `isDismissed` (세션 내).
- **외부 의존 데이터**: 없음.
- **이벤트**: `onFilterFailed`, `onDismiss`.
- **재사용성**: 중. 업로드 실패가 존재하는 다른 화면에서도 재사용 가능.

#### DocumentFilters

- **역할**: 상태·문서 유형·태그·업로드 기간 필터 묶음.
- **props**: `{ value: DocumentFilterState; availableTags: string[]; onChange: (next: DocumentFilterState) => void }`
- **내부 상태**: 없음 (제어 컴포넌트).
- **외부 의존 데이터**: MVP에서는 상위가 이미 로드한 `documents` 리스트에서 `tags`를 dedupe하여 `availableTags`로 주입한다(별도 태그 엔드포인트 없음). 페이지네이션/대용량 프로젝트에서는 이후 API 추가를 검토한다.
- **이벤트**: `onChange`.
- **재사용성**: 중.

#### DocumentSearchInput

- **역할**: 제목/파일명 검색 입력 (디바운스 300ms).
- **props**: `{ value: string; onChange: (v: string) => void; placeholder?: string }`
- **내부 상태**: `localValue` (디바운스 버퍼).
- **외부 의존 데이터**: 없음.
- **이벤트**: `onChange`.
- **재사용성**: 높음. `ui/Input` 기반 얇은 래퍼.

#### DocumentList

- **역할**: 필터/검색 적용된 문서 목록 렌더. 선택 상태 관리, 페이지네이션(또는 무한 스크롤).
- **props**: `{ documents: DocumentSummary[]; selectedId?: string; isLoading: boolean; hasMore: boolean; error?: Error; onSelect: (id: string) => void; onLoadMore: () => void; onRerun: (id: string) => void; onDelete: (id: string) => void; readOnly?: boolean }`
- **내부 상태**: 없음.
- **외부 의존 데이터**: 상위에서 `GET /projects/{id}/documents` 결과 전달. 작업 상태 폴링 결과(`GET /jobs/{id}`)는 문서 객체 내 `jobStatus`로 병합.
- **이벤트**: `onSelect`, `onLoadMore`, `onRerun`, `onDelete`.
- **재사용성**: 낮음.

#### DocumentListItem

- **역할**: 문서 1행. 제목, 파일명, 상태 배지, 업로드자/시각, 크기, 태그, 요약, 행 액션(미리보기·재실행·삭제).
- **props**: `{ document: DocumentSummary; isSelected: boolean; readOnly?: boolean; onSelect: () => void; onRerun: () => void; onDelete: () => void }`
- **내부 상태**: `isMenuOpen` (행 액션 드롭다운).
- **외부 의존 데이터**: 없음.
- **이벤트**: `onSelect`, `onRerun`, `onDelete`.
- **재사용성**: 낮음.

#### DocumentStatusBadge

- **역할**: `UPLOADED/QUEUED/PARSING/INDEXING/READY/FAILED` 상태 배지. 색상·아이콘·툴팁.
- **props**: `{ status: DocumentStatus; progressPct?: number }`
- **내부 상태**: 없음.
- **외부 의존 데이터**: 없음.
- **이벤트**: 없음.
- **재사용성**: 높음. `ui/Badge` 위에 얹은 도메인 프리셋. 프로젝트 상세의 최근 업로드 카드에서도 사용.

#### DocumentSummaryPanel

- **역할**: 선택 문서 요약 패널. 메타, 청크 수, 마지막 분석 로그, 인용 사용 통계(확장). 선택 없을 때 안내.
- **props**: `{ document?: DocumentDetail; chunksPreview: DocumentChunk[]; isLoading: boolean; error?: Error; onOpenChat: (documentId: string) => void }`
- **내부 상태**: 없음.
- **외부 의존 데이터**: 상위에서 `GET /documents/{id}`, `GET /documents/{id}/chunks?limit=5`.
- **이벤트**: `onOpenChat` (이 문서 기준 질문 시작 → `/chat?scope=project&documentId=...`).
- **재사용성**: 낮음.

#### EmptyDocumentsState

- **역할**: 문서 0건 중앙 빈 상태. 대형 드롭존 + 지원 형식 안내 + `Upload documents` CTA.
- **props**: `{ canUpload: boolean; onOpenUpload: () => void; onFilesDropped: (files: File[]) => void }`
- **내부 상태**: `isDragging`.
- **외부 의존 데이터**: 없음.
- **이벤트**: `onOpenUpload`, `onFilesDropped` (즉시 드로어 오픈 + 파일 프리셋).
- **재사용성**: 중. 프로젝트 상세의 문서 없음 상태에서도 재사용.

## 4. Upload Drawer

업로드는 독립 도메인으로 취급한다. Documents 화면, 프로젝트 상세 화면, (확장) 대시보드에서 모두 동일한 드로어를 오픈한다.

### 4.1 배치

```text
web-app/components/upload/UploadDrawer.tsx       # 진입점
web-app/components/upload/FileDropzone.tsx
web-app/components/upload/UploadFileList.tsx
web-app/components/upload/UploadMetadataForm.tsx
web-app/components/upload/UploadValidationList.tsx
web-app/components/upload/UploadProgressList.tsx
web-app/components/upload/UploadResultSummary.tsx
web-app/components/upload/index.ts
```

### 4.2 컴포넌트 트리

```text
UploadDrawer
├── FileDropzone
├── UploadFileList
├── UploadMetadataForm
├── UploadValidationList
├── UploadProgressList        # 제출 이후
└── UploadResultSummary       # 완료/실패 이후
```

드로어는 내부 스텝을 단계 state로 관리한다: `select → validate → metadata → submitting → result`.

### 4.3 컴포넌트 사양

#### UploadDrawer

- **역할**: 사이드 드로어. 오픈/클로즈, 단계 전환, 업로드 API 호출, 작업 ID 추적.
- **props**: `{ isOpen: boolean; projectId: string; initialFiles?: File[]; onClose: () => void; onUploaded: (result: UploadResult) => void }`
- **내부 상태**: `step`, `files`, `metadataByFile`, `validations`, `progressByFile`, `abortControllersByFile`, `result`.
- **업로드 모델**: 드로어는 제출 시 파일별로 **독립된 `POST /projects/{projectId}/documents` 요청**을 순차 또는 소규모 병렬(기본 3)로 실행한다. 파일마다 전용 `AbortController`와 `XMLHttpRequest`(또는 fetch + stream) 기반 progress 리스너를 소유한다. 이 구조가 있어야 "파일별 progress"와 "파일별 cancel"이 실제로 성립한다.
- **외부 의존 데이터**:
  - `POST /projects/{projectId}/documents` (multipart, 파일당 1회) → 업로드 및 문서/작업 생성
  - `GET /jobs/{jobId}` 폴링 (완료/실패 감지, 제출 직후부터 `READY|FAILED`까지)
- **이벤트**: `onClose`, `onUploaded`.
- **재사용성**: 높음. 문서 리스트·프로젝트 상세·빈 상태 공통 진입점.

#### FileDropzone

- **역할**: 드래그앤드롭 영역 + 파일 선택 버튼. 지원 형식/최대 크기 안내.
- **props**: `{ accept: string[]; maxSizeBytes: number; onFiles: (files: File[]) => void; disabled?: boolean }`
- **내부 상태**: `isDragOver`.
- **외부 의존 데이터**: 없음.
- **이벤트**: `onFiles`.
- **재사용성**: 높음. 일반 파일 입력이 필요한 다른 기능(예: 아바타 업로드 확장)에도 사용.

#### UploadFileList

- **역할**: 추가된 파일 후보 목록. 각 행 제거/순서 조정.
- **props**: `{ files: FileCandidate[]; onRemove: (id: string) => void; readOnly?: boolean }`
- **내부 상태**: 없음.
- **외부 의존 데이터**: 없음.
- **이벤트**: `onRemove`.
- **재사용성**: 중.

#### UploadMetadataForm

- **역할**: 파일별 메타데이터 입력 (제목·태그·문서 유형). 공통 일괄 입력도 지원.
- **props**: `{ files: FileCandidate[]; values: Record<string, DocumentMetadataInput>; availableTags: string[]; onChange: (fileId: string, next: DocumentMetadataInput) => void; onBulkApply: (partial: Partial<DocumentMetadataInput>) => void }`
- **내부 상태**: `activeFileId` (탭 전환).
- **외부 의존 데이터**: 태그 자동완성은 상위가 `DocumentFilters`와 동일한 소스(로드된 documents 리스트에서 dedupe한 tags)를 `availableTags`로 주입한다. 별도 엔드포인트 없음.
- **이벤트**: `onChange`, `onBulkApply`.
- **재사용성**: 낮음.

#### UploadValidationList

- **역할**: 파일별 사전 검증 결과(형식·크기·중복 파일명·권한) 표시.
- **props**: `{ validations: UploadValidation[]; onDismissFile: (fileId: string) => void }`
- **내부 상태**: 없음.
- **외부 의존 데이터**: 상위에서 검증 수행.
- **이벤트**: `onDismissFile`.
- **재사용성**: 중.

#### UploadProgressList

- **역할**: 업로드 중 파일별 진행률 표시.
- **props**: `{ progressByFile: Record<string, UploadProgress>; onCancel: (fileId: string) => void }`
- **내부 상태**: 없음.
- **외부 의존 데이터**: `UploadDrawer`가 파일별 XHR progress 이벤트를 `UploadProgress`로 정규화해 주입한다.
- **이벤트**: `onCancel` → `UploadDrawer`가 해당 파일의 `AbortController.abort()` 호출 + 상태를 `CANCELLED`로 업데이트.
- **재사용성**: 높음.

#### UploadResultSummary

- **역할**: 제출 결과 요약. 성공·실패 건수, 실패 사유별 그룹, 재시도/문서로 이동 CTA.
- **props**: `{ result: UploadResult; onRetryFailed: () => void; onGoToDocuments: () => void; onClose: () => void }`
- **내부 상태**: 없음.
- **외부 의존 데이터**: 없음.
- **이벤트**: `onRetryFailed`, `onGoToDocuments`, `onClose`.
- **재사용성**: 중.

## 5. 타입 정의 요약 (stub)

컴포넌트 사양에 사용된 주요 타입은 이후 구현 단계에서 `web-app/types/` 또는 기능 내부 `types.ts`에 정의한다.

```ts
type ChatScope =
  | { kind: 'WORKSPACE' }
  | { kind: 'TEAM'; teamId: string }
  | { kind: 'PROJECT'; projectId: string };

type ChatSessionSummary = {
  id: string; title: string; scope: ChatScope;
  lastMessageAt: string; createdBy: string;
};

type BaseMessage = { id: string; sessionId: string; createdAt: string };

type UserMessage = BaseMessage & {
  role: 'user';
  content: string;
};

type SystemMessage = BaseMessage & {
  role: 'system';
  variant: 'insufficient_evidence' | 'permission_warning' | 'info';
  content: string;
};

type AssistantAnswer = BaseMessage & {
  role: 'assistant';
  content: string;
  modelName: string;
  confidence?: number;
  citations: Citation[];
  suggestedFollowUps: SuggestedQuestion[];
};

// ChatConversation이 순회하는 메시지 스트림은 이 discriminated union이다.
type ConversationMessage = UserMessage | SystemMessage | AssistantAnswer;

type Citation = {
  id: string;
  documentId: string;
  chunkId: string;
  projectId: string;              // '문서 열기' 네비게이션에 필요
  projectName: string;
  documentTitle: string;
  quoteText: string;
  pageNumber?: number;
  relevanceScore: number;
};

type CitationRef = { messageId: string; citationId: string };
type CitationPreview = Citation & { sectionTitle?: string; surroundingText?: string };

type CitationNavigation = {
  projectId: string;
  documentId: string;
  chunkId?: string;
};

type DocumentStatus =
  'UPLOADED' | 'QUEUED' | 'PARSING' | 'INDEXING' | 'READY' | 'FAILED';

type DocumentSummary = {
  id: string; title: string; originalFilename: string;
  mimeType: string; fileSize: number;
  status: DocumentStatus; jobStatus?: JobStatus;
  uploadedBy: string; uploadedAt: string;
  tags: string[]; summary?: string;
};

type DocumentFilterState = {
  statuses: DocumentStatus[];
  docTypes: string[];
  tags: string[];
  uploadedFrom?: string;
  uploadedTo?: string;
  query?: string;
};

type UploadOutcome = 'SUCCEEDED' | 'FAILED' | 'CANCELLED';

type UploadResult = {
  succeeded: Array<{ fileId: string; documentId: string; jobId: string }>;
  failed: Array<{ fileId: string; reason: string }>;
  cancelled: Array<{ fileId: string }>;   // 사용자가 진행 중 중단한 파일
};

type UploadProgress = {
  fileId: string;
  loadedBytes: number;
  totalBytes: number;
  state: 'PENDING' | 'UPLOADING' | 'SERVER_PROCESSING' | UploadOutcome;
};
```

### 5.1 공통 인프라 컴포넌트

아래 컴포넌트는 도메인 섹션(§1~§4)에 속하지 않지만, 여러 페이지가 공유하는 공통 인프라로 별도 관리한다. 배치: `web-app/components/feedback/`.

#### ErrorView

- **역할**: 페이지 전역 로드 실패·403·404·500 공통 에러 화면. 상태 코드 배지, 타이틀, 본문, Retry / Go back / Support 액션을 가진다.
- **props**: `{ statusCode: 400 | 401 | 403 | 404 | 500 | 'network'; title?: string; message?: string; onRetry?: () => void; onGoBack?: () => void; supportHref?: string }`
- **내부 상태**: 없음.
- **외부 의존 데이터**: 없음.
- **이벤트**: `onRetry`, `onGoBack`.
- **재사용성**: 높음 (모든 페이지의 전역 에러 상태에서 사용).

## 6. 재사용성 맵 (한눈에)

| 컴포넌트 | 재사용성 | 재사용 대상 |
|---|---|---|
| ChatComposer | 높음 | Welcome, Follow-up, Dashboard CTA |
| ChatScopeSelector | 중 | Dashboard, Search |
| SuggestedFollowUps | 높음 | Welcome, AnswerCard, Dashboard 추천 카드 |
| CitationList | 중 | Search 결과 상세 |
| SourcePreviewCard | 중 | DocumentSummaryPanel 인용 통계 |
| DocumentStatusBadge | 높음 | 프로젝트 상세 최근 업로드 |
| EmptyDocumentsState | 중 | 프로젝트 상세 문서 없음 |
| FileDropzone | 높음 | 기타 파일 입력 |
| UploadProgressList | 높음 | 일반 업로드 UI |
| UploadDrawer | 높음 | 문서/프로젝트/대시보드 공통 진입점 |
| ErrorView | 높음 | 모든 페이지 전역 에러 (403/404/500) |

## 7. 다음 단계

- `docs/2026-04-13-lowfi-ui-spec.md`: 본 컴포넌트 분해를 Figma로 옮길 수 있는 low-fi 스펙으로 변환.
- `docs/2026-04-13-frontend-task-breakdown.md`: 컴포넌트 단위 구현 태스크로 분해 (codex 실행 단위).
