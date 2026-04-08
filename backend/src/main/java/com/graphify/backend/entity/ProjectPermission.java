// backend/src/main/java/com/graphify/backend/entity/ProjectPermission.java
package com.graphify.backend.entity;

import java.time.LocalDateTime;

public class ProjectPermission {
    private Long id;
    private Project project;
    private User user;
    private String role; // owner, editor, commenter, viewer
    private User grantedBy;
    private LocalDateTime grantedAt;
    private LocalDateTime updatedAt;

    public ProjectPermission() {
    }

    public ProjectPermission(Project project, User user, String role, User grantedBy) {
        this.project = project;
        this.user = user;
        this.role = role;
        this.grantedBy = grantedBy;
        this.grantedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public User getGrantedBy() {
        return grantedBy;
    }

    public void setGrantedBy(User grantedBy) {
        this.grantedBy = grantedBy;
    }

    public LocalDateTime getGrantedAt() {
        return grantedAt;
    }

    public void setGrantedAt(LocalDateTime grantedAt) {
        this.grantedAt = grantedAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
