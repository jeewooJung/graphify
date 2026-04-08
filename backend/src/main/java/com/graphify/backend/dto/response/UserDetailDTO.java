package com.graphify.backend.dto.response;

import com.graphify.backend.entity.User;
import java.time.LocalDateTime;

public class UserDetailDTO {
    private Long id;
    private String username;
    private String email;
    private String displayName;
    private String role;
    private boolean isActive;
    private LocalDateTime lastLoginAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public UserDetailDTO() {
    }

    public UserDetailDTO(Long id, String username, String email, String displayName, String role, boolean isActive, LocalDateTime lastLoginAt, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.displayName = displayName;
        this.role = role;
        this.isActive = isActive;
        this.lastLoginAt = lastLoginAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static UserDetailDTOBuilder builder() {
        return new UserDetailDTOBuilder();
    }

    public static UserDetailDTO fromEntity(User user) {
        return UserDetailDTO.builder()
            .id(user.getId())
            .username(user.getUsername())
            .email(user.getEmail())
            .displayName(user.getDisplayName())
            .role(user.getRole().toString())
            .isActive(user.isActive())
            .lastLoginAt(user.getLastLoginAt())
            .createdAt(user.getCreatedAt())
            .updatedAt(user.getUpdatedAt())
            .build();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setIsActive(boolean isActive) {
        this.isActive = isActive;
    }

    public LocalDateTime getLastLoginAt() {
        return lastLoginAt;
    }

    public void setLastLoginAt(LocalDateTime lastLoginAt) {
        this.lastLoginAt = lastLoginAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public static class UserDetailDTOBuilder {
        private Long id;
        private String username;
        private String email;
        private String displayName;
        private String role;
        private boolean isActive;
        private LocalDateTime lastLoginAt;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public UserDetailDTOBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public UserDetailDTOBuilder username(String username) {
            this.username = username;
            return this;
        }

        public UserDetailDTOBuilder email(String email) {
            this.email = email;
            return this;
        }

        public UserDetailDTOBuilder displayName(String displayName) {
            this.displayName = displayName;
            return this;
        }

        public UserDetailDTOBuilder role(String role) {
            this.role = role;
            return this;
        }

        public UserDetailDTOBuilder isActive(boolean isActive) {
            this.isActive = isActive;
            return this;
        }

        public UserDetailDTOBuilder lastLoginAt(LocalDateTime lastLoginAt) {
            this.lastLoginAt = lastLoginAt;
            return this;
        }

        public UserDetailDTOBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public UserDetailDTOBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public UserDetailDTO build() {
            return new UserDetailDTO(id, username, email, displayName, role, isActive, lastLoginAt, createdAt, updatedAt);
        }
    }
}
