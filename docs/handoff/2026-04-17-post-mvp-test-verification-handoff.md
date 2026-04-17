# Graphify Post-MVP 테스트 검증 핸드오프

작성일: 2026-04-17
이전 핸드오프: [2026-04-13-stage5-complete-handoff-and-next-steps.md](./2026-04-13-stage5-complete-handoff-and-next-steps.md) (Stage 1~8 구현 100% 완료)
문서 목적: Stage 1~8 구현 완료 후 수행한 테스트·검증 세션의 결과와, 다음 세션이 바로 이어받을 수 있도록 현재 블로커 및 후속 작업을 정리한다.
상태: **구현/자동 검증은 모두 PASS. 실 e2e 검증은 백엔드 포트 미스매치로 중단.**

## 1. 이 세션에서 수행한 작업

### 1.1 Gradle Wrapper 보안 경고 대응

VS Code에서 `backend/gradle/wrapper/gradle-wrapper.jar`의 SHA256 해시가 Microsoft vscode-gradle 확장 allowlist에 없다는 경고가 떴다.

- 공식 Gradle 8.14.x wrapper 해시 `7d3a4ac4...`와 대조 — 불일치 (`497c8c2a...`)
- Gradle 8.11~9.2 공식 배포 어디에도 매칭되지 않음
- Spring Initializr가 방금 생성하는 wrapper 해시(`7d3a4ac4...`)와도 다름
- **결론**: 출처 불명 wrapper jar 확인

**조치**: Spring Initializr가 방금 생성한 공식 wrapper로 교체. 의심 파일은 `c:/tmp/graphify-suspicious-gradle-wrapper-20260415.jar.bak`에 보존(포렌식용). 변경은 commit `31c4f82`에 포함됨.

### 1.2 npm install + 자동 테스트 실행

사용자가 `cd web-app && npm install` 수행 후 테스트 요청. 결과:

**Jest 단위 테스트**:
- 전체: 10 suites pass / 1 fail (총 11, e2e 제외)
- 실패 원인: `lib/api/__tests__/client.test.ts`의 mock 누락 (`headers.get()` 미정의) — **pre-existing 버그, 이 세션 범위 밖**
- **Stage 1~8 신규 테스트 6 suites, 15/15 tests PASS** ✓

**TypeScript `tsc --noEmit`**:
- Stage 1~8 관련 실 타입 에러 **6건 발견** (모두 Stage 6 페이지에서 `res.data`가 `unknown`으로 추론되는 문제)

**ESLint**:
- Stage 1~8 관련 react-hooks 에러 **5건 발견** (setState in effect, render 중 컴포넌트 생성)

**Playwright UI e2e** (`npx playwright test --project=ui`):
- 19 pass / 2 fail / 2 skip
- 실패: UI-20 (selector strict mode), UI-21 (프로젝트 카드 navigation 누락)
- skip: UI-22, UI-23 — 백엔드 `/chat/answer` 파이프라인 미구현으로 `test.skip` 자동 발동

**부가 조치**: `@playwright/test`가 `package.json`에 선언되지 않아 있어 `npm install -D @playwright/test`로 설치. Commit `216b113`에 반영됨. `npm audit`에 1 high-severity 경고(확인 필요).

### 1.3 실 코드 결함 11건 수정 (codex 위임, commit `216b113`)

**Category A — TypeScript 타입 에러 (6건)**

Stage 6 서비스 메서드에 반환 타입이 명시되지 않아 소비 페이지에서 `.data`가 `unknown`으로 추론됨. 서비스 3개에 명시적 반환 타입 주입:

- `lib/api/chat-service.ts`: `getSessions/getSession/createSession/getMessages/postMessage/answer` 모두 `Promise<{ data?: T; error?: string; status: number }>`
- `lib/api/document-service.ts`: `getProjectDocuments/getDocument/getDocumentChunks/deleteDocument` 동일 패턴
- `lib/api/project-service.ts`: `getProjectDetail/getProjectMetrics/getProjectSummary` + `ServiceResult<T>` 타입 별칭 도입

**Category B — React-hooks 규칙 위반 (5건)**

- `components/chat/ChatLayout.tsx` (25, 86): `useEffect` + `setState` 초기 sync → subscription-only media-query 핸들링으로 전환
- `components/chat/ChatSessionHeader.tsx` (18): effect + setState → 파생값(useMemo)으로
- `components/documents/DocumentListItem.tsx` (92): `FileIcon = getFileIcon(...)` 렌더 중 컴포넌트 생성 → JSX 직접 반환하는 렌더 함수로
- `components/upload/UploadMetadataForm.tsx` (34): effect + setState → useState initializer + 이벤트 기반

**검증**: tsc 에러 0건 (pre-existing jest-dom 매처 제외), eslint 0건, jest 15/15 PASS 유지.

### 1.4 Playwright UI 테스트 셀렉터/내비게이션 수정 (commit `216b113`)

**UI-20 (12-ui-chat-entry.spec.ts)**:
- `getByRole('button', { name: 'Workspace' })`가 사이드바 `Open workspace`와 스코프 토글 버튼 2개에 strict mode 매칭 → `{ exact: true }` 추가

**UI-21 (13-ui-document-upload.spec.ts)**:
- 근본 원인: `app/projects/page.tsx`의 `onViewProject`가 `console.log`만 하고 실제 라우팅을 안 함
- 수정 1: `app/projects/page.tsx` — `useRouter` + `ROUTES.project(id)` 네비게이션 연결
- 수정 2: `components/project/ProjectList.tsx` — 아이콘 버튼에 `aria-label="View project"/"Edit project"/"Delete project"` 추가
- 수정 3: 테스트 셀렉터 — `firstProjectCard.locator('button').first()` → `page.getByRole('button', { name: 'View project' }).first()`

### 1.5 ChatLayout SSR Hydration 수정 (commit `216b113`)

B-1 수정(`useSyncExternalStore`) 이후 `/chat` 페이지 진입 시 Next dev log에 `Hydration failed because the server rendered HTML didn't match the client` 에러 발생. 서버 스냅샷은 `false`, 클라이언트는 실제 matchMedia 값을 반환 → 첫 paint에서 트리 불일치.

**수정**: `useDesktop()`을 standard `useState(false) + useEffect(() => matchMedia 구독)` 패턴으로 되돌림. 서버·클라이언트 초기값 모두 `false`로 일치, mount 후 effect가 실제 값을 적용해 짧은 non-desktop flash는 감수.

## 2. 이 세션 종료 시점의 최종 상태

### 2.1 코드 품질

| 지표 | 결과 |
|---|---|
| Jest (Stage 1~8 신규 15 tests) | ✅ 15/15 PASS |
| Jest (전체, e2e 제외) | 10 pass / 1 fail (pre-existing `client.test.ts`) |
| TypeScript (`tsc --noEmit`, Stage 1~8 필터) | ✅ 0 errors |
| ESLint (Stage 1~8 신규 파일) | ✅ 0 errors |
| Playwright UI-01~19 (pre-existing + FE-8-5의 FE-8-5는 Jest) | ✅ 19/19 PASS (이 세션의 첫 실행) |

### 2.2 미해결 이슈 (자동 검증 불가)

| ID | 상태 | 원인 |
|---|---|---|
| UI-20 Chat Entry | ❓ 미검증 | 셀렉터/페이지 수정은 완료되었으나, 재실행 시 로그인 단계에서 500 발생해 검증 불가 |
| UI-21 Document Upload | ❓ 미검증 | 위와 동일 |
| UI-22 Chat Answer | ⊘ SKIP | 백엔드 `/chat/answer` 파이프라인 미구현 — `test.skip` 자동 발동. 백엔드 구현 후 재검증 필요 |
| UI-23 Citation Deep Link | ⊘ SKIP | UI-22에 의존. 동일 |

### 2.3 최종 블로커 — 백엔드 포트 미스매치

**문제**: 사용자는 "backend는 기동했다"고 보고했으나, 자동 검증에서 실제 백엔드는 **.env.local이 기대하는 포트 `8086`에 없음**.

확인 결과:

| 포트 | 상태 |
|---|---|
| 3006 (Next dev) | ✅ LISTENING |
| **8086 (backend expected)** | ❌ **NOT LISTENING** |
| 18080 | ⚠️ LISTENING — 그러나 `/auth/login` 등에 404 반환 (다른 서비스) |
| 5432 (Postgres) | ✅ LISTENING |

BFF `POST /api/auth/login`이 `http://localhost:8086/api/auth/login`으로 프록시 → 연결 실패 → 500 → Playwright 로그인 대기 타임아웃 → UI-20/21 로그인 단계에서 실패.

**확인 사항**:
- `backend/src/main/resources/application.yml`: `server.port: 8086` (올바른 설정)
- `web-app/.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:8086/api` (일치)
- 따라서 설정은 정합. **백엔드 프로세스가 실제로 8086에 바인딩되지 않은 상태**

## 3. 다음 세션 즉시 할 일

### 3.1 백엔드 재기동 & 포트 확인

```bash
# 백엔드 기동 로그에서 'Started GraphifyBackendApplication in ... seconds' 확인
cd backend && ./gradlew bootRun
# 또는 이미 기동 중이라면:
netstat -ano | findstr ":8086"   # Windows
# 기대: 0.0.0.0:8086  LISTENING
```

백엔드가 정말 다른 포트에 있다면 `web-app/.env.local`의 `NEXT_PUBLIC_API_URL`을 조정하고 Next dev 서버 재기동.

### 3.2 UI e2e 재검증 (백엔드 기동 후)

```bash
cd web-app
# 이미 기동 중인 dev 서버 확인
curl -sI http://localhost:3006/auth/login   # 200 OK 기대
# UI-20, UI-21 재실행
npx playwright test --project=ui --reporter=list \
  e2e/scenarios/12-ui-chat-entry.spec.ts \
  e2e/scenarios/13-ui-document-upload.spec.ts
# 기대: 2 PASS (수정은 commit 216b113에 이미 반영됨)
```

UI-22/23은 백엔드 `/chat/answer` 파이프라인이 없으면 계속 skip. 백엔드 구현 후 재검증.

### 3.3 Pre-existing 이슈 정리 (선택)

이번 세션에서 의도적으로 건드리지 않은 기존 문제들. 본 스펙 밖이지만 CI 깨끗하게 하려면 정리 필요:

1. `lib/api/__tests__/client.test.ts`: mock의 `response.headers.get` 누락 — 2 Jest 실패
2. `tsconfig.json`: `@testing-library/jest-dom` 타입 미등록 — `toBeInTheDocument` 등 매처 TypeScript 경고 (team/search 기존 테스트 및 새로 작성한 chat 테스트 모두 영향). jest 런타임에는 영향 없음
3. `lib/api/*-service.ts`, `components/ui/Card.tsx`, `components/graph/GraphCanvas.tsx`: 기존 `any` 및 forwardRef 관련 lint 에러
4. `package.json`: `@playwright/test` devDependency에 1 high-severity vulnerability — `npm audit`으로 세부 확인

### 3.4 백엔드 미구현 엔드포인트 (Stage 6/8 블로커)

UI-22/23 및 실 기능 동작을 위해 백엔드에 추가 필요 (설계는 `PAGE_SPECIFICATIONS.md §15`, 데이터 모델은 `2026-04-10-knowledgebase-chat-and-upload-design.md §11`):

- **채팅**: `POST /chat/sessions`, `GET /chat/sessions`, `GET /chat/sessions/{id}`, `POST /chat/sessions/{id}/messages`, `GET /chat/sessions/{id}/messages`, `POST /chat/answer` (RAG 파이프라인)
- **문서**: `POST /projects/{id}/documents`, `GET /projects/{id}/documents`, `GET /documents/{id}`, `GET /documents/{id}/chunks`, `DELETE /documents/{id}`
- **작업**: `POST /projects/{id}/jobs?source=UPLOAD`, `GET /jobs/{id}`, `PUT /jobs/{id}/status`, `PUT /jobs/{id}/error`
- **스키마**: `documents`, `document_chunks`, `chat_sessions`, `chat_messages`, `answer_citations` 테이블 및 Flyway migration

### 3.5 디자인 완성도 및 Post-MVP 확장

`2026-04-13-stage5-complete-handoff-and-next-steps.md` §4의 D/E 항목 참조:

- Figma 디자인 이행 (low-fi UI spec 9 프레임)
- 벡터 검색 (Qdrant/pgvector), OCR, 문서 버전 비교
- 답변 → 그래프 탐색 연결, 인용 문서 인라인 미리보기
- 세션 이름 PATCH API, 문서 재실행 엔드포인트

## 4. 파일 변경 이력 (이 세션)

### 4.1 Commit `216b113` (2026-04-17 15:59 KST)

14개 파일, +183 -57 lines:

```
web-app/app/chat/[sessionId]/page.tsx          |  7 +--
web-app/app/projects/page.tsx                   |  5 +-
web-app/components/chat/ChatLayout.tsx          | 37 +++++++++----
web-app/components/chat/ChatSessionHeader.tsx   | 12 ++---
web-app/components/documents/DocumentListItem.tsx | 11 ++--
web-app/components/project/ProjectList.tsx      |  3 ++
web-app/components/upload/UploadMetadataForm.tsx | 16 +++---
web-app/e2e/scenarios/12-ui-chat-entry.spec.ts  |  2 +-
web-app/e2e/scenarios/13-ui-document-upload.spec.ts | 2 +-
web-app/lib/api/chat-service.ts                 | 36 +++++++++----
web-app/lib/api/document-service.ts             | 22 +++++---
web-app/lib/api/project-service.ts              | 23 ++++++--
web-app/package-lock.json                       | 63 ++++++++++++++++++++++
web-app/package.json                            |  1 +
```

### 4.2 작업 트리 상태

최종 `git status`: **clean** (모든 변경 사항 commit 완료).

## 5. 누적 진행

**총 58/58 태스크 완료** (Stage 1~8 구현 100%). 이 세션에서 Post-MVP 품질 보정 11건 + UI 테스트 수정 완료.

**블록된 검증**: UI-20~23 4개 — 백엔드 8086 기동 또는 chat 파이프라인 구현 대기 중.

## 6. 다음 세션 시작 체크리스트

1. `git pull` 후 `git log -5 --oneline`로 `216b113` 반영 확인
2. `backend/application.yml`의 `server.port: 8086` 확인 후 `./gradlew bootRun` 실행. 기동 로그에서 `Started GraphifyBackendApplication`와 `Tomcat started on port 8086` 확인
3. `netstat -ano | findstr ":8086"` LISTENING 확인
4. `cd web-app && npm run dev &` → `curl -sI http://localhost:3006` 200 확인
5. `curl -sI http://localhost:3006/api/backend/auth/validate` 통해 BFF→백엔드 연결 확인
6. `npx playwright test --project=ui --reporter=list` 로 UI-01~23 재실행. 기대: UI-20/21 PASS, UI-22/23 여전히 skip (백엔드 chat 구현 후 PASS 예정)
7. 남은 작업은 본 문서 §3.3(정리), §3.4(백엔드 미구현 API), §3.5(디자인·Post-MVP) 순서로 진행

## 7. 한 줄 요약

```text
Stage 1~8 구현 100% + 이 세션 Post-MVP 품질 보정 11건 + UI 테스트 수정 완료(commit 216b113).
UI-20~23은 백엔드 8086 기동 및 chat 파이프라인 구현 완료 후 재검증 필요.
```
