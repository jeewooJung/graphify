package com.graphify.backend.dto.response;

import com.graphify.backend.entity.AuditLog;

import java.time.LocalDateTime;
import java.util.Map;

public class AuditLogDTO {
    private Long id;
    private Long actorId;
    private String actorUsername;
    private String action;
    private String resourceType;
    private String resourceId;
    private Map<String, Object> changes;
    private String ipAddress;
    private LocalDateTime createdAt;

    public AuditLogDTO() {}

    public AuditLogDTO(Long id, Long actorId, String actorUsername, String action,
                       String resourceType, String resourceId, Map<String, Object> changes,
                       String ipAddress, LocalDateTime createdAt) {
        this.id = id;
        this.actorId = actorId;
        this.actorUsername = actorUsername;
        this.action = action;
        this.resourceType = resourceType;
        this.resourceId = resourceId;
        this.changes = changes;
        this.ipAddress = ipAddress;
        this.createdAt = createdAt;
    }

    public static AuditLogDTO fromEntity(AuditLog log) {
        return new AuditLogDTO(
            log.getId(),
            log.getActor() != null ? log.getActor().getId() : null,
            log.getActor() != null ? log.getActor().getUsername() : null,
            log.getAction(),
            log.getResourceType(),
            log.getResourceId(),
            log.getChanges(),
            log.getIpAddress(),
            log.getCreatedAt()
        );
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getActorId() { return actorId; }
    public void setActorId(Long actorId) { this.actorId = actorId; }
    public String getActorUsername() { return actorUsername; }
    public void setActorUsername(String actorUsername) { this.actorUsername = actorUsername; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getResourceType() { return resourceType; }
    public void setResourceType(String resourceType) { this.resourceType = resourceType; }
    public String getResourceId() { return resourceId; }
    public void setResourceId(String resourceId) { this.resourceId = resourceId; }
    public Map<String, Object> getChanges() { return changes; }
    public void setChanges(Map<String, Object> changes) { this.changes = changes; }
    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
