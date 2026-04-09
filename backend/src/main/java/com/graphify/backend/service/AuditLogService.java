package com.graphify.backend.service;

import org.springframework.stereotype.Service;
import com.graphify.backend.dto.response.AuditLogDTO;
import com.graphify.backend.repository.AuditLogRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public List<AuditLogDTO> getAllLogs() {
        return auditLogRepository.findAll().stream()
            .map(AuditLogDTO::fromEntity)
            .collect(Collectors.toList());
    }

    public List<AuditLogDTO> getLogsByUser(Long userId) {
        return auditLogRepository.findByActorId(userId).stream()
            .map(AuditLogDTO::fromEntity)
            .collect(Collectors.toList());
    }

    public List<AuditLogDTO> getLogsByResource(String resourceType, String resourceId) {
        return auditLogRepository.findByResourceTypeAndResourceId(resourceType, resourceId).stream()
            .map(AuditLogDTO::fromEntity)
            .collect(Collectors.toList());
    }

    public List<AuditLogDTO> getLogsByAction(String action) {
        return auditLogRepository.findByAction(action).stream()
            .map(AuditLogDTO::fromEntity)
            .collect(Collectors.toList());
    }

    public List<AuditLogDTO> getLogsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return auditLogRepository.findByCreatedAtBetween(startDate, endDate).stream()
            .map(AuditLogDTO::fromEntity)
            .collect(Collectors.toList());
    }
}
