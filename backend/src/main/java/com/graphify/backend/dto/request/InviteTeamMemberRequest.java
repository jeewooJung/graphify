// backend/src/main/java/com/graphify/backend/dto/request/InviteTeamMemberRequest.java
package com.graphify.backend.dto.request;

import jakarta.validation.constraints.NotNull;

public class InviteTeamMemberRequest {
    @NotNull(message = "User ID is required")
    private Long userId;

    public InviteTeamMemberRequest() {
    }

    public InviteTeamMemberRequest(Long userId) {
        this.userId = userId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}
