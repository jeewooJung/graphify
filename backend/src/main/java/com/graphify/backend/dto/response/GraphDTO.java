// backend/src/main/java/com/graphify/backend/dto/response/GraphDTO.java
package com.graphify.backend.dto.response;

import com.graphify.backend.entity.Graph;
import java.time.LocalDateTime;

public class GraphDTO {
    private Long id;
    private Long projectId;
    private String projectName;
    private Long jobId;
    private String name;
    private Integer nodesCount;
    private Integer edgesCount;
    private Integer communitiesCount;
    private boolean isLatest;
    private String neo4jGraphId;
    private LocalDateTime createdAt;

    public GraphDTO() {
    }

    public GraphDTO(Long id, Long projectId, String projectName, Long jobId, String name,
                    Integer nodesCount, Integer edgesCount, Integer communitiesCount,
                    boolean isLatest, String neo4jGraphId, LocalDateTime createdAt) {
        this.id = id;
        this.projectId = projectId;
        this.projectName = projectName;
        this.jobId = jobId;
        this.name = name;
        this.nodesCount = nodesCount;
        this.edgesCount = edgesCount;
        this.communitiesCount = communitiesCount;
        this.isLatest = isLatest;
        this.neo4jGraphId = neo4jGraphId;
        this.createdAt = createdAt;
    }

    public static GraphDTO fromEntity(Graph graph) {
        return new GraphDTO(
            graph.getId(),
            graph.getProject().getId(),
            graph.getProject().getName(),
            graph.getJob().getId(),
            graph.getName(),
            graph.getNodesCount(),
            graph.getEdgesCount(),
            graph.getCommunitiesCount(),
            graph.isLatest(),
            graph.getNeo4jGraphId(),
            graph.getCreatedAt()
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

    public Long getJobId() {
        return jobId;
    }

    public void setJobId(Long jobId) {
        this.jobId = jobId;
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
