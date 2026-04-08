# Backend & Database Design - Graphify

**작성일**: 2026-04-08  
**상태**: 설계 리뷰 중  
**기술스택**: Java Spring Boot 3.x + PostgreSQL + Neo4j

---

## 1. 아키텍처 개요

### 포트 구성
- **Java 백엔드**: Port 8086 (사용자/팀/프로젝트/권한 관리)
- **Python FastAPI**: Port 8006 (그래프 분석/파싱/LLM)
- **PostgreSQL**: Port 5432 (메타데이터, RBAC)
- **Neo4j**: Port 7687 (지식 그래프)
- **Redis**: Port 6379 (캐싱)

### Java 백엔드 책임
```
┌─────────────────────────────────────────┐
│     Spring Boot 3.x (Port 8086)         │
├─────────────────────────────────────────┤
│ 계층 구조:                               │
│                                         │
│ 1. Controller (REST API)                │
│    └─ /api/auth, /api/users, /api/teams │
│       /api/projects, /api/permissions    │
│                                         │
│ 2. Service (비즈니스 로직)               │
│    └─ UserService, TeamService,        │
│       ProjectService, PermissionService │
│                                         │
│ 3. Repository (데이터 접근)             │
│    └─ Spring Data JPA                   │
│                                         │
│ 4. Entity (도메인 모델)                 │
│    └─ User, Team, Project, Permission   │
│                                         │
│ 5. Security (인증/권한)                 │
│    └─ Spring Security + JWT             │
└─────────────────────────────────────────┘
```

---

## 2. PostgreSQL 데이터베이스 스키마

### 2.1 사용자 관리

```sql
-- users 테이블
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'MEMBER', -- ADMIN, TEAM_LEAD, MEMBER, VIEWER
    gitlab_id VARCHAR(255),
    gitlab_token_encrypted TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT REFERENCES users(id),
    updated_by BIGINT REFERENCES users(id)
);

-- roles 테이블 (역할 정의)
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL, -- ADMIN, TEAM_LEAD, MEMBER, VIEWER
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- role_permissions 테이블 (역할별 권한)
CREATE TABLE role_permissions (
    id BIGSERIAL PRIMARY KEY,
    role_id BIGINT NOT NULL REFERENCES roles(id),
    permission_name VARCHAR(255) NOT NULL, -- users:read, projects:create, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2.2 팀 관리

```sql
-- teams 테이블
CREATE TABLE teams (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by BIGINT NOT NULL REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- team_members 테이블 (다대다 관계)
CREATE TABLE team_members (
    id BIGSERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'MEMBER', -- TEAM_LEAD, MEMBER
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    invited_by BIGINT REFERENCES users(id),
    invited_at TIMESTAMP,
    UNIQUE(team_id, user_id)
);

CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
```

### 2.3 프로젝트 관리

```sql
-- projects 테이블
CREATE TABLE projects (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    created_by BIGINT NOT NULL REFERENCES users(id),
    gitlab_url VARCHAR(500),
    gitlab_repo_id VARCHAR(255),
    gitlab_token_encrypted TEXT,
    status VARCHAR(50) DEFAULT 'INITIALIZED', -- INITIALIZED, SYNCING, READY, ERROR
    last_synced_at TIMESTAMP,
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_projects_team_id ON projects(team_id);
CREATE INDEX idx_projects_created_by ON projects(created_by);

-- project_permissions 테이블 (ABAC)
CREATE TABLE project_permissions (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL, -- owner, editor, commenter, viewer
    granted_by BIGINT NOT NULL REFERENCES users(id),
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, user_id)
);

CREATE INDEX idx_project_permissions_project_id ON project_permissions(project_id);
CREATE INDEX idx_project_permissions_user_id ON project_permissions(user_id);
```

### 2.4 그래프 분석 작업

```sql
-- graph_jobs 테이블 (분석 작업 추적)
CREATE TABLE graph_jobs (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, RUNNING, COMPLETED, FAILED
    source VARCHAR(50) NOT NULL, -- GITLAB, GITHUB, UPLOAD
    source_url VARCHAR(500),
    total_nodes INTEGER DEFAULT 0,
    total_edges INTEGER DEFAULT 0,
    total_communities INTEGER DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT NOT NULL REFERENCES users(id)
);

CREATE INDEX idx_graph_jobs_project_id ON graph_jobs(project_id);
CREATE INDEX idx_graph_jobs_status ON graph_jobs(status);

-- graphs 테이블 (그래프 메타데이터)
CREATE TABLE graphs (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    job_id BIGINT NOT NULL REFERENCES graph_jobs(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    nodes_count INTEGER DEFAULT 0,
    edges_count INTEGER DEFAULT 0,
    communities_count INTEGER DEFAULT 0,
    is_latest BOOLEAN DEFAULT true,
    neo4j_graph_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_graphs_project_id ON graphs(project_id);
CREATE INDEX idx_graphs_job_id ON graphs(job_id);
```

### 2.5 감시 및 감사

```sql
-- audit_logs 테이블 (모든 작업 추적)
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    actor_id BIGINT REFERENCES users(id),
    action VARCHAR(255) NOT NULL, -- CREATE, UPDATE, DELETE, QUERY
    resource_type VARCHAR(100) NOT NULL, -- User, Team, Project, Graph
    resource_id VARCHAR(255) NOT NULL,
    changes JSONB, -- 변경 내용 기록 (UPDATE 시)
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

---

## 3. Java Spring Boot 엔티티 & 구조

### 3.1 핵심 엔티티 클래스

```java
// User.java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String username;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String passwordHash;
    
    @Enumerated(EnumType.STRING)
    private UserRole role; // ADMIN, TEAM_LEAD, MEMBER, VIEWER
    
    private String displayName;
    private String gitlabId;
    private String gitlabTokenEncrypted;
    private boolean isActive;
    private LocalDateTime lastLoginAt;
    
    @Temporal(TemporalType.TIMESTAMP)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.LAZY)
    private List<TeamMember> teamMemberships;
    
    @OneToMany(mappedBy = "createdBy", cascade = CascadeType.LAZY)
    private List<Team> createdTeams;
}

// Team.java
@Entity
@Table(name = "teams")
public class Team {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    private String description;
    
    @ManyToOne
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;
    
    private boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TeamMember> members;
    
    @OneToMany(mappedBy = "team", cascade = CascadeType.LAZY)
    private List<Project> projects;
}

// Project.java
@Entity
@Table(name = "projects")
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    private String description;
    
    @ManyToOne
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;
    
    @ManyToOne
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;
    
    private String gitlabUrl;
    private String gitlabRepoId;
    private String gitlabTokenEncrypted;
    
    @Enumerated(EnumType.STRING)
    private ProjectStatus status; // INITIALIZED, SYNCING, READY, ERROR
    
    private LocalDateTime lastSyncedAt;
    private boolean isArchived;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL)
    private List<ProjectPermission> permissions;
    
    @OneToMany(mappedBy = "project", cascade = CascadeType.LAZY)
    private List<GraphJob> graphJobs;
}
```

### 3.2 프로젝트 구조

```
src/main/java/com/graphify/backend/
├── config/                    # Spring 설정
│   ├── SecurityConfig.java
│   ├── JwtConfig.java
│   └── CorsConfig.java
├── controller/                # REST API
│   ├── AuthController.java
│   ├── UserController.java
│   ├── TeamController.java
│   ├── ProjectController.java
│   └── PermissionController.java
├── service/                   # 비즈니스 로직
│   ├── UserService.java
│   ├── TeamService.java
│   ├── ProjectService.java
│   ├── PermissionService.java
│   └── AuditService.java
├── repository/                # Data Access (Spring Data JPA)
│   ├── UserRepository.java
│   ├── TeamRepository.java
│   ├── ProjectRepository.java
│   ├── PermissionRepository.java
│   └── AuditLogRepository.java
├── entity/                    # JPA Entities
│   ├── User.java
│   ├── Team.java
│   ├── TeamMember.java
│   ├── Project.java
│   ├── ProjectPermission.java
│   ├── GraphJob.java
│   └── AuditLog.java
├── dto/                       # Data Transfer Objects
│   ├── request/
│   │   ├── LoginRequest.java
│   │   ├── CreateTeamRequest.java
│   │   ├── CreateProjectRequest.java
│   │   └── GrantPermissionRequest.java
│   └── response/
│       ├── LoginResponse.java
│       ├── UserDTO.java
│       ├── TeamDTO.java
│       ├── ProjectDTO.java
│       └── ErrorResponse.java
├── security/                  # 보안 관련
│   ├── JwtTokenProvider.java
│   ├── CustomUserDetailsService.java
│   ├── JwtAuthenticationFilter.java
│   └── UserPrincipal.java
├── exception/                 # 예외 처리
│   ├── ResourceNotFoundException.java
│   ├── UnauthorizedException.java
│   └── GlobalExceptionHandler.java
├── util/                      # 유틸리티
│   ├── EncryptionUtil.java   (GitLab 토큰 암호화)
│   ├── ValidationUtil.java
│   └── LoggingUtil.java
└── GraphifyBackendApplication.java
```

---

## 4. 인증 & 보안 전략

### 4.1 JWT 기반 인증

```java
// 토큰 구조
JWT Header: {
    "alg": "HS256",
    "typ": "JWT"
}

JWT Payload: {
    "sub": "user_id",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "TEAM_LEAD",
    "iat": 1234567890,
    "exp": 1234571490,  // 1시간 유효
    "iss": "graphify"
}

JWT Signature: HMACSHA256(base64(header) + "." + base64(payload), secret_key)
```

### 4.2 권한 검증 (RBAC + ABAC)

```java
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<List<UserDTO>> getAllUsers() { ... }

@PreAuthorize("@permissionService.canAccessProject(#projectId, principal)")
public ResponseEntity<GraphDTO> getProjectGraph(@PathVariable Long projectId) { ... }
```

---

## 5. API 엔드포인트 (Java 백엔드)

### 5.1 인증

```
POST   /api/auth/login              - 로그인 (username, password)
POST   /api/auth/logout             - 로그아웃
POST   /api/auth/refresh            - 토큰 갱신
GET    /api/auth/validate           - 토큰 검증
POST   /api/auth/oauth/gitlab       - GitLab OAuth 콜백
```

### 5.2 사용자 관리

```
GET    /api/users                   - 사용자 목록 (ADMIN만)
GET    /api/users/{userId}          - 사용자 조회
PUT    /api/users/{userId}          - 사용자 정보 수정
DELETE /api/users/{userId}          - 사용자 삭제 (ADMIN)
POST   /api/users/register          - 새 사용자 등록
GET    /api/me                      - 현재 사용자 정보
```

### 5.3 팀 관리

```
GET    /api/teams                   - 사용자가 속한 팀 목록
POST   /api/teams                   - 팀 생성
GET    /api/teams/{teamId}          - 팀 상세 조회
PUT    /api/teams/{teamId}          - 팀 정보 수정
DELETE /api/teams/{teamId}          - 팀 삭제 (TEAM_LEAD/ADMIN)
GET    /api/teams/{teamId}/members  - 팀 멤버 목록
POST   /api/teams/{teamId}/members  - 팀 멤버 초대
DELETE /api/teams/{teamId}/members/{userId} - 팀 멤버 제거
```

### 5.4 프로젝트 관리

```
GET    /api/projects                - 사용자가 접근 가능한 프로젝트 목록
POST   /api/projects                - 프로젝트 생성
GET    /api/projects/{projectId}    - 프로젝트 상세 조회
PUT    /api/projects/{projectId}    - 프로젝트 정보 수정
DELETE /api/projects/{projectId}    - 프로젝트 삭제 (owner/ADMIN)
POST   /api/projects/{projectId}/sync - GitLab 코드 동기화 (Python 호출)
GET    /api/projects/{projectId}/jobs - 분석 작업 목록
```

### 5.5 권한 관리 (ABAC)

```
GET    /api/projects/{projectId}/permissions - 프로젝트 권한 목록
POST   /api/permissions/grant       - 권한 부여
DELETE /api/permissions/{permissionId} - 권한 취소
PUT    /api/permissions/{permissionId} - 권한 수정
```

### 5.6 감사 로그

```
GET    /api/audit-logs              - 감사 로그 (ADMIN만)
GET    /api/audit-logs/user/{userId} - 사용자별 감시 로그
```

---

## 6. 데이터 흐름

### 6.1 로그인 흐름

```
1. 사용자가 /api/auth/login에 POST (username, password)
2. UserService.authenticate() 호출
3. BCrypt로 비밀번호 검증
4. JwtTokenProvider로 JWT 생성 (1시간 유효)
5. 토큰과 사용자 정보 반환
6. 클라이언트가 Authorization 헤더에 토큰 포함해 다음 요청 전송
```

### 6.2 프로젝트 권한 확인

```
1. GET /api/projects/{projectId}
2. JwtAuthenticationFilter가 토큰 검증
3. @PreAuthorize 수행
4. PermissionService.canAccessProject(projectId, user) 호출
5. project_permissions 테이블에서 조회
6. 캐시(Redis)에 결과 저장 (TTL: 10분)
7. 접근 허용/거부
```

### 6.3 프로젝트 생성 흐름

```
1. POST /api/projects (name, description, teamId, gitlabUrl, gitlabToken)
2. ProjectService.createProject() 호출
3. Team 접근 권한 확인
4. Project entity 생성 (status: INITIALIZED)
5. GitLab 토큰 암호화 저장
6. 프로젝트 ID 반환
7. 클라이언트가 /api/projects/{projectId}/sync 호출
8. Python FastAPI로 분석 작업 큐잉 (비동기)
9. GraphJob 생성 (status: PENDING)
```

---

## 7. 외부 서비스 통합

### 7.1 Python FastAPI 연동

```java
// Python 호출 예시
@Service
public class GraphSyncService {
    private final RestTemplate restTemplate;
    
    public void triggerGraphAnalysis(Long projectId) {
        String pythonUrl = "http://localhost:8006/api/graphs/analyze";
        GraphAnalysisRequest request = new GraphAnalysisRequest(projectId);
        restTemplate.postForObject(pythonUrl, request, GraphAnalysisResponse.class);
    }
}
```

### 7.2 GitLab API 연동

```java
@Service
public class GitlabIntegrationService {
    
    public RepositoryInfo getRepositoryInfo(String gitlabUrl, String token) {
        // GitLab API를 통해 저장소 정보 조회
        // tree-sitter 파싱을 위한 코드 다운로드
    }
}
```

---

## 8. 설정 파일 (application.yml)

```yaml
spring:
  application:
    name: graphify-backend
  
  datasource:
    url: jdbc:postgresql://localhost:5432/graphify
    username: graphify_user
    password: ${DB_PASSWORD}
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
  
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQL10Dialect
        format_sql: true
  
  redis:
    host: localhost
    port: 6379
    password: ${REDIS_PASSWORD}
    timeout: 2000
  
  security:
    jwt:
      secret: ${JWT_SECRET}
      expiration: 3600000  # 1시간

server:
  port: 8086
  servlet:
    context-path: /api

logging:
  level:
    com.graphify: DEBUG
    org.springframework: INFO
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} %-5p %logger{36} - %msg%n"
```

---

## 9. 보안 고려사항

### 9.1 암호화
- GitLab 토큰: AES-256 암호화 저장
- 비밀번호: BCrypt(cost: 12) 해싱
- JWT: HS256 서명

### 9.2 권한 최소화
- 데이터베이스 사용자 최소 권한 (graphify_user: SELECT, INSERT, UPDATE만)
- PostgreSQL 역할 기반 접근 제어

### 9.3 감사 로그
- 모든 CREATE/UPDATE/DELETE 작업 기록
- 사용자별 활동 추적
- 변경 내용 (JSONB) 저장

---

## 10. 배포 구성

### 10.1 Docker Compose (Java 백엔드)

```yaml
# docker-compose.yml에 추가
java_backend:
  image: openjdk:21-jdk-slim
  ports:
    - "8086:8086"
  environment:
    DATABASE_URL: postgresql://postgres:5432/graphify
    DB_PASSWORD: ${POSTGRES_PASSWORD}
    REDIS_PASSWORD: ${REDIS_PASSWORD}
    JWT_SECRET: ${JWT_SECRET}
  depends_on:
    - postgres
    - redis
  volumes:
    - ./backend:/app
  command: ./mvnw spring-boot:run
```

---

## 11. 마이그레이션 전략

### Flyway를 통한 스키마 관리

```sql
-- db/migration/V1__Initial_Schema.sql
-- V2__Add_Audit_Logs.sql
-- V3__Add_Indexes.sql
```

Spring Boot Flyway 자동 마이그레이션으로 스키마 일관성 유지.

---

## 12. 성능 최적화

### 쿼리 최적화
- JPA Lazy Loading (N+1 쿼리 방지)
- @EntityGraph로 조인 최적화
- 인덱스 전략 (team_id, project_id, user_id 등)

### 캐싱 전략
- Redis: 권한 조회 (TTL: 10분)
- Redis: 팀 멤버 목록 (TTL: 30분)
- Spring Cache @Cacheable 활용

---

## 13. 구현 우선순위

**Phase 1** (MVP):
1. User, Team, Project 엔티티 & Repository
2. 인증 (JWT) & 로그인
3. RBAC 권한 검증
4. 기본 CRUD API

**Phase 2**:
1. ABAC (프로젝트별 권한)
2. 감시 로그
3. GitLab 통합

**Phase 3**:
1. 성능 최적화 (캐싱, 인덱스)
2. 테스트 (JUnit5, Mockito)

---

**다음 단계**: 이 설계를 승인 후 implementation plan (writing-plans) 수립

