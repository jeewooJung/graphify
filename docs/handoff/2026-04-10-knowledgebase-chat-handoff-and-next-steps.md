# Graphify 지식베이스 채팅 기능 핸드오프 및 다음 작업

작성일: 2026-04-10
문서 목적: 다음 세션에서 바로 작업을 이어갈 수 있도록 지금까지의 결정 사항을 간결하게 정리하고, 바로 실행할 다음 작업을 구체적인 문서 형태로 남긴다.

## 1. 현재까지 작업한 내용 요약

### 1.1 현재 앱 구현 상태

현재 앱에는 아래가 이미 구현되어 있다.

- 로그인, 로그아웃, 세션 유지
- 보호 라우트와 비로그인 사용자 리다이렉트
- 로그인 사용자 정보 표시
- 공통 앱 셸과 사이드바
- 프로젝트, 팀, 권한 조회
- 메타데이터 기반 검색
- 그래프 화면 기본 UI
- 실제 백엔드 API 연동
- 시드 데이터 기반 로그인 및 조회
- e2e 로그인/기본 UI 테스트

### 1.2 이번 설계 작업에서 새로 정리한 방향

앱의 핵심 방향을 아래처럼 재정의했다.

```text
지식베이스 문서 업로드 -> 분석 -> 검색/질문 -> 근거 포함 답변 -> 출처 검증 -> 후속 질문
```

핵심 결정은 아래와 같다.

- 이 앱의 중심 기능은 `지식베이스 기반 채팅/답변`이다.
- 문서 업로드는 전역 기능이 아니라 `프로젝트 문맥 안의 작업`이다.
- `Chat`은 사이드바의 최상위 메뉴여야 한다.
- `Dashboard`는 통계판이 아니라 질문 시작 허브여야 한다.
- 답변은 항상 근거와 출처를 동반해야 한다.
- 권한 없는 문서는 검색과 답변에 포함되면 안 된다.

### 1.3 이미 작성된 관련 문서

- [현재 구현 기능과 사용자 흐름](/mnt/c/workspaceRND/graphify/graphify/docs/2026-04-10-current-features-and-user-flows.md#L1)
- [현재 페이지 사양](/mnt/c/workspaceRND/graphify/graphify/docs/PAGE_SPECIFICATIONS.md#L1)
- [지식베이스 채팅/업로드 기능 설계](/mnt/c/workspaceRND/graphify/graphify/docs/2026-04-10-knowledgebase-chat-and-upload-design.md#L1)
- [지식베이스 채팅/업로드 화면 와이어프레임](/mnt/c/workspaceRND/graphify/graphify/docs/2026-04-10-knowledgebase-chat-wireframes.md#L1)

## 2. 이번 설계에서 확정한 핵심 구조

### 2.1 추천 라우트

- `/dashboard`
- `/chat`
- `/chat/:sessionId`
- `/search`
- `/projects`
- `/projects/:projectId`
- `/projects/:projectId/documents`
- `/graphs`
- `/team`
- `/permissions`

### 2.2 추천 사이드바 정보 구조

```text
Workspace
- Dashboard
- Chat
- Search
- Graphs

Knowledge
- Projects

Admin
- Team
- Permissions
```

### 2.3 핵심 화면

- Dashboard
- Chat home
- Chat session detail
- Project documents
- Upload drawer
- Source preview panel

### 2.4 핵심 사용자 흐름

```text
1. 로그인
2. Dashboard에서 질문 시작 또는 프로젝트 진입
3. Project Documents에서 문서 업로드
4. 업로드 상태 확인
5. Chat에서 질문
6. 답변 + 출처 확인
7. 후속 질문
```

## 3. 다음에 바로 해야 할 작업

아래 4가지는 다음 세션의 직접적인 작업 항목이다.

1. `PAGE_SPECIFICATIONS.md`에 실제 신규 페이지 사양 반영
2. `Chat`, `Documents`, `Upload Drawer` 컴포넌트 트리 설계
3. Figma로 옮길 수 있는 수준의 `low-fi UI spec` 작성
4. 구현 착수용 `frontend task breakdown` 작성

## 4. 다음 작업 문서화

## 4.1 `PAGE_SPECIFICATIONS.md` 업데이트 계획

### 목적

현재 `PAGE_SPECIFICATIONS.md`는 기존 구현 화면 기준이다. 여기에 신규 기능을 반영해 실제 제품 사양 문서로 갱신해야 한다.

### 반영해야 할 신규 페이지

- `/chat`
- `/chat/:sessionId`
- `/projects/:projectId`
- `/projects/:projectId/documents`

### 각 페이지에 반드시 들어가야 할 항목

- 경로
- 접근 권한
- 화면 목적
- 주요 UI 구성
- 데이터 소스
- 주요 액션
- 사용자 흐름
- 빈 상태
- 로딩 상태
- 오류 상태
- 권한 예외

### 페이지별 핵심 반영 포인트

#### `/chat`

- 세션이 없는 상태에서 새 질문을 시작하는 화면
- 범위 선택과 첫 질문 입력이 핵심
- 최근 세션 목록과 추천 질문 포함

#### `/chat/:sessionId`

- 실제 질문/답변 진행 화면
- 답변, 출처, 후속 질문 흐름이 핵심
- 세션 범위 유지와 출처 패널이 중요

#### `/projects/:projectId`

- 프로젝트 개요 화면
- 프로젝트 설명, 문서 수, 최근 업로드 상태, `Ask this project`, `Open documents` 진입점 포함

#### `/projects/:projectId/documents`

- 문서 관리 화면
- 업로드, 상태 확인, 실패 복구, 문서 검색이 핵심

### 기대 결과물

`PAGE_SPECIFICATIONS.md`만 봐도 채팅/문서 기능의 페이지 역할과 사용자 흐름을 이해할 수 있는 상태

## 4.2 컴포넌트 트리 설계 문서 작성 계획

### 목적

화면 설계가 실제 구현으로 넘어가려면 페이지를 어떤 컴포넌트로 쪼갤지 먼저 정리해야 한다.

### 우선 설계 대상

- `Chat`
- `Documents`
- `Upload Drawer`

### 추천 컴포넌트 분해

#### Chat

```text
app/chat/page.tsx
app/chat/[sessionId]/page.tsx

components/chat/
- ChatLayout
- ChatSessionList
- ChatSessionListItem
- ChatComposer
- ChatScopeSelector
- ChatWelcomeState
- ChatConversation
- ChatMessage
- AnswerCard
- CitationList
- SuggestedFollowUps
- SourcePanel
- SourcePreviewCard
```

#### Documents

```text
app/projects/[projectId]/documents/page.tsx

components/documents/
- ProjectDocumentsHeader
- DocumentFilters
- DocumentSearchInput
- DocumentList
- DocumentListItem
- DocumentStatusBadge
- DocumentSummaryPanel
- EmptyDocumentsState
- FailedDocumentNotice
```

#### Upload Drawer

```text
components/upload/
- UploadDrawer
- FileDropzone
- UploadFileList
- UploadMetadataForm
- UploadValidationList
- UploadProgressList
- UploadResultSummary
```

### 각 컴포넌트 문서에 들어가야 할 내용

- 역할
- props
- 내부 상태
- 외부 의존 데이터
- 이벤트
- 재사용 가능성

### 기대 결과물

프런트엔드 구현 전에 파일 구조와 책임 분리가 명확해진 상태

## 4.3 Figma용 low-fi UI spec 작성 계획

### 목적

지금 있는 텍스트 와이어프레임을 Figma에 바로 옮길 수 있는 수준의 스펙으로 정리해야 한다.

### 문서에 포함할 항목

- 화면 이름
- 프레임 크기
- 레이아웃 구조
- 주요 컴포넌트 목록
- 영역별 우선순위
- 상태별 변형
- 인터랙션 메모

### 최소 필요 프레임

- Dashboard
- Chat home
- Chat session detail
- Project documents
- Upload drawer
- Source preview panel
- Empty state
- Error state
- Mobile chat session

### 프레임별 예시 스펙

#### Chat session detail

- 데스크톱 3열 구조
- 좌측 세션 목록
- 중앙 대화 영역
- 우측 출처 패널
- 하단 follow-up composer
- 정상 답변, 근거 부족, 오류 3개 상태 포함

#### Project documents

- 상단 프로젝트 헤더
- 업로드 CTA
- 문서 필터
- 문서 리스트
- 우측 요약 패널

### 기대 결과물

디자이너나 프런트엔드가 별도 해석 없이 low-fi 레이아웃을 재현할 수 있는 상태

## 4.4 frontend task breakdown 작성 계획

### 목적

설계 문서를 실제 구현 태스크로 쪼개서 개발 순서를 정한다.

### 작업 분해 기준

- 라우트 단위
- 컴포넌트 단위
- API 연동 단위
- 상태 처리 단위
- 테스트 단위

### 추천 작업 순서

#### 1단계. 라우트 골격 추가

- `/chat`
- `/chat/[sessionId]`
- `/projects/[projectId]`
- `/projects/[projectId]/documents`

#### 2단계. 앱 셸 정리

- 사이드바에 `Chat` 추가
- 헤더에 현재 범위 표시
- 프로젝트 문맥 액션 추가

#### 3단계. Chat UI 골격

- 세션 목록
- 채팅 빈 상태
- 대화 영역
- 답변 카드
- 출처 패널

#### 4단계. Documents UI 골격

- 문서 리스트
- 상태 배지
- 문서 필터
- 빈 상태
- 실패 상태

#### 5단계. Upload Drawer

- 파일 드롭존
- 메타데이터 폼
- 업로드 진행 상태
- 업로드 완료/실패 상태

#### 6단계. API 연결

- 채팅 세션 목록
- 메시지 목록
- 답변 요청
- 문서 목록
- 문서 업로드
- 작업 상태 조회

#### 7단계. 상태 처리

- empty
- loading
- error
- no permission
- insufficient evidence

#### 8단계. 테스트

- 로그인 후 chat 진입 e2e
- 문서 업로드 e2e
- 질문/답변 e2e
- 출처 패널 상호작용 e2e

### 기대 결과물

이슈 트래커에 바로 옮길 수 있는 구현 단위 태스크 목록

## 5. 다음 세션에서 바로 시작할 추천 순서

다음 세션에서는 아래 순서가 가장 효율적이다.

1. `PAGE_SPECIFICATIONS.md` 확장
2. 컴포넌트 트리 설계 문서 작성
3. low-fi UI spec 문서 작성
4. frontend task breakdown 문서 작성

이 순서가 맞는 이유는 아래와 같다.

- 페이지 역할이 먼저 정리돼야 컴포넌트를 안정적으로 쪼갤 수 있다.
- 컴포넌트가 정리돼야 Figma용 화면 구조가 흔들리지 않는다.
- UI spec이 있어야 구현 태스크를 정확히 쪼갤 수 있다.

## 6. 한 줄 요약

다음 세션의 목표는 아래다.

```text
채팅/문서 업로드 기능의 설계를 페이지 사양 -> 컴포넌트 구조 -> low-fi UI spec -> 구현 태스크 순서로 구체화한다.
```
