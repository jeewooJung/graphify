// backend/src/main/java/com/graphify/backend/entity/TeamMember.java
package com.graphify.backend.entity;

import java.time.LocalDateTime;

public class TeamMember {
    private Long id;
    private Team team;
    private User user;
    private String role;
    private User invitedBy;
    private LocalDateTime invitedAt;
    private LocalDateTime joinedAt;

    public TeamMember() {
    }

    public TeamMember(Team team, User user, String role, User invitedBy) {
        this.team = team;
        this.user = user;
        this.role = role;
        this.invitedBy = invitedBy;
        this.invitedAt = LocalDateTime.now();
        this.joinedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Team getTeam() {
        return team;
    }

    public void setTeam(Team team) {
        this.team = team;
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

    public User getInvitedBy() {
        return invitedBy;
    }

    public void setInvitedBy(User invitedBy) {
        this.invitedBy = invitedBy;
    }

    public LocalDateTime getInvitedAt() {
        return invitedAt;
    }

    public void setInvitedAt(LocalDateTime invitedAt) {
        this.invitedAt = invitedAt;
    }

    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(LocalDateTime joinedAt) {
        this.joinedAt = joinedAt;
    }
}
