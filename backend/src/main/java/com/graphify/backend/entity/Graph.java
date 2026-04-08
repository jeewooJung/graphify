// backend/src/main/java/com/graphify/backend/entity/Graph.java
package com.graphify.backend.entity;

import java.time.LocalDateTime;

public class Graph {
    private Long id;
    private Project project;
    private GraphJob job;
    private String name;
    private Integer nodesCount;
    private Integer edgesCount;
    private Integer communitiesCount;
    private boolean isLatest;
    private String neo4jGraphId;
    private LocalDateTime createdAt;

    public Graph() {
    }

    public Graph(Project project, GraphJob job, String name) {
        this.project = project;
        this.job = job;
        this.name = name;
        this.isLatest = false;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public GraphJob getJob() {
        return job;
    }

    public void setJob(GraphJob job) {
        this.job = job;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getNodesCount() {
        return nodesCount;
    }

    public void setNodesCount(Integer nodesCount) {
        this.nodesCount = nodesCount;
    }

    public Integer getEdgesCount() {
        return edgesCount;
    }

    public void setEdgesCount(Integer edgesCount) {
        this.edgesCount = edgesCount;
    }

    public Integer getCommunitiesCount() {
        return communitiesCount;
    }

    public void setCommunitiesCount(Integer communitiesCount) {
        this.communitiesCount = communitiesCount;
    }

    public boolean isLatest() {
        return isLatest;
    }

    public void setLatest(boolean latest) {
        isLatest = latest;
    }

    public String getNeo4jGraphId() {
        return neo4jGraphId;
    }

    public void setNeo4jGraphId(String neo4jGraphId) {
        this.neo4jGraphId = neo4jGraphId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
