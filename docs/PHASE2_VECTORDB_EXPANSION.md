# Phase 2: 의미론적 검색 확장 (Qdrant + Redis)

**상태**: 미래 계획 (Phase 1: 그래프 구조 완성 후)

## 개요

Phase 1에서는 **그래프 구조 기반 탐색**으로 MVP를 완성합니다.
Phase 2에서는 **벡터 임베딩 기반 의미론적 검색**을 추가합니다.

---

## Phase 2 추가 기능

### 1. Qdrant (벡터 검색)
```python
사용자 쿼리: "Attention과 개념적으로 유사한 함수는?"

흐름:
1. 사용자 쿼리 → Ollama 임베딩 생성
2. Qdrant에서 코사인 유사도 검색
3. 상위 K개 결과 반환 (신뢰도 점수 포함)
4. 그래프의 해당 노드와 연결된 구조 표시
```

### 2. Redis (캐싱)
```
캐시 항목:
├─ 인기 검색어 결과 (TTL: 1시간)
├─ 사용자 권한 (TTL: 30분)
├─ 그래프 조각 (frequently accessed subgraphs)
└─ 쿼리 결과 (사용자별)

효과:
• 벡터 검색 응답 시간 50% 단축
• 임베딩 재생성 불필요
• DB 쿼리 부하 감소
```

---

## 마이그레이션 경로

### Phase 1 (현재)
```
PostgreSQL + Neo4j
└─ 그래프 구조만

데이터 모델:
{
  nodes: [
    {id, label, source_file, community, confidence}
  ],
  edges: [
    {source, target, relation, confidence_score}
  ]
}
```

### Phase 2 (확장)
```
PostgreSQL + Neo4j + Qdrant + Redis
└─ 그래프 + 벡터 검색

추가 데이터 모델:
{
  embeddings: [
    {node_id, vector, source}  // 1536 차원 (Ollama)
  ],
  cache: {
    query_results: {},
    permissions: {},
    graph_fragments: {}
  }
}
```

---

## 구현 계획

### Step 1: Qdrant 추가 (1-2주)
```
1. Docker Compose에 Qdrant 서비스 추가
2. Python FastAPI에 Qdrant 클라이언트 통합
3. 기존 그래프의 모든 노드 임베딩 생성
4. 임베딩을 Qdrant에 저장

코드 예:
```python
from qdrant_client import QdrantClient

qdrant = QdrantClient(":memory:")

# 노드별 임베딩 생성 및 저장
for node in graph.nodes():
    embedding = ollama.embed(node.label)
    qdrant.upsert(
        collection_name="nodes",
        points=[Point(id=node.id, vector=embedding)]
    )
```

### Step 2: 의미론적 검색 API 추가 (1주)
```python
# Python FastAPI 엔드포인트
POST /api/semantic-search
{
  "query": "Attention과 유사한 개념",
  "top_k": 10,
  "threshold": 0.7
}

응답:
{
  "results": [
    {
      "node_id": "...",
      "label": "...",
      "similarity_score": 0.92,
      "connected_nodes": [...]
    }
  ]
}
```

### Step 3: Redis 캐싱 추가 (1주)
```python
# Python에서 Redis 캐싱
@cache_result(ttl=3600)
def semantic_search(query, top_k):
    embedding = ollama.embed(query)
    results = qdrant.search(embedding, top_k)
    return results

# Java에서 권한 캐싱
@Cacheable(value = "user_permissions")
public Set<Permission> getUserPermissions(String userId) {
    return permissionService.fetch(userId);
}
```

### Step 4: React UI 업그레이드 (1주)
```
UI 추가:
├─ "의미론적으로 유사한 노드" 탭
├─ 유사도 점수 시각화
├─ 검색 모드 선택 (구조 vs 의미)
└─ 성능 메트릭 표시
```

---

## 데이터 마이그레이션

### Phase 1 → Phase 2 전환
```bash
# 기존 그래프에서 임베딩 생성 (배치)
python scripts/generate_embeddings.py \
  --graph /data/graph.json \
  --output /data/embeddings.json \
  --model ollama

# Qdrant에 대량 로드
python scripts/load_to_qdrant.py \
  --embeddings /data/embeddings.json \
  --qdrant-url http://localhost:6333
```

---

## 아키텍처 변화

### Phase 1 (현재)
```
질의: "A에서 B로 가는 경로?"
→ Neo4j GraphQL
→ 경로 탐색 (DFS/BFS)
→ 결과 반환
```

### Phase 2 (확장)
```
질의 1: "A에서 B로 가는 경로?"
→ Neo4j GraphQL (기존)
→ 경로 탐색

질의 2: "이와 유사한 개념?"
→ Qdrant 벡터 검색 (신규)
→ 임베딩 유사도
→ 관련 노드 반환

질의 3: "최근 검색 결과?"
→ Redis 캐시 (신규)
→ 캐시 히트 시 빠른 응답
```

---

## 성능 예상

| 작업 | Phase 1 | Phase 2 |
|------|---------|---------|
| 경로 탐색 | 50-200ms | 50-200ms (변화 없음) |
| 의미 검색 | ❌ 불가능 | 100-300ms |
| 캐시 히트 | ❌ 없음 | 10-50ms |
| 대역폭 | 낮음 | 중간 |
| 저장소 | 중간 | 높음 (임베딩) |

---

## 비용 분석

| 요소 | Phase 1 | Phase 2 추가 |
|------|---------|------------|
| 저장소 | PostgreSQL + Neo4j | + Qdrant 저장소 |
| 메모리 | 4GB | + 2-4GB (캐시) |
| CPU | 낮음 (쿼리) | 중간 (임베딩) |
| 외부 API | 0 (Ollama) | 0 (로컬) |

---

## 의사결정: Phase 2 시작 기준

Phase 2를 시작하는 타이밍:
- ✅ Phase 1 MVP 완성 (그래프 시각화, 기본 검색)
- ✅ 사용자 피드백 (구조 기반 검색으로 충분한가?)
- ✅ 성능 메트릭 (Neo4j 쿼리 응답 시간 < 100ms)
- ✅ 예산/리소스 확보

---

## 참고: Qdrant vs PostgreSQL pgvector

| 항목 | pgvector | Qdrant |
|------|----------|--------|
| 임베딩 저장 | PostgreSQL 컬럼 | 전문 Vector DB |
| 검색 속도 | 느림 (대규모) | 빠름 (HNSW 인덱스) |
| 운영 복잡도 | 낮음 | 중간 |
| 메모리 | PostgreSQL과 함께 | 분리됨 |
| 추천 시나리오 | 소규모 (< 100K 임베딩) | 대규모 (> 1M 임베딩) |

---

## 구현 체크리스트

- [ ] Phase 1 완성
- [ ] Qdrant 아키텍처 검토
- [ ] Python FastAPI에 Qdrant 클라이언트 추가
- [ ] 배치 임베딩 생성 스크립트
- [ ] Qdrant 데이터 로드
- [ ] 의미론적 검색 API 구현
- [ ] Redis 캐싱 레이어 추가
- [ ] React UI 업그레이드
- [ ] 성능 벤치마크
- [ ] 사용자 테스트

---

**이 문서는 Phase 1 완성 후 참고하세요.**
