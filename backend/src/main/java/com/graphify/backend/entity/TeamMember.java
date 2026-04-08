package com.graphify.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "team_members", uniqueConstraints = @UniqueConstraint(columnNames = {"team_id", "user_id"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamMember {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private String role; // TEAM_LEAD, MEMBER
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime joinedAt;
    
    @ManyToOne
    @JoinColumn(name = "invited_by")
    private User invitedBy;
    
    private LocalDateTime invitedAt;
    
    @PrePersist
    protected void onCreate() {
        joinedAt = LocalDateTime.now();
    }
}


