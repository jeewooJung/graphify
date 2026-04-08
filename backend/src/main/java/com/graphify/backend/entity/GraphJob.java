package com.graphify.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "graph_jobs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GraphJob {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;
    
    @Column(nullable = false)
    private String status; // PENDING, RUNNING, COMPLETED, FAILED
    
    @Column(nullable = false)
    private String source; // GITLAB, GITHUB, UPLOAD
    
    private String sourceUrl;
    private Integer totalNodes;
    private Integer totalEdges;
    private Integer totalCommunities;
    private String errorMessage;
    
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @ManyToOne
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}

// backend/src/main/java/com/graphify/backend/entity/Graph.java
