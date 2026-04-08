// backend/src/main/java/com/graphify/backend/dto/response/GraphJobDTO.java
package com.graphify.backend.dto.response;

import com.graphify.backend.entity.GraphJob;
import java.time.LocalDateTime;

public class GraphJobDTO {
    private Long id;
    private Long projectId;
    private String projectName;
    private String status;
    private String source;
    private String sourceUrl;
    private Integer totalNodes;
    private Integer totalEdges;
    private Integer totalCommunities;
    private String errorMessage;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private String createdByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public GraphJobDTO() {
    }

    public GraphJobDTO(Long id, Long projectId, String projectName, String status, String source, String sourceUrl,
                       Integer totalNodes, Integer totalEdges, Integer totalCommunities, String errorMessage,
                       LocalDateTime startedAt, LocalDateTime completedAt, String createdByName,
                       LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.projectId = projectId;
        this.projectName = projectName;
        this.status = status;
        this.source = source;
        this.sourceUrl = sourceUrl;
        this.totalNodes = totalNodes;
        this.totalEdges = totalEdges;
        this.totalCommunities = totalCommunities;
        this.errorMessage = errorMessage;
        this.startedAt = startedAt;
        this.completedAt = completedAt;
        this.createdByName = createdByName;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static GraphJobDTO fromEntity(GraphJob job) {
        return new GraphJobDTO(
            job.getId(),
            job.getProject().getId(),
            job.getProject().getName(),
            job.getStatus(),
            job.getSource(),
            job.getSourceUrl(),
            job.getTotalNodes(),
            job.getTotalEdges(),
            job.getTotalCommunities(),
            job.getErrorMessage(),
            job.getStartedAt(),
            job.getCompletedAt(),
            job.getCreatedBy().getUsername(),
            job.getCreatedAt(),
            job.getUpdatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
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

    public String getCreatedByName() {
        return createdByName;
    }

    public void setCreatedByName(String createdByName) {
        this.createdByName = createdByName;
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
