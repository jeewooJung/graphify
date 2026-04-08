// backend/src/main/java/com/graphify/backend/repository/GraphRepository.java
package com.graphify.backend.repository;

import com.graphify.backend.entity.Graph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface GraphRepository extends JpaRepository<Graph, Long> {
    List<Graph> findByProjectId(Long projectId);

    Optional<Graph> findByProjectIdAndIsLatestTrue(Long projectId);

    List<Graph> findByProjectIdOrderByCreatedAtDesc(Long projectId);

    Optional<Graph> findByJobId(Long jobId);
}
