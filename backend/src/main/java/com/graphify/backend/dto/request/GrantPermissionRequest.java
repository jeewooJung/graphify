// backend/src/main/java/com/graphify/backend/dto/request/GrantPermissionRequest.java
package com.graphify.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public class GrantPermissionRequest {
    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Role is required")
    @Pattern(regexp = "owner|editor|commenter|viewer", message = "Role must be one of: owner, editor, commenter, viewer")
    private String role;

    public GrantPermissionRequest() {
    }

    public GrantPermissionRequest(Long userId, String role) {
        this.userId = userId;
        this.role = role;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
