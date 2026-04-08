// backend/src/main/java/com/graphify/backend/controller/AuditLogController.java
package com.graphify.backend.controller;

import com.graphify.backend.dto.response.AuditLogDTO;
import com.graphify.backend.entity.AuditLog;
import com.graphify.backend.service.AuditLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/audit-logs")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuditLogController {

    private final AuditLogService auditLogService;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    /**
     * Get all audit logs (admin only).
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditLogDTO>> getAllAuditLogs() {
        List<AuditLog> logs = auditLogService.getAllAuditLogs();
        List<AuditLogDTO> dtos = logs.stream()
            .map(AuditLogDTO::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    /**
     * Get audit log by ID (admin only).
     */
    @GetMapping("/{logId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AuditLogDTO> getAuditLog(@PathVariable Long logId) {
        try {
            AuditLog log = auditLogService.getAuditLogById(logId);
            return ResponseEntity.ok(AuditLogDTO.fromEntity(log));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get audit logs for a user (admin only).
     */
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditLogDTO>> getUserAuditLogs(@PathVariable Long userId) {
        List<AuditLog> logs = auditLogService.getUserAuditLogs(userId);
        List<AuditLogDTO> dtos = logs.stream()
            .map(AuditLogDTO::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    /**
     * Get audit logs for a resource (admin only).
     */
    @GetMapping("/resource/{resourceType}/{resourceId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditLogDTO>> getResourceAuditLogs(
            @PathVariable String resourceType,
            @PathVariable Long resourceId) {
        List<AuditLog> logs = auditLogService.getResourceAuditLogs(resourceType, resourceId);
        List<AuditLogDTO> dtos = logs.stream()
            .map(AuditLogDTO::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    /**
     * Get audit logs by resource type (admin only).
     */
    @GetMapping("/resource-type/{resourceType}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditLogDTO>> getResourceTypeAuditLogs(
            @PathVariable String resourceType) {
        List<AuditLog> logs = auditLogService.getResourceTypeAuditLogs(resourceType);
        List<AuditLogDTO> dtos = logs.stream()
            .map(AuditLogDTO::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    /**
     * Get audit logs by action (admin only).
     */
    @GetMapping("/action/{action}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditLogDTO>> getActionAuditLogs(
            @PathVariable String action) {
        List<AuditLog> logs = auditLogService.getActionAuditLogs(action);
        List<AuditLogDTO> dtos = logs.stream()
            .map(AuditLogDTO::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    /**
     * Get audit logs by date range (admin only).
     */
    @GetMapping("/date-range")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditLogDTO>> getAuditLogsByDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        try {
            LocalDateTime start = LocalDateTime.parse(startDate, DATE_FORMATTER);
            LocalDateTime end = LocalDateTime.parse(endDate, DATE_FORMATTER);
            List<AuditLog> logs = auditLogService.getAuditLogsByDateRange(start, end);
            List<AuditLogDTO> dtos = logs.stream()
                .map(AuditLogDTO::fromEntity)
                .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get user audit logs by date range (admin only).
     */
    @GetMapping("/user/{userId}/date-range")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditLogDTO>> getUserAuditLogsByDateRange(
            @PathVariable Long userId,
            @RequestParam String startDate,
            @RequestParam String endDate) {
        try {
            LocalDateTime start = LocalDateTime.parse(startDate, DATE_FORMATTER);
            LocalDateTime end = LocalDateTime.parse(endDate, DATE_FORMATTER);
            List<AuditLog> logs = auditLogService.getUserAuditLogsByDateRange(userId, start, end);
            List<AuditLogDTO> dtos = logs.stream()
                .map(AuditLogDTO::fromEntity)
                .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get resource type audit logs by date range (admin only).
     */
    @GetMapping("/resource-type/{resourceType}/date-range")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditLogDTO>> getResourceTypeAuditLogsByDateRange(
            @PathVariable String resourceType,
            @RequestParam String startDate,
            @RequestParam String endDate) {
        try {
            LocalDateTime start = LocalDateTime.parse(startDate, DATE_FORMATTER);
            LocalDateTime end = LocalDateTime.parse(endDate, DATE_FORMATTER);
            List<AuditLog> logs = auditLogService.getResourceTypeAuditLogsByDateRange(resourceType, start, end);
            List<AuditLogDTO> dtos = logs.stream()
                .map(AuditLogDTO::fromEntity)
                .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
