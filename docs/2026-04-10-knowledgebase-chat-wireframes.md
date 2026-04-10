# Graphify 지식베이스 채팅/답변 및 문서 업로드 화면 와이어프레임

작성일: 2026-04-10
기준 문서: `docs/2026-04-10-knowledgebase-chat-and-upload-design.md`
문서 목적: 지식베이스 기반 채팅/답변과 파일 업로드 기능을 실제 화면 단위로 풀어낸다. 각 화면의 목적, 진입점, 핵심 유스케이스, 정보 구조, 상호작용, 상태를 상세히 정의한다.

## 1. 문서 범위

이 문서는 아래 기능의 화면 설계를 다룬다.

- 지식베이스 채팅
- 답변 근거 확인
- 파일 업로드
- 업로드 상태 확인
- 프로젝트 문서 관리
- 검색에서 채팅으로 이어지는 흐름

이 문서는 시각 스타일 가이드가 아니라 제품 와이어프레임 문서다. 따라서 색, 그림자, 브랜딩보다 아래 요소를 우선한다.

- 사용자가 어떤 화면에서 무엇을 할 수 있는가
- 어떤 정보를 먼저 봐야 하는가
- 어떤 액션이 다음 단계로 이어지는가
- 어떤 상태와 오류를 처리해야 하는가

## 2. 제품 방향

핵심 사용자 루프는 아래다.

```text
문서 업로드 -> 분석 대기/완료 확인 -> 질문 -> 답변 확인 -> 출처 검증 -> 후속 질문
```

현재 앱 기준으로 보면 대시보드는 시작 화면, 검색은 탐색 화면, 프로젝트는 관리 화면 역할을 가진다. 여기에 채팅과 문서 업로드가 들어오면 정보 구조는 아래처럼 재정리되어야 한다.

- `Dashboard`: 시작점
- `Chat`: 질문과 답변의 중심 화면
- `Search`: 키워드 탐색과 결과 검토
- `Projects`: 프로젝트 목록
- `Project Documents`: 프로젝트별 문서 관리
- `Graphs`: 관계 탐색
- `Team`, `Permissions`: 운영 관리

## 3. 권장 정보 구조

### 3.1 사이드바 구조

권장 구조는 아래다.

```text
Workspace
- Dashboard
- Chat
- Search
- Graphs

Knowledge
- Projects
  - Project detail
  - Documents

Admin
- Team
- Permissions
```

핵심 변화는 아래 두 가지다.

1. `Chat`을 최상위 1차 메뉴로 올린다.
2. 문서 업로드는 전역 메뉴가 아니라 `프로젝트 컨텍스트 안의 작업`으로 둔다.

이 구조가 맞는 이유는 아래와 같다.

- 질문/답변은 앱의 핵심 가치이므로 별도 화면이어야 한다.
- 문서는 특정 프로젝트 문맥 안에서 권한과 의미를 가진다.
- 업로드 후 질문은 대부분 같은 프로젝트 안에서 이어진다.

### 3.2 추천 라우트

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

## 4. 화면 목록

이 문서에서 다루는 핵심 화면은 아래 7개다.

1. 공통 앱 셸
2. 대시보드
3. 채팅 홈
4. 채팅 세션 상세
5. 프로젝트 문서 관리
6. 문서 업로드 드로어
7. 출처 미리보기 패널

보조 화면으로 검색 연계 패턴과 모바일 변형도 함께 다룬다.

## 5. 공통 앱 셸

### 5.1 화면 목적

모든 로그인 사용자가 공통적으로 사용하는 프레임이다. 사용자는 이 셸을 통해 자신이 누구인지, 어느 워크스페이스에 있는지, 현재 어떤 화면에 있는지, 어디로 이동할 수 있는지 즉시 이해해야 한다.

### 5.2 주요 유스케이스

- UC-03 프로젝트 범위 질문 진입
- UC-04 워크스페이스 범위 질문 진입
- UC-01 문서 업로드 진입
- UC-06 답변 출처 검증을 위한 프로젝트 문서 화면 이동

### 5.3 핵심 요구사항

- 로그인 사용자 이름, 이메일, 역할을 상단 프로필 영역에 노출
- `Chat`을 빠른 진입 메뉴로 제공
- 현재 프로젝트 문맥이 있을 때는 그 정보를 헤더에 표시
- 헤더에서 전역 검색 또는 빠른 질문 진입 제공

### 5.4 와이어프레임

```text
+--------------------------------------------------------------------------------------------------+
| Sidebar                              | Top bar                                                   |
|--------------------------------------|-----------------------------------------------------------|
| User card                            | Breadcrumb / Current scope / Global actions               |
| - avatar                             |-----------------------------------------------------------|
| - name                               | Page content                                              |
| - email                              |                                                           |
| - role                               |                                                           |
|                                      |                                                           |
| Workspace                            |                                                           |
| - Dashboard                          |                                                           |
| - Chat                               |                                                           |
| - Search                             |                                                           |
| - Graphs                             |                                                           |
|                                      |                                                           |
| Knowledge                            |                                                           |
| - Projects                           |                                                           |
|                                      |                                                           |
| Admin                                |                                                           |
| - Team                               |                                                           |
| - Permissions                        |                                                           |
|                                      |                                                           |
| Current workspace / project context  |                                                           |
+--------------------------------------------------------------------------------------------------+
```

### 5.5 영역 설명

- `User card`: 로그인 유저 이름, 이메일, 역할, 현재 워크스페이스 이름
- `Primary nav`: Dashboard, Chat, Search, Graphs
- `Secondary nav`: Projects, Team, Permissions
- `Top bar`: 현재 화면 제목, 현재 범위, 새 질문, 업로드, 알림, 로그아웃

### 5.6 상호작용 규칙

- `Chat` 클릭 시 최근 세션이 있으면 마지막 세션으로, 없으면 `/chat` 빈 상태로 이동
- `Projects/:projectId/documents`에 들어가 있으면 헤더에 현재 프로젝트명과 업로드 버튼 표시
- 모바일에서는 사이드바가 오버레이로 열리며, 채팅 화면에서는 좌측 세션 목록이 하단 시트로 대체된다

## 6. 대시보드

### 6.1 화면 목적

대시보드는 더 이상 통계 카드 중심의 리포트 화면이 아니다. 이 화면의 역할은 사용자가 지금 바로 질문하거나, 최근 업로드 상태를 확인하거나, 최근 작업으로 재진입하는 시작 허브가 되는 것이다.

### 6.2 대표 유스케이스

- 로그인 직후 빠르게 질문 시작
- 최근 업로드한 문서 처리 상태 확인
- 직전에 하던 채팅 세션 재개
- 최근 프로젝트 문서 관리 화면으로 이동

### 6.3 진입점

- 로그인 성공 후 기본 진입
- 루트 `/` 자동 리다이렉트

### 6.4 권장 화면 구성

```text
+----------------------------------------------------------------------------------------------+
| Welcome block                                                                                |
| "무엇을 찾고 있나요?"                                                                        |
| [ Ask Graphify...                                              ] [Ask]                       |
| Scope chips: [Current project] [Workspace] [Recent docs]                                    |
|------------------------------------------------------------------------------------------------
| Recent chat sessions                    | Upload queue                                        |
| - Architecture decisions                | - handbook.pdf     RUNNING 64%                     |
| - Permission changes                    | - ops-guide.docx   COMPLETED                       |
| - Team onboarding                       | - policy.pdf       FAILED Retry                    |
|------------------------------------------------------------------------------------------------
| Recent projects                         | Suggested actions                                   |
| - Company Knowledge Graph               | - Upload new document                               |
| - Product Architecture                  | - Ask about latest policy                           |
| - Security Operations                   | - Review failed ingestion                           |
+----------------------------------------------------------------------------------------------+
```

### 6.5 주요 컴포넌트

- `Hero question composer`
- `Scope selector chips`
- `Recent sessions list`
- `Upload queue card`
- `Recent projects card`
- `Suggested actions card`

### 6.6 상태 정의

- `empty`: 최근 세션과 업로드가 없으면 "문서를 올리고 첫 질문을 시작하세요"
- `loading`: 최근 세션, 업로드 큐, 최근 프로젝트 skeleton
- `error`: 일부 카드 실패 시 카드 단위 에러와 재시도

### 6.7 왜 이런 구성이 필요한가

현재 대시보드는 샘플 통계 위주라서 핵심 가치와 거리가 있다. 채팅과 업로드가 핵심이라면 대시보드는 아래 두 질문에 답해야 한다.

- 지금 무엇을 질문할 수 있는가
- 방금 올린 문서는 언제 답변에 반영되는가

## 7. 채팅 홈 `/chat`

### 7.1 화면 목적

아직 특정 세션이 없을 때 질문을 시작하는 화면이다. 사용자가 범위를 정하고 첫 질문을 던지도록 돕는 데 집중한다.

### 7.2 대표 유스케이스

- UC-03 프로젝트 범위 질문 시작
- UC-04 워크스페이스 범위 질문 시작
- 검색 결과 없이 자연어 질문으로 바로 진입

### 7.3 진입점

- 사이드바 `Chat`
- 대시보드의 `Ask Graphify...`
- 검색 결과 카드의 `Ask about this`

### 7.4 화면 와이어프레임

```text
+------------------------------------------------------------------------------------------------------+
| Sessions                         | Chat start                                                        |
|----------------------------------|-------------------------------------------------------------------|
| New chat                         | Welcome to Graphify                                               |
|----------------------------------| Ask questions grounded in your project documents.                |
| Today                            |                                                                   |
| - Architecture rationale         | Scope                                                             |
| - Release checklist              | [ Workspace v ] [ Project: Company KG v ]                        |
|----------------------------------|                                                                   |
| Earlier                          | Prompt box                                                        |
| - Team onboarding                | [ Ask a question about your docs...                        ]      |
| - Permissions review             |                                                                   |
|                                  | Suggested prompts                                                 |
|                                  | - Summarize latest architecture decisions                         |
|                                  | - Show deployment steps from uploaded runbooks                    |
|                                  | - What changed in permissions this week?                          |
|                                  |                                                                   |
|                                  | Recent sources                                                    |
|                                  | - policy.pdf                                                      |
|                                  | - architecture-review.md                                          |
+------------------------------------------------------------------------------------------------------+
```

### 7.5 영역 설명

- `Left rail`: 최근 세션 목록
- `Scope selector`: 워크스페이스, 프로젝트, 팀
- `Prompt composer`: 첫 질문 입력
- `Suggested prompts`: 빈 상태에서 사용자가 바로 시작하도록 돕는 템플릿
- `Recent sources`: 최근 업로드 또는 최근 인용 문서

### 7.6 주요 상호작용

- 질문 입력 후 `Enter` 또는 `Ask` 클릭 시 새 세션 생성 후 `/chat/:sessionId` 이동
- 프로젝트를 먼저 선택하면 그 프로젝트 문서만 검색 범위에 포함
- 프로젝트에 문서가 하나도 없으면 업로드 CTA를 노출

### 7.7 상태 정의

- `empty workspace`: 문서가 없는 경우, "Upload documents to start grounded answers"
- `no permission`: 접근 가능한 프로젝트가 없으면 관리자 문의 메시지
- `recent sessions available`: 좌측 세션 목록 노출

## 8. 채팅 세션 상세 `/chat/:sessionId`

### 8.1 화면 목적

실제 질문, 답변, 후속 질문, 출처 검증이 일어나는 중심 화면이다. 이 앱의 핵심 가치는 여기서 드러나야 한다.

### 8.2 대표 유스케이스

- UC-03 프로젝트 범위 질문
- UC-05 후속 질문
- UC-06 답변 출처 검증

### 8.3 핵심 UX 원칙

- 답변은 항상 근거와 함께 보여야 한다.
- 출처는 별도 패널에서 바로 검증 가능해야 한다.
- 사용자는 답변 실패 이유도 이해할 수 있어야 한다.
- 질문 범위는 세션 안에서 명확히 유지되어야 한다.

### 8.4 화면 와이어프레임

```text
+------------------------------------------------------------------------------------------------------------------+
| Session list                  | Conversation                                              | Sources panel           |
|------------------------------|-----------------------------------------------------------|-------------------------|
| New chat                     | Session title: Architecture decision summary              | Source 1                |
| Today                        | Scope: Project / Company Knowledge Graph                  | architecture.md         |
| - Architecture rationale     |-----------------------------------------------------------| section 3.2             |
| - Release checklist          | User                                                      | "We chose event..."     |
|                              | What architecture decisions were made last month?         |                         |
| Earlier                      |-----------------------------------------------------------| Source 2                |
| - Team onboarding            | Assistant                                                 | policy.pdf              |
|                              | Summary                                                   | page 8                  |
|                              | - Switched to event-driven ingestion                      | "Only admins can..."    |
|                              | - Added retry queue for failed jobs                       |                         |
|                              |                                                           | Open full document      |
|                              | Why this answer?                                          |-------------------------|
|                              | 3 sources used, all within current project scope.         | Source 3                |
|                              |                                                           | runbook.docx            |
|                              | Citations                                                 |                         |
|                              | [1] architecture.md sec 3.2                               |                         |
|                              | [2] meeting-notes.md 2026-04-03                           |                         |
|                              | [3] policy.pdf p8                                         |                         |
|                              |                                                           |                         |
|                              | Actions                                                   |                         |
|                              | [Open source] [Ask follow-up] [Copy answer]               |                         |
|------------------------------|-----------------------------------------------------------|-------------------------|
|                              | Follow-up composer                                        |                         |
|                              | [ Ask a follow-up question...                      ] [↑]   |                         |
+------------------------------------------------------------------------------------------------------------------+
```

### 8.5 메시지 규격

#### 사용자 메시지

- 질문 본문
- 질문 시각
- 적용 범위 배지

#### 답변 메시지

- 한 줄 요약
- 본문 답변
- 근거 수준 표시
- 출처 목록
- 후속 액션

### 8.6 답변 카드 내부 구조

권장 순서는 아래다.

1. `Summary`
2. `Direct answer`
3. `Supporting bullets`
4. `Citations`
5. `Next suggested questions`

이 순서가 필요한 이유는 사용자가 항상 긴 본문을 원하는 것은 아니기 때문이다. 먼저 결론을 보고, 필요하면 출처와 본문으로 내려가게 해야 한다.

### 8.7 상호작용 규칙

- 인용 클릭 시 우측 패널이 해당 출처로 스크롤
- 우측 패널에서 `Open full document` 클릭 시 문서 상세 또는 문서 미리보기로 이동
- `Ask follow-up` 클릭 시 답변 내용을 기반으로 프롬프트 자동 삽입
- 세션 제목은 첫 질문을 기준으로 자동 생성 후 편집 가능

### 8.8 주요 상태

#### 정상 답변

- 답변, 출처, 후속 질문 추천 표시

#### 근거 부족

- "충분한 근거를 찾지 못했습니다"
- 관련 프로젝트 문서 업로드 CTA
- 검색 결과 보기 CTA

#### 권한 부족

- "선택한 범위에 접근 권한이 없습니다"
- 범위 재선택 유도

#### 처리 오류

- "답변 생성 중 오류가 발생했습니다"
- 다시 시도

## 9. 프로젝트 문서 관리 `/projects/:projectId/documents`

### 9.1 화면 목적

프로젝트에 속한 문서를 업로드, 조회, 상태 확인, 재처리하는 관리 화면이다. 문서가 실제 지식베이스 자산으로 보이도록 만들어야 한다.

### 9.2 대표 유스케이스

- UC-01 프로젝트 문서 업로드
- UC-02 업로드 상태 확인
- UC-07 업로드 실패 복구

### 9.3 진입점

- 프로젝트 목록에서 특정 프로젝트 클릭
- 채팅 세션의 출처 문서에서 역이동
- 대시보드 업로드 큐 카드

### 9.4 화면 와이어프레임

```text
+--------------------------------------------------------------------------------------------------------------+
| Project header: Company Knowledge Graph                                                                      |
| Description / member count / permission summary                                                              |
| [Upload documents] [Ask this project]                                                                        |
|--------------------------------------------------------------------------------------------------------------|
| Filters: [Status v] [Type v] [Tag v] [Owner v] [Search docs...]                                             |
|--------------------------------------------------------------------------------------------------------------|
| Document list                                                                                                 |
|--------------------------------------------------------------------------------------------------------------|
| architecture-review.md | Spec      | Sarah Chen  | COMPLETED | Updated 2h ago | 124 chunks | Ask | Open   |
| handbook.pdf           | Policy    | James       | RUNNING   | 64%             | --         | View status  |
| ops-runbook.docx       | Runbook   | Emma        | FAILED    | Parser error    | --         | Retry        |
|--------------------------------------------------------------------------------------------------------------|
| Right summary panel                                                                                           |
| - Total documents                                                                                             |
| - Ready for answers                                                                                            |
| - Running ingestion jobs                                                                                       |
| - Failed jobs                                                                                                  |
+--------------------------------------------------------------------------------------------------------------+
```

### 9.5 핵심 정보 요소

- 문서 제목
- 문서 유형
- 업로더
- 상태
- 마지막 업데이트 시각
- 청크 수
- 태그
- 액션

### 9.6 액션 정의

- `Upload documents`
- `Ask this project`
- `Open`
- `Retry`
- `Delete`
- `View status`

### 9.7 주요 상태

- `no documents`: 업로드 가이드와 샘플 질문 예시 표시
- `processing`: 진행률 배지와 마지막 상태 갱신 시각
- `failed`: 실패 원인과 재시도 버튼
- `completed`: 채팅 대상 포함 표시

### 9.8 이 화면이 중요한 이유

사용자는 질문 결과가 이상할 때 대부분 "문서가 제대로 들어갔는지"부터 확인한다. 따라서 문서 관리 화면은 단순 파일 리스트가 아니라 지식베이스 상태 보드 역할을 해야 한다.

## 10. 문서 업로드 드로어

### 10.1 화면 목적

업로드는 별도 페이지보다 드로어 또는 모달이 낫다. 사용자가 프로젝트 문맥을 잃지 않고 파일을 올릴 수 있어야 하기 때문이다.

### 10.2 대표 유스케이스

- 새 문서 추가
- 메타데이터 입력
- 업로드 직후 상태 확인

### 10.3 권장 패턴

- 데스크톱: 우측 드로어
- 모바일: 풀스크린 시트

### 10.4 화면 와이어프레임

```text
+------------------------------------------------------------------------------------+
| Upload documents                                                                  X|
|------------------------------------------------------------------------------------|
| Drop files here or browse                                                          |
| [ handbook.pdf ] [ architecture.docx ]                                            |
|                                                                                    |
| Document metadata                                                                  |
| Title          [........................................]                          |
| Type           [ Policy v ]                                                        |
| Tags           [ onboarding ] [ security ]                                         |
| Visibility     [ Project only v ]                                                  |
| Description    [........................................]                          |
|                                                                                    |
| Validation                                                                    OK  |
| - PDF, DOCX, TXT supported                                                        |
| - Max 50 MB each                                                                  |
|                                                                                    |
| [Cancel]                                                     [Upload and analyze] |
+------------------------------------------------------------------------------------+
```

### 10.5 업로드 이후 상태

업로드 직후에는 드로어 하단에 아래 정보가 바로 보여야 한다.

- 생성된 문서 수
- 생성된 작업 수
- 각 작업의 상태
- `Go to documents`
- `Ask when ready`

### 10.6 유효성 검사

- 지원하지 않는 형식
- 크기 초과
- 중복 파일명
- 프로젝트 미선택
- 권한 부족

## 11. 출처 미리보기 패널

### 11.1 화면 목적

답변을 신뢰하게 만드는 핵심 패널이다. 사용자는 이 패널에서 답변의 근거를 원문 수준으로 확인할 수 있어야 한다.

### 11.2 대표 유스케이스

- UC-06 답변 출처 검증
- 후속 질문 전에 근거 확인
- 문서 상세 화면으로 이동

### 11.3 열리는 방식

- 데스크톱: 채팅 우측 고정 패널
- 태블릿: 우측 슬라이드 패널
- 모바일: 하단 시트

### 11.4 화면 와이어프레임

```text
+--------------------------------------------------------------------------------------+
| Source detail                                                                        |
|--------------------------------------------------------------------------------------|
| architecture-review.md                                                               |
| Company Knowledge Graph                                                              |
| section 3.2 / updated 2h ago / Sarah Chen                                            |
|--------------------------------------------------------------------------------------|
| Matched excerpt                                                                      |
| "We introduced a retry queue for failed ingestion jobs to prevent data loss..."      |
|--------------------------------------------------------------------------------------|
| Why selected                                                                         |
| - High lexical match with "retry queue"                                              |
| - Same project scope                                                                 |
| - Recent document                                                                    |
|--------------------------------------------------------------------------------------|
| Actions                                                                              |
| [Open full document] [Copy excerpt] [Ask only from this document]                    |
+--------------------------------------------------------------------------------------+
```

### 11.5 패널에 꼭 있어야 하는 정보

- 문서명
- 프로젝트명
- 작성자 또는 업로더
- 위치 정보
- 발췌문
- 왜 이 출처가 선택됐는지에 대한 짧은 설명

## 12. 검색 연계 패턴 `/search`

### 12.1 왜 필요한가

채팅과 검색은 경쟁 관계가 아니라 보완 관계다. 사용자는 검색으로 대상을 좁히고, 그다음 질문으로 넘어간다.

### 12.2 권장 변경점

검색 결과 카드에 아래 액션을 추가한다.

- `Ask about this`
- `Open project documents`
- `Use as chat scope`

### 12.3 와이어프레임

```text
+-----------------------------------------------------------------------------------------------------------+
| Search results                                                                                            |
|-----------------------------------------------------------------------------------------------------------|
| Result card                                                                                                |
| Company Knowledge Graph                                                                                   |
| Project / updated 2h ago / 124 documents                                                                  |
| Short description                                                                                         |
| [Ask about this] [Open documents] [Open project]                                                          |
+-----------------------------------------------------------------------------------------------------------+
```

### 12.4 연결 유스케이스

- 검색으로 프로젝트를 찾고 해당 범위에서 질문
- 검색으로 문서를 찾고 해당 문서의 프로젝트 문맥으로 이동
- 검색 결과를 답변 범위로 축소

## 13. 상태 및 예외 처리 화면

### 13.1 문서 없음

표시 메시지:

- "이 프로젝트에는 아직 답변 가능한 문서가 없습니다"

액션:

- `Upload documents`
- `View supported formats`

### 13.2 업로드 실패

표시 정보:

- 실패 사유
- 실패 시각
- 재시도 버튼

액션:

- `Retry upload`
- `Replace file`
- `Contact admin`

### 13.3 답변 불가

표시 메시지:

- "현재 질문에 대한 충분한 근거를 찾지 못했습니다"

액션:

- `Search related documents`
- `Upload more documents`
- `Ask in workspace scope`

### 13.4 권한 없음

표시 메시지:

- "선택한 프로젝트 또는 문서에 접근 권한이 없습니다"

액션:

- `Choose another scope`
- `Request access`

## 14. 모바일 와이어프레임 원칙

모바일에서는 3열 구성을 유지하면 안 된다. 우선순위는 아래와 같다.

1. 대화 본문
2. 질문 입력
3. 세션 목록
4. 출처 패널

### 14.1 채팅 세션 상세 모바일 구조

```text
+--------------------------------------+
| Top bar                              |
| Session title / Scope / More         |
|--------------------------------------|
| Conversation                         |
| User message                         |
| Assistant answer                     |
| Citations summary                    |
| [View sources]                       |
|--------------------------------------|
| Follow-up composer                   |
+--------------------------------------+
```

세션 목록은 좌상단 버튼으로 열고, 출처는 하단 시트로 연다.

### 14.2 문서 화면 모바일 구조

- 상단에 프로젝트명
- 문서 목록 1열
- 업로드 버튼은 고정 하단 또는 상단 우측
- 필터는 시트로 모음

## 15. 화면별 유스케이스 매핑

| 화면 | 주요 유스케이스 | 핵심 성공 기준 |
|------|------------------|----------------|
| Dashboard | 빠른 질문 시작, 최근 작업 복귀 | 사용자가 1번 클릭 이내에 질문 시작 |
| Chat home | 새 질문 시작 | 범위 선택 후 첫 질문 전송 |
| Chat session | 답변 확인, 후속 질문, 출처 검증 | 답변과 출처가 함께 노출 |
| Project documents | 업로드, 상태 확인, 실패 복구 | 문서 상태와 재처리 가능 |
| Upload drawer | 파일 등록 | 파일과 메타데이터 검증 후 작업 생성 |
| Source panel | 근거 확인 | 발췌문과 문서 이동 가능 |
| Search | 대상을 좁힌 뒤 질문 시작 | 결과에서 채팅 범위로 연결 |

## 16. 구현 우선순위

와이어프레임 기준 우선순위는 아래 순서가 적절하다.

1. 공통 앱 셸에 `Chat` 메뉴 추가
2. `/chat` 빈 상태 화면
3. `/chat/:sessionId` 대화 + 출처 패널
4. `/projects/:projectId/documents` 문서 목록 화면
5. 업로드 드로어
6. 검색 결과와 채팅 범위 연결
7. 대시보드의 최근 세션/업로드 큐 반영

## 17. 최종 권장안

권장안은 아래와 같다.

- 채팅은 별도 전용 화면으로 분리한다.
- 문서 업로드는 프로젝트 문맥 안에서 처리한다.
- 출처 패널은 채팅 화면의 고정 핵심 요소로 둔다.
- 대시보드는 보고서가 아니라 질문 시작 허브로 재정의한다.

즉, 화면 구조는 아래 한 줄로 요약할 수 있다.

```text
Dashboard에서 시작 -> Chat에서 질문 -> Source panel에서 검증 -> Documents에서 문서 상태 관리
```
