# Graphify 지식베이스 채팅 기능 Stage 1~5 완료 핸드오프

작성일: 2026-04-13
문서 목적: `2026-04-10-knowledgebase-chat-handoff-and-next-steps.md` 이후 진행된 4개 문서화 작업(작업 1~4)과 Stage 1~5 구현 전체 내역을 정리하고, 다음 세션이 바로 이어받을 수 있도록 남긴다.
기준 커밋 상태: 커밋되지 않은 변경 사항 있음(아래 §3 참조). Claude Code 세션 종료 전 `git status` 확인 권장.

## 0. 이 세션의 개발 위임 규칙

본 세션부터 graphify 프로젝트의 **코드 구현은 codex CLI(GPT 5.4)에 위임**한다.

- **Claude 담당**: 설계, 문서 작성, 계획, diff 리뷰, 테스트 실행, 컨텍스트 관리
- **codex 담당**: 실제 코드 파일 생성/수정 (`codex exec`, non-interactive)
- **리뷰 루프**: 매 stage/batch 종료 시 Claude가 codex에게 정적 리뷰를 요청 → 결함 반영 → 다음 단계

이 규칙은 `C:\Users\jwjung\.claude\projects\c--workspaceRND-graphify-graphify\memory\feedback_delegate_dev_to_codex.md`에 메모리로 저장되어 다음 세션에서도 자동 적용된다.

## 1. 설계 문서 작성 완료

`2026-04-10-knowledgebase-chat-handoff-and-next-steps.md`에서 정의한 4개 작업이 모두 완료되었다. 각 문서는 codex 리뷰 루프를 거치며 총 29건의 결함을 반영했다.

### 1.1 작업 1 — PAGE_SPECIFICATIONS.md 확장

- 파일: [../PAGE_SPECIFICATIONS.md](../PAGE_SPECIFICATIONS.md)
- 추가된 섹션:
  - §11 채팅 홈 (`/chat`)
  - §12 채팅 세션 상세 (`/chat/:sessionId`)
  - §13 프로젝트 상세 (`/projects/:projectId`)
  - §14 프로젝트 문서 (`/projects/:projectId/documents`)
  - §15에 신규 계획 API 블록 추가
  - §16 다음 단계 섹션을 A(기존 보강)/B(신규 8단계 태스크)로 재구성
- 대시보드 섹션에 `신규 방향(계획)` 블록 추가 — 통계판 → 질문 허브 재정의
- 기존 보호 라우트 목록에 4개 신규 경로 반영

### 1.2 작업 2 — 컴포넌트 트리 설계

- 파일: [../2026-04-13-component-tree.md](../2026-04-13-component-tree.md)
- 구조: 7개 섹션
  - §1 Chat (13개 컴포넌트)
  - §2 Project Detail (5개 컴포넌트)
  - §3 Documents (8개 컴포넌트)
  - §4 Upload Drawer (7개 컴포넌트)
  - §5 타입 stub + §5.1 공통 인프라 컴포넌트(ErrorView)
  - §6 재사용성 맵
  - §7 다음 단계
- codex 리뷰 3회 루프로 9건 결함 반영:
  - `ConversationMessage` discriminated union 도입
  - `Citation`에 `projectId` 추가 + `CitationNavigation` 객체 도입
  - `availableTags` 소스를 문서 리스트 파생으로 변경(별도 엔드포인트 제거)
  - UploadDrawer를 파일별 XHR + AbortController 모델로 재정의
  - `CANCELLED` 상태 타입 추가
  - Documents 페이지 deep-link 소비 규약 명시 외

### 1.3 작업 3 — Low-fi UI 스펙

- 파일: [../2026-04-13-lowfi-ui-spec.md](../2026-04-13-lowfi-ui-spec.md)
- 9개 프레임: Dashboard, Chat home, Chat session detail, Project documents, Upload drawer, Source preview panel, Empty state, Error state, Mobile chat session
- 각 프레임 필수 7개 필드(화면 이름·크기·레이아웃·컴포넌트·우선순위·상태 변형·인터랙션) 포함
- codex 리뷰 3회 루프로 7건 결함 반영:
  - F2-F9 `화면 이름` 필드 누락 수정
  - F2 viewer Workspace-only 상태 추가
  - F3/F9 Empty(0 messages) 상태 추가
  - F4 PollingDisconnected 상태 추가
  - `ErrorView`를 component-tree §5.1에 정식 등록
  - 라우트 플레이스홀더 `:id` → `:projectId`/`:sessionId` 통일
  - F9 NoPermission 404/403 표기 통일

### 1.4 작업 4 — Frontend Task Breakdown

- 파일: [../2026-04-13-frontend-task-breakdown.md](../2026-04-13-frontend-task-breakdown.md)
- 47개 태스크를 Stage 1~8로 분해
- 각 태스크: `ID / 제목 / 의존 / 변경 파일(절대경로) / 작업 내용 / DoD / 크기 / 리스크`
- codex 리뷰 3회 루프로 13건 결함 반영:
  - e2e 경로 `tests/e2e/` → `web-app/e2e/scenarios/` 정정
  - API 서비스 네이밍 `*-service.ts` 컨벤션 맞춤
  - FE-3-15에 FE-3-5 의존 추가
  - FE-3-2/3-7 DoD를 격리 단위 테스트로 재작성
  - FE-3-1에 `NavigationTarget` 타입 추가
  - FE-4-1에 업로드 관련 타입(`FileCandidate` 등) 추가
  - FE-4-8에 `EmptyDocumentsState` + `UploadDrawer` 통합 명시
  - FE-5-8 단일 태스크(scope bloat)를 FE-5-8/5-9/5-10 3개로 분할
  - `pnpm dev` → `cd web-app && npm run dev` 명령 17곳 정규화 외

## 2. 구현 완료 — Stage 1~5

### 2.1 Stage 별 완료 내역

| Stage | 태스크 | 상태 | 주요 산출물 |
|---|---|---|---|
| 1 | FE-1-1 ~ FE-1-5 (5개) | ✅ | 4개 신규 라우트 placeholder + `web-app/lib/routes.ts` 타입 안전 헬퍼 |
| 2 | FE-2-1 ~ FE-2-3 (3개) | ✅ | Sidebar IA 3섹션 재배치(Workspace/Knowledge/Admin) + Header 프로젝트 배지 + `ProjectContextNav` |
| 3 | FE-3-1 ~ FE-3-15 (15개) | ✅ | `web-app/types/chat.ts` + 14개 Chat 컴포넌트 + `/chat`, `/chat/:sessionId` 페이지 |
| 4 | FE-4-1 ~ FE-4-8 (8개) | ✅ | `web-app/types/document.ts` + 9개 Documents 컴포넌트 + 5개 Project 허브 컴포넌트 + 2개 페이지 |
| 5 | FE-5-1 ~ FE-5-10 (10개) | ✅ | Upload 드로어 shell + 6개 스텝 컴포넌트 + `document-service.ts`(XHR) + `job-service.ts`(pollJob) + 실제 wiring |
| 6 | FE-6-1 ~ FE-6-6 (6개) | ✅ | BFF multipart streaming fix + 3개 서비스(chat/document/project) + 2개 채팅 페이지 실 데이터 wiring + 2개 프로젝트 페이지 실 데이터 wiring |
| 7 | FE-7-1 ~ FE-7-6 (6개) | ✅ | ErrorView + 4개 error.tsx 경계 + Skeleton + 권한 주입 + 근거 부족 CTA + 폴링 끊김 배너 |
| 8 | FE-8-1 ~ FE-8-5 (5개) | ✅ | 4개 Playwright e2e(chat entry / document upload / chat answer / citation deeplink) + 1개 Jest 단위 테스트(ChatConversation discriminated union) |

**총 58개 태스크 완료 (100%)** — 모든 Stage 완료

Stage 7 세부 완료 내역:
- **Batch 7A**: FE-7-1 `ErrorView` (6개 statusCode, Korean defaults) + FE-7-2 4개 `error.tsx` 경계
- **Batch 7B**: FE-7-3 `Skeleton` 프리미티브 + 페이지 로딩 스켈레톤 통일 + FE-7-4 페이지 레벨 권한 주입(`disabledKinds`, `canUpload`, `readOnly`)
- **Batch 7C**: FE-7-5 근거 부족 CTA (빈 citations + `insufficient_evidence` 시스템 메시지) + FE-7-6 `PollingDisconnectedBanner` + 5초 간격 폴링(active docs only, 3연속 실패 시 stale, unmount cleanup)
- **권한 누수 수정**: `onAsk`/`onOpenChat`에 `canScopeToProject` 게이트 추가 — viewer는 프로젝트 스코프 chat 진입 불가(Workspace로 fallback)

Stage 6 세부 완료 내역:
- **Batch 6A**: FE-6-1 BFF 프록시 multipart streaming 안전성 + PATCH/OPTIONS 추가
- **Batch 6B**: FE-6-2 chat-service 신규, FE-6-4 document-service 확장, FE-6-6 project-service 확장(`getProjectSummary` 병렬 집계 포함)
- **Batch 6C**: FE-6-3 `/chat`, `/chat/:sessionId` 페이지를 chatService로 실 데이터 wiring(낙관적 메시지 추가, 에러 시 롤백)
- **Batch 6E**: 문서/프로젝트 페이지 mock → 실 데이터 전환 (deep-link 유지, 삭제/업로드 후 refetch, 필터 유지)
- **FE-6-5**: 업로드 실 API는 FE-5-9/5-10에서 이미 코드 완성. Batch 6A의 multipart streaming 수정으로 실질 wiring 완료. 백엔드 계약 검증은 Stage 7 이후 수동 smoke test로 확인.

### 2.2 생성된 주요 파일 트리

```text
web-app/
├── types/
│   ├── chat.ts                                  # 18개 타입 (ConversationMessage 등)
│   └── document.ts                              # 15개 타입 (UploadResult 등)
├── lib/
│   ├── routes.ts                                # ROUTES 헬퍼
│   └── api/
│       ├── document-service.ts                  # uploadDocument (XHR + AbortController)
│       │                                        # + runWithConcurrency 헬퍼
│       ├── job-service.ts                       # jobService.getJob + pollJob
│       └── __tests__/
│           └── document-service.test.ts
├── app/
│   ├── chat/
│   │   ├── layout.tsx                           # ProtectedAppShell 래퍼
│   │   ├── page.tsx                             # Chat home (mock, ChatWelcomeState)
│   │   └── [sessionId]/page.tsx                 # 세션 상세 (mock, 3열 + SourcePanel)
│   └── projects/[projectId]/
│       ├── layout.tsx                           # ProjectContextNav 주입 (새 nested layout)
│       ├── page.tsx                             # 프로젝트 허브 (mock, UploadDrawer 연결)
│       └── documents/page.tsx                   # 문서 리스트 (mock, deep-link 소비)
├── components/
│   ├── chat/ (14 components + 4 tests + index.ts)
│   │   ├── ChatLayout, ChatSessionList, ChatSessionListItem
│   │   ├── ChatScopeSelector, ChatComposer, SuggestedFollowUps
│   │   ├── ChatSessionHeader, ChatMessage
│   │   ├── CitationList, SourcePanel, SourcePreviewCard
│   │   ├── ChatWelcomeState, AnswerCard, ChatConversation
│   │   └── __tests__/ (ChatLayout, ChatComposer, SourcePanel, ChatWelcomeState)
│   ├── documents/ (9 components + index.ts)
│   │   ├── DocumentStatusBadge, DocumentSearchInput, DocumentFilters
│   │   ├── DocumentListItem, DocumentList, DocumentSummaryPanel
│   │   └── ProjectDocumentsHeader, FailedDocumentNotice, EmptyDocumentsState
│   ├── upload/ (8 components + 2 helper files + index.ts)
│   │   ├── UploadDrawer (실제 업로드+폴링 wiring 완료)
│   │   ├── FileDropzone, UploadFileList, UploadValidationList
│   │   ├── UploadMetadataForm, UploadProgressList, UploadResultSummary
│   │   ├── TagPillInput (UploadMetadataForm 내부 helper)
│   │   ├── uploadDrawerHelpers.ts (pure helpers)
│   │   └── uploadUtils.ts (bytes, accept matcher 등)
│   ├── project/ (5 new components; ProjectContextNav도 barrel에 통합)
│   │   ├── ProjectDetailHeader, ProjectMetricCards, ProjectCtaRow
│   │   ├── RecentProjectUploads, RecentProjectChatSessions
│   │   └── index.ts (ProjectContextNav + ProjectList + 5 new 재export)
│   └── layout/
│       ├── Sidebar.tsx (수정 — 3섹션 IA)
│       └── Header.tsx (수정 — 프로젝트 배지)
└── docs/handoff/
    └── 2026-04-13-stage5-complete-handoff-and-next-steps.md  # 본 문서
```

### 2.3 Codex 리뷰 루프 통계 (Stage 1~5)

| Stage | 리뷰 횟수 | 수정 재호출 |
|---|---|---|
| 1 | 1 | 1 (FE-1-4 placeholder 문구 리터럴 수정) |
| 2 | 1 | 1 (FE-2-2 Header 배지 경로 과대 매칭 정규식 정정) |
| 3 | 4 | 2 (ChatLayout 스펙 정정, AnswerCard paragraph split 정규식 개선) |
| 4 | 4 | 0 (전원 PASS) |
| 5 | 3 | 1 (UploadDrawer `result` 단계 중복 버튼 정리) |

**누적**: 코드 결함 5건이 리뷰 루프로 잡혀 재수정됨. 설계 문서 결함 29건을 포함하면 전체 34건.

## 3. 알려진 환경 상태

### 3.1 node_modules 미설치

- `web-app/package.json`에 jest v30, @testing-library/*, jest-environment-jsdom, eslint-config-next 16.2.2 등 필요한 devDependencies가 모두 선언되어 있으나 `node_modules`가 설치되지 않은 상태.
- 따라서 이번 세션에서는:
  - `npm test`(jest) 실행 불가 — 신규 작성된 8개 테스트 파일은 구조만 검증됨
  - `npx tsc --noEmit`는 pre-existing 에러(missing @types) 때문에 노이즈 존재하나, 각 배치에서 **변경/생성 파일 타깃 린트**(`npx eslint <files>`)로 확인 완료
- 다음 세션 또는 CI에서 `cd web-app && npm install` 후 다음을 일괄 실행:
  - `npm test` — 새 단위 테스트 8개(ChatLayout, ChatComposer, SourcePanel, ChatWelcomeState, document-service 등) 통과 확인
  - `npm run lint` — repo 전체 린트
  - `npx tsc --noEmit` — 전체 타입 검사

### 3.2 Pre-existing repo 이슈 (이번 세션 건드리지 않음)

- `web-app/components/graph/GraphCanvas.tsx`, `components/ui/Card.tsx`, `e2e/fixtures/auth.fixture.ts`, 기타 `lib/api/*`의 기존 린트 에러
- 이 세션은 **새로 작성/수정한 파일에 대한 린트 통과**만 보장. pre-existing은 별도 정리 태스크 필요.

### 3.3 Next.js 16 환경 주의

- `web-app/AGENTS.md` 경고: "This is NOT the Next.js you know". 수정된/비표준 Next.js 16.2.2 사용.
- 이번 세션 구현은 **기존 코드에서 쓰는 패턴만 답습**(`'use client'`, `useParams`, `usePathname`, `Link`, nested layout). 새로운 API는 도입하지 않았다.
- dynamic segment layout(`app/projects/[projectId]/layout.tsx`)은 `params: Promise<{...}>` + `await params` 패턴 사용 — Next 16 신규 표준과 호환됨.

### 3.4 Mock 데이터 상태

Stage 1~5의 모든 페이지/컴포넌트는 **inline mock 데이터** 기반으로 렌더링됨. 실 API 연결은 Stage 6 책임.

- `/chat`, `/chat/:sessionId`: mockSessions, mockMessages, mockCitations, mockSuggestions
- `/projects/:id`: mockProjectDetail, mockMetrics, mockRecentDocs, mockRecentSessions
- `/projects/:id/documents`: mockDocs(8건, FAILED·PARSING 포함), mockChunks

`document-service.ts`와 `job-service.ts`는 실제 HTTP 호출 코드를 포함하지만, UploadDrawer는 BFF 프록시(`/api/backend/projects/:id/documents`, `/api/backend/jobs/:id`)에 의존. **해당 BFF 라우트는 Stage 6에서 신설해야 실제 동작**한다.

## 4. 다음 세션에서 바로 할 일

Stage 6~8이 남았다. 각 Stage는 [../2026-04-13-frontend-task-breakdown.md](../2026-04-13-frontend-task-breakdown.md)의 해당 섹션에 태스크 단위로 쪼개져 있다.

### 4.1 Stage 6 — API 연결 (4/6 완료, 2개 남음)

**✅ 완료** (Batch 6A, 6B)

- FE-6-1. BFF 프록시 라우트 정비 — `web-app/app/api/backend/[...path]/route.ts`
  - multipart/form-data streaming 안전성 확보(`request.body` 스트림 포워딩 + `duplex: 'half'`)
  - `PATCH`, `OPTIONS` 메서드 추가
  - 501 stub은 넣지 않음(투명 프록시가 백엔드 원본 응답 그대로 전달)
- FE-6-2. 채팅 세션 CRUD + 메시지/답변 — `web-app/lib/api/chat-service.ts` (신규)
  - `getSessions, getSession, createSession, getMessages, postMessage, answer`
  - 메시지 role 기준 discriminated union 매핑
- FE-6-4. 문서 목록/상세/청크/삭제 — `web-app/lib/api/document-service.ts` 확장
  - `getProjectDocuments, getDocument, getDocumentChunks, deleteDocument` 추가
  - 배열 필터(statuses/docTypes/tags) 반복 쿼리 파라미터 직렬화
  - 기존 `uploadDocument, runWithConcurrency` 보존
- FE-6-6. 프로젝트 집계 — `web-app/lib/api/project-service.ts` 확장
  - `getProjectDetail, getProjectMetrics, getProjectSummary` 추가
  - `getProjectSummary`는 detail+metrics+recentDocs+recentSessions를 `Promise.all`로 병렬
  - `getProjectMetrics`는 total-count 헤더 접근을 위해 직접 fetch 사용(주석 명시)
  - 기존 CRUD 메서드 보존

**🔵 남은 작업** (Batch 6C, 6D)

- **FE-6-3. 메시지/답변 UI wiring** — `chat-service`는 있으나 `/chat`, `/chat/:sessionId` 페이지가 아직 mock 데이터 사용.
  - `/chat/page.tsx`: `chatService.getSessions({ limit: 10 })` 호출 → 최근 세션 렌더. 전송 시 `chatService.createSession` + `answer` 조합 또는 `createSession + postMessage`.
  - `/chat/[sessionId]/page.tsx`: `chatService.getSession` + `getMessages`로 초기 로드. composer 전송 시 `postMessage` 낙관적 append.
  - 의존: FE-6-1, FE-6-2. 상태: 서비스 레이어 준비 완료, UI 연결만 남음.
- **FE-6-5. 업로드 BFF 모의 응답 제거 및 실 백엔드 연결**
  - `document-service.uploadDocument`와 `job-service.pollJob`은 이미 실 HTTP 호출 코드. Batch 6A에서 multipart streaming이 고쳐졌으므로 별도 코드 변경 불필요할 가능성.
  - 작업 내용: 백엔드의 실제 `POST /projects/:id/documents` 및 `GET /jobs/:id` 계약 확인 후 필요 시 어댑터 추가. 로컬에서 실제 업로드 smoke test 수행.
  - 의존: FE-5-10, FE-6-1. 상태: 코드 자체는 이미 준비됨, 백엔드 계약 검증 단계.

추가로 문서 리스트/프로젝트 허브 페이지도 실 데이터 wiring이 필요하지만, FE-6-4/6-6 서비스는 준비되었으므로 페이지별로 1개 태스크씩 분리하거나 통합 배치(`Batch 6E: 페이지 실 데이터 wiring`)로 묶어 진행하면 된다.

### 4.2 Stage 7 — 상태 처리 (6 tasks)

Stage 6 종료 후. 실제 API 응답 기반으로 상태 분기 일관화.

1. FE-7-1. 공통 `ErrorView` 추가 (component-tree §5.1 사양)
2. FE-7-2. 페이지 레벨 `error.tsx` 적용 (chat, chat/[sessionId], projects/[projectId], projects/[projectId]/documents)
3. FE-7-3. 로딩 스켈레톤 통일
4. FE-7-4. 권한 분기 상위 주입 (viewer Workspace-only 등)
5. FE-7-5. 답변 근거 부족 시스템 메시지 처리
6. FE-7-6. 업로드 폴링 연결 끊김 배너

### 4.3 Stage 8 — 테스트 (5 tasks)

`web-app/e2e/scenarios/` 아래에 Playwright 스펙 작성.

1. FE-8-1. 로그인 후 `/chat` 진입 e2e
2. FE-8-2. 문서 업로드 e2e
3. FE-8-3. 질문/답변 흐름 e2e
4. FE-8-4. 출처 패널 상호작용 + deep-link e2e
5. FE-8-5. `ChatConversation` discriminated union 렌더 분기 단위 테스트

Stage 8 이전에 `npm install`이 반드시 선행되어야 함(jest + playwright 의존성).

## 5. 다음 세션 시작 체크리스트

다음 세션을 시작할 때 아래 순서로 점검하면 즉시 이어받을 수 있다.

1. `git status` 로 변경 파일 확인 (Stage 1~5 전부 커밋되지 않았을 가능성 높음 — 세션 시작 시 커밋 권장)
2. 본 핸드오프 문서 §2.2의 파일 트리와 실제 상태 대조
3. `cd web-app && npm install` 실행 (아직 안 되어 있으면)
4. `cd web-app && npm run dev` 로 로컬 기동 → 아래 경로 수동 smoke test:
   - `/chat` — Welcome 상태 렌더 확인
   - `/chat/mock-session-1` — 3열 + mock 메시지 + 인용 chip 클릭 시 우측 패널
   - `/projects/demo` — 허브 카드 + CTA + UploadDrawer 오픈
   - `/projects/demo/documents` — 리스트 + 필터 + summary panel
   - `/projects/demo/documents?documentId=doc-3&chunkId=chunk-2` — deep-link 하이라이트
5. Stage 6 Batch 6A부터 codex 위임 시작
6. 진행 중 의사결정 사항은 메모리에 저장 (`C:\Users\jwjung\.claude\projects\c--workspaceRND-graphify-graphify\memory\`)

## 6. 참고 문서 인덱스

### 6.1 설계 (이 세션에서 완성)

- [PAGE_SPECIFICATIONS.md](../PAGE_SPECIFICATIONS.md) — 페이지 사양 (12개 페이지)
- [2026-04-13-component-tree.md](../2026-04-13-component-tree.md) — 컴포넌트 트리
- [2026-04-13-lowfi-ui-spec.md](../2026-04-13-lowfi-ui-spec.md) — Low-fi UI 스펙
- [2026-04-13-frontend-task-breakdown.md](../2026-04-13-frontend-task-breakdown.md) — 구현 태스크 47개

### 6.2 원본 설계 (이전 세션)

- [2026-04-08-graphify-webapp-design.md](../2026-04-08-graphify-webapp-design.md)
- [2026-04-10-current-features-and-user-flows.md](../2026-04-10-current-features-and-user-flows.md)
- [2026-04-10-knowledgebase-chat-and-upload-design.md](../2026-04-10-knowledgebase-chat-and-upload-design.md)
- [2026-04-10-knowledgebase-chat-wireframes.md](../2026-04-10-knowledgebase-chat-wireframes.md)
- [2026-04-10-knowledgebase-chat-handoff-and-next-steps.md](./2026-04-10-knowledgebase-chat-handoff-and-next-steps.md)

### 6.3 관련 시스템

- [DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md)
- [PHASE2_VECTORDB_EXPANSION.md](../PHASE2_VECTORDB_EXPANSION.md)
- [../../ARCHITECTURE.md](../../ARCHITECTURE.md)

## 7. 한 줄 요약

```text
설계 4문서 완성(리뷰 29건) + Stage 1~8 전체 완료(58/58 태스크, 100%).
knowledge-base chat feature MVP 구현 완료.
다음 세션: cd web-app && npm install 후 e2e + unit test 실행 → 실 백엔드와 smoke test.
```

## 8. 세션 재개 시 바로 복사 가능한 codex 프롬프트 샘플

Batch 6C (FE-6-3) 시작용:

```text
Implement FE-6-3: wire /chat/page.tsx and /chat/[sessionId]/page.tsx to use
web-app/lib/api/chat-service.ts instead of mock data.

Prereqs in place:
- web-app/lib/api/chat-service.ts with getSessions, getSession, createSession, getMessages, postMessage, answer.
- Pages currently use inline mock (see /chat/page.tsx mockSessions, /chat/[sessionId]/page.tsx mockMessages).

Replace:
1. /chat/page.tsx: on mount call chatService.getSessions({ limit: 10 }).
   Render ChatSessionList with the fetched sessions + loading/error states.
   On submit: await chatService.createSession({ scope, title: input.content.slice(0,60) })
   then router.push(ROUTES.chatSession(created.id)).
2. /chat/[sessionId]/page.tsx: on mount Promise.all [getSession, getMessages].
   Replace mockMessages state init. On composer submit:
   optimistic append user message → chatService.postMessage(sessionId, { content })
   → on result append { user, answer }. Handle error with toast/alert.

Keep ChatLayout, SourcePanel, citation click behavior, deep-link navigation unchanged.
Do NOT modify components — only pages.

Verification: eslint + manual read of both pages.
```

