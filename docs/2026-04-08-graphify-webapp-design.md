# Graphify Web Application - 설계 문서

**작성일**: 2026-04-08  
**상태**: 설계 승인됨  
**프로젝트**: Enterprise 지식베이스 플랫폼  
**대상**: 회사 내부 (100명 미만)

---

## 1. 프로젝트 개요

### 목적
회사/팀 내 **코드 + 문서 + 설계 결정**을 하나의 **구조화된 지식 그래프**로 통합 관리하고, 빠른 탐색과 의미론적 검색을 지원하는 웹 애플리케이션.

### 사용자
- **ADMIN**: 시스템 전체 관리, 사용자 관리
- **TEAM_LEAD**: 팀 그래프 관리, 팀원 초대
- **MEMBER**: 팀 그래프 읽기/쓰기, 개인 그래프 소유
- **VIEWER**: 공유된 그래프 읽기만

### 배포
- **환경**: Windows Desktop Self-hosted
- **네트워크**: 회사 내부 폐쇄망
- **기술 스택**: Java + React + PostgreSQL + Neo4j + Python + Ollama

---

## 2. 시스템 아키텍처

### 2.1 전체 구조

```
┌─────────────────────────────────────────────────────────────────┐
│                     REACT 웹 UI (Port 3000)                      │
│  ├─ 그래프 시각화 (vis.js)                                       │
│  ├─ 그래프 탐색 (경로 찾기, 커뮤니티 탐색)                        │
│  ├─ 팀/프로젝트/권한 관리                                        │
│  └─ 검색 & 쿼리 인터페이스                                       │
└────────────────┬────────────────────────────────┬────────────────┘
                 │ REST API                       │ REST API
                 ▼                                ▼
    ┌──────────────────────┐      ┌──────────────────────────┐
    │   JAVA 백엔드         │      │  PYTHON FastAPI          │
    │   (Port 8080)        │      │  (Port 8000)             │
    ├──────────────────────┤      ├──────────────────────────┤
    │ • 사용자/권한 관리    │      │ • Graphify 라이브러리    │
    │ • 팀 & 프로젝트      │      │ • tree-sitter 파싱      │
    │ • OAuth (GitLab)     │      │ • Ollama 의미 추출      │
    │ • GitLab API 통합   │      │ • 그래프 분석/클러스터   │
    │ • 메타데이터         │      │ • Neo4j Cypher 생성     │
    │ • 캐시 조율          │      │ • Redis 캐싱            │
    └──────────┬───────────┘      └──────────┬───────────────┘
               │                             │
         ┌─────┴─────────────────────────────┴────┐
         │                                        │
         ├────────────────────────────────────────┤
         │                                        │
         ▼                ▼                ▼      ▼
    ┌─────────┐      ┌─────────┐      ┌──────────┐
    │PostgreSQL       │ Neo4j        │ Ollama   │
    │(기존)          │(NEW)         │(NEW)     │
    │Port 5432       │Port 7687     │Port 11434│
    ├─────────┤      │             │          │
    │ • Users │      │ • Nodes     │ • 로컬   │
    │ • Teams │      │ • Edges     │   모델   │
    │ • Projects      │ • Communities│ • GPU    │
    │ • Roles │      │ • Queries   │   활용   │
    │ • Permissions   │ (EXTRACTED/ │          │
    │ • Audit Log     │  INFERRED)  │          │
    └─────────┘      └─────────┘      └──────────┘
    
    🐳 Docker Compose (Windows Desktop)
    ├─ Java 컨테이너 (신규)
    ├─ Python 컨테이너 (신규)
    ├─ PostgreSQL 컨테이너 (기존)
    ├─ Redis 컨테이너 (기존)
    ├─ Neo4j 컨테이너 (신규)
    ├─ Ollama 컨테이너 (신규)
    └─ React 프론트엔드 (신규)
```

### 2.2 서비스 책임

| 서비스 | 포트 | 책임 |
|--------|------|------|
| React | 3000 | UI, 그래프 시각화, 사용자 입력 |
| Java 백엔드 | 8080 | 인증, 권한, 메타데이터, 비즈니스 로직 |
| Python FastAPI | 8000 | 그래프 분석, 파싱, 임베딩, 쿼리 생성 |
| PostgreSQL | 5432 | 사용자, 팀, 프로젝트, 권한, 감사 로그 (기존) |
| Neo4j | 7687 | 지식 그래프 저장 및 쿼리 |
| Redis | 6379 | 캐싱 (기존) |
| Ollama | 11434 | 로컬 LLM (의미 추출, 임베딩) |

---

## 3. 권한 모델

### 3.1 RBAC (Role-Based Access Control)

```
ADMIN
├─ 모든 리소스 접근
├─ 사용자/팀 관리
├─ 시스템 설정
└─ 감사 로그 조회

TEAM_LEAD
├─ 팀의 그래프 접근/편집
├─ 팀원 초대/제거
├─ 팀 내 권한 설정
└─ 팀 그래프 공유

MEMBER
├─ 자신이 속한 그래프만 접근
├─ 팀 그래프 읽기/편집
├─ 개인 그래프 소유
└─ 검색/쿼리 가능

VIEWER
└─ 읽기만 가능 (공유된 그래프)
```

### 3.2 ABAC (Attribute-Based - 프로젝트별)

```
프로젝트별 권한:
├─ owner: 모든 권한 (삭제 포함)
├─ editor: 읽기/쓰기/분석
├─ commenter: 읽기 + 코멘트
└─ viewer: 읽기만

공유 범위:
├─ private: 본인/팀장만
├─ team: 팀원 전체
├─ company: 전사 공개
└─ custom: 특정 사용자/그룹
```

---

## 4. 데이터 모델

### 4.1 PostgreSQL 스키마 (주요 테이블)

```sql
-- 사용자
users (id, username, email, role, created_at, updated_at)

-- 팀
teams (id, name, description, created_by, created_at)

-- 팀 멤버
team_members (id, team_id, user_id, role, joined_at)

-- 프로젝트
projects (id, name, description, team_id, created_by, gitlab_url, gitlab_token_encrypted, status)

-- 프로젝트 권한 (ABAC)
project_permissions (id, project_id, user_id, role, granted_by, granted_at)

-- 그래프 분석 작업
graph_jobs (id, project_id, status, source, source_url, total_nodes, total_edges, started_at, completed_at)

-- 그래프 메타데이터
graphs (id, project_id, job_id, name, nodes_count, edges_count, communities_count, is_latest)

-- 감사 로그
audit_logs (id, actor_id, action, resource_type, resource_id, changes, created_at)
```

### 4.2 Neo4j 그래프 모델

```cypher
// 노드 타입
(:Function {id, label, source_file, language, community})
(:Class {id, label, source_file, language, community})
(:Module {id, label, source_file, community})
(:Concept {id, label, source_document, community})

// 엣지 타입
(n)-[:calls {confidence}]->(m)
(n)-[:imports {confidence}]->(m)
(n)-[:inherits {confidence}]->(m)
(n)-[:semantically_similar_to {confidence_score}]->(m)
(n)-[:defined_in {confidence}]->(m)
(n)-[:part_of_community {confidence}]->(m)

// 엣지 속성
relation: "calls|imports|inherits|semantically_similar_to|..."
confidence: "EXTRACTED|INFERRED|AMBIGUOUS"
confidence_score: 0.0-1.0 (INFERRED에만)
source_location: "filename:line"
```

---

## 5. 주요 API 엔드포인트

### 5.1 Java 백엔드

**인증**
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `POST /api/auth/oauth/gitlab` - GitLab OAuth 콜백

**사용자 & 팀**
- `GET /api/users` - 사용자 목록
- `POST /api/teams` - 팀 생성
- `GET /api/teams/{teamId}/members` - 팀원 조회
- `POST /api/teams/{teamId}/members` - 팀원 초대
- `DELETE /api/teams/{teamId}/members/{userId}` - 팀원 제거

**프로젝트**
- `GET /api/projects` - 프로젝트 목록
- `POST /api/projects` - 프로젝트 생성
- `PUT /api/projects/{projectId}` - 프로젝트 수정
- `DELETE /api/projects/{projectId}` - 프로젝트 삭제

**권한 (ABAC)**
- `POST /api/permissions/grant` - 권한 부여
- `DELETE /api/permissions/{permissionId}` - 권한 제거
- `GET /api/projects/{projectId}/permissions` - 프로젝트 권한 조회

**GitLab 통합**
- `POST /api/integrations/gitlab/connect` - GitLab 연결
- `GET /api/integrations/gitlab/repositories` - 리포 목록

### 5.2 Python FastAPI

**그래프 분석**
- `POST /api/graphs/analyze` - 분석 작업 시작 (수동)
- `GET /api/graphs/analyze/{jobId}/status` - 작업 상태 조회
- `GET /api/graphs/analyze/{jobId}/logs` - 작업 로그

**그래프 조회**
- `GET /api/graphs/{graphId}/nodes` - 노드 목록
- `GET /api/graphs/{graphId}/edges` - 엣지 목록
- `GET /api/graphs/{graphId}/communities` - 커뮤니티 목록

**경로 탐색**
- `POST /api/graphs/{graphId}/path` - 노드 간 경로 찾기

**노드 상세**
- `GET /api/graphs/{graphId}/nodes/{nodeId}` - 노드 정보 및 연결된 노드

**Cypher 쿼리**
- `POST /api/graphs/{graphId}/query` - Neo4j Cypher 쿼리 실행

---

## 6. 데이터 흐름

### 6.1 그래프 분석 플로우 (수동 업데이트)

```
사용자가 "업데이트" 버튼 클릭
         │
         ▼
┌─────────────────────────────┐
│ 1. GitLab 코드 다운로드      │
│    (Java 백엔드)            │
│    • Personal Access Token  │
│    • 로컬 임시 폴더에 저장   │
└─────────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ 2. 파일 분석 (Python)        │
│    • tree-sitter AST 파싱   │
│    • 클래스, 함수, 임포트    │
│    • 호출 그래프 분석        │
│    • 문서/이미지 처리        │
└─────────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ 3. LLM 의미 추출 (Ollama)    │
│    • 개념 관계 식별          │
│    • 신뢰도 점수 계산        │
│    • Redis에 임시 캐시       │
└─────────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ 4. 그래프 생성 (NetworkX)    │
│    • 노드/엣지 통합          │
│    • Leiden 커뮤니티 탐지   │
│    • Neo4j에 저장           │
└─────────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ 5. 메타데이터 저장           │
│    • PostgreSQL에 저장       │
│    • graph_jobs 상태 업데이트│
│    • 분석 완료               │
└─────────────────────────────┘
         │
         ▼
  사용자가 시각화 보기
  검색/쿼리 실행
```

### 6.2 쿼리 플로우

```
사용자 검색어 입력
         │
         ▼
┌─────────────────────────────┐
│ 1. Redis 캐시 확인           │
│    (최근 검색 결과)          │
└─────────────────────────────┘
    캐시 히트 ─→ 결과 반환 (10ms)
    캐시 미스 ↓
┌─────────────────────────────┐
│ 2. Neo4j GraphQL 쿼리       │
│    • 경로 탐색               │
│    • 노드/엣지 조회          │
│    • 커뮤니티 필터링         │
└─────────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ 3. 결과 Redis 캐시           │
│    (TTL: 1시간)             │
└─────────────────────────────┘
         │
         ▼
    React에 결과 전송 (시각화)
```

---

## 7. 배포 & 운영

### 7.1 Docker Compose

**포함 서비스:**
- Java 백엔드 (신규)
- Python FastAPI (신규)
- PostgreSQL (기존)
- Redis (기존)
- Neo4j (신규)
- Ollama (신규)
- React 프론트엔드 (신규)

**실행 명령:**
```bash
docker-compose up -d
```

**.env 설정:**
```
POSTGRES_DB=postgres
POSTGRES_USER=anchors
POSTGRES_PASSWORD=Dodzjtm26!@pg

REDIS_PASSWORD=Dodzjtm26!@redis

NEO4J_PASSWORD=your_neo4j_password

GITLAB_CLIENT_ID=your_gitlab_client_id
GITLAB_CLIENT_SECRET=your_gitlab_client_secret
```

### 7.2 시스템 요구사항

| 리소스 | 최소 | 권장 |
|--------|------|------|
| CPU | 4 cores | 8 cores |
| 메모리 | 8GB | 16GB |
| 디스크 | 50GB | 200GB |
| OS | Windows 10+ | Windows 11 + WSL2 (GPU 지원) |

---

## 8. MVP 우선순위

### Phase 1 (Weeks 1-8)
1. **그래프 시각화 & 탐색** - vis.js 기반 인터랙티브 그래프
2. **검색 & 쿼리** - Neo4j GraphQL 기반 경로 탐색
3. **코드/문서 업로드** - Graphify 통합 분석
4. **권한 관리** - RBAC + ABAC 구현

### Phase 2 (Weeks 9-12) - 문서: PHASE2_VECTORDB_EXPANSION.md
- Qdrant 의미론적 검색 추가
- Redis 캐싱 최적화
- 성능 벤치마크

### Phase 3 (향후)
- Linear 프로젝트 관리 도구 통합
- Wiki 자동 생성
- 실시간 협업 기능

---

## 9. 기술 고려사항

### 9.1 보안
- GitLab Personal Access Token 암호화 저장
- PostgreSQL 권한 최소화 원칙
- Redis 패스워드 보호
- Neo4j 기본 인증 변경

### 9.2 성능
- Neo4j 인덱스 최적화 (nodes, edges)
- PostgreSQL 쿼리 최적화 (권한 조회)
- Redis TTL 전략 (1시간)
- Python 벡터화된 연산 (numpy)

### 9.3 확장성
- Docker 컨테이너 리소스 제한 관리
- Neo4j 메모리 2-4GB 할당
- PostgreSQL 연결 풀링 (HikariCP)
- Python 워커 수 설정 (uvicorn)

---

## 10. 위험 및 완화

| 위험 | 심각도 | 완화 방안 |
|------|--------|---------|
| Neo4j 메모리 부족 | 높음 | 시작 시 2GB, 모니터링 후 증설 |
| Ollama 응답 지연 | 중간 | 분석 작업 배경 실행, 캐싱 |
| GitLab 토큰 유출 | 높음 | 암호화, 감사 로그, 정기 회전 |
| PostgreSQL 권한 실수 | 중간 | 스키마 검토, 테스트 환경 검증 |

---

## 11. 성공 기준

- ✅ 모든 마이크로서비스 Docker에서 정상 실행
- ✅ 그래프 시각화 1000+ 노드에서 < 500ms 응답
- ✅ 권한 검증 < 100ms (캐시)
- ✅ 코드 분석 < 2분 (중소 리포지토리)
- ✅ 사용자 승인 테스트 완료

---

## 12. 향후 확장 계획

**Phase 2: 벡터 검색**
- Qdrant 추가
- 의미론적 유사도 검색
- 문서: `PHASE2_VECTORDB_EXPANSION.md` 참고

**Phase 3: Linear 통합**
- Issue/PR과 지식 그래프 연결
- 자동 추적 및 연관성 분석

**Phase 4: 실시간 협업**
- WebSocket 기반 동시 편집
- 변경 이력 추적

---

**설계 문서 승인**: 2026-04-08  
**다음 단계**: Implementation Planning (writing-plans 스킬)
