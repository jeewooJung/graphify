// backend/src/main/java/com/graphify/backend/entity/AuditLog.java
package com.graphify.backend.entity;

import java.time.LocalDateTime;

public class AuditLog {
    private Long id;
    private User actor;
    private String action; // CREATE, UPDATE, DELETE, QUERY, LOGIN, LOGOUT
    private String resourceType; // User, Team, Project, Graph, Permission
    private Long resourceId;
    private String changes; // JSON string of changes
    private String ipAddress;
    private LocalDateTime createdAt;

    public AuditLog() {
    }

    public AuditLog(User actor, String action, String resourceType, Long resourceId, String ipAddress) {
        this.actor = actor;
        this.action = action;
        this.resourceType = resourceType;
        this.resourceId = resourceId;
        this.ipAddress = ipAddress;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getActor() {
        return actor;
    }

    public void setActor(User actor) {
        this.actor = actor;
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
