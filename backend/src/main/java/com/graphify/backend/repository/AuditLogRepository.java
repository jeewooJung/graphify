// backend/src/main/java/com/graphify/backend/repository/AuditLogRepository.java
package com.graphify.backend.repository;

import com.graphify.backend.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByActorId(Long userId);

    List<AuditLog> findByResourceType(String resourceType);

    List<AuditLog> findByResourceTypeAndResourceId(String resourceType, Long resourceId);

    List<AuditLog> findByAction(String action);

    List<AuditLog> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    List<AuditLog> findByActorIdAndCreatedAtBetween(Long userId, LocalDateTime startDate, LocalDateTime endDate);

    List<AuditLog> findByResourceTypeAndCreatedAtBetween(String resourceType, LocalDateTime startDate, LocalDateTime endDate);

    List<AuditLog> findAllByOrderByCreatedAtDesc();
}
