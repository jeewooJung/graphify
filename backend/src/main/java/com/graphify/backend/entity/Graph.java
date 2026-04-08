package com.graphify.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "graphs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Graph {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;
    
    @ManyToOne
    @JoinColumn(name = "job_id", nullable = false)
    private GraphJob job;
    
    @Column(nullable = false)
    private String name;
    
    private Integer nodesCount;
    private Integer edgesCount;
    private Integer communitiesCount;
    
    @Column(nullable = false)
    private boolean isLatest;
    
    @Column(unique = true)
    private String neo4jGraphId;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
