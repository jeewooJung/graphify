# Graphify Web App

현재 `web-app`은 Graphify의 운영 UI이다. Next.js 16 기반이며, Spring Boot 백엔드와 BFF 방식으로 연결된다.

## 현재 상태

현재 구현된 핵심 범위는 다음과 같다.

- 이메일/비밀번호 로그인
- JWT + httpOnly 쿠키 기반 세션
- 보호 라우트
- 공통 앱 셸
- 대시보드, 그래프, 검색, 팀, 프로젝트, 권한 화면
- 실제 백엔드 연동
- Playwright e2e 통과

현재 전체 e2e 결과는 다음과 같다.

- `76 passed`
- 로그인 전용 UI e2e `4 passed`

상세 구현 현황은 [현재 기능 및 사용자 흐름 문서](/mnt/c/workspaceRND/graphify/graphify/docs/2026-04-10-current-features-and-user-flows.md)에서 본다.

## 실행 경로

주요 라우트는 아래와 같다.

| 경로 | 설명 | 인증 |
|------|------|------|
| `/` | 세션에 따라 `/dashboard` 또는 `/auth/login`으로 리다이렉트 | 분기 |
| `/auth/login` | 로그인 화면 | 비로그인 |
| `/dashboard` | 대시보드 | 필요 |
| `/graphs` | 그래프 스튜디오 | 필요 |
| `/search` | 검색 화면 | 필요 |
| `/team` | 팀 멤버 화면 | 필요 |
| `/projects` | 프로젝트 화면 | 필요 |
| `/permissions` | 권한 화면 | 필요 |

## 데이터 연결 상태

실제 백엔드와 연결된 화면은 다음과 같다.

- 로그인
- 세션 검증
- 검색
- 팀
- 프로젝트
- 권한

아직 UI 샘플 데이터가 남아 있는 영역은 다음과 같다.

- 대시보드 내부 카드
- 그래프 스튜디오 노드/속성 샘플

즉, 인증과 메타데이터 조회는 실데이터 기반이고, 일부 그래프 시각화 내부 콘텐츠는 아직 샘플 상태다.

## 로컬 실행

기본 포트는 아래와 같다.

- 프런트: `http://localhost:3006`
- 백엔드: `http://localhost:8086/api`

프런트는 기본적으로 아래 백엔드 주소를 사용한다.

- `http://localhost:8086/api`

### 개발 서버 실행

```bash
npm install
npm run dev
```

브라우저에서 아래 주소로 접속한다.

```text
http://localhost:3006
```

## 테스트

### 정적 빌드

```bash
npm run build
```

### Jest

```bash
npm test
```

### Playwright e2e

전체:

```bash
npm run test:e2e
```

UI만:

```bash
npm run test:e2e:ui
```

API만:

```bash
npm run test:e2e:api
```

로그인 흐름만:

```bash
npx playwright test e2e/scenarios/11-ui-login.spec.ts --project=ui
```

## 인증 흐름

현재 인증 흐름은 다음과 같다.

1. 로그인 화면에서 이메일/비밀번호 입력
2. `POST /api/auth/login`
3. Next.js가 백엔드 `/auth/login` 호출
4. JWT를 `authToken` httpOnly 쿠키로 저장
5. 이후 `/api/backend/*` 요청은 쿠키 기반으로 백엔드에 프록시
6. 비로그인 사용자가 보호 화면 접근 시 `/auth/login`으로 이동

## 시드 계정

바로 로그인 가능한 기본 계정은 다음과 같다.

- `demo@graphify.com` / `demo123`
- `sarah.chen@graphify.com` / `Graph1234!`
- `james.wilson@graphify.com` / `Graph1234!`
- `emma.davis@graphify.com` / `Graph1234!`

## 구조

핵심 디렉터리는 아래와 같다.

- `app/`: App Router 페이지와 서버 라우트
- `components/`: 레이아웃, 대시보드, 그래프, 검색, 팀, 프로젝트, 권한 UI
- `lib/auth/`: 세션, 사용자 정규화, 사용자 컨텍스트
- `lib/api/`: 프런트 서비스 계층
- `e2e/`: Playwright 시나리오

## 주요 서버 라우트

프런트 BFF 라우트:

- `app/api/auth/login/route.ts`
- `app/api/auth/validate/route.ts`
- `app/api/auth/logout/route.ts`
- `app/api/backend/[...path]/route.ts`

## 현재 한계

아직 연결되지 않은 항목은 아래와 같다.

- 회원가입 UI
- OAuth 로그인
- 대시보드 실데이터
- 그래프 스튜디오 실데이터
- 팀/프로젝트/권한 CRUD UI 액션 연결
- 검색 결과 상세 이동
- Import/New graph 버튼 동작

## 참고 문서

- [현재 기능 및 사용자 흐름](/mnt/c/workspaceRND/graphify/graphify/docs/2026-04-10-current-features-and-user-flows.md)
- [페이지별 현재 사양](/mnt/c/workspaceRND/graphify/graphify/docs/PAGE_SPECIFICATIONS.md)
