package com.graphify.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "project_permissions", uniqueConstraints = @UniqueConstraint(columnNames = {"project_id", "user_id"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectPermission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private String role; // owner, editor, commenter, viewer
    
    @ManyToOne
    @JoinColumn(name = "granted_by", nullable = false)
    private User grantedBy;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime grantedAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        grantedAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
