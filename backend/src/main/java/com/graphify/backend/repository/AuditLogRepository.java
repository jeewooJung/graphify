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
