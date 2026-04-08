# Graphify 프로젝트 분석

## 프로젝트 개요

**Graphify**는 코드, 문서, 논문, 이미지 등 다양한 소스를 읽고 이들 간의 관계를 분석하여 **지식 그래프(Knowledge Graph)**를 자동으로 구축하는 AI 코딩 어시스턴트 스킬입니다.

- **핵심 기능**: 코드베이스와 관련 문서를 입력하면 구조화된 지식 그래프로 변환
- **토큰 효율성**: 원본 파일 대비 **71.5배** 더 적은 토큰으로 질의 가능
- **멀티모달**: 코드, PDF, 마크다운, 스크린샷, 다이어그램, 이미지 등 모든 형식 지원
- **언어 지원**: 19개 프로그래밍 언어 (Python, JS, TS, Go, Rust, Java, C, C++, Ruby, C#, Kotlin, Scala, PHP, Swift, Lua, Zig, PowerShell, Elixir, Objective-C)

---

## 기술 스택

### 핵심 라이브러리
| 영역 | 기술 |
|------|------|
| 그래프 처리 | NetworkX |
| 커뮤니티 탐지 | Leiden (graspologic) |
| 코드 분석 | tree-sitter (19개 언어 파서) |
| 시각화 | vis.js (인터랙티브 HTML) |
| AI 기반 추출 | Claude API (Anthropic) |

### 선택 가능한 확장 기능
- **MCP**: MCP 서버 시작
- **Neo4j**: Neo4j 데이터베이스로 내보내기
- **PDF**: PDF 파일 처리 (pypdf, html2text)
- **Watch**: 파일 변경 감시 (watchdog)
- **Office**: Word/Excel 파일 처리 (python-docx, openpyxl)

---

## 파이프라인 구조

graphify는 **6단계 파이프라인**으로 동작합니다:

```
detect() → extract() → build_graph() → cluster() → analyze() → report() → export()
```

### 각 단계별 모듈

| 단계 | 모듈 | 입력 | 출력 | 역할 |
|-----|------|------|------|------|
| 1️⃣ 감지 | `detect.py` | 디렉토리 | 파일 목록 | .graphifyignore 규칙으로 필터링 |
| 2️⃣ 추출 | `extract.py` | 파일 경로 | {nodes, edges} 딕셔너리 | AST 분석 & AI 기반 의미 추출 |
| 3️⃣ 그래프 생성 | `build.py` | 추출 결과 리스트 | NetworkX Graph | 모든 노드와 엣지를 그래프에 통합 |
| 4️⃣ 클러스터링 | `cluster.py` | 그래프 | 커뮤니티 레이블 포함 그래프 | Leiden 알고리즘으로 커뮤니티 탐지 |
| 5️⃣ 분석 | `analyze.py` | 그래프 | 분석 딕셔너리 | God nodes, 놀라운 연결, 제안 질문 생성 |
| 6️⃣ 리포트 | `report.py` | 그래프 + 분석 | GRAPH_REPORT.md | 평문 기반 감사 리포트 |
| 7️⃣ 내보내기 | `export.py` | 그래프 + 옵션 | 다양한 형식 | graph.json, graph.html, Obsidian vault 등 생성 |

### 주요 지원 모듈

| 모듈 | 기능 |
|-----|------|
| `cache.py` | SHA256 기반 시맨틱 캐싱 - 변경된 파일만 재처리 |
| `ingest.py` | URL 기반 콘텐츠 수집 (아카이브, 트윗, 논문) |
| `watch.py` | 파일 시스템 감시 - 변경 시 자동 그래프 업데이트 |
| `cluster.py` | Leiden 커뮤니티 탐지 알고리즘 |
| `serve.py` | MCP stdio 서버 시작 |
| `wiki.py` | Obsidian 호환 위키 생성 |
| `benchmark.py` | 토큰 효율성 측정 |
| `security.py` | URL, 경로, 레이블 검증 |
| `validate.py` | 추출 결과 스키마 검증 |
| `hooks.py` | Git 훅 설치/관리 |

---

## 핵심 기능

### 1. 추출 방식 (Extract)

#### 코드 파일 (.py, .ts, .go, etc.)
- **AST 기반 분석** (tree-sitter): 클래스, 함수, 임포트, 콜 그래프 추출
- **LLM 불필요** - 완전히 로컬에서 처리
- **호출 그래프**: 함수 간 호출 관계 추론 (INFERRED 엣지)
- **문서화**: docstring과 특수 주석 추출
  - `# NOTE:`, `# IMPORTANT:`, `# HACK:`, `# WHY:` 등 특수 주석 캡처

#### 문서 파일 (.md, .txt, .rst)
- Claude AI를 통한 개념과 관계 추출
- 설계 원칙과 근거(rationale) 추출

#### 논문 (.pdf)
- 인용 마이닝
- 개념 추출
- Claude 비전으로 다이어그램 분석

#### 이미지 (.png, .jpg, .webp, .gif)
- Claude 비전 API 사용
- 다국어 텍스트 인식
- 다이어그램, 스크린샷 분석

#### Office 파일 (.docx, .xlsx)
- 마크다운으로 변환 후 처리
- 선택적 설치 필요 (`office` 옵션)

### 2. 관계 타입과 신뢰도

모든 엣지는 다음 중 하나의 신뢰도 레이블을 가집니다:

| 레이블 | 의미 | 신뢰도 |
|--------|------|--------|
| **EXTRACTED** | 소스에 명시적으로 드러남 (import, 직접 호출 등) | 100% |
| **INFERRED** | 합리적인 추론 (콜 그래프 2차 분석, 동시 출현) | 0-1.0 |
| **AMBIGUOUS** | 불확실함 - 수동 검토 필요 | 0-1.0 |

### 3. 하이퍼엣지 (Hyperedges)

일반 2-노드 엣지로 표현할 수 없는 관계:
- 여러 클래스가 공유 프로토콜 구현
- 인증 흐름의 모든 함수
- 논문 섹션의 연관 개념들

### 4. 커뮤니티 탐지

**Leiden 알고리즘** 사용 - 엣지 밀도 기반 커뮤니티 분류
- 토폴로지 기반 (임베딩 불필요)
- Claude가 추출한 시맨틱 유사성 엣지 활용
- God nodes와 내부 연결 식별

---

## 출력 형식

실행 후 `graphify-out/` 디렉토리에 생성되는 파일들:

### 필수 파일
```
graphify-out/
├── GRAPH_REPORT.md      # God nodes, 놀라운 연결, 제안 질문
├── graph.json           # 영구 저장용 그래프 (쿼리 가능)
├── graph.html           # 인터랙티브 시각화
└── cache/               # SHA256 기반 캐시 (변경 파일만 재처리)
```

### 선택적 출력
- `graph.svg` - SVG 형식 그래프
- `graph.graphml` - Gephi/yEd용 GraphML 형식
- `cypher.txt` - Neo4j Cypher 명령
- `vault/` - Obsidian 호환 위키
- `index.md` - 마크다운 기반 네비게이션

---

## 커맨드 라인 인터페이스

### 기본 사용법
```bash
/graphify .                          # 현재 디렉토리 그래프 생성
/graphify ./src                      # 특정 폴더 대상
/graphify ./src --mode deep          # 공격적인 INFERRED 엣지 추출
/graphify ./src --update             # 변경된 파일만 재처리 후 병합
/graphify ./src --cluster-only       # 기존 그래프로 클러스터링만 재실행
/graphify ./src --no-viz             # HTML 스킵, 리포트 + JSON만
```

### 콘텐츠 추가
```bash
/graphify add https://arxiv.org/abs/1706.03762        # 논문 추가
/graphify add https://x.com/karpathy/status/...       # 트윗 추가
/graphify add https://... --author "Name"             # 작가 태그
/graphify add https://... --contributor "Name"        # 기여자 태그
```

### 그래프 쿼리
```bash
/graphify query "attention과 optimizer를 연결하는 것은?"
/graphify query "..." --dfs                           # 특정 경로 추적
/graphify query "..." --budget 1500                   # 토큰 제한
/graphify path "DigestAuth" "Response"                # 노드 간 경로
/graphify explain "SwinTransformer"                   # 노드 설명
```

### 고급 옵션
```bash
/graphify ./src --watch                      # 자동 동기화 (파일 변경 감시)
/graphify ./src --wiki                       # 마크다운 위키 생성
/graphify ./src --obsidian                   # Obsidian vault 생성
/graphify ./src --graphml                    # GraphML 내보내기
/graphify ./src --neo4j                      # Neo4j Cypher 생성
/graphify ./src --neo4j-push bolt://...      # 직접 Neo4j로 푸시
```

### Git 훅 설정
```bash
graphify hook install                        # post-commit, post-checkout 훅 설치
graphify hook uninstall                      # 훅 제거
graphify hook status                         # 훅 상태 확인
```

### 어시스턴트 통합
```bash
graphify claude install                      # Claude Code 통합 (PreToolUse 훅)
graphify codex install                       # Codex 통합 (AGENTS.md)
graphify opencode install                    # OpenCode 통합
graphify claw install                        # OpenClaw 통합
graphify droid install                       # Factory Droid 통합
```

---

## 핵심 특성

### ✅ 장점

1. **토큰 효율성**: 원본 대비 71.5배 토큰 감소 (52 파일 기준)
2. **멀티모달 입력**: 코드+문서+논문+이미지 동시 처리
3. **로컬 처리**: 코드는 로컬 AST 분석 (LLM API 호출 불필요)
4. **신뢰도 표시**: 추출 vs 추론 vs 모호함 명확히 구분
5. **캐싱**: SHA256 기반 캐시로 변경 파일만 재처리
6. **Git 통합**: 자동 훅으로 커밋/브랜치 변경 시 그래프 업데이트
7. **엣지 정보**: 각 관계에 신뢰도, 소스 위치, 관계 타입 포함
8. **인터랙티브 시각화**: HTML 기반 그래프 네비게이션, 검색, 필터
9. **다국어 지원**: 19개 프로그래밍 언어 + 이미지 텍스트 인식

### 🎯 사용 사례

- **코드베이스 이해**: 새로운 프로젝트 빠르게 파악
- **아키텍처 문서화**: 시스템 구조 자동 가시화
- **지식 관리**: Andrej Karpathy의 `/raw` 폴더 패턴 대체
- **RAG 기반 질의**: 그래프 기반 정확한 답변
- **크로스도메인 연결**: 코드와 논문의 개념 연결
- **팀 온보딩**: 신규 팀원이 빠르게 시스템 이해

---

## 아키텍처 특징

### 모듈식 설계
- 각 단계는 독립적인 함수 (side-effect 없음)
- 순수 Python 딕셔너리와 NetworkX 그래프로 통신
- 공유 상태 없음

### 확장성
- 새로운 언어 추가: `extract_<lang>()` 함수 + tree-sitter 바인딩
- 새로운 관계 타입: 엣지 `relation` 필드 확장
- 새로운 내보내기 형식: `export.py`에 함수 추가

### 보안
- 모든 외부 입력은 `security.py`를 통해 검증
- URL: http/https only, 파일:// 리다이렉트 차단
- 파일 경로: `graphify-out/` 내부로 제한
- 레이블: 제어 문자 제거, HTML 이스케이프, 256자 제한
- 크기 제한: 대용량 파일 fetch 타임아웃

### 테스트
- 단위 테스트 1개 모듈당 (tests/ 디렉토리)
- 네트워크 호출 없음
- 임시 경로로만 파일 시스템 접근
- `pytest tests/ -q`로 실행

---

## 플랫폼 지원

| 플랫폼 | 설치 명령 | 특징 |
|--------|----------|------|
| Claude Code (Linux/Mac) | `graphify install` | PreToolUse 훅 지원 |
| Claude Code (Windows) | `graphify install --platform windows` | 자동 감지 |
| Codex | `graphify install --platform codex` | `multi_agent=true` 필요 |
| OpenCode | `graphify install --platform opencode` | 순차 처리 |
| OpenClaw | `graphify install --platform claw` | Task 도구 지원 |
| Factory Droid | `graphify install --platform droid` | Task 도구로 병렬화 |

---

## 데이터 플로우

```
입력 파일들
    ↓
detect() - 파일 필터링 (.graphifyignore)
    ↓
extract() - 병렬 처리
    ├─ 코드 → tree-sitter AST 분석 (로컬)
    ├─ 문서 → Claude 의미 추출 (API)
    ├─ 논문 → 인용 + 개념 추출
    └─ 이미지 → Claude Vision (API)
    ↓
cache.py - SHA256 캐싱 (변경 파일만)
    ↓
validate.py - 스키마 검증
    ↓
build_graph() - NetworkX 그래프 생성
    ↓
cluster() - Leiden 커뮤니티 탐지
    ↓
analyze() - God nodes & 놀라운 연결 분석
    ↓
report() - GRAPH_REPORT.md 생성
    ↓
export() - 다양한 형식 출력
    └─ graph.json, graph.html, Obsidian vault, GraphML, Cypher...
```

---

## 프로젝트 현황

### 버전
- **현재**: 0.3.11
- **Python 요구사항**: 3.10 이상

### 의존성 통계
- **필수 의존성**: 19개 (networkx, tree-sitter, 19개 언어 파서)
- **선택 의존성**: 8개 그룹 (mcp, neo4j, pdf, watch, leiden, office 등)

### 주요 파일
- **메인 진입점**: `__main__.py` (20KB)
- **추출 로직**: `extract.py` (107KB - 가장 큼)
- **내보내기**: `export.py` (38KB)
- **분석**: `analyze.py` (21KB)
- **스킬 정의**: 6개 플랫폼별 SKILL.md 파일

---

## 라이선스 & 사용

- **라이선스**: LICENSE 파일 참고
- **PyPI**: `graphifyy` (이름 회수 중)
- **GitHub**: https://github.com/safishamsi/graphify
- **Branch**: v3 (현재 활발한 개발)

---

## 성과 사례

| 대상 | 파일 수 | 토큰 감소율 | 결과물 위치 |
|------|--------|-----------|-----------|
| Karpathy 저장소 + 5 논문 + 4 이미지 | 52개 | **71.5배** | `worked/karpathy-repos/` |
| graphify + Transformer 논문 | 4개 | **5.4배** | `worked/mixed-corpus/` |
| httpx (Python 라이브러리) | 6개 | ~1배 | `worked/httpx/` |

> 토큰 감소는 코퍼스 규모에 따라 다릅니다. 작은 코드베이스는 이미 컨텍스트에 맞으므로 그래프의 가치는 구조 명확화 측면입니다.

---

## 개발 기여

### 환영하는 기여
1. **Worked Examples**: 실제 코드베이스에 graphify 실행 → `worked/{slug}/` 저장 → PR
2. **추출 버그**: 입력 파일 + 캐시 항목 + 누락/생성된 부분 명시하고 이슈 작성
3. **새로운 언어**: ARCHITECTURE.md 참고 후 언어 파서 추가
4. **테스트 개선**: 기존 테스트 확대 또는 엣지 케이스 커버

---

## 요약

**Graphify**는 멀티모달 입력을 받아 **자동으로 구조화된 지식 그래프를 구축**하는 고급 AI 어시스턴트 스킬입니다. 
- 코드는 **로컬 AST 분석**으로 빠르고 안전하게 처리
- 문서/이미지는 **Claude AI**로 의미를 추출
- **Leiden 커뮤니티 탐지**로 논리적 그룹화
- **77.5배의 토큰 효율성**으로 대용량 코드베이스 쿼리 가능
- **Git 통합**으로 지속적 그래프 업데이트
- 6개 AI 코딩 어시스턴트 플랫폼 지원

코드베이스를 빠르게 이해하고, 아키텍처 결정의 "왜"를 찾고, 팀 온보딩을 가속화하는 데 이상적입니다.
