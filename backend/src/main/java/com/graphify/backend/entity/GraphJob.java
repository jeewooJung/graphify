// backend/src/main/java/com/graphify/backend/entity/GraphJob.java
package com.graphify.backend.entity;

import java.time.LocalDateTime;

public class GraphJob {
    private Long id;
    private Project project;
    private String status; // PENDING, RUNNING, COMPLETED, FAILED
    private String source; // GITLAB, GITHUB, UPLOAD
    private String sourceUrl;
    private Integer totalNodes;
    private Integer totalEdges;
    private Integer totalCommunities;
    private String errorMessage;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private User createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public GraphJob() {
    }

    public GraphJob(Project project, String status, String source, User createdBy) {
        this.project = project;
        this.status = status;
        this.source = source;
        this.createdBy = createdBy;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getSourceUrl() {
        return sourceUrl;
    }

    public void setSourceUrl(String sourceUrl) {
        this.sourceUrl = sourceUrl;
    }

    public Integer getTotalNodes() {
        return totalNodes;
    }

    public void setTotalNodes(Integer totalNodes) {
        this.totalNodes = totalNodes;
    }

    public Integer getTotalEdges() {
        return totalEdges;
    }

    public void setTotalEdges(Integer totalEdges) {
        this.totalEdges = totalEdges;
    }

    public Integer getTotalCommunities() {
        return totalCommunities;
    }

    public void setTotalCommunities(Integer totalCommunities) {
        this.totalCommunities = totalCommunities;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
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
}
