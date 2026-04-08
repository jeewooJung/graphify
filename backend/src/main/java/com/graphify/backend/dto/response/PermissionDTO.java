// backend/src/main/java/com/graphify/backend/dto/response/PermissionDTO.java
package com.graphify.backend.dto.response;

import com.graphify.backend.entity.ProjectPermission;
import java.time.LocalDateTime;

public class PermissionDTO {
    private Long id;
    private Long projectId;
    private String projectName;
    private Long userId;
    private String username;
    private String email;
    private String role;
    private String grantedByName;
    private LocalDateTime grantedAt;
    private LocalDateTime updatedAt;

    public PermissionDTO() {
    }

    public PermissionDTO(Long id, Long projectId, String projectName, Long userId, String username, String email, String role, String grantedByName, LocalDateTime grantedAt, LocalDateTime updatedAt) {
        this.id = id;
        this.projectId = projectId;
        this.projectName = projectName;
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.role = role;
        this.grantedByName = grantedByName;
        this.grantedAt = grantedAt;
        this.updatedAt = updatedAt;
    }

    public static PermissionDTO fromEntity(ProjectPermission permission) {
        return new PermissionDTO(
            permission.getId(),
            permission.getProject().getId(),
            permission.getProject().getName(),
            permission.getUser().getId(),
            permission.getUser().getUsername(),
            permission.getUser().getEmail(),
            permission.getRole(),
            permission.getGrantedBy().getUsername(),
            permission.getGrantedAt(),
            permission.getUpdatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getGrantedByName() {
        return grantedByName;
    }

    public void setGrantedByName(String grantedByName) {
        this.grantedByName = grantedByName;
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
