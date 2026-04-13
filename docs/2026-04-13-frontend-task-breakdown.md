# Graphify 지식베이스 채팅/문서 Frontend Task Breakdown

작성일: 2026-04-13
문서 목적: `PAGE_SPECIFICATIONS.md §§11-14`, `2026-04-13-component-tree.md`, `2026-04-13-lowfi-ui-spec.md`를 실제 구현 태스크로 분해한다. 각 태스크는 **codex exec 1회 실행 단위**로 설계되어 있으며, 이슈 트래커에 바로 전사 가능하다.
연계 문서:

- [페이지 사양](./PAGE_SPECIFICATIONS.md)
- [컴포넌트 트리](./2026-04-13-component-tree.md)
- [Low-fi UI 스펙](./2026-04-13-lowfi-ui-spec.md)
- [핸드오프](./handoff/2026-04-10-knowledgebase-chat-handoff-and-next-steps.md)

## 0. 공통 규칙

### 0.1 태스크 카드 포맷

각 태스크는 아래 필드를 갖는다.

- **ID**: `FE-<단계>-<순번>` (예: `FE-1-1`)
- **제목**: 동사로 시작, 한 줄
- **의존**: 선행 태스크 ID 목록 또는 `없음`
- **변경 파일**: 생성/수정 파일 절대 경로
- **작업 내용**: 실제 구현 내용. codex가 이 문구를 그대로 받아 실행할 수 있어야 한다.
- **Definition of Done (DoD)**: 완료 판정 기준. 코드, 테스트, 실행 결과 중 검증 가능한 형태.
- **예상 크기**: `XS(<30분)` / `S(30-90분)` / `M(90-240분)` / `L(240분+)` 중 하나. (우선순위 판단용, 실행 시간 단축/연장은 codex 결과에 맞춰 재평가)
- **리스크/메모**: 있으면 기록.

### 0.2 실행 규약

- 모든 태스크는 `codex exec` 대상. Claude는 스펙 정의·결과 검증·후속 태스크 갱신을 담당.
- 변경은 기존 경로 규약(`web-app/app/*`, `web-app/components/*`)에 따른다. 새 폴더가 필요하면 태스크 본문에 명시.
- `ui/` 프리미티브(`Button`, `Card`, `Badge`, `Input`, `PageHeader`)는 재사용, 새 프리미티브 추가 금지.
- 타입은 `web-app/types/`에 추가하거나 기능 폴더 내 `types.ts`로 둔다(태스크별 지시 따른다).
- 모든 컴포넌트/페이지는 React 함수형 + TypeScript, Next.js App Router 기준.

### 0.3 기본 가정

- 백엔드 신규 API(§15 in PAGE_SPECIFICATIONS)는 아직 일부만 존재한다. 프런트 태스크는 **BFF 라우트(`/api/backend/...`) 모의 응답** 또는 **타입만 정의하고 핸들러는 TODO 스텁**으로 우선 진행 가능. 실 API 연결은 6단계에서 일괄 교체.
- e2e 테스트는 Playwright 기존 setup을 사용(이미 로그인 테스트 존재).

### 0.4 단계 개요 및 의존도

```text
Stage 1  라우트 골격        ─┐
Stage 2  앱 셸 정리          ├─→ Stage 3 Chat UI
                             │   Stage 4 Documents UI
                             │   Stage 5 Upload Drawer
                             └─→ Stage 6 API 연결
                                 Stage 7 상태 처리
                                 Stage 8 테스트
```

각 태스크의 `의존` 필드에 선행 관계가 명시된다.

## Stage 1. 라우트 골격

목표: 신규 4개 라우트의 페이지 파일과 기본 렌더링(플레이스홀더)을 추가해, 네비게이션이 깨지지 않게 한다. 이 단계에서는 데이터 연결 없이 `h1`+라우트명만 보여도 OK.

### FE-1-1. `/chat` 페이지 파일 생성

- **의존**: 없음
- **변경 파일**: `web-app/app/chat/page.tsx`
- **작업 내용**: 로그인 가드를 적용한 빈 페이지. `PageHeader` 재사용, 타이틀 `Chat`. 본문은 "Chat home placeholder" 문구만 렌더.
- **DoD**: `cd web-app && npm run dev`로 `/chat` 접속 시 `PageHeader` + 문구가 표시. 비로그인은 `/auth/login`으로 리다이렉트.
- **크기**: XS

### FE-1-2. `/chat/[sessionId]` 페이지 파일 생성

- **의존**: FE-1-1
- **변경 파일**: `web-app/app/chat/[sessionId]/page.tsx`
- **작업 내용**: 동적 라우트 파라미터 수신, `sessionId`를 문구로 렌더. 보호 라우트.
- **DoD**: `/chat/abc` 접속 시 `abc` 문구 표시.
- **크기**: XS

### FE-1-3. `/projects/[projectId]` 페이지 파일 생성

- **의존**: 없음
- **변경 파일**: `web-app/app/projects/[projectId]/page.tsx`
- **작업 내용**: 동적 라우트 파라미터로 `projectId` 렌더. 보호 라우트.
- **DoD**: `/projects/demo` 접속 시 `demo` 문구 표시.
- **크기**: XS

### FE-1-4. `/projects/[projectId]/documents` 페이지 파일 생성

- **의존**: FE-1-3
- **변경 파일**: `web-app/app/projects/[projectId]/documents/page.tsx`
- **작업 내용**: 동적 파라미터 수신 + 보호 라우트. 문구 플레이스홀더.
- **DoD**: `/projects/demo/documents` 접속 시 `documents for demo` 문구 표시.
- **크기**: XS

### FE-1-5. 라우트 타입 및 경로 헬퍼 추가

- **의존**: FE-1-2, FE-1-4
- **변경 파일**: `web-app/lib/routes.ts` (새 파일)
- **작업 내용**: `ROUTES` 객체 정의: `chat`, `chatSession(id)`, `project(id)`, `projectDocuments(id)`. 타입 추론 가능하게 문자열 리터럴 유니온.
- **DoD**: 다른 모듈에서 `ROUTES.chatSession('x') === '/chat/x'` 참조 가능. TypeScript 컴파일 통과.
- **크기**: XS

## Stage 2. 앱 셸 정리

목표: 사이드바·헤더·프로젝트 문맥을 신규 IA에 맞게 재배치.

### FE-2-1. 사이드바에 `Chat` 최상위 메뉴 추가, `Projects`를 `Knowledge` 섹션으로 이동

- **의존**: FE-1-1, FE-1-5
- **변경 파일**: `web-app/components/layout/Sidebar.tsx`(또는 해당 파일), 필요 시 `web-app/components/layout/SidebarSections.tsx` 신설
- **작업 내용**: PAGE_SPECIFICATIONS §2.2 IA 구조로 재배치.
  - `Workspace` 섹션: Dashboard, Chat, Search, Graphs
  - `Knowledge` 섹션: Projects
  - `Admin` 섹션: Team, Permissions
  - 섹션 헤더(작은 타이포) 추가.
- **DoD**: 사이드바에 3개 섹션 헤더가 보이고, 각 메뉴가 올바른 라우트로 이동.
- **크기**: S

### FE-2-2. 헤더에 현재 범위 배지 표시

- **의존**: FE-2-1
- **변경 파일**: `web-app/components/layout/Header.tsx`(또는 해당 파일)
- **작업 내용**: 현재 라우트에서 프로젝트 컨텍스트(`/projects/:projectId/*`)일 때 헤더 우측에 프로젝트 이름 배지 표시. 이외에는 숨김.
- **DoD**: `/projects/demo`, `/projects/demo/documents`에서 배지가 보임. 다른 경로에선 사라짐.
- **크기**: S
- **리스크**: 프로젝트 이름 조회 API 미구현 시 `projectId` 텍스트 fallback 사용.

### FE-2-3. 프로젝트 문맥 액션 바(프로젝트 내 하위 내비게이션) 추가

- **의존**: FE-2-2
- **변경 파일**: `web-app/components/project/ProjectContextNav.tsx` (신규)
- **작업 내용**: `/projects/:projectId/*` 이하에서 페이지 상단에 탭형 네비 렌더 (`Overview` / `Documents`). 활성 탭 강조.
- **DoD**: `/projects/demo`에서 `Overview` 활성, `/projects/demo/documents`에서 `Documents` 활성.
- **크기**: S

## Stage 3. Chat UI 골격

목표: 백엔드 없이 mock 데이터로 Chat 홈·세션 상세가 렌더된다.

### FE-3-1. 타입 정의 (`web-app/types/chat.ts`)

- **의존**: 없음
- **변경 파일**: `web-app/types/chat.ts`
- **작업 내용**: `2026-04-13-component-tree.md §5` 타입 stub을 그대로 옮긴다. `ChatScope`, `ChatSessionSummary`, `ConversationMessage`(discriminated union), `UserMessage`, `SystemMessage`, `AssistantAnswer`, `Citation`, `CitationRef`, `CitationPreview`, `CitationNavigation`, `SuggestedQuestion`, `ChatAnswerRequest`, `ChatSession`, `ProjectOption`, `TeamOption`, `ScopeKind`, `NavigationTarget`(`{ kind: 'document' | 'search' | 'graph'; payload: CitationNavigation | { query: string } | { nodeId: string } }`).
- **DoD**: `tsc --noEmit` 통과. 다른 모듈에서 import 시 타입 해석됨.
- **크기**: S

### FE-3-2. `ChatLayout` 구현

- **의존**: FE-3-1
- **변경 파일**: `web-app/components/chat/ChatLayout.tsx`
- **작업 내용**: 컴포넌트 트리 §1.3 사양 준수. 3열/모바일 반응형. props로 `leftSlot`, `children`, `rightSlot`, 드로어 토글 콜백.
- **DoD**: 단위 렌더 테스트(`web-app/components/chat/__tests__/ChatLayout.test.tsx`)에서 `leftSlot`·`children`·`rightSlot`에 sentinel 요소 주입 시 3열 모두 querySelector로 탐지. 모바일 뷰포트(width<768)에서 `rightSlot`이 기본 숨김인지 jsdom 단위로 검증.
- **크기**: M

### FE-3-3. `ChatSessionList` + `ChatSessionListItem`

- **의존**: FE-3-1
- **변경 파일**: `web-app/components/chat/ChatSessionList.tsx`, `web-app/components/chat/ChatSessionListItem.tsx`
- **작업 내용**: props 계약은 컴포넌트 트리 §1.3. 빈/로딩/에러 분기 포함.
- **DoD**: mock 세션 3건 전달 시 리스트 렌더, 클릭 시 `onSelect` 호출.
- **크기**: S

### FE-3-4. `ChatScopeSelector`

- **의존**: FE-3-1
- **변경 파일**: `web-app/components/chat/ChatScopeSelector.tsx`
- **작업 내용**: `Workspace`/`Team`/`Project` 3택 + Project 선택 시 드롭다운. `disabledKinds` 존중, 비활성 옵션에 툴팁.
- **DoD**: 제어 컴포넌트로 동작. `disabledKinds=['TEAM','PROJECT']` 시 `Workspace`만 활성.
- **크기**: S

### FE-3-5. `ChatComposer`

- **의존**: FE-3-1
- **변경 파일**: `web-app/components/chat/ChatComposer.tsx`
- **작업 내용**: 자동 높이 textarea + 전송 버튼. Enter 전송 / Shift+Enter 줄바꿈. `isSubmitting` 시 버튼 스피너.
- **DoD**: 제어 컴포넌트. 엔터키 동작 유닛 테스트(`@testing-library/react`) 1건 추가.
- **크기**: S

### FE-3-6. `SuggestedFollowUps`

- **의존**: FE-3-1
- **변경 파일**: `web-app/components/chat/SuggestedFollowUps.tsx`
- **작업 내용**: chip 리스트, `onSelect` 콜백. `isLoading` 시 스켈레톤 3개.
- **DoD**: chip 클릭 시 `onSelect` 호출.
- **크기**: XS

### FE-3-7. `ChatWelcomeState`

- **의존**: FE-3-4, FE-3-5, FE-3-6
- **변경 파일**: `web-app/components/chat/ChatWelcomeState.tsx`
- **작업 내용**: low-fi F2 `M` 영역 렌더. scope selector + composer + suggestions. props 계약은 컴포넌트 트리 §1.3 (수정된 `disabledKinds`).
- **DoD**: 단위 렌더 테스트(`web-app/components/chat/__tests__/ChatWelcomeState.test.tsx`)에서 (a) Default props로 composer/selector/suggestions 렌더, (b) `disabledKinds=['TEAM','PROJECT']` 시 selector가 Workspace만 활성, (c) 제출 시 `onSubmit` 호출을 spy로 검증.
- **크기**: S

### FE-3-8. `ChatSessionHeader`

- **의존**: FE-3-1
- **변경 파일**: `web-app/components/chat/ChatSessionHeader.tsx`
- **작업 내용**: 세션 제목(더블클릭 편집), 범위 배지, 메타.
- **DoD**: 인라인 편집 토글 동작.
- **크기**: S

### FE-3-9. `ChatMessage` (user/system)

- **의존**: FE-3-1
- **변경 파일**: `web-app/components/chat/ChatMessage.tsx`
- **작업 내용**: `variant: 'user' | 'system'` 분기. 시스템은 `variant` 필드(`insufficient_evidence` 등)에 따라 아이콘/톤 변경.
- **DoD**: 각 variant 스토리 mock 3종 렌더 확인.
- **크기**: S

### FE-3-10. `CitationList`

- **의존**: FE-3-1
- **변경 파일**: `web-app/components/chat/CitationList.tsx`
- **작업 내용**: chip 형태, `maxVisible` 초과 시 `more` 펼침. `onSelect(ref)` 호출.
- **DoD**: mock 5건, maxVisible 3일 때 `more` 펼침 동작.
- **크기**: S

### FE-3-11. `AnswerCard`

- **의존**: FE-3-10, FE-3-6
- **변경 파일**: `web-app/components/chat/AnswerCard.tsx`
- **작업 내용**: 메타 row, body(markdown 렌더), CitationList, SuggestedFollowUps, 액션 row(`문서 열기`/`검색으로 이동`/`그래프에서 보기`).
- **DoD**: 액션 클릭 시 `onNavigate(target)` 호출. 인용 선택 시 `onSelectCitation` 호출.
- **크기**: M
- **리스크**: markdown 렌더는 기존 라이브러리(예: `react-markdown`) 사용 여부 확인 필요. 없으면 텍스트로 먼저 렌더 후 확장.

### FE-3-12. `ChatConversation`

- **의존**: FE-3-8, FE-3-9, FE-3-11
- **변경 파일**: `web-app/components/chat/ChatConversation.tsx`
- **작업 내용**: `messages: ConversationMessage[]` 순회, `role` 기준 분기 렌더. 자동 스크롤.
- **DoD**: mock 메시지 5건(user/assistant/system 혼합) 렌더 시 올바르게 분기.
- **크기**: M

### FE-3-13. `SourcePanel` + `SourcePreviewCard`

- **의존**: FE-3-1
- **변경 파일**: `web-app/components/chat/SourcePanel.tsx`, `web-app/components/chat/SourcePreviewCard.tsx`
- **작업 내용**: 우측 패널 컨테이너 + 카드. `onOpenDocument(nav: CitationNavigation)` 계약 준수.
- **DoD**: 단위 렌더 테스트(`web-app/components/chat/__tests__/SourcePanel.test.tsx`)에서 mock preview 2건 렌더 후 `문서 열기` 클릭 시 `onOpenDocument`가 `{ projectId, documentId, chunkId }` 필드를 가진 `CitationNavigation` 객체로 호출됨을 jest spy로 assert.
- **크기**: S

### FE-3-14. `/chat` 페이지 실제 연결

- **의존**: FE-3-2, FE-3-3, FE-3-7
- **변경 파일**: `web-app/app/chat/page.tsx`
- **작업 내용**: mock 세션 목록 + `ChatWelcomeState` 조합. Stage 1 플레이스홀더 제거. 전송 시 `/chat/:sessionId`로 push(아직 mock sessionId).
- **DoD**: F2 Default/Empty 스펙 재현. 전송 → 라우트 전환.
- **크기**: S

### FE-3-15. `/chat/[sessionId]` 페이지 실제 연결

- **의존**: FE-3-2, FE-3-3, FE-3-5, FE-3-12, FE-3-13
- **변경 파일**: `web-app/app/chat/[sessionId]/page.tsx`
- **작업 내용**: mock 세션/메시지 데이터로 F3 레이아웃 재현. follow-up 전송은 낙관적으로 local state에 append.
- **DoD**: F3 Default 상태 재현. 인용 클릭 → 우측 패널 렌더.
- **크기**: M

## Stage 4. Documents UI 골격

목표: mock 데이터로 문서 리스트·필터·요약 패널이 렌더된다.

### FE-4-1. 타입 정의 (`web-app/types/document.ts`)

- **의존**: 없음
- **변경 파일**: `web-app/types/document.ts`
- **작업 내용**: 컴포넌트 트리 §5의 `DocumentStatus`, `DocumentSummary`, `DocumentFilterState`, `DocumentDetail`, `DocumentChunk`, `ProjectMetrics`, `ProjectDetail`, `ProjectSummary`, `JobStatus`, `UploadProgress`, `UploadOutcome`, `UploadResult`, `FileCandidate`(`{ id: string; file: File; sizeBytes: number; mimeType: string }`), `DocumentMetadataInput`(`{ title?: string; tags: string[]; docType?: string }`), `UploadValidation`(`{ fileId: string; severity: 'error'|'warn'; code: 'unsupported_type'|'too_large'|'duplicate_filename'|'permission'; message: string }`) 정의.
- **DoD**: `tsc --noEmit` 통과.
- **크기**: S

### FE-4-2. `DocumentStatusBadge`

- **의존**: FE-4-1
- **변경 파일**: `web-app/components/documents/DocumentStatusBadge.tsx`
- **작업 내용**: `ui/Badge` 기반. 6개 상태별 색/아이콘. `progressPct` 있으면 라벨에 % 표기.
- **DoD**: 6개 상태 각각 렌더 확인.
- **크기**: XS

### FE-4-3. `DocumentSearchInput` + `DocumentFilters`

- **의존**: FE-4-1
- **변경 파일**: `web-app/components/documents/DocumentSearchInput.tsx`, `web-app/components/documents/DocumentFilters.tsx`
- **작업 내용**: 검색 입력(디바운스 300ms) + 필터 바(상태/유형/태그/날짜). 태그는 props `availableTags`로 주입.
- **DoD**: 제어 컴포넌트. 디바운스 유닛 테스트 1건.
- **크기**: M

### FE-4-4. `DocumentListItem` + `DocumentList`

- **의존**: FE-4-2
- **변경 파일**: `web-app/components/documents/DocumentListItem.tsx`, `web-app/components/documents/DocumentList.tsx`
- **작업 내용**: 행 렌더(제목·파일명·상태 배지·업로드자·시각·크기·태그·요약·액션 메뉴). 무한 스크롤 또는 `Load more` 버튼.
- **DoD**: mock 6건 렌더, 행 선택 시 `onSelect` 호출, 액션 메뉴에서 `onRerun`/`onDelete` 호출.
- **크기**: M

### FE-4-5. `DocumentSummaryPanel`

- **의존**: FE-4-1
- **변경 파일**: `web-app/components/documents/DocumentSummaryPanel.tsx`
- **작업 내용**: 선택 문서 상세 요약 + 청크 프리뷰. 선택 없을 때 안내.
- **DoD**: mock 상세 전달 시 렌더.
- **크기**: S

### FE-4-6. `ProjectDocumentsHeader` + `FailedDocumentNotice` + `EmptyDocumentsState`

- **의존**: FE-4-1, FE-4-2
- **변경 파일**: `web-app/components/documents/ProjectDocumentsHeader.tsx`, `web-app/components/documents/FailedDocumentNotice.tsx`, `web-app/components/documents/EmptyDocumentsState.tsx`
- **작업 내용**: 컴포넌트 트리 §3.3 사양.
- **DoD**: 세 컴포넌트 각각 개별 렌더.
- **크기**: S

### FE-4-7. `/projects/[projectId]/documents` 페이지 실제 연결

- **의존**: FE-4-3, FE-4-4, FE-4-5, FE-4-6
- **변경 파일**: `web-app/app/projects/[projectId]/documents/page.tsx`
- **작업 내용**: mock 데이터로 F4 레이아웃 재현. deep-link `?documentId=...` 파싱하여 초기 선택 상태 설정.
- **DoD**: F4 Default/Empty/FailedBanner 재현 가능(mock 토글).
- **크기**: M

### FE-4-8. 프로젝트 상세(`/projects/[projectId]`) 페이지 실제 연결

- **의존**: FE-4-2, FE-4-4, FE-4-6, FE-2-3, FE-5-1
- **변경 파일**: `web-app/app/projects/[projectId]/page.tsx`, `web-app/components/project/ProjectDetailHeader.tsx`, `web-app/components/project/ProjectMetricCards.tsx`, `web-app/components/project/ProjectCtaRow.tsx`, `web-app/components/project/RecentProjectUploads.tsx`, `web-app/components/project/RecentProjectChatSessions.tsx`
- **작업 내용**: 컴포넌트 트리 §2.3 사양대로 허브 렌더. CTA는 각각 `/chat?scope=project&projectId=...`, `/projects/:projectId/documents`로 라우팅. 문서 0건일 때 `EmptyDocumentsState`(§3 재사용) 노출, `Upload documents` CTA 클릭 시 `UploadDrawer` 오픈 + `onUploaded` 후 최근 업로드 카드 재조회.
- **DoD**: 카드 지표·최근 업로드·최근 세션이 mock으로 렌더. CTA 클릭 라우팅 동작. 문서 0건 mock에서 `EmptyDocumentsState` 노출. `Upload documents` 클릭 시 드로어 오픈 확인.
- **크기**: M

## Stage 5. Upload Drawer

목표: 드로어가 단계적으로 전환되고, mock 업로드 흐름이 완성된다.

### FE-5-1. `UploadDrawer` shell + 단계 state

- **의존**: FE-4-1
- **변경 파일**: `web-app/components/upload/UploadDrawer.tsx`, `web-app/components/upload/index.ts`
- **작업 내용**: `step: 'select' | 'validate' | 'metadata' | 'submitting' | 'result'` 상태 머신. 드로어 열고/닫기 + 바깥 클릭 확인 모달. 공통 header/footer 레이아웃(F5 스펙).
- **DoD**: step 전환 버튼으로 각 step placeholder 렌더 전환.
- **크기**: M

### FE-5-2. `FileDropzone`

- **의존**: 없음
- **변경 파일**: `web-app/components/upload/FileDropzone.tsx`
- **작업 내용**: 드래그앤드롭 + 파일 선택 버튼. `accept`, `maxSizeBytes` 검증. 드래그 중 하이라이트.
- **DoD**: 파일 드롭 시 `onFiles` 호출. 지원 안 되는 형식은 reject + 안내.
- **크기**: S

### FE-5-3. `UploadFileList`

- **의존**: FE-4-1
- **변경 파일**: `web-app/components/upload/UploadFileList.tsx`
- **작업 내용**: 후보 파일 행 렌더, 제거 버튼.
- **DoD**: mock 3건 렌더, 제거 시 `onRemove` 호출.
- **크기**: XS

### FE-5-4. `UploadValidationList`

- **의존**: FE-4-1
- **변경 파일**: `web-app/components/upload/UploadValidationList.tsx`
- **작업 내용**: 파일별 사전 검증 결과(형식/크기/중복/권한) 리스트.
- **DoD**: 실패 항목 표시 + `onDismissFile` 콜백.
- **크기**: S

### FE-5-5. `UploadMetadataForm`

- **의존**: FE-4-1
- **변경 파일**: `web-app/components/upload/UploadMetadataForm.tsx`
- **작업 내용**: 파일별 메타 입력(제목/태그/유형), 일괄 적용 버튼. `availableTags`는 상위에서 주입(로드된 docs에서 파생).
- **DoD**: 제어 컴포넌트. 일괄 적용 동작.
- **크기**: M

### FE-5-6. `UploadProgressList`

- **의존**: FE-4-1
- **변경 파일**: `web-app/components/upload/UploadProgressList.tsx`
- **작업 내용**: 파일별 진행률 바 + cancel 버튼. `progressByFile` 렌더.
- **DoD**: mock progress 갱신 시 바 업데이트. cancel 클릭 → `onCancel(fileId)` 호출.
- **크기**: S

### FE-5-7. `UploadResultSummary`

- **의존**: FE-4-1
- **변경 파일**: `web-app/components/upload/UploadResultSummary.tsx`
- **작업 내용**: `succeeded`/`failed`/`cancelled` 3분할. `Retry failed`, `Go to documents`, `Close` 액션.
- **DoD**: 3분할 렌더, 액션 콜백 동작.
- **크기**: S

### FE-5-8. `UploadDrawer` 드로어-단계 통합 (API 호출 없음)

- **의존**: FE-5-1~FE-5-7
- **변경 파일**: `web-app/components/upload/UploadDrawer.tsx`
- **작업 내용**: 모든 step 컴포넌트를 `UploadDrawer`에 연결해 `select→validate→metadata→submitting→result` 전환을 mock handler(예: `setTimeout` fake progress)로 시연. 아직 실제 업로드 호출은 호출하지 않는다. 단계별 validation 실패/뒤로가기/닫기 확인 모달을 붙인다.
- **DoD**: 단위 렌더 테스트(`web-app/components/upload/__tests__/UploadDrawer.test.tsx`)에서 파일 드롭 → 메타 입력 → 제출 → (fake) progress → result 까지 `userEvent` 기반 시나리오 통과.
- **크기**: M

### FE-5-9. 업로드 전송 레이어 (파일별 XHR + AbortController)

- **의존**: FE-5-8
- **변경 파일**: `web-app/lib/api/document-service.ts`(신규), `web-app/lib/api/__tests__/document-service.test.ts`(신규)
- **작업 내용**: `uploadDocument(projectId, file, meta, { onProgress, signal })` 함수 구현. `POST /api/backend/projects/:projectId/documents` multipart. XHR로 progress 이벤트 구독, `AbortController.signal`로 취소. 소규모 병렬 실행 헬퍼(`runWithConcurrency(tasks, n=3)`)도 같이 정의.
- **DoD**: 유닛 테스트에서 (a) `onProgress` 호출 ≥1회, (b) `signal.abort()` 시 reject with `AbortError`, (c) 병렬 헬퍼가 동시 실행 수 ≤ n 유지.
- **크기**: M

### FE-5-10. 작업 상태 폴링 + 결과 집계

- **의존**: FE-5-9
- **변경 파일**: `web-app/lib/api/job-service.ts`(신규), `web-app/components/upload/UploadDrawer.tsx`
- **작업 내용**: `pollJob(jobId, { intervalMs=2000, timeoutMs=300000, signal })`로 `GET /api/backend/jobs/:jobId`를 상태가 `READY|FAILED`될 때까지 반복. `UploadDrawer`에서 FE-5-9를 실제 호출로 교체하고 각 파일의 업로드 종료 후 `pollJob`을 연결, `UploadResult`(`succeeded/failed/cancelled`)를 집계해 `result` step으로 전달.
- **DoD**: mock BFF(또는 jest.mock)에서 progress 0→100% 갱신 후 polling으로 `READY` 수신 → `UploadResultSummary`가 `succeeded` 1건. 중간 cancel 시 해당 파일 `cancelled`로 집계.
- **크기**: M
- **리스크**: 폴링 타임아웃/백오프 정책은 구현 중 검토.

## Stage 6. API 연결

목표: mock을 실 BFF 라우트 + 백엔드 엔드포인트로 교체.

### FE-6-1. BFF 프록시 라우트 정비

- **의존**: Stage 3/4/5 기본 구현
- **변경 파일**: `web-app/app/api/backend/[...path]/route.ts` (기존), `web-app/app/api/backend/chat/*` (필요 시 신규)
- **작업 내용**: 신규 엔드포인트(§15 PAGE_SPECIFICATIONS)를 백엔드로 투명 프록시. 인증 쿠키 포워딩. 백엔드가 아직 미구현인 엔드포인트는 `501 Not Implemented` JSON 응답으로 스텁.
- **DoD**: 프런트에서 `/api/backend/chat/sessions` 호출 시 프록시 또는 501 stub.
- **크기**: M

### FE-6-2. 채팅 세션 목록 연결

- **의존**: FE-6-1, FE-3-14
- **변경 파일**: `web-app/lib/api/chat-service.ts` (신규)
- **작업 내용**: `GET /api/backend/chat/sessions?scope=...&limit=N` 래퍼. react-query 또는 fetch + `use()` 기반.
- **DoD**: `/chat`에서 실 API 결과로 세션 리스트 렌더.
- **크기**: S

### FE-6-3. 메시지 목록/전송 연결

- **의존**: FE-6-2, FE-3-15
- **변경 파일**: `web-app/lib/api/chat-service.ts`
- **작업 내용**: `GET /api/backend/chat/sessions/{id}/messages`, `POST /api/backend/chat/sessions/{id}/messages`, `POST /api/backend/chat/answer` 래퍼. 답변 응답의 `citations` 필드를 타입에 맞춰 변환.
- **DoD**: 세션 상세에서 실 API로 메시지 로드 및 전송 가능.
- **크기**: M

### FE-6-4. 문서 목록/상세/삭제 연결

- **의존**: FE-6-1, FE-4-7
- **변경 파일**: `web-app/lib/api/document-service.ts`
- **작업 내용**: `GET/DELETE /api/backend/projects/:id/documents`, `GET /api/backend/documents/:id`, `GET /api/backend/documents/:id/chunks`. 필터/페이지네이션 파라미터 직렬화.
- **DoD**: 실 API로 Documents 페이지 동작.
- **크기**: M

### FE-6-5. 업로드 BFF 모의 응답 제거 및 실 백엔드 연결

- **의존**: FE-5-10, FE-6-1
- **변경 파일**: `web-app/app/api/backend/[...path]/route.ts`, 필요 시 `web-app/lib/api/document-service.ts`
- **작업 내용**: FE-5-9/FE-5-10이 호출하는 `/api/backend/projects/:id/documents`, `/api/backend/jobs/:id`를 실 백엔드로 투명 프록시 전환(FE-6-1에서 stub 처리된 경우 제거). 계약 불일치 시 어댑터 함수 추가.
- **DoD**: 실 파일 업로드 → 문서 리스트에 `QUEUED→PARSING→INDEXING→READY` 반영.
- **크기**: M

### FE-6-6. 프로젝트 상세 집계 API 연결

- **의존**: FE-6-1, FE-4-8
- **변경 파일**: `web-app/lib/api/project-service.ts` (기존 파일 확장)
- **작업 내용**: `GET /api/backend/projects/:id`, `GET /api/backend/projects/:id/documents?limit=5&sort=recent`, `GET /api/backend/projects/:id/jobs?status=RUNNING,PENDING`, `GET /api/backend/chat/sessions?scopeType=PROJECT&scopeId=:id&limit=5` 병렬 호출 후 조합.
- **DoD**: 프로젝트 상세에서 실 데이터 렌더.
- **크기**: M

## Stage 7. 상태 처리

목표: 5개 상태(empty/loading/error/no permission/insufficient evidence)를 모든 화면에서 일관되게 처리.

### FE-7-1. 공통 `ErrorView` 추가

- **의존**: 없음
- **변경 파일**: `web-app/components/feedback/ErrorView.tsx`
- **작업 내용**: 컴포넌트 트리 §5.1 사양. `statusCode` 분기로 문구/액션 변경.
- **DoD**: 403/404/500 각각 렌더 확인.
- **크기**: S

### FE-7-2. 페이지 레벨 에러 바운더리 적용

- **의존**: FE-7-1
- **변경 파일**: `web-app/app/chat/error.tsx`, `web-app/app/chat/[sessionId]/error.tsx`, `web-app/app/projects/[projectId]/error.tsx`, `web-app/app/projects/[projectId]/documents/error.tsx`
- **작업 내용**: Next.js `error.tsx`로 `ErrorView` 렌더.
- **DoD**: 각 라우트에서 강제 throw 시 `ErrorView` 표시.
- **크기**: S

### FE-7-3. 로딩 상태 스켈레톤 통일

- **의존**: Stage 3/4 구현
- **변경 파일**: 각 페이지/컴포넌트
- **작업 내용**: 모든 컴포넌트의 `isLoading` 분기가 low-fi 스펙과 일치하도록 스켈레톤 추가/정렬.
- **DoD**: 의도적 delay로 mock 테스트 시 스켈레톤 시각 확인.
- **크기**: M

### FE-7-4. 권한 분기 상위 주입

- **의존**: FE-7-1
- **변경 파일**: 각 페이지
- **작업 내용**: 페이지에서 `user.role` + 리소스 권한을 계산해 하위 컴포넌트에 `readOnly`/`canUpload`/`disabledKinds` 등으로 주입. 자식이 `user`를 직접 조회하지 않게 유지.
- **DoD**: viewer 계정으로 접속 시 업로드 버튼 비활성, Chat에서 `Workspace` 전용 스코프.
- **크기**: M

### FE-7-5. 답변 근거 부족 처리

- **의존**: FE-6-3
- **변경 파일**: `web-app/components/chat/ChatConversation.tsx`, `web-app/components/chat/ChatMessage.tsx`
- **작업 내용**: 서버가 `insufficient_evidence` 시스템 메시지를 반환하면 해당 메시지를 시스템 variant로 렌더 + `문서 업로드` CTA.
- **DoD**: mock으로 해당 메시지 주입 시 CTA 동작.
- **크기**: S

### FE-7-6. 업로드 폴링 연결 끊김 배너

- **의존**: FE-6-5
- **변경 파일**: `web-app/app/projects/[projectId]/documents/page.tsx`, `web-app/components/documents/PollingDisconnectedBanner.tsx`(신규, 매우 작으면 inline)
- **작업 내용**: 폴링 실패 임계 이상 지속 시 상단 경고 배너 + 진행 중 행에 `stale` 표시. 재연결 성공 시 자동 해제.
- **DoD**: 네트워크 오프라인 시뮬레이션에서 배너 등장/해제.
- **크기**: S

## Stage 8. 테스트

목표: 핵심 사용자 흐름을 e2e 및 상호작용 단위로 검증.

### FE-8-1. e2e: 로그인 후 `/chat` 진입

- **의존**: FE-3-14, FE-7-4
- **변경 파일**: `web-app/e2e/scenarios/chat-entry.spec.ts`(신규)
- **작업 내용**: 기존 로그인 픽스처 재사용. 로그인 후 사이드바 `Chat` 클릭 → `/chat` URL + 헤더/Welcome 요소 확인.
- **DoD**: Playwright 실행 통과.
- **크기**: S

### FE-8-2. e2e: 문서 업로드

- **의존**: FE-5-8, FE-6-5
- **변경 파일**: `web-app/e2e/scenarios/document-upload.spec.ts`(신규)
- **작업 내용**: 프로젝트 문서 페이지 진입 → Upload 드로어 오픈 → 테스트 파일 드롭 → 메타 입력 → 제출 → 결과 요약에 succeeded 1건 확인.
- **DoD**: Playwright 실행 통과.
- **크기**: M
- **리스크**: 업로드 API 백엔드 미구현 시 mock 모드로 스킵 조건 분기 추가.

### FE-8-3. e2e: 질문/답변 흐름

- **의존**: FE-6-3, FE-3-15
- **변경 파일**: `web-app/e2e/scenarios/chat-answer.spec.ts`(신규)
- **작업 내용**: `/chat` → 질문 전송 → 세션 상세 진입 → 답변 카드 노출 → 출처 chip 클릭 → 우측 패널 미리보기 확인.
- **DoD**: Playwright 실행 통과.
- **크기**: M

### FE-8-4. e2e: 출처 패널 상호작용 및 deep-link

- **의존**: FE-8-3, FE-4-7
- **변경 파일**: `web-app/e2e/scenarios/citation-deeplink.spec.ts`(신규)
- **작업 내용**: 답변의 `문서 열기` 액션 → `/projects/:projectId/documents?documentId=...&chunkId=...`로 이동, 해당 행 선택/청크 하이라이트 확인.
- **DoD**: Playwright 실행 통과.
- **크기**: S

### FE-8-5. 유닛 테스트: discriminated union 렌더 분기

- **의존**: FE-3-12
- **변경 파일**: `web-app/components/chat/__tests__/ChatConversation.test.tsx`(신규)
- **작업 내용**: user/assistant/system 3종 메시지를 섞은 리스트가 올바르게 분기 렌더되는지. 시스템 variant `insufficient_evidence`에서 CTA 노출 여부.
- **DoD**: `cd web-app && npm test -- ChatConversation` 통과 (Jest).
- **크기**: S

## 9. 실행 순서 요약 (크리티컬 패스)

```text
S1: FE-1-1 → FE-1-2, FE-1-3 → FE-1-4 → FE-1-5
S2: FE-2-1 → FE-2-2 → FE-2-3
S3: FE-3-1 → (3-2..3-13 병렬) → FE-3-14, FE-3-15
S4: FE-4-1 → (4-2..4-6 병렬) → FE-4-7, FE-4-8
S5: FE-5-1 → (5-2..5-7 병렬) → FE-5-8 → FE-5-9 → FE-5-10
S6: FE-6-1 → 6-2/6-4/6-6 병렬 → FE-6-3, FE-6-5
S7: FE-7-1 → 7-2..7-6 병렬
S8: FE-8-1 → 8-2..8-5 병렬
```

병렬화 가능한 태스크는 `FE-X-N`이 동일 Stage 내 선행 의존이 공통 타입(`FE-3-1` 등)만 있는 경우다.

## 10. 이슈 트래커 전사 가이드

- 각 `FE-X-N` 카드를 GitHub Issue 또는 Linear Issue 1건으로 복사.
- 라벨: `frontend`, `kb-chat`, 그리고 Stage 번호(`stage-1`~`stage-8`).
- 마일스톤: `2026-Q2 KB Chat MVP`.
- 의존 관계는 이슈 설명 본문에 `Depends on #xxx` 링크로 기록.

## 11. 후속

- 구현은 본 문서 순서대로 codex 위임.
- 각 Stage 종료 시 Claude가 codex에 리뷰 요청 → 결함 반영 → 다음 Stage 착수.
- 실제 백엔드 신규 API 계약이 확정되면 `docs/PAGE_SPECIFICATIONS.md §15`와 본 문서의 Stage 6 태스크를 재조정한다.
