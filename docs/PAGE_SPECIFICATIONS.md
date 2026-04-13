# Graphify 웹앱 페이지 사양

목적: 현재 구현된 페이지 기준으로 경로, 접근 제어, 주요 UI, 데이터 소스, 사용자 흐름을 정리한다.
기준일: 2026-04-13
상태: 현재 구현 + 지식베이스 채팅/문서 업로드 확장 반영 (신규 페이지는 `계획` 상태로 표시)

## 1. 공통 규칙

### 1.1 인증 규칙

- 비로그인 사용자는 보호 화면에 직접 접근할 수 없다.
- `/dashboard`, `/graphs`, `/search`, `/team`, `/projects`, `/projects/:projectId`, `/projects/:projectId/documents`, `/chat`, `/chat/:sessionId`, `/permissions`는 로그인 필요 화면이다.
- 루트 `/`는 세션 유무에 따라 자동 분기된다.

분기 규칙:

- 로그인 상태: `/dashboard`
- 비로그인 상태: `/auth/login`

### 1.2 공통 레이아웃

로그인 후 화면은 공통 앱 셸을 사용한다.

포함 요소:

- 좌측 사이드바
- 상단 헤더
- 모바일 메뉴 토글
- 현재 로그인 사용자 이름, 이메일, 역할 표시
- 로그아웃 메뉴

### 1.3 데이터 연결 원칙

프런트는 직접 백엔드를 호출하지 않고 Next.js BFF를 통해 호출한다.

주요 프런트 서버 라우트:

- `/api/auth/login`
- `/api/auth/validate`
- `/api/auth/logout`
- `/api/backend/[...path]`

## 2. 페이지 목록

기존 구현 페이지:

1. 루트 리다이렉트
2. 로그인
3. 대시보드
4. 그래프 스튜디오
5. 검색
6. 팀
7. 프로젝트
8. 권한

신규(계획) 페이지:

9. 채팅 홈 (`/chat`)
10. 채팅 세션 상세 (`/chat/:sessionId`)
11. 프로젝트 상세 (`/projects/:projectId`)
12. 프로젝트 문서 (`/projects/:projectId/documents`)

신규 페이지의 사양은 아래 11~14절에 정의한다.

## 3. 루트 리다이렉트

### 기본 정보

- 경로: `/`
- 접근 권한: 없음
- 목적: 세션 상태에 따라 첫 진입 경로를 결정

### 현재 동작

- 세션이 있으면 `/dashboard`
- 세션이 없으면 `/auth/login`

### 사용자 흐름

1. 사용자가 `/`에 접속한다.
2. 서버가 세션 사용자 정보를 확인한다.
3. 결과에 따라 로그인 또는 대시보드로 이동한다.

## 4. 로그인

### 기본 정보

- 경로: `/auth/login`
- 접근 권한: 비로그인 사용자
- 목적: 이메일/비밀번호 로그인

### 현재 UI

- 브랜드 소개 영역
- 이메일 입력
- 비밀번호 입력
- 로그인 버튼
- 데모 계정 안내
- 로그인 실패 시 에러 메시지

### 현재 데이터 소스

- 프런트: `/api/auth/login`
- 백엔드: `/auth/login`

### 사용자 흐름

1. 사용자가 이메일과 비밀번호를 입력한다.
2. 로그인 버튼을 누른다.
3. 프런트가 `/api/auth/login`을 호출한다.
4. 성공 시 `authToken` 쿠키가 저장된다.
5. 사용자 컨텍스트가 갱신된다.
6. `/dashboard`로 이동한다.

### 현재 제한

- 회원가입 UI 없음
- OAuth 로그인 없음

## 5. 대시보드

### 기본 정보

- 경로: `/dashboard`
- 접근 권한: 로그인 필요
- 목적: 워크스페이스 시작 화면

### 현재 UI

- 웰컴 메시지
- 검색/그래프 진입 CTA
- 통계 카드
- 최근 그래프 카드
- 팀 활동 카드

### 현재 데이터 소스

- 인증/셸: 실제 세션 데이터
- 대시보드 내부 카드: 현재 UI 샘플 데이터

### 사용자 흐름

1. 로그인한 사용자가 대시보드에 들어간다.
2. 공통 앱 셸과 사용자 정보가 보인다.
3. 사용자는 여기서 Search 또는 Graphs로 진입한다.
4. 최근 그래프와 팀 활동을 읽고 다음 작업으로 이동한다.

### 현재 제한

- 통계 카드 실데이터 미연결
- 최근 그래프 실데이터 미연결
- 팀 활동 실데이터 미연결

### 신규 방향(계획)

2026-04-10 설계 결과에 따라 대시보드는 `통계판`이 아니라 `질문 시작 허브`로 재정의된다. 다음 반영 사항은 구현 단계에서 적용한다.

- `Ask Graphify...` 영역을 `/chat` 진입 CTA 또는 인라인 질문 입력으로 교체
- `최근 채팅 세션` 카드 신규 추가
- `최근 업로드 문서` 카드 신규 추가
- `추천 질문` 카드 신규 추가
- 통계 카드는 비중을 낮추거나 아래쪽으로 이동

## 6. 그래프 스튜디오

### 기본 정보

- 경로: `/graphs`
- 접근 권한: 로그인 필요
- 목적: 그래프 탐색과 노드 선택

### 현재 UI

- 상단 소개 카드
- 왼쪽 노드 리스트
- 타입 필터
- 노드 검색 입력
- 중앙 3D 그래프 캔버스
- 오른쪽 속성 패널

### 현재 데이터 소스

- 페이지 보호 및 셸: 실제 세션 데이터
- 노드 목록/속성 내용: 현재 샘플 데이터

### 사용자 흐름

1. 사용자가 `/graphs`로 이동한다.
2. 노드 목록, 그래프 캔버스, 속성 패널을 본다.
3. 검색어 또는 타입 필터를 적용한다.
4. 노드를 선택하면 선택 상태가 공유된다.
5. 속성 패널에서 선택 노드 정보를 본다.

### 현재 제한

- 실그래프 API 미연결
- Neo4j 기반 탐색 미연결
- 그래프 저장/불러오기 액션 미연결

## 7. 검색

### 기본 정보

- 경로: `/search`
- 접근 권한: 로그인 필요
- 목적: 현재 워크스페이스 메타데이터 검색

### 현재 UI

- 검색 입력
- 타입 필터
- 디바운스 검색
- 결과 개수 표시
- 결과 카드 리스트
- 에러 상태 표시

### 현재 데이터 소스

- 프런트: `/api/backend/search`
- 백엔드: `/search`

현재 검색 대상:

- 프로젝트
- 팀
- 팀 멤버
- 프로젝트 권한

### 사용자 흐름

1. 사용자가 검색어를 입력한다.
2. 프런트가 디바운스 후 검색 API를 호출한다.
3. 백엔드가 메타데이터를 검색한다.
4. 결과가 `graph`, `concept`, `entity`, `relation` 타입 카드로 보인다.

### 현재 제한

- 그래프 경로 탐색 UI 없음
- 결과 상세 이동 흐름 없음
- 순수 Neo4j 노드 탐색은 아직 아님

## 8. 팀

### 기본 정보

- 경로: `/team`
- 접근 권한: 로그인 필요
- 목적: 현재 팀 멤버 현황 확인

### 현재 UI

- 페이지 헤더
- 팀 멤버 리스트
- 역할, 이메일, 가입일, 상태 표시
- Add member 버튼

### 현재 데이터 소스

- 프런트: `/api/backend/teams/current/members`
- 백엔드: `/teams/current/members`

### 사용자 흐름

1. 사용자가 Team 화면으로 이동한다.
2. 현재 팀의 멤버 목록이 로드된다.
3. 사용자는 팀 구성과 역할 상태를 확인한다.

### 현재 제한

- Add member 버튼 미연결
- 편집/삭제 버튼 미연결
- 조회 중심 화면

## 9. 프로젝트

### 기본 정보

- 경로: `/projects`
- 접근 권한: 로그인 필요
- 목적: 프로젝트 목록과 상태 확인

### 현재 UI

- 페이지 헤더
- 프로젝트 리스트
- 소유자, 멤버 수, 그래프 수, 날짜, 상태 표시
- New project 버튼

### 현재 데이터 소스

- 프런트: `/api/backend/projects`
- 백엔드: `/projects`

### 사용자 흐름

1. 사용자가 Projects 화면으로 이동한다.
2. 프로젝트 목록이 로드된다.
3. 사용자는 프로젝트별 상태와 메타데이터를 확인한다.

### 현재 제한

- 생성 버튼 미연결
- 보기/수정/삭제 액션 미연결
- 조회 중심 화면

## 10. 권한

### 기본 정보

- 경로: `/permissions`
- 접근 권한: 로그인 필요
- 목적: 권한 규칙 조회

### 현재 UI

- 페이지 헤더
- 권한 리스트
- role, resource, action, description, grantedTo, createdDate 표시

### 현재 데이터 소스

- 프런트: `/api/backend/permissions`
- 백엔드: `/permissions`

### 사용자 흐름

1. 사용자가 Permissions 화면으로 이동한다.
2. 권한 목록이 로드된다.
3. 어떤 사용자에게 어떤 리소스 권한이 있는지 확인한다.

### 현재 제한

- 편집/회수 액션 미연결
- 조회 중심 화면

## 11. 채팅 홈 (신규/계획)

### 기본 정보

- 경로: `/chat`
- 접근 권한: 로그인 필요 (admin, editor, viewer 모두 접근)
- 상태: 계획 (미구현)
- 화면 목적: 세션이 없는 상태에서 새 질문을 시작한다. 범위 선택과 첫 질문 입력, 최근 세션/추천 질문 탐색이 핵심이다.

### 주요 UI 구성

- 페이지 헤더 (`Chat`)
- 범위 선택기 (`Workspace` / `Team` / `Project` 중 택1)
- 질문 입력창 + 전송 버튼 (중앙 대형 composer)
- 추천 질문 카드 리스트 (템플릿 질문 4~6개)
- 최근 세션 목록 (좌측 패널 또는 하단 카드: 제목, 범위, 마지막 메시지 시각)
- 빈 상태 일러스트/설명

### 데이터 소스

- 프런트: `/api/backend/chat/sessions?limit=N` (최근 세션)
- 프런트: `/api/backend/chat/suggestions?scope=...` (추천 질문, 확장 기능 시)
- 백엔드: `GET /chat/sessions`, `POST /chat/sessions`, `POST /chat/answer`
- 범위가 `Project`인 경우 프로젝트 목록은 `/api/backend/projects`

### 주요 액션

- 범위 변경
- 첫 질문 전송 → `POST /chat/sessions`로 세션 생성 후 `/chat/:sessionId`로 이동
- 최근 세션 카드 클릭 → 해당 세션 상세로 이동
- 추천 질문 클릭 → 입력창에 주입 후 전송 가능 상태

### 사용자 흐름

1. 사용자가 사이드바에서 `Chat`을 클릭한다.
2. 기본 범위(`Workspace` 또는 사용자의 현재 프로젝트)가 사전 선택된다.
3. 사용자가 질문을 입력하거나 추천 질문을 선택한다.
4. 전송 시 새 세션이 생성되고 `/chat/:sessionId`로 이동한다.
5. 또는 최근 세션을 클릭해 기존 대화로 복귀한다.

### 상태

- 빈 상태: 최근 세션 없음 → "첫 질문을 시작해 보세요" + 추천 질문 노출
- 로딩 상태: 최근 세션/추천 질문 스켈레톤, 전송 중 버튼 로딩 스피너
- 오류 상태: 세션 생성 실패 시 composer 하단 에러 메시지 + 재시도 버튼
- 권한 예외: 접근 가능한 프로젝트가 없는 viewer는 범위 선택기에 `Workspace`만 노출

## 12. 채팅 세션 상세 (신규/계획)

### 기본 정보

- 경로: `/chat/:sessionId`
- 접근 권한: 로그인 필요 + 세션 소유자(또는 세션 범위 내 접근 권한 보유자)
- 상태: 계획 (미구현)
- 화면 목적: 실제 질문/답변을 이어가는 메인 대화 화면. 답변 본문, 출처 근거, 후속 질문이 세 축이다.

### 주요 UI 구성

데스크톱 3열 레이아웃:

- 좌측: 세션 목록 패널 (최근 세션, 새 세션 버튼)
- 중앙: 대화 영역 (헤더: 세션 제목/범위 배지, 메시지 스트림, 하단 follow-up composer)
- 우측: 출처 패널 (선택한 답변의 인용 청크 카드, 문서 미리보기 링크)

메시지 스트림 구성:

- 사용자 메시지 버블
- 답변 카드: 답변 본문, 생성 시각, 사용된 문서 수, confidence 배지, 출처 목록, 후속 질문 제안
- 시스템 메시지 (근거 부족 / 권한 경고)

모바일: 단일 열, 출처 패널은 드로어로 전환.

### 데이터 소스

- 프런트: `/api/backend/chat/sessions/:sessionId` (세션 메타)
- 프런트: `/api/backend/chat/sessions/:sessionId/messages` (메시지 목록)
- 프런트: `/api/backend/chat/sessions/:sessionId/messages` (POST, 후속 질문)
- 백엔드: `GET /chat/sessions/{id}`, `GET /chat/sessions/{id}/messages`, `POST /chat/sessions/{id}/messages`
- 답변 인용 청크: `answer_citations` 조인 결과 (document_id, chunk_id, quote_text, relevance_score)

### 주요 액션

- 후속 질문 전송 (composer)
- 답변 카드 → 출처 카드 선택 → 우측 패널에 인용 청크/문서 미리보기 표시
- `문서 열기` → `/projects/:projectId/documents`로 이동 (특정 문서 하이라이트)
- `검색으로 이동` → `/search?q=...`
- `그래프에서 보기` → `/graphs` (확장 기능)
- 세션 제목 편집
- 세션 범위 고정 유지 (세션 중 범위 변경 불가)

### 사용자 흐름

1. 사용자가 채팅 홈에서 세션을 생성하거나 기존 세션을 연다.
2. 중앙에 과거 메시지가 로드된다.
3. 답변 카드의 출처 카드를 클릭하면 우측 패널에 인용문과 문서 메타가 표시된다.
4. 사용자가 composer에 후속 질문을 입력한다.
5. 서버가 세션 문맥 + 범위 내 지식베이스로 답변을 생성한다.
6. 새 답변 카드와 출처가 렌더링된다.

### 상태

- 빈 상태(세션은 있으나 메시지가 0건): "이 세션에서 첫 질문을 시작하세요" 안내
- 로딩 상태:
  - 메시지 목록 스켈레톤
  - 답변 생성 중 타이핑 인디케이터 (서버 전송 후 3초 이상 지속 시 `응답 생성 중...` 문구)
- 오류 상태:
  - 네트워크 실패: 답변 카드 자리에 "답변 생성 실패" + 재시도
  - 근거 부족: 시스템 메시지 "충분한 근거를 찾지 못했습니다" + 관련 문서 업로드 제안
  - LLM 타임아웃: 재시도 버튼
- 권한 예외:
  - 세션 소유자가 아니거나 세션 범위 접근 권한 상실 시 404 리다이렉트
  - 인용 대상 문서 권한이 중간에 회수되면 해당 출처 카드는 `권한 없음`으로 마스킹

## 13. 프로젝트 상세 (신규/계획)

### 기본 정보

- 경로: `/projects/:projectId`
- 접근 권한: 로그인 필요 + 프로젝트 접근 권한 (viewer 이상)
- 상태: 계획 (미구현)
- 화면 목적: 단일 프로젝트의 개요를 보여주고 `질문하기`와 `문서 관리`로 진입하는 허브 역할.

### 주요 UI 구성

- 프로젝트 헤더: 이름, 설명, 소유자, 팀, 상태 배지
- 주요 지표 카드: 문서 수, 최근 업로드 시각, 처리 중 작업 수, 멤버 수
- CTA 영역:
  - `Ask this project` → `/chat?scope=project&projectId=:id`
  - `Open documents` → `/projects/:projectId/documents`
  - `Upload documents` → 업로드 드로어 오픈
- 최근 업로드 문서 리스트 (상위 5건, 상태 배지 포함)
- 최근 채팅 세션 리스트 (해당 프로젝트 범위로 진행된 세션 상위 5건)
- (확장) 관련 그래프 미리보기

### 데이터 소스

- 프런트: `/api/backend/projects/:id`
- 프런트: `/api/backend/projects/:id/documents?limit=5&sort=recent`
- 프런트: `/api/backend/projects/:id/jobs?status=RUNNING,PENDING`
- 프런트: `/api/backend/chat/sessions?scopeType=PROJECT&scopeId=:id&limit=5`
- 백엔드: `GET /projects/{id}`, `GET /projects/{id}/documents`, `GET /projects/{id}/jobs`

### 주요 액션

- `Ask this project` 클릭 → 채팅 홈에 범위/프로젝트 프리셋으로 진입
- `Upload documents` 클릭 → 업로드 드로어 오픈 (프로젝트 프리셋)
- 문서 항목 클릭 → 문서 화면에서 해당 문서 하이라이트
- 세션 항목 클릭 → 채팅 세션 상세로 이동
- (admin/editor) 프로젝트 편집 버튼 (확장)

### 사용자 흐름

1. 사용자가 `/projects`에서 프로젝트 카드를 선택한다.
2. `/projects/:projectId`가 로드되고 지표·최근 업로드·최근 세션이 표시된다.
3. 사용자는 `Ask this project`로 질문하거나 `Open documents`로 문서 관리로 진입한다.

### 상태

- 빈 상태:
  - 문서 0건: "이 프로젝트에 아직 문서가 없습니다" + `Upload documents` CTA 강조
  - 채팅 세션 0건: "아직 이 프로젝트에서 질문한 기록이 없습니다" + `Ask this project` CTA
- 로딩 상태: 카드별 스켈레톤
- 오류 상태: 프로젝트 조회 실패 시 전체 에러 화면 + 재시도; 부분 카드 실패는 해당 카드만 에러 표시
- 권한 예외:
  - 접근 권한 없음 → 403 화면 + `/projects`로 복귀 CTA
  - viewer는 `Upload documents` 버튼 비활성화

## 14. 프로젝트 문서 (신규/계획)

### 기본 정보

- 경로: `/projects/:projectId/documents`
- 접근 권한: 로그인 필요 + 프로젝트 접근 권한 (업로드는 editor 이상)
- 상태: 계획 (미구현)
- 화면 목적: 프로젝트 문서의 업로드·상태 확인·실패 복구·검색을 하나의 화면에서 수행.

### 주요 UI 구성

- 헤더: 프로젝트명, `Upload documents` CTA, 전체 문서 수 뱃지
- 필터 바: 상태 필터 (`UPLOADED/QUEUED/PARSING/INDEXING/READY/FAILED`), 문서 유형, 태그, 업로드 기간
- 검색 입력: 제목/파일명 검색 (디바운스)
- 문서 리스트:
  - 컬럼: 제목, 파일명, 상태 배지, 업로드자, 업로드 시각, 크기, 태그, 요약
  - 행 액션: `Preview`, `Re-run`, `Delete` (권한 기반)
- 우측 요약 패널: 선택한 문서의 메타, 청크 수, 마지막 분석 로그, 인용 사용 통계 (확장)
- 업로드 드로어 (별도 컴포넌트):
  - 드롭존, 파일 리스트, 메타데이터 폼(제목·태그·유형), 검증 결과, 진행률, 결과 요약
- 실패 안내 배너: `FAILED` 문서가 1건 이상이면 상단에 노출

### 데이터 소스

- 프런트: `/api/backend/projects/:id/documents` (리스트 + 필터)
- 프런트: `/api/backend/projects/:id/documents` (POST, 업로드) — multipart
- 프런트: `/api/backend/documents/:documentId` (상세)
- 프런트: `/api/backend/documents/:documentId` (DELETE)
- 프런트: `/api/backend/jobs/:jobId` (폴링 또는 SSE, 작업 상태)
- 백엔드: `POST /projects/{id}/documents`, `GET /projects/{id}/documents`, `GET /documents/{id}`, `DELETE /documents/{id}`, `GET /jobs/{id}`

### 주요 액션

- 파일 업로드 (드래그앤드롭/파일 선택 → 메타데이터 입력 → 제출)
- 상태 폴링 갱신
- 실패 문서 재실행 (`Re-run` → `POST /projects/{id}/jobs?source=UPLOAD&documentId=...`)
- 문서 삭제 (editor 이상, 확인 모달 필수)
- 문서 미리보기 (요약/청크 샘플)
- 필터/검색 적용

### 사용자 흐름

1. 사용자가 `/projects/:projectId`에서 `Open documents` 또는 사이드바 프로젝트 컨텍스트에서 진입.
2. 문서 리스트가 로드된다.
3. `Upload documents`로 업로드 드로어를 열고 파일을 올린다.
4. 업로드된 문서는 `QUEUED → PARSING → INDEXING → READY` 순으로 상태가 전이한다.
5. `FAILED` 발생 시 실패 사유를 확인하고 `Re-run` 또는 재업로드한다.
6. `READY` 상태의 문서는 채팅 답변과 검색 대상에 자동 포함된다.

### 상태

- 빈 상태: 문서 0건 → 중앙에 대형 드롭존 + "첫 문서를 업로드하세요" + 지원 형식 안내(PDF/Markdown/Docx/Txt)
- 로딩 상태:
  - 리스트 스켈레톤
  - 업로드 진행률 바 (파일별)
  - 상태 전이 중 `PARSING`/`INDEXING` 배지 애니메이션
- 오류 상태:
  - 업로드 실패: 파일 항목에 실패 사유(형식/크기/권한) 표시 + 재시도
  - 리스트 조회 실패: 전체 재시도 버튼
  - 폴링 연결 끊김: 상단 경고 배너
- 권한 예외:
  - viewer: 업로드/삭제/재실행 비활성화, 읽기 전용 모드
  - 프로젝트 접근 권한 없음: 403 리다이렉트

## 15. 현재 구현된 백엔드 API 요약

현재 UI와 직접 연결된 백엔드 API는 아래와 같다.

- `POST /auth/login`
- `GET /auth/validate`
- `POST /auth/logout`
- `GET /teams/current`
- `GET /teams/current/members`
- `GET /projects`
- `GET /permissions`
- `GET /search`
- `GET /search/recent`

사용자 관련 API도 구현되어 있다.

- `POST /users/register`
- `GET /users/me`
- `GET /users/{userId}`
- `GET /users`
- `PUT /users/{userId}`
- `DELETE /users/{userId}`

### 신규(계획) 백엔드 API

채팅/문서 기능 도입 시 추가될 엔드포인트 (상세는 `docs/2026-04-10-knowledgebase-chat-and-upload-design.md` 10.2절 참고).

문서:

- `POST /projects/{projectId}/documents`
- `GET /projects/{projectId}/documents`
- `GET /documents/{documentId}`
- `DELETE /documents/{documentId}`
- `GET /documents/{documentId}/chunks`

작업(분석/인덱싱):

- `POST /projects/{projectId}/jobs?source=UPLOAD`
- `GET /projects/{projectId}/jobs`
- `GET /jobs/{jobId}`
- `PUT /jobs/{jobId}/status`
- `PUT /jobs/{jobId}/error`

채팅:

- `POST /chat/sessions`
- `GET /chat/sessions`
- `GET /chat/sessions/{sessionId}`
- `POST /chat/sessions/{sessionId}/messages`
- `GET /chat/sessions/{sessionId}/messages`
- `POST /chat/answer`

## 16. 현재 미구현 또는 다음 단계

현재 기준 다음 작업 후보는 아래와 같다.

A. 기존 화면 보강:

1. 대시보드 실데이터 연결 + 질문 허브 재구성 (Ask CTA, 최근 세션, 최근 업로드, 추천 질문 카드)
2. 그래프 스튜디오 실데이터 연결
3. 팀/프로젝트/권한 CRUD 버튼 연결
4. 검색 결과 상세 이동 + `이 내용으로 질문하기` → `/chat` 연결

B. 신규 채팅/문서 기능 (본 문서 11~14절):

1. 라우트 골격 추가: `/chat`, `/chat/:sessionId`, `/projects/:projectId`, `/projects/:projectId/documents`
2. 사이드바에 `Chat` 최상위 메뉴 추가, `Projects`는 `Knowledge` 섹션으로 이동
3. 업로드 드로어 + 문서 리스트 구현
4. 단건 답변 API (`POST /chat/answer`) 연결 + 답변 카드/출처 패널 UI
5. 세션 저장 + 후속 질문
6. 권한 기반 범위 계산 및 문서 필터링
7. 상태 처리 5종: empty / loading / error / no permission / insufficient evidence
8. e2e 테스트: chat 진입, 업로드, 질의응답, 출처 상호작용

## 17. 참고 문서

- [현재 기능 및 사용자 흐름](/mnt/c/workspaceRND/graphify/graphify/docs/2026-04-10-current-features-and-user-flows.md)
- [지식베이스 채팅/업로드 설계](/mnt/c/workspaceRND/graphify/graphify/docs/2026-04-10-knowledgebase-chat-and-upload-design.md)
- [지식베이스 채팅/업로드 와이어프레임](/mnt/c/workspaceRND/graphify/graphify/docs/2026-04-10-knowledgebase-chat-wireframes.md)
- [다음 작업 핸드오프](/mnt/c/workspaceRND/graphify/graphify/docs/handoff/2026-04-10-knowledgebase-chat-handoff-and-next-steps.md)
