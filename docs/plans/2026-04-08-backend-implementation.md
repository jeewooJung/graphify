# Backend & Database Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a production-ready Java Spring Boot backend with PostgreSQL, JWT authentication, RBAC+ABAC authorization, and Neo4j integration for Graphify knowledge graph platform.

**Architecture:** Spring Boot 3.x REST API (port 8086) with PostgreSQL for metadata and RBAC, Neo4j for graph storage, Redis for caching. JWT-based authentication with role-based and attribute-based access control. Clean layered architecture: Controller → Service → Repository → Entity.

**Tech Stack:** 
- Java 21 + Spring Boot 3.x
- PostgreSQL 15+ with Spring Data JPA
- Neo4j 5.x
- Redis for caching
- JWT (jjwt)
- Flyway for migrations
- Gradle build tool

---

## Phase 1: Project Setup & Database

### Task 1: Create Spring Boot Project & Dependencies

**Files:**
- Create: `backend/build.gradle`
- Create: `backend/src/main/resources/application.yml`
- Create: `backend/src/main/java/com/graphify/backend/GraphifyBackendApplication.java`
- Modify: `.gitignore`

**Step 1: Generate Spring Boot project structure**

```bash
cd /c/workspaceRND/graphify/graphify
mkdir -p backend/src/main/java/com/graphify/backend
mkdir -p backend/src/main/resources
mkdir -p backend/src/test/java/com/graphify/backend
```

**Step 2: Create build.gradle**

```gradle
plugins {
    id 'java'
    id 'org.springframework.boot' version '3.2.0'
    id 'io.spring.dependency-management' version '1.1.4'
}

group = 'com.graphify'
version = '0.1.0'
sourceCompatibility = '21'

repositories {
    mavenCentral()
}

dependencies {
    // Spring Boot
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'org.springframework.boot:spring-boot-starter-security'
    implementation 'org.springframework.boot:spring-boot-starter-data-redis'
    implementation 'org.springframework.boot:spring-boot-starter-validation'
    
    // Database
    implementation 'org.postgresql:postgresql:42.7.1'
    implementation 'org.flywaydb:flyway-core:9.22.3'
    
    // JWT
    implementation 'io.jsonwebtoken:jjwt-api:0.12.3'
    runtimeOnly 'io.jsonwebtoken:jjwt-impl:0.12.3'
    runtimeOnly 'io.jsonwebtoken:jjwt-jackson:0.12.3'
    
    // Neo4j
    implementation 'org.springframework.boot:spring-boot-starter-data-neo4j'
    
    // Utility
    implementation 'org.projectlombok:lombok:1.18.30'
    implementation 'com.google.guava:guava:32.1.3-jre'
    
    // Testing
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    testImplementation 'org.springframework.security:spring-security-test'
    testImplementation 'junit:junit:4.13.2'
}

tasks.named('test') {
    useJUnitPlatform()
}

bootRun {
    args = ['--spring.profiles.active=dev']
}
```

**Step 3: Create application.yml**

```yaml
spring:
  application:
    name: graphify-backend
    version: 0.1.0
  
  datasource:
    url: jdbc:postgresql://localhost:5432/graphify
    username: graphify_user
    password: ${DB_PASSWORD:graphify123}
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
  
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQL10Dialect
        format_sql: true
        jdbc:
          batch_size: 20
          fetch_size: 50
    open-in-view: false
  
  redis:
    host: localhost
    port: 6379
    password: ${REDIS_PASSWORD:redis123}
    timeout: 2000ms
    jedis:
      pool:
        max-active: 20
        max-idle: 10
        min-idle: 5
  
  security:
    jwt:
      secret: ${JWT_SECRET:your-secret-key-min-32-characters-long!}
      expiration: 3600000  # 1 hour in milliseconds
  
  neo4j:
    uri: bolt://localhost:7687
    authentication:
      username: neo4j
      password: ${NEO4J_PASSWORD:neo4j}

server:
  port: 8086
  servlet:
    context-path: /api
  error:
    include-message: always
    include-binding-errors: always

logging:
  level:
    com.graphify: DEBUG
    org.springframework.web: INFO
    org.springframework.security: DEBUG
    org.hibernate.SQL: DEBUG
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"

management:
  endpoints:
    web:
      exposure:
        include: health,metrics
  endpoint:
    health:
      show-details: always
```

**Step 4: Create main application class**

```java
// backend/src/main/java/com/graphify/backend/GraphifyBackendApplication.java
package com.graphify.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableCaching
@EnableAsync
public class GraphifyBackendApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(GraphifyBackendApplication.class, args);
    }
}
```

**Step 5: Test application starts**

```bash
cd backend
./gradlew clean build -x test
./gradlew bootRun
```

Expected: Application starts on port 8086, no database errors (DDL validate mode).

**Step 6: Commit**

```bash
git add backend/ .gitignore
git commit -m "feat: initialize spring boot 3.x project structure

- Add Gradle build configuration with Spring Boot, PostgreSQL, Redis, Neo4j dependencies
- Create application.yml with database, Redis, JWT, and logging configuration
- Add main GraphifyBackendApplication class with caching and async support
- Project ready for entity and migration setup

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

### Task 2: Create Database Schema with Flyway Migrations

**Files:**
- Create: `backend/src/main/resources/db/migration/V1__Initial_Schema.sql`
- Create: `backend/src/main/resources/db/migration/V2__Add_Indexes.sql`

**Step 1: Create initial schema migration**

```bash
mkdir -p backend/src/main/resources/db/migration
```

**Step 2: Write V1__Initial_Schema.sql**

```sql
-- V1__Initial_Schema.sql

-- Create roles table first
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default roles
INSERT INTO roles (name, description) VALUES
    ('ADMIN', 'System administrator with all permissions'),
    ('TEAM_LEAD', 'Team lead can manage team and projects'),
    ('MEMBER', 'Team member can read/write shared graphs'),
    ('VIEWER', 'Can only view shared graphs');

-- Create users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'MEMBER' REFERENCES roles(name),
    gitlab_id VARCHAR(255),
    gitlab_token_encrypted TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT
);

-- Create teams table
CREATE TABLE teams (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by BIGINT NOT NULL REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create team_members table (many-to-many)
CREATE TABLE team_members (
    id BIGSERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'MEMBER',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    invited_by BIGINT REFERENCES users(id),
    invited_at TIMESTAMP,
    UNIQUE(team_id, user_id)
);

-- Create projects table
CREATE TABLE projects (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    created_by BIGINT NOT NULL REFERENCES users(id),
    gitlab_url VARCHAR(500),
    gitlab_repo_id VARCHAR(255),
    gitlab_token_encrypted TEXT,
    status VARCHAR(50) DEFAULT 'INITIALIZED',
    last_synced_at TIMESTAMP,
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create project_permissions table (ABAC)
CREATE TABLE project_permissions (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    granted_by BIGINT NOT NULL REFERENCES users(id),
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, user_id)
);

-- Create graph_jobs table
CREATE TABLE graph_jobs (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    source VARCHAR(50) NOT NULL,
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

-- Create graphs table
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

-- Create audit_logs table
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    actor_id BIGINT REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255) NOT NULL,
    changes JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Step 3: Write V2__Add_Indexes.sql**

```sql
-- V2__Add_Indexes.sql

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_is_active ON users(is_active);

CREATE INDEX idx_teams_created_by ON teams(created_by);
CREATE INDEX idx_teams_is_active ON teams(is_active);

CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);

CREATE INDEX idx_projects_team_id ON projects(team_id);
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_projects_status ON projects(status);

CREATE INDEX idx_project_permissions_project_id ON project_permissions(project_id);
CREATE INDEX idx_project_permissions_user_id ON project_permissions(user_id);

CREATE INDEX idx_graph_jobs_project_id ON graph_jobs(project_id);
CREATE INDEX idx_graph_jobs_status ON graph_jobs(status);

CREATE INDEX idx_graphs_project_id ON graphs(project_id);
CREATE INDEX idx_graphs_job_id ON graphs(job_id);

CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

**Step 4: Verify migrations run on boot**

```bash
./gradlew bootRun
```

Expected: Flyway creates tables automatically. Check PostgreSQL:

```bash
psql postgresql://graphify_user:graphify123@localhost:5432/graphify -c "\dt"
```

Should list all 11 tables.

**Step 5: Commit**

```bash
git add backend/src/main/resources/db/migration/
git commit -m "feat: add database schema migrations with flyway

- V1__Initial_Schema.sql: Create users, teams, projects, permissions, graphs, audit_logs tables
- V2__Add_Indexes.sql: Add indexes on frequently queried columns
- Flyway auto-migrates on application startup

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Phase 2: JPA Entities & Repositories

### Task 3: Create JPA Entities (User, Team, Project, Permission)

**Files:**
- Create: `backend/src/main/java/com/graphify/backend/entity/User.java`
- Create: `backend/src/main/java/com/graphify/backend/entity/Team.java`
- Create: `backend/src/main/java/com/graphify/backend/entity/TeamMember.java`
- Create: `backend/src/main/java/com/graphify/backend/entity/Project.java`
- Create: `backend/src/main/java/com/graphify/backend/entity/ProjectPermission.java`
- Create: `backend/src/main/java/com/graphify/backend/entity/GraphJob.java`
- Create: `backend/src/main/java/com/graphify/backend/entity/Graph.java`
- Create: `backend/src/main/java/com/graphify/backend/entity/AuditLog.java`
- Create: `backend/src/main/java/com/graphify/backend/entity/enums/UserRole.java`

**Step 1: Create UserRole enum**

```java
// backend/src/main/java/com/graphify/backend/entity/enums/UserRole.java
package com.graphify.backend.entity.enums;

public enum UserRole {
    ADMIN,
    TEAM_LEAD,
    MEMBER,
    VIEWER
}
```

**Step 2: Create User entity**

```java
// backend/src/main/java/com/graphify/backend/entity/User.java
package com.graphify.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.graphify.backend.entity.enums.UserRole;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
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
    
    private String displayName;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;
    
    private String gitlabId;
    private String gitlabTokenEncrypted;
    
    @Column(nullable = false)
    private boolean isActive;
    
    private LocalDateTime lastLoginAt;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

**Step 3: Create Team entity**

```java
// backend/src/main/java/com/graphify/backend/entity/Team.java
package com.graphify.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "teams")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
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
    
    @Column(nullable = false)
    private boolean isActive;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TeamMember> members;
    
    @OneToMany(mappedBy = "team", cascade = CascadeType.LAZY)
    private List<Project> projects;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

**Step 4: Create TeamMember entity**

```java
// backend/src/main/java/com/graphify/backend/entity/TeamMember.java
package com.graphify.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "team_members", uniqueConstraints = @UniqueConstraint(columnNames = {"team_id", "user_id"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamMember {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private String role; // TEAM_LEAD, MEMBER
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime joinedAt;
    
    @ManyToOne
    @JoinColumn(name = "invited_by")
    private User invitedBy;
    
    private LocalDateTime invitedAt;
    
    @PrePersist
    protected void onCreate() {
        joinedAt = LocalDateTime.now();
    }
}
```

**Step 5: Create Project entity**

```java
// backend/src/main/java/com/graphify/backend/entity/Project.java
package com.graphify.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "projects")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
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
    
    @Column(nullable = false)
    private String status; // INITIALIZED, SYNCING, READY, ERROR
    
    private LocalDateTime lastSyncedAt;
    
    @Column(nullable = false)
    private boolean isArchived;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProjectPermission> permissions;
    
    @OneToMany(mappedBy = "project", cascade = CascadeType.LAZY)
    private List<GraphJob> graphJobs;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

**Step 6: Create ProjectPermission entity**

```java
// backend/src/main/java/com/graphify/backend/entity/ProjectPermission.java
package com.graphify.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "project_permissions", uniqueConstraints = @UniqueConstraint(columnNames = {"project_id", "user_id"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectPermission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private String role; // owner, editor, commenter, viewer
    
    @ManyToOne
    @JoinColumn(name = "granted_by", nullable = false)
    private User grantedBy;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime grantedAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        grantedAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

**Step 7: Create GraphJob and Graph entities (simplified)**

```java
// backend/src/main/java/com/graphify/backend/entity/GraphJob.java
package com.graphify.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "graph_jobs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GraphJob {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;
    
    @Column(nullable = false)
    private String status; // PENDING, RUNNING, COMPLETED, FAILED
    
    @Column(nullable = false)
    private String source; // GITLAB, GITHUB, UPLOAD
    
    private String sourceUrl;
    private Integer totalNodes;
    private Integer totalEdges;
    private Integer totalCommunities;
    private String errorMessage;
    
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @ManyToOne
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}

// backend/src/main/java/com/graphify/backend/entity/Graph.java
package com.graphify.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "graphs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Graph {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;
    
    @ManyToOne
    @JoinColumn(name = "job_id", nullable = false)
    private GraphJob job;
    
    @Column(nullable = false)
    private String name;
    
    private Integer nodesCount;
    private Integer edgesCount;
    private Integer communitiesCount;
    
    @Column(nullable = false)
    private boolean isLatest;
    
    @Column(unique = true)
    private String neo4jGraphId;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
```

**Step 8: Create AuditLog entity**

```java
// backend/src/main/java/com/graphify/backend/entity/AuditLog.java
package com.graphify.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcType;
import org.hibernate.dialect.PostgreSQL10Dialect;
import org.hibernate.type.SqlTypes;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "audit_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "actor_id")
    private User actor;
    
    @Column(nullable = false)
    private String action; // CREATE, UPDATE, DELETE, QUERY
    
    @Column(nullable = false)
    private String resourceType; // User, Team, Project, Graph
    
    @Column(nullable = false)
    private String resourceId;
    
    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> changes;
    
    private String ipAddress;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
```

**Step 9: Compile and verify entities**

```bash
./gradlew clean build -x test
```

Expected: All entities compile without errors.

**Step 10: Commit**

```bash
git add backend/src/main/java/com/graphify/backend/entity/
git commit -m "feat: create jpa entities for users, teams, projects, permissions

- Add User, Team, TeamMember, Project, ProjectPermission entities
- Add GraphJob, Graph, AuditLog entities
- Implement @PrePersist/@PreUpdate for timestamps
- Add unique constraints and foreign keys at entity level

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

### Task 4: Create Repository Interfaces (Spring Data JPA)

**Files:**
- Create: `backend/src/main/java/com/graphify/backend/repository/UserRepository.java`
- Create: `backend/src/main/java/com/graphify/backend/repository/TeamRepository.java`
- Create: `backend/src/main/java/com/graphify/backend/repository/ProjectRepository.java`
- Create: `backend/src/main/java/com/graphify/backend/repository/ProjectPermissionRepository.java`
- Create: `backend/src/main/java/com/graphify/backend/repository/AuditLogRepository.java`

**Step 1: Create UserRepository**

```java
// backend/src/main/java/com/graphify/backend/repository/UserRepository.java
package com.graphify.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.graphify.backend.entity.User;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByGitlabId(String gitlabId);
}
```

**Step 2: Create TeamRepository**

```java
// backend/src/main/java/com/graphify/backend/repository/TeamRepository.java
package com.graphify.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.graphify.backend.entity.Team;
import java.util.List;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {
    List<Team> findByCreatedById(Long userId);
    
    List<Team> findByIsActiveTrue();
    
    @Query("SELECT t FROM Team t JOIN t.members tm WHERE tm.user.id = :userId AND t.isActive = true")
    List<Team> findTeamsByMemberId(@Param("userId") Long userId);
}
```

**Step 3: Create ProjectRepository**

```java
// backend/src/main/java/com/graphify/backend/repository/ProjectRepository.java
package com.graphify.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.graphify.backend.entity.Project;
import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByTeamId(Long teamId);
    
    List<Project> findByCreatedById(Long userId);
    
    List<Project> findByIsArchivedFalse();
    
    @Query("SELECT p FROM Project p WHERE p.team.id = :teamId AND p.isArchived = false")
    List<Project> findActiveProjectsByTeamId(@Param("teamId") Long teamId);
    
    @Query("SELECT DISTINCT p FROM Project p JOIN p.permissions pp " +
           "WHERE pp.user.id = :userId AND p.isArchived = false")
    List<Project> findProjectsByUserPermissions(@Param("userId") Long userId);
}
```

**Step 4: Create ProjectPermissionRepository**

```java
// backend/src/main/java/com/graphify/backend/repository/ProjectPermissionRepository.java
package com.graphify.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.graphify.backend.entity.ProjectPermission;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectPermissionRepository extends JpaRepository<ProjectPermission, Long> {
    Optional<ProjectPermission> findByProjectIdAndUserId(Long projectId, Long userId);
    
    List<ProjectPermission> findByProjectId(Long projectId);
    
    List<ProjectPermission> findByUserId(Long userId);
}
```

**Step 5: Create AuditLogRepository**

```java
// backend/src/main/java/com/graphify/backend/repository/AuditLogRepository.java
package com.graphify.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.graphify.backend.entity.AuditLog;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByActorId(Long actorId);
    
    List<AuditLog> findByResourceType(String resourceType);
    
    List<AuditLog> findByResourceTypeAndResourceId(String resourceType, String resourceId);
    
    List<AuditLog> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}
```

**Step 6: Compile and verify**

```bash
./gradlew clean build -x test
```

Expected: No compilation errors.

**Step 7: Commit**

```bash
git add backend/src/main/java/com/graphify/backend/repository/
git commit -m "feat: create spring data jpa repositories

- Add UserRepository with findByUsername, findByEmail, findByGitlabId
- Add TeamRepository with findTeamsByMemberId custom query
- Add ProjectRepository with findProjectsByUserPermissions query
- Add ProjectPermissionRepository with findByProjectIdAndUserId
- Add AuditLogRepository with filtering by actor, resource, date range

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Phase 3: Authentication & Security

### Task 5: Implement JWT Token Provider

**Files:**
- Create: `backend/src/main/java/com/graphify/backend/security/JwtTokenProvider.java`
- Create: `backend/src/main/java/com/graphify/backend/security/UserPrincipal.java`

**Step 1: Create UserPrincipal class**

```java
// backend/src/main/java/com/graphify/backend/security/UserPrincipal.java
package com.graphify.backend.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import com.graphify.backend.entity.User;
import java.util.Collection;
import java.util.Collections;

public class UserPrincipal implements UserDetails {
    private final Long id;
    private final String username;
    private final String email;
    private final String password;
    private final Collection<? extends GrantedAuthority> authorities;
    
    public UserPrincipal(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.password = user.getPasswordHash();
        this.authorities = Collections.singletonList(
            new SimpleGrantedAuthority("ROLE_" + user.getRole().toString())
        );
    }
    
    public Long getId() {
        return id;
    }
    
    public String getEmail() {
        return email;
    }
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }
    
    @Override
    public String getPassword() {
        return password;
    }
    
    @Override
    public String getUsername() {
        return username;
    }
    
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }
    
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }
    
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
    
    @Override
    public boolean isEnabled() {
        return true;
    }
}
```

**Step 2: Create JwtTokenProvider**

```java
// backend/src/main/java/com/graphify/backend/security/JwtTokenProvider.java
package com.graphify.backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtTokenProvider {
    
    @Value("${spring.security.jwt.secret}")
    private String jwtSecret;
    
    @Value("${spring.security.jwt.expiration}")
    private long jwtExpiration;
    
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }
    
    public String generateToken(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);
        
        return Jwts.builder()
            .subject(String.valueOf(userPrincipal.getId()))
            .claim("username", userPrincipal.getUsername())
            .claim("email", userPrincipal.getEmail())
            .claim("role", userPrincipal.getAuthorities().stream()
                .map(auth -> auth.getAuthority().replace("ROLE_", ""))
                .findFirst()
                .orElse("VIEWER"))
            .issuedAt(now)
            .expiration(expiryDate)
            .signWith(getSigningKey(), SignatureAlgorithm.HS256)
            .compact();
    }
    
    public String generateTokenFromUsername(String username, String role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);
        
        return Jwts.builder()
            .subject(username)
            .claim("role", role)
            .issuedAt(now)
            .expiration(expiryDate)
            .signWith(getSigningKey(), SignatureAlgorithm.HS256)
            .compact();
    }
    
    public Long getUserIdFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
            .setSigningKey(getSigningKey())
            .build()
            .parseClaimsJws(token)
            .getBody();
        
        return Long.parseLong(claims.getSubject());
    }
    
    public String getUsernameFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
            .setSigningKey(getSigningKey())
            .build()
            .parseClaimsJws(token)
            .getBody();
        
        return claims.get("username", String.class);
    }
    
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token);
            return true;
        } catch (MalformedJwtException ex) {
            // Invalid JWT token
        } catch (ExpiredJwtException ex) {
            // Expired JWT token
        } catch (UnsupportedJwtException ex) {
            // Unsupported JWT token
        } catch (IllegalArgumentException ex) {
            // Claims string is empty
        }
        return false;
    }
}
```

**Step 3: Compile and verify**

```bash
./gradlew clean build -x test
```

**Step 4: Commit**

```bash
git add backend/src/main/java/com/graphify/backend/security/JwtTokenProvider.java \
           backend/src/main/java/com/graphify/backend/security/UserPrincipal.java
git commit -m "feat: implement jwt token provider for authentication

- Add JwtTokenProvider with generateToken, validateToken, getUserIdFromToken methods
- Add UserPrincipal implementing Spring Security UserDetails
- Use JJWT library for HS256 signing with configurable secret and expiration
- Token includes userId, username, email, and role claims

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

### Task 6: Implement Spring Security Configuration

**Files:**
- Create: `backend/src/main/java/com/graphify/backend/config/SecurityConfig.java`
- Create: `backend/src/main/java/com/graphify/backend/security/JwtAuthenticationFilter.java`
- Create: `backend/src/main/java/com/graphify/backend/security/CustomUserDetailsService.java`

**Step 1: Create CustomUserDetailsService**

```java
// backend/src/main/java/com/graphify/backend/security/CustomUserDetailsService.java
package com.graphify.backend.security;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import com.graphify.backend.repository.UserRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    
    private final UserRepository userRepository;
    
    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        var user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
        
        return new UserPrincipal(user);
    }
    
    public UserDetails loadUserById(Long id) throws UsernameNotFoundException {
        var user = userRepository.findById(id)
            .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));
        
        return new UserPrincipal(user);
    }
}
```

**Step 2: Create JwtAuthenticationFilter**

```java
// backend/src/main/java/com/graphify/backend/security/JwtAuthenticationFilter.java
package com.graphify.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private final JwtTokenProvider tokenProvider;
    private final CustomUserDetailsService customUserDetailsService;
    
    public JwtAuthenticationFilter(JwtTokenProvider tokenProvider, 
                                   CustomUserDetailsService customUserDetailsService) {
        this.tokenProvider = tokenProvider;
        this.customUserDetailsService = customUserDetailsService;
    }
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                  HttpServletResponse response,
                                  FilterChain filterChain) throws ServletException, IOException {
        try {
            String jwt = getJwtFromRequest(request);
            
            if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
                Long userId = tokenProvider.getUserIdFromToken(jwt);
                
                var userDetails = customUserDetailsService.loadUserById(userId);
                var authentication = new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception ex) {
            logger.error("Could not set user authentication in security context", ex);
        }
        
        filterChain.doFilter(request, response);
    }
    
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
```

**Step 3: Create SecurityConfig**

```java
// backend/src/main/java/com/graphify/backend/config/SecurityConfig.java
package com.graphify.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import com.graphify.backend.security.JwtAuthenticationEntryPoint;
import com.graphify.backend.security.JwtAuthenticationFilter;
import com.graphify.backend.security.JwtTokenProvider;
import com.graphify.backend.security.CustomUserDetailsService;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    
    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailsService customUserDetailsService;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    
    public SecurityConfig(JwtTokenProvider jwtTokenProvider,
                         CustomUserDetailsService customUserDetailsService,
                         JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.customUserDetailsService = customUserDetailsService;
        this.jwtAuthenticationEntryPoint = jwtAuthenticationEntryPoint;
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }
    
    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        return http.getSharedObject(AuthenticationManagerBuilder.class)
            .userDetailsService(customUserDetailsService)
            .passwordEncoder(passwordEncoder())
            .and()
            .build();
    }
    
    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtTokenProvider, customUserDetailsService);
    }
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .exceptionHandling(ex -> ex.authenticationEntryPoint(jwtAuthenticationEntryPoint))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/health/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/public/**").permitAll()
                .anyRequest().authenticated())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000", "http://localhost:3001"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

**Step 4: Create JwtAuthenticationEntryPoint**

```java
// backend/src/main/java/com/graphify/backend/security/JwtAuthenticationEntryPoint.java
package com.graphify.backend.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {
    
    @Override
    public void commence(HttpServletRequest request,
                       HttpServletResponse response,
                       AuthenticationException authException) throws IOException, ServletException {
        
        response.setContentType("application/json");
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        
        Map<String, Object> body = new HashMap<>();
        body.put("status", HttpServletResponse.SC_UNAUTHORIZED);
        body.put("error", "Unauthorized");
        body.put("message", "Full authentication is required to access this resource");
        body.put("path", request.getServletPath());
        
        ObjectMapper mapper = new ObjectMapper();
        response.getWriter().write(mapper.writeValueAsString(body));
    }
}
```

**Step 5: Compile and verify**

```bash
./gradlew clean build -x test
```

**Step 6: Commit**

```bash
git add backend/src/main/java/com/graphify/backend/config/SecurityConfig.java \
           backend/src/main/java/com/graphify/backend/security/JwtAuthenticationFilter.java \
           backend/src/main/java/com/graphify/backend/security/CustomUserDetailsService.java \
           backend/src/main/java/com/graphify/backend/security/JwtAuthenticationEntryPoint.java
git commit -m "feat: implement spring security with jwt authentication

- Add SecurityConfig with JWT filter chain and CORS configuration
- Add JwtAuthenticationFilter to validate token on each request
- Add CustomUserDetailsService for loading users from database
- Add JwtAuthenticationEntryPoint for handling 401 responses
- Configure BCrypt password encoder with cost factor 12

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Phase 4: Services & Business Logic

### Task 7: Implement UserService & AuthenticationService

**Files:**
- Create: `backend/src/main/java/com/graphify/backend/service/UserService.java`
- Create: `backend/src/main/java/com/graphify/backend/service/AuthenticationService.java`
- Create: `backend/src/main/java/com/graphify/backend/dto/request/LoginRequest.java`
- Create: `backend/src/main/java/com/graphify/backend/dto/response/LoginResponse.java`

**Step 1: Create DTOs**

```java
// backend/src/main/java/com/graphify/backend/dto/request/LoginRequest.java
package com.graphify.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "Username is required")
    private String username;
    
    @NotBlank(message = "Password is required")
    private String password;
}

// backend/src/main/java/com/graphify/backend/dto/response/LoginResponse.java
package com.graphify.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String tokenType;
    private Long userId;
    private String username;
    private String email;
    private String role;
    private Long expiresIn;
    
    public LoginResponse() {
        this.tokenType = "Bearer";
    }
}

// backend/src/main/java/com/graphify/backend/dto/response/UserDTO.java
package com.graphify.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import com.graphify.backend.entity.User;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private String displayName;
    private String role;
    private boolean isActive;
    private LocalDateTime lastLoginAt;
    private LocalDateTime createdAt;
    
    public static UserDTO fromEntity(User user) {
        return UserDTO.builder()
            .id(user.getId())
            .username(user.getUsername())
            .email(user.getEmail())
            .displayName(user.getDisplayName())
            .role(user.getRole().toString())
            .isActive(user.isActive())
            .lastLoginAt(user.getLastLoginAt())
            .createdAt(user.getCreatedAt())
            .build();
    }
}
```

**Step 2: Create UserService**

```java
// backend/src/main/java/com/graphify/backend/service/UserService.java
package com.graphify.backend.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.graphify.backend.entity.User;
import com.graphify.backend.entity.enums.UserRole;
import com.graphify.backend.repository.UserRepository;
import com.graphify.backend.dto.response.UserDTO;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }
    
    public User createUser(String username, String email, String password, UserRole role) {
        User user = User.builder()
            .username(username)
            .email(email)
            .passwordHash(passwordEncoder.encode(password))
            .role(role)
            .isActive(true)
            .build();
        
        return userRepository.save(user);
    }
    
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }
    
    public User getUserById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }
    
    public User updateLastLogin(Long userId) {
        User user = getUserById(userId);
        user.setLastLoginAt(LocalDateTime.now());
        return userRepository.save(user);
    }
    
    public boolean validatePassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }
    
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
            .map(UserDTO::fromEntity)
            .collect(Collectors.toList());
    }
    
    public UserDTO getUserDTOById(Long id) {
        return UserDTO.fromEntity(getUserById(id));
    }
    
    public void deactivateUser(Long userId) {
        User user = getUserById(userId);
        user.setIsActive(false);
        userRepository.save(user);
    }
}
```

**Step 3: Create AuthenticationService**

```java
// backend/src/main/java/com/graphify/backend/service/AuthenticationService.java
package com.graphify.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.graphify.backend.dto.request.LoginRequest;
import com.graphify.backend.dto.response.LoginResponse;
import com.graphify.backend.security.JwtTokenProvider;

@Service
@Transactional
public class AuthenticationService {
    
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserService userService;
    
    @Value("${spring.security.jwt.expiration}")
    private long jwtExpiration;
    
    public AuthenticationService(AuthenticationManager authenticationManager,
                               JwtTokenProvider jwtTokenProvider,
                               UserService userService) {
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
        this.userService = userService;
    }
    
    public LoginResponse authenticate(LoginRequest loginRequest) {
        var user = userService.getUserByUsername(loginRequest.getUsername());
        
        if (!user.isActive()) {
            throw new RuntimeException("User account is deactivated");
        }
        
        if (!userService.validatePassword(loginRequest.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid username or password");
        }
        
        // Update last login
        userService.updateLastLogin(user.getId());
        
        // Generate JWT token
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                loginRequest.getUsername(),
                loginRequest.getPassword()
            )
        );
        
        String token = jwtTokenProvider.generateToken(authentication);
        
        return LoginResponse.builder()
            .token(token)
            .tokenType("Bearer")
            .userId(user.getId())
            .username(user.getUsername())
            .email(user.getEmail())
            .role(user.getRole().toString())
            .expiresIn(jwtExpiration / 1000) // Convert to seconds
            .build();
    }
    
    public LoginResponse validateToken(String token) {
        if (!jwtTokenProvider.validateToken(token)) {
            throw new RuntimeException("Invalid or expired token");
        }
        
        Long userId = jwtTokenProvider.getUserIdFromToken(token);
        var user = userService.getUserById(userId);
        
        return LoginResponse.builder()
            .userId(user.getId())
            .username(user.getUsername())
            .email(user.getEmail())
            .role(user.getRole().toString())
            .build();
    }
}
```

**Step 4: Compile and verify**

```bash
./gradlew clean build -x test
```

**Step 5: Commit**

```bash
git add backend/src/main/java/com/graphify/backend/service/ \
           backend/src/main/java/com/graphify/backend/dto/
git commit -m "feat: implement user and authentication services

- Add UserService with createUser, getUserByUsername, updateLastLogin methods
- Add AuthenticationService with authenticate and validateToken methods
- Add LoginRequest and LoginResponse DTOs
- Add UserDTO for API responses
- Implement password validation with BCrypt

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

### Task 8: Implement PermissionService

**Files:**
- Create: `backend/src/main/java/com/graphify/backend/service/PermissionService.java`
- Create: `backend/src/main/java/com/graphify/backend/repository/TeamMemberRepository.java`

**Step 1: Create TeamMemberRepository**

```java
// backend/src/main/java/com/graphify/backend/repository/TeamMemberRepository.java
package com.graphify.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.graphify.backend.entity.TeamMember;
import java.util.List;
import java.util.Optional;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {
    Optional<TeamMember> findByTeamIdAndUserId(Long teamId, Long userId);
    
    List<TeamMember> findByTeamId(Long teamId);
    
    List<TeamMember> findByUserId(Long userId);
    
    boolean existsByTeamIdAndUserId(Long teamId, Long userId);
}
```

**Step 2: Create PermissionService**

```java
// backend/src/main/java/com/graphify/backend/service/PermissionService.java
package com.graphify.backend.service;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.graphify.backend.entity.*;
import com.graphify.backend.entity.enums.UserRole;
import com.graphify.backend.repository.*;
import java.util.List;

@Service
@Transactional
public class PermissionService {
    
    private final ProjectPermissionRepository projectPermissionRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    
    public PermissionService(ProjectPermissionRepository projectPermissionRepository,
                           TeamMemberRepository teamMemberRepository,
                           ProjectRepository projectRepository,
                           UserRepository userRepository,
                           TeamRepository teamRepository) {
        this.projectPermissionRepository = projectPermissionRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.teamRepository = teamRepository;
    }
    
    @Cacheable(value = "projectPermissions", key = "#projectId + ':' + #userId", unless = "#result == null")
    public String getProjectPermission(Long projectId, Long userId) {
        return projectPermissionRepository.findByProjectIdAndUserId(projectId, userId)
            .map(ProjectPermission::getRole)
            .orElse(null);
    }
    
    public boolean canAccessProject(Long projectId, Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        
        // ADMIN can access everything
        if (user.getRole() == UserRole.ADMIN) {
            return true;
        }
        
        Project project = projectRepository.findById(projectId).orElseThrow();
        
        // Check explicit project permissions (ABAC)
        String permission = getProjectPermission(projectId, userId);
        if (permission != null) {
            return true;
        }
        
        // Check team membership
        return teamMemberRepository.existsByTeamIdAndUserId(project.getTeam().getId(), userId);
    }
    
    public boolean canEditProject(Long projectId, Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        
        if (user.getRole() == UserRole.ADMIN) {
            return true;
        }
        
        String permission = getProjectPermission(projectId, userId);
        return permission != null && (permission.equals("owner") || permission.equals("editor"));
    }
    
    public boolean canDeleteProject(Long projectId, Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        
        if (user.getRole() == UserRole.ADMIN) {
            return true;
        }
        
        String permission = getProjectPermission(projectId, userId);
        return permission != null && permission.equals("owner");
    }
    
    @CacheEvict(value = "projectPermissions", key = "#projectId + ':' + #userId")
    public void grantPermission(Long projectId, Long userId, String role, Long grantedBy) {
        var grantedByUser = userRepository.findById(grantedBy).orElseThrow();
        var project = projectRepository.findById(projectId).orElseThrow();
        var user = userRepository.findById(userId).orElseThrow();
        
        ProjectPermission permission = projectPermissionRepository
            .findByProjectIdAndUserId(projectId, userId)
            .orElse(new ProjectPermission());
        
        permission.setProject(project);
        permission.setUser(user);
        permission.setRole(role);
        permission.setGrantedBy(grantedByUser);
        
        projectPermissionRepository.save(permission);
    }
    
    @CacheEvict(value = "projectPermissions", key = "#projectId + ':' + #userId")
    public void revokePermission(Long projectId, Long userId) {
        projectPermissionRepository.findByProjectIdAndUserId(projectId, userId)
            .ifPresent(projectPermissionRepository::delete);
    }
    
    public List<ProjectPermission> getProjectPermissions(Long projectId) {
        return projectPermissionRepository.findByProjectId(projectId);
    }
    
    public boolean canManageTeam(Long teamId, Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        
        if (user.getRole() == UserRole.ADMIN) {
            return true;
        }
        
        var teamMember = teamMemberRepository.findByTeamIdAndUserId(teamId, userId);
        return teamMember.isPresent() && 
               (teamMember.get().getRole().equals("TEAM_LEAD") || 
                user.getRole() == UserRole.TEAM_LEAD);
    }
}
```

**Step 3: Compile and verify**

```bash
./gradlew clean build -x test
```

**Step 4: Commit**

```bash
git add backend/src/main/java/com/graphify/backend/service/PermissionService.java \
           backend/src/main/java/com/graphify/backend/repository/TeamMemberRepository.java
git commit -m "feat: implement permission service with caching

- Add PermissionService with canAccessProject, canEditProject, canDeleteProject methods
- Add grantPermission and revokePermission with cache invalidation
- Add TeamMemberRepository for team membership queries
- Implement RBAC (ADMIN role) and ABAC (project-level permissions)
- Cache project permissions for 10 minutes

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Phase 5: REST API Controllers

### Task 9: Implement Authentication Controller

**Files:**
- Create: `backend/src/main/java/com/graphify/backend/controller/AuthController.java`
- Create: `backend/src/main/java/com/graphify/backend/dto/response/ErrorResponse.java`

**Step 1: Create ErrorResponse DTO**

```java
// backend/src/main/java/com/graphify/backend/dto/response/ErrorResponse.java
package com.graphify.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
public class ErrorResponse {
    private int status;
    private String error;
    private String message;
    private String path;
    private LocalDateTime timestamp;
    
    public ErrorResponse(int status, String error, String message) {
        this.status = status;
        this.error = error;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }
}
```

**Step 2: Create AuthController**

```java
// backend/src/main/java/com/graphify/backend/controller/AuthController.java
package com.graphify.backend.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.graphify.backend.service.AuthenticationService;
import com.graphify.backend.dto.request.LoginRequest;
import com.graphify.backend.dto.response.LoginResponse;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class AuthController {
    
    private final AuthenticationService authenticationService;
    
    public AuthController(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }
    
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        LoginResponse response = authenticationService.authenticate(loginRequest);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/validate")
    public ResponseEntity<LoginResponse> validateToken(@RequestHeader("Authorization") String token) {
        String jwt = token.replace("Bearer ", "");
        LoginResponse response = authenticationService.validateToken(jwt);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        // Token invalidation is handled client-side
        return ResponseEntity.ok().build();
    }
}
```

**Step 3: Create Global Exception Handler**

```java
// backend/src/main/java/com/graphify/backend/exception/GlobalExceptionHandler.java
package com.graphify.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import com.graphify.backend.dto.response.ErrorResponse;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(
            ResourceNotFoundException ex, WebRequest request) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.NOT_FOUND.value(),
            "Resource Not Found",
            ex.getMessage()
        );
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }
    
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorized(
            UnauthorizedException ex, WebRequest request) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.UNAUTHORIZED.value(),
            "Unauthorized",
            ex.getMessage()
        );
        return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(
            MethodArgumentNotValidException ex, WebRequest request) {
        Map<String, Object> body = new HashMap<>();
        Map<String, String> errors = new HashMap<>();
        
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Validation Failed");
        body.put("errors", errors);
        
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(
            Exception ex, WebRequest request) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            "Internal Server Error",
            ex.getMessage()
        );
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
```

**Step 4: Create Exception classes**

```java
// backend/src/main/java/com/graphify/backend/exception/ResourceNotFoundException.java
package com.graphify.backend.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}

// backend/src/main/java/com/graphify/backend/exception/UnauthorizedException.java
package com.graphify.backend.exception;

public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}
```

**Step 5: Test the endpoint manually**

```bash
curl -X POST http://localhost:8086/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test_user","password":"password123"}'
```

Expected: 401 Unauthorized or similar (since no users exist yet).

**Step 6: Commit**

```bash
git add backend/src/main/java/com/graphify/backend/controller/AuthController.java \
           backend/src/main/java/com/graphify/backend/exception/ \
           backend/src/main/java/com/graphify/backend/dto/response/ErrorResponse.java
git commit -m "feat: implement authentication and exception handling controllers

- Add AuthController with /auth/login, /auth/validate, /auth/logout endpoints
- Add GlobalExceptionHandler for consistent error responses
- Add ResourceNotFoundException and UnauthorizedException
- Add ErrorResponse DTO with timestamp and path information
- Implement validation error formatting

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Phase 6: Integration & Testing

### Task 10: Build and Run Application

**Files:**
- Verify: `application.yml` configuration
- Test: Application startup and basic API calls

**Step 1: Ensure PostgreSQL is running**

```bash
docker-compose up postgres redis neo4j -d
```

**Step 2: Build and run the application**

```bash
cd backend
./gradlew clean build -x test
./gradlew bootRun
```

Expected: Application starts on port 8086 without errors.

**Step 3: Test health endpoint**

```bash
curl http://localhost:8086/api/health
```

Expected: 200 OK with application status.

**Step 4: Test auth endpoint (should fail gracefully)**

```bash
curl -X POST http://localhost:8086/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"nonexistent","password":"password"}'
```

Expected: 500 error with message "User not found".

**Step 5: Create database seed script (optional)**

```sql
-- seed-data.sql
INSERT INTO roles (name, description) VALUES
    ('ADMIN', 'System administrator'),
    ('TEAM_LEAD', 'Team lead'),
    ('MEMBER', 'Team member'),
    ('VIEWER', 'Read-only viewer');

INSERT INTO users (username, email, password_hash, display_name, role, is_active) VALUES
    ('admin', 'admin@graphify.com', '$2a$12$...', 'Administrator', 'ADMIN', true),
    ('demo', 'demo@graphify.com', '$2a$12$...', 'Demo User', 'MEMBER', true);
```

**Step 6: Commit build configuration**

```bash
git add backend/
git commit -m "feat: complete spring boot backend setup

- Build and run successfully on port 8086
- All endpoints respond correctly
- Database migrations applied via Flyway
- JWT authentication configured
- Exception handling working

Ready for Phase 2: API controller implementation

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Summary

**✅ Phase 1: Setup & Database**
- Spring Boot project with Gradle
- PostgreSQL migrations (Flyway)

**✅ Phase 2: JPA Entities & Repositories**
- 8 entities with relationships
- 5 Spring Data JPA repositories

**✅ Phase 3: Authentication & Security**
- JWT token provider (HS256)
- Spring Security configuration
- Custom authentication filter

**✅ Phase 4: Services & Business Logic**
- UserService & AuthenticationService
- PermissionService with caching

**✅ Phase 5: REST API Controllers**
- Authentication endpoints
- Global exception handling

**✅ Phase 6: Integration**
- Application successfully builds and runs
- Ready for additional controller implementation

---

**Next Phase:**  
Continue with:
- Task 11: User & Team Management Controllers
- Task 12: Project Management Controllers
- Task 13: Permission Management Controllers
- Task 14: Unit and Integration Tests
- Task 15: Docker Compose Configuration

