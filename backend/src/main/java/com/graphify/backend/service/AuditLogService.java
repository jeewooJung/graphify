// backend/src/main/java/com/graphify/backend/service/AuditLogService.java
package com.graphify.backend.service;

import com.graphify.backend.entity.AuditLog;
import com.graphify.backend.entity.User;
import com.graphify.backend.repository.AuditLogRepository;
import com.graphify.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public AuditLogService(AuditLogRepository auditLogRepository, UserRepository userRepository) {
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    /**
     * Log an action.
     */
    public AuditLog logAction(Long userId, String action, String resourceType, Long resourceId, String ipAddress) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        AuditLog log = new AuditLog(user, action, resourceType, resourceId, ipAddress);
        return auditLogRepository.save(log);
    }

    /**
     * Log an action with changes.
     */
    public AuditLog logActionWithChanges(Long userId, String action, String resourceType, Long resourceId,
                                         String changes, String ipAddress) {
        AuditLog log = logAction(userId, action, resourceType, resourceId, ipAddress);
        log.setChanges(changes);
        return auditLogRepository.save(log);
    }

    /**
     * Get audit log by ID.
     */
    public AuditLog getAuditLogById(Long logId) {
        return auditLogRepository.findById(logId)
            .orElseThrow(() -> new IllegalArgumentException("Audit log not found"));
    }

    /**
     * Get all logs for a user.
     */
    public List<AuditLog> getUserAuditLogs(Long userId) {
        return auditLogRepository.findByActorId(userId);
    }

    /**
     * Get logs for a resource.
     */
    public List<AuditLog> getResourceAuditLogs(String resourceType, Long resourceId) {
        return auditLogRepository.findByResourceTypeAndResourceId(resourceType, resourceId);
    }

    /**
     * Get logs by resource type.
     */
    public List<AuditLog> getResourceTypeAuditLogs(String resourceType) {
        return auditLogRepository.findByResourceType(resourceType);
    }

    /**
     * Get logs by action.
     */
    public List<AuditLog> getActionAuditLogs(String action) {
        return auditLogRepository.findByAction(action);
    }

    /**
     * Get logs within date range.
     */
    public List<AuditLog> getAuditLogsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return auditLogRepository.findByCreatedAtBetween(startDate, endDate);
    }

    /**
     * Get user logs within date range.
     */
    public List<AuditLog> getUserAuditLogsByDateRange(Long userId, LocalDateTime startDate, LocalDateTime endDate) {
        return auditLogRepository.findByActorIdAndCreatedAtBetween(userId, startDate, endDate);
    }

    /**
     * Get resource type logs within date range.
     */
    public List<AuditLog> getResourceTypeAuditLogsByDateRange(String resourceType, LocalDateTime startDate,
                                                               LocalDateTime endDate) {
        return auditLogRepository.findByResourceTypeAndCreatedAtBetween(resourceType, startDate, endDate);
    }

    /**
     * Get all audit logs (ordered by creation date descending).
     */
    public List<AuditLog> getAllAuditLogs() {
        return auditLogRepository.findAllByOrderByCreatedAtDesc();
    }
}
