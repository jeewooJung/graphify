# Graphify 웹앱 MVP - 구현 계획

**문서**: 설계 기반 상세 구현 계획  
**타임라인**: 8주 (Phase 1 MVP)  
**상태**: 계획 수립 중

---

## 📋 목차
1. [전체 태스크 분해](#전체-태스크-분해)
2. [Phase 별 상세 계획](#phase-별-상세-계획)
3. [의존성 관계](#의존성-관계)
4. [리소스 & 일정](#리소스--일정)
5. [위험 및 완화](#위험-및-완화)
6. [성공 기준](#성공-기준)

---

## 전체 태스크 분해

### 🎯 MVP 목표
4가지 핵심 기능 구현 (8주)
1. **그래프 시각화 & 탐색** (Week 1-3)
2. **검색 & 쿼리** (Week 2-4)
3. **코드/문서 업로드 & 분석** (Week 3-5)
4. **권한 관리** (Week 4-6)

### 📊 태스크 요약

| 구간 | 담당 | 태스크 | 의존성 | 예상 일수 |
|------|------|--------|--------|----------|
| **기초 인프라** | DevOps | Docker Compose, Neo4j, Ollama 설정 | 없음 | 5 |
| **백엔드 인증** | Backend | Spring Security, JWT, OAuth GitLab | 기초 | 7 |
| **DB 스키마** | Backend | PostgreSQL 테이블 생성, 인덱스 | 기초 | 3 |
| **권한 시스템** | Backend | RBAC + ABAC 구현 | 인증 | 10 |
| **메타데이터 API** | Backend | Team, Project, Permission API | 권한 | 8 |
| **그래프 분석** | Python | Graphify 통합, tree-sitter, Ollama | 기초 | 12 |
| **그래프 저장** | Python | Neo4j 쓰기, Cypher 쿼리 생성 | 그래프분석 | 8 |
| **검색 API** | Python | GraphQL 쿼리, 경로 탐색 | 그래프저장 | 10 |
| **캐싱** | Python | Redis 통합, TTL 정책 | 검색API | 5 |
| **UI - 기본** | Frontend | React 레이아웃, 라우팅 | 없음 | 5 |
| **UI - 그래프** | Frontend | vis.js 통합, 노드/엣지 시각화 | UI기본 | 12 |
| **UI - 검색** | Frontend | 검색 폼, 결과 표시, 필터 | UI그래프 | 8 |
| **UI - 권한** | Frontend | 팀/프로젝트 관리, 권한 설정 UI | UI기본 | 10 |
| **통합 & 테스트** | QA | End-to-end 테스트, 성능 벤치마크 | 모든 | 10 |

**총 예상 일수**: ~113 일 → **8주 (40일/주 기준 약 2.8 스프린트)**

---

## Phase 별 상세 계획

### ⏱️ Week 1-2: 기초 인프라 & 백엔드 준비

#### **Week 1 (기초 인프라)**

**DevOps**
- [ ] Docker Compose 파일 작성 (Java, Python, Neo4j, Ollama, React)
- [ ] .env 설정 파일 생성
- [ ] Windows에서 Docker Desktop 테스트
- [ ] 각 서비스 헬스체크 설정
- [ ] 로그 수집 및 모니터링 설정
- **산출물**: `docker-compose.yml`, `.env.example`

**Backend - 프로젝트 설정**
- [ ] Spring Boot 프로젝트 생성 (Gradle)
- [ ] 의존성 추가 (Spring Data JPA, Spring Security, PostgreSQL, Neo4j driver, Redis)
- [ ] 기본 예외 처리 및 응답 DTO 정의
- [ ] 로깅 설정 (SLF4J + Logback)
- **산출물**: `backend-java/build.gradle`, `application.properties`

**Python - 프로젝트 설정**
- [ ] FastAPI 프로젝트 생성
- [ ] 의존성 설정 (graphify, tree-sitter, neo4j-driver, redis, ollama)
- [ ] 기본 미들웨어 설정 (CORS, 에러 핸들링)
- [ ] 로깅 설정
- **산출물**: `backend-python/requirements.txt`, `main.py`

---

#### **Week 2 (인증 & DB 스키마)**

**Backend - 인증 & 보안**
- [ ] JWT 토큰 생성/검증 로직
- [ ] Spring Security 설정
- [ ] GitLab OAuth 설정
- [ ] 비밀번호 암호화 (BCrypt)
- [ ] 토큰 리프레시 메커니즘
- **산출물**: `AuthController.java`, `JwtTokenProvider.java`, `SecurityConfig.java`

**Backend - 데이터베이스 스키마**
- [ ] PostgreSQL 초기화 스크립트 작성
  - users, teams, team_members
  - projects, project_permissions
  - graph_jobs, graphs
  - audit_logs
- [ ] 인덱스 생성
- [ ] 제약 조건 설정 (FK, UK)
- [ ] 마이그레이션 도구 (Flyway) 설정
- **산출물**: `db/migration/V1__initial_schema.sql`

**Backend - 기본 엔티티**
- [ ] User, Team, Project, Permission 엔티티 클래스
- [ ] Repository 인터페이스
- [ ] 기본 CRUD 메서드
- **산출물**: `entity/*.java`, `repository/*.java`

---

### 📅 Week 3-4: 권한 & API 기초

#### **Week 3 (RBAC + ABAC 권한)**

**Backend - 권한 관리**
- [ ] RBAC 구현 (ADMIN, TEAM_LEAD, MEMBER, VIEWER)
  - Role 엔티티 및 권한 데이터베이스
  - UserRole 매핑
- [ ] ABAC 구현 (프로젝트별 권한)
  - ProjectPermission 엔티티
  - 권한 검증 로직
- [ ] 권한 확인 AOP/인터셉터
- [ ] Redis 권한 캐싱 (TTL: 30분)
- **산출물**: `permission/PermissionService.java`, `permission/RoleInterceptor.java`

**Backend - 감사 로그**
- [ ] AuditLog 엔티티
- [ ] 모든 쓰기 작업에 감사 로그 기록
- [ ] 감사 로그 조회 API
- **산출물**: `audit/AuditInterceptor.java`, `audit/AuditLogRepository.java`

---

#### **Week 4 (메타데이터 API)**

**Backend - Team & Project API**
- [ ] `GET /api/teams` - 팀 목록 (권한 필터링)
- [ ] `POST /api/teams` - 팀 생성
- [ ] `GET /api/teams/{teamId}/members` - 팀원 조회
- [ ] `POST /api/teams/{teamId}/members` - 팀원 초대
- [ ] `DELETE /api/teams/{teamId}/members/{userId}` - 팀원 제거
- [ ] `GET /api/projects` - 프로젝트 목록
- [ ] `POST /api/projects` - 프로젝트 생성
- [ ] `PUT /api/projects/{projectId}` - 프로젝트 수정
- [ ] `DELETE /api/projects/{projectId}` - 프로젝트 삭제
- [ ] `GET /api/projects/{projectId}/permissions` - 권한 조회
- **산출물**: `controller/TeamController.java`, `controller/ProjectController.java`

**Backend - GitLab 통합**
- [ ] GitLab API 클라이언트 (RestTemplate 또는 Feign)
- [ ] `POST /api/integrations/gitlab/connect` - 토큰 저장 (암호화)
- [ ] `GET /api/integrations/gitlab/repositories` - 리포지토리 목록 조회
- [ ] 토큰 갱신 로직
- **산출물**: `integration/GitLabClient.java`, `controller/IntegrationController.java`

**Backend - 테스트**
- [ ] 권한 검증 단위 테스트
- [ ] API 통합 테스트 (@SpringBootTest)
- [ ] PostgreSQL 테스트 컨테이너 (Testcontainers)
- **산출물**: `test/**Test.java`

---

### 🔧 Week 5-6: 그래프 분석 & 저장

#### **Week 5 (Graphify 통합 & 분석)**

**Python - Graphify 통합**
- [ ] Graphify 라이브러리 임포트 및 설정
- [ ] 코드 파일 다운로드 처리
  - GitLab API 호출
  - 로컬 폴더에 저장
  - 캐싱 (변경 파일만 재분석)
- [ ] tree-sitter 파싱
  - AST 추출 (클래스, 함수, 임포트)
  - 호출 그래프 분석
- [ ] 문서/이미지 처리
  - Markdown 파싱
  - 이미지 분석 (Ollama Vision)
- **산출물**: `analysis/GraphifyAnalyzer.py`, `analysis/FileDownloader.py`

**Python - LLM 의미 추출 (Ollama)**
- [ ] Ollama 클라이언트 설정
- [ ] 개념/관계 추출 프롬프트 작성
- [ ] 신뢰도 점수 계산 로직
- [ ] 배치 처리 (병렬 요청)
- [ ] 결과 캐싱 (Redis)
- **산출물**: `llm/OllamaClient.py`, `extraction/ConceptExtractor.py`

**Python - 그래프 구축 (NetworkX)**
- [ ] 추출 결과를 노드/엣지로 변환
- [ ] 중복 제거 로직
- [ ] 엣지 신뢰도 병합
- [ ] Leiden 커뮤니티 탐지
- **산출물**: `graph/GraphBuilder.py`, `community/CommunityDetector.py`

---

#### **Week 6 (Neo4j 저장 & Cypher)**

**Python - Neo4j 저장**
- [ ] Neo4j Python 드라이버 설정
- [ ] 노드 생성 (Function, Class, Module, Concept)
- [ ] 엣지 생성 (calls, imports, semantically_similar_to 등)
- [ ] 배치 작업 (트랜잭션)
- [ ] 중복 확인 및 업데이트 로직 (MERGE)
- [ ] 인덱스 생성 (성능)
- **산출물**: `neo4j/GraphWriter.py`

**Python - 메타데이터 저장**
- [ ] PostgreSQL에 graph_jobs 상태 저장
- [ ] graphs 테이블에 메타데이터 저장
- [ ] 분석 결과 요약 (노드수, 엣지수, 커뮤니티수)
- **산출물**: `database/MetadataWriter.py`

**Python - 그래프 쿼리 API**
- [ ] `POST /api/graphs/analyze` - 분석 작업 시작
- [ ] `GET /api/graphs/analyze/{jobId}/status` - 상태 조회
- [ ] `GET /api/graphs/analyze/{jobId}/logs` - 로그 조회
- [ ] `GET /api/graphs/{graphId}/nodes` - 노드 목록
- [ ] `GET /api/graphs/{graphId}/edges` - 엣지 목록
- [ ] `GET /api/graphs/{graphId}/communities` - 커뮤니티 목록
- **산출물**: `routes/graphs.py`

**Python - 테스트**
- [ ] Graphify 분석 단위 테스트
- [ ] Neo4j 쓰기 테스트 (테스트 컨테이너)
- [ ] 엣지 신뢰도 계산 테스트
- **산출물**: `test/**_test.py`

---

### 🔍 Week 7: 검색 & 경로 탐색

#### **Week 7 (경로 탐색 & 쿼리)**

**Python - GraphQL 쿼리 & 경로 탐색**
- [ ] Neo4j GraphQL 기본 쿼리 작성
- [ ] 경로 탐색 알고리즘 (DFS/BFS)
  - `POST /api/graphs/{graphId}/path` - A → B 경로 찾기
  - 응답: 경로 + 각 엣지의 관계/신뢰도
- [ ] 노드 상세 조회
  - `GET /api/graphs/{graphId}/nodes/{nodeId}`
  - 응답: 노드 정보 + 연결된 노드 + 커뮤니티
- [ ] 커뮤니티별 쿼리
  - God nodes 식별
  - 커뮤니티 멤버 조회
- **산출물**: `query/PathFinder.py`, `query/NodeQueries.py`

**Python - Cypher 쿼리 실행**
- [ ] 사용자 정의 Cypher 쿼리 API
  - `POST /api/graphs/{graphId}/query`
  - SQL 인젝션 방지
- [ ] 쿼리 결과 포맷팅
- **산출물**: `query/CypherExecutor.py`

**Python - Redis 캐싱**
- [ ] 검색 결과 캐싱 (TTL: 1시간)
- [ ] 경로 탐색 결과 캐싱
- [ ] 캐시 무효화 로직 (그래프 업데이트 시)
- **산출물**: `cache/CacheManager.py`

**Python - 테스트**
- [ ] 경로 탐색 알고리즘 테스트
- [ ] 캐시 동작 테스트
- [ ] 쿼리 성능 벤치마크
- **산출물**: `test/test_queries.py`

---

### 🎨 Week 5-7: React 프론트엔드 (병렬 진행)

#### **Week 5 (UI 기초)**

**Frontend - 프로젝트 설정**
- [ ] React + TypeScript 프로젝트 생성 (Vite)
- [ ] 의존성 설치 (vis.js, axios, react-router, zustand/redux)
- [ ] API 클라이언트 설정 (axios 인터셉터)
- [ ] 라우팅 구조 설계
- [ ] 기본 레이아웃 (헤더, 사이드바, 메인)
- **산출물**: `src/api/client.ts`, `src/router/index.ts`, `src/layout/`

**Frontend - 인증 페이지**
- [ ] 로그인 폼 (GitLab OAuth)
- [ ] 로그아웃 기능
- [ ] 토큰 저장 (localStorage)
- [ ] 권한 기반 페이지 제한
- **산출물**: `src/pages/Login.tsx`, `src/context/AuthContext.ts`

---

#### **Week 6 (그래프 시각화)**

**Frontend - vis.js 그래프 시각화**
- [ ] vis.js 네트워크 그래프 컴포넌트
- [ ] 노드/엣지 렌더링
- [ ] 노드 색상 (커뮤니티별)
- [ ] 엣지 스타일 (관계 타입별)
- [ ] 줌/팬 상호작용
- [ ] 노드 클릭 → 상세 정보 표시
- **산출물**: `src/components/GraphVisualization.tsx`

**Frontend - 그래프 네비게이션**
- [ ] 노드 검색 및 하이라이팅
- [ ] 커뮤니티 필터링
- [ ] 관계 타입 필터 (calls, imports 등)
- [ ] 신뢰도 범위 필터 (EXTRACTED만, INFERRED 포함 등)
- **산출물**: `src/components/GraphFilter.tsx`, `src/hooks/useGraphFilter.ts`

**Frontend - 노드 상세 패널**
- [ ] 선택된 노드의 정보 표시
- [ ] 연결된 노드 목록
- [ ] 소스 코드 링크
- [ ] 관계 목록 (신뢰도 포함)
- **산출물**: `src/components/NodeDetails.tsx`

---

#### **Week 7 (검색 & 권한 UI)**

**Frontend - 검색 & 쿼리 인터페이스**
- [ ] 검색 폼
  - 자유 텍스트 검색
  - 고급 필터 (노드 타입, 커뮤니티 등)
- [ ] 경로 탐색 UI
  - "A에서 B로 가는 경로 찾기"
  - 결과 시각화 (경로 강조)
- [ ] 검색 결과 표시 (테이블/리스트)
- **산출물**: `src/components/SearchForm.tsx`, `src/pages/SearchResults.tsx`

**Frontend - 팀 & 프로젝트 관리**
- [ ] 팀 생성 폼
- [ ] 팀원 초대 폼
- [ ] 프로젝트 생성 폼
- [ ] 프로젝트 권한 설정 UI
  - ABAC 선택 (owner, editor, commenter, viewer)
  - 사용자/그룹별 권한
- [ ] 권한 목록 및 제거
- **산출물**: `src/pages/TeamManagement.tsx`, `src/pages/ProjectSettings.tsx`

**Frontend - 테스트**
- [ ] 컴포넌트 단위 테스트 (React Testing Library)
- [ ] 통합 테스트 (E2E)
- **산출물**: `src/**/*.test.tsx`

---

### ✅ Week 8: 통합 & 최적화

#### **Week 8 (E2E 테스트 & 성능)**

**QA & 통합 테스트**
- [ ] End-to-end 테스트 (Cypress 또는 Playwright)
  - 로그인 → 그래프 분석 → 검색 → 권한 설정
  - 에러 케이스 처리
- [ ] 성능 벤치마크
  - 그래프 렌더링 시간 (1000+ 노드)
  - API 응답 시간
  - 캐시 히트율
- [ ] 버그 수정 및 최적화
- **산출물**: `tests/e2e/`, 성능 리포트

**배포 준비**
- [ ] Docker 이미지 빌드 및 테스트
- [ ] 환경 변수 검증
- [ ] 로그 수집 설정
- [ ] 모니터링 대시보드 (선택사항)
- [ ] 배포 문서 작성
- **산출물**: `Dockerfile`들, 배포 가이드

**사용자 수용 테스트 (UAT)**
- [ ] 비즈니스 요구사항 검증
- [ ] 사용자 피드백 수집
- [ ] 필수 버그 수정
- **산출물**: UAT 체크리스트, 피드백 로그

---

## 의존성 관계

```
기초 인프라 (Week 1-2)
├─ Docker Compose, PostgreSQL, Redis, Neo4j, Ollama
│
├─ 백엔드 인증 (Week 2)
│  ├─ 권한 시스템 (Week 3)
│  │  └─ 메타데이터 API (Week 4)
│  │     └─ GitLab 통합 (Week 4)
│  │
│  └─ DB 스키마 (Week 2)
│
├─ Python 그래프 분석 (Week 5-6)
│  ├─ Graphify 통합
│  ├─ Ollama LLM
│  ├─ Neo4j 저장
│  └─ 검색 & 경로 (Week 7)
│     └─ 캐싱 (Week 7)
│
└─ React 프론트엔드 (Week 5-7, 병렬)
   ├─ 기초 UI (Week 5)
   ├─ 그래프 시각화 (Week 6) → 의존 (Python 그래프 API)
   ├─ 검색 UI (Week 7) → 의존 (Python 검색 API)
   └─ 권한 UI (Week 7) → 의존 (Backend 메타데이터 API)

통합 & 테스트 (Week 8)
└─ 모든 모듈 완료
```

---

## 리소스 & 일정

### 👥 팀 구성

| 역할 | 인원 | 주요 담당 |
|------|------|---------|
| Backend (Java) | 2명 | 인증, 권한, API, DB |
| Python/분석 | 2명 | Graphify, 그래프 저장, 쿼리 |
| Frontend (React) | 2명 | UI, 시각화, 라우팅 |
| DevOps | 1명 | Docker, 배포, 모니터링 |
| QA | 1명 | 테스트, 성능, 문서 |

**총 8명**

### 📅 일정

| Phase | 기간 | 마일스톤 | 산출물 |
|-------|------|----------|--------|
| 1 | Week 1-2 | 인프라 완성 | Docker Compose, DB 스키마 |
| 2 | Week 3-4 | 권한 & API 완성 | 메타데이터 API, 권한 시스템 |
| 3 | Week 5-6 | 그래프 분석/저장 | Neo4j 쿼리, 시각화 UI |
| 4 | Week 7 | 검색/탐색 완성 | 검색 API, 경로 탐색 |
| 5 | Week 8 | MVP 완성 | E2E 테스트, 배포 가능 상태 |

### 💾 리소스 요청

| 항목 | 요청 |
|------|------|
| 개발 환경 | Windows 11 + WSL2, 16GB RAM, 200GB SSD |
| 서버 | 8 코어, 16GB RAM, 200GB 스토리지 |
| 클라우드 | 선택사항 (Self-hosted 우선) |
| 외부 API | GitLab (기존 사용), Ollama (로컬) |

---

## 위험 및 완화

| 위험 | 심각도 | 완화 방안 |
|------|--------|---------|
| 팀원 부족으로 인한 지연 | 높음 | • 외부 컨설턴트 고려<br/>• 우선순위 재조정<br/>• 스프린트 연장 (9-10주) |
| Neo4j 메모리 부족 | 중간 | • 시작 시 2GB, 모니터링<br/>• 대규모 그래프는 Phase 2로 |
| Ollama 응답 지연 | 중간 | • 배경 작업 처리<br/>• 결과 캐싱<br/>• 모델 최적화 |
| PostgreSQL 성능 저하 | 낮음-중간 | • 쿼리 최적화<br/>• 인덱스 관리<br/>• 파티셔닝 (향후) |
| 보안 이슈 (토큰 유출) | 높음 | • 암호화 저장<br/>• 감사 로그<br/>• 정기 회전<br/>• 코드 리뷰 |

---

## 성공 기준

### 기능성
- ✅ 모든 마이크로서비스 Docker에서 정상 실행
- ✅ 모든 메타데이터 API 동작
- ✅ 그래프 시각화 렌더링 성공
- ✅ 권한 검증 작동
- ✅ 검색 & 경로 탐색 가능

### 성능
- ✅ 그래프 시각화: 1000+ 노드에서 < 500ms 응답
- ✅ API 응답: < 200ms (캐시 미스)
- ✅ 권한 검증: < 100ms (캐시 히트)
- ✅ 코드 분석: < 2분 (중소 리포지토리)

### 품질
- ✅ 단위 테스트 커버리지: 70%+
- ✅ 통합 테스트: 모든 주요 플로우
- ✅ E2E 테스트: 최소 5개 시나리오
- ✅ 버그: Critical 0건, High < 5건

### 사용자 수락
- ✅ 팀원 5명 이상 UAT 완료
- ✅ 피드백 Critical 이슈 해결
- ✅ 배포 문서 완성

---

## 다음 단계

1. **팀 구성 및 권한 위임** (이번주)
2. **개발 환경 설정** (Week 1)
3. **스프린트 계획 수립** (주간)
4. **정기 상태 보고** (주 2회)

---

**계획 수립 완료**: 2026-04-08  
**첫 스프린트 시작**: 2026-04-15 예정
