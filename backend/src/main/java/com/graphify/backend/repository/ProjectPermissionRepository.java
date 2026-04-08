// backend/src/main/java/com/graphify/backend/repository/ProjectPermissionRepository.java
package com.graphify.backend.repository;

import com.graphify.backend.entity.ProjectPermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectPermissionRepository extends JpaRepository<ProjectPermission, Long> {
    Optional<ProjectPermission> findByProjectIdAndUserId(Long projectId, Long userId);

    List<ProjectPermission> findByProjectId(Long projectId);

    List<ProjectPermission> findByUserId(Long userId);

    boolean existsByProjectIdAndUserId(Long projectId, Long userId);

    void deleteByProjectIdAndUserId(Long projectId, Long userId);
}
