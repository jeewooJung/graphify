// backend/src/main/java/com/graphify/backend/dto/response/AuditLogDTO.java
package com.graphify.backend.dto.response;

import com.graphify.backend.entity.AuditLog;
import java.time.LocalDateTime;

public class AuditLogDTO {
    private Long id;
    private Long actorId;
    private String actorName;
    private String action;
    private String resourceType;
    private Long resourceId;
    private String changes;
    private String ipAddress;
    private LocalDateTime createdAt;

    public AuditLogDTO() {
    }

    public AuditLogDTO(Long id, Long actorId, String actorName, String action, String resourceType,
                       Long resourceId, String changes, String ipAddress, LocalDateTime createdAt) {
        this.id = id;
        this.actorId = actorId;
        this.actorName = actorName;
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
            log.getActor().getId(),
            log.getActor().getUsername(),
            log.getAction(),
            log.getResourceType(),
            log.getResourceId(),
            log.getChanges(),
            log.getIpAddress(),
            log.getCreatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getActorId() {
        return actorId;
    }

    public void setActorId(Long actorId) {
        this.actorId = actorId;
    }

    public String getActorName() {
        return actorName;
    }

    public void setActorName(String actorName) {
        this.actorName = actorName;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getResourceType() {
        return resourceType;
    }

    public void setResourceType(String resourceType) {
        this.resourceType = resourceType;
    }

    public Long getResourceId() {
        return resourceId;
    }

    public void setResourceId(Long resourceId) {
        this.resourceId = resourceId;
    }

    public String getChanges() {
        return changes;
    }

    public void setChanges(String changes) {
        this.changes = changes;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
