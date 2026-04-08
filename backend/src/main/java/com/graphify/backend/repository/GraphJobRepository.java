// backend/src/main/java/com/graphify/backend/repository/GraphJobRepository.java
package com.graphify.backend.repository;

import com.graphify.backend.entity.GraphJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface GraphJobRepository extends JpaRepository<GraphJob, Long> {
    List<GraphJob> findByProjectId(Long projectId);

    List<GraphJob> findByProjectIdAndStatus(Long projectId, String status);

    Optional<GraphJob> findFirstByProjectIdOrderByCreatedAtDesc(Long projectId);

    List<GraphJob> findByStatus(String status);

    List<GraphJob> findByCreatedById(Long userId);
}
