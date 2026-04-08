// backend/src/main/java/com/graphify/backend/dto/response/TeamMemberDTO.java
package com.graphify.backend.dto.response;

import com.graphify.backend.entity.TeamMember;
import java.time.LocalDateTime;

public class TeamMemberDTO {
    private Long id;
    private Long userId;
    private String username;
    private String email;
    private String role;
    private LocalDateTime joinedAt;
    private String invitedByName;
    private LocalDateTime invitedAt;

    public TeamMemberDTO() {
    }

    public TeamMemberDTO(Long id, Long userId, String username, String email, String role, LocalDateTime joinedAt, String invitedByName, LocalDateTime invitedAt) {
        this.id = id;
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.role = role;
        this.joinedAt = joinedAt;
        this.invitedByName = invitedByName;
        this.invitedAt = invitedAt;
    }

    public static TeamMemberDTOBuilder builder() {
        return new TeamMemberDTOBuilder();
    }

    public static TeamMemberDTO fromEntity(TeamMember member) {
        return TeamMemberDTO.builder()
            .id(member.getId())
            .userId(member.getUser().getId())
            .username(member.getUser().getUsername())
            .email(member.getUser().getEmail())
            .role(member.getRole())
            .joinedAt(member.getJoinedAt())
            .invitedByName(member.getInvitedBy() != null ? member.getInvitedBy().getUsername() : null)
            .invitedAt(member.getInvitedAt())
            .build();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(LocalDateTime joinedAt) {
        this.joinedAt = joinedAt;
    }

    public String getInvitedByName() {
        return invitedByName;
    }

    public void setInvitedByName(String invitedByName) {
        this.invitedByName = invitedByName;
    }

    public LocalDateTime getInvitedAt() {
        return invitedAt;
    }

    public void setInvitedAt(LocalDateTime invitedAt) {
        this.invitedAt = invitedAt;
    }

    public static class TeamMemberDTOBuilder {
        private Long id;
        private Long userId;
        private String username;
        private String email;
        private String role;
        private LocalDateTime joinedAt;
        private String invitedByName;
        private LocalDateTime invitedAt;

        public TeamMemberDTOBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public TeamMemberDTOBuilder userId(Long userId) {
            this.userId = userId;
            return this;
        }

        public TeamMemberDTOBuilder username(String username) {
            this.username = username;
            return this;
        }

        public TeamMemberDTOBuilder email(String email) {
            this.email = email;
            return this;
        }

        public TeamMemberDTOBuilder role(String role) {
            this.role = role;
            return this;
        }

        public TeamMemberDTOBuilder joinedAt(LocalDateTime joinedAt) {
            this.joinedAt = joinedAt;
            return this;
        }

        public TeamMemberDTOBuilder invitedByName(String invitedByName) {
            this.invitedByName = invitedByName;
            return this;
        }

        public TeamMemberDTOBuilder invitedAt(LocalDateTime invitedAt) {
            this.invitedAt = invitedAt;
            return this;
        }

        public TeamMemberDTO build() {
            return new TeamMemberDTO(id, userId, username, email, role, joinedAt, invitedByName, invitedAt);
        }
    }
}
