// backend/src/main/java/com/graphify/backend/dto/response/ProjectDetailDTO.java
package com.graphify.backend.dto.response;

import com.graphify.backend.entity.Project;
import java.time.LocalDateTime;

public class ProjectDetailDTO {
    private Long id;
    private String name;
    private String description;
    private Long teamId;
    private String teamName;
    private Long createdById;
    private String createdByName;
    private String status;
    private LocalDateTime lastSyncedAt;
    private boolean isArchived;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ProjectDetailDTO() {
    }

    public ProjectDetailDTO(Long id, String name, String description, Long teamId, String teamName,
                           Long createdById, String createdByName, String status, LocalDateTime lastSyncedAt,
                           boolean isArchived, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.teamId = teamId;
        this.teamName = teamName;
        this.createdById = createdById;
        this.createdByName = createdByName;
        this.status = status;
        this.lastSyncedAt = lastSyncedAt;
        this.isArchived = isArchived;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static ProjectDetailDTOBuilder builder() {
        return new ProjectDetailDTOBuilder();
    }

    public static ProjectDetailDTO fromEntity(Project project) {
        return ProjectDetailDTO.builder()
            .id(project.getId())
            .name(project.getName())
            .description(project.getDescription())
            .teamId(project.getTeam().getId())
            .teamName(project.getTeam().getName())
            .createdById(project.getCreatedBy().getId())
            .createdByName(project.getCreatedBy().getUsername())
            .status(project.getStatus())
            .lastSyncedAt(project.getLastSyncedAt())
            .isArchived(project.isArchived())
            .createdAt(project.getCreatedAt())
            .updatedAt(project.getUpdatedAt())
            .build();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getTeamId() {
        return teamId;
    }

    public void setTeamId(Long teamId) {
        this.teamId = teamId;
    }

    public String getTeamName() {
        return teamName;
    }

    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }

    public Long getCreatedById() {
        return createdById;
    }

    public void setCreatedById(Long createdById) {
        this.createdById = createdById;
    }

    public String getCreatedByName() {
        return createdByName;
    }

    public void setCreatedByName(String createdByName) {
        this.createdByName = createdByName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getLastSyncedAt() {
        return lastSyncedAt;
    }

    public void setLastSyncedAt(LocalDateTime lastSyncedAt) {
        this.lastSyncedAt = lastSyncedAt;
    }

    public boolean isArchived() {
        return isArchived;
    }

    public void setIsArchived(boolean isArchived) {
        this.isArchived = isArchived;
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

    public static class ProjectDetailDTOBuilder {
        private Long id;
        private String name;
        private String description;
        private Long teamId;
        private String teamName;
        private Long createdById;
        private String createdByName;
        private String status;
        private LocalDateTime lastSyncedAt;
        private boolean isArchived;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public ProjectDetailDTOBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public ProjectDetailDTOBuilder name(String name) {
            this.name = name;
            return this;
        }

        public ProjectDetailDTOBuilder description(String description) {
            this.description = description;
            return this;
        }

        public ProjectDetailDTOBuilder teamId(Long teamId) {
            this.teamId = teamId;
            return this;
        }

        public ProjectDetailDTOBuilder teamName(String teamName) {
            this.teamName = teamName;
            return this;
        }

        public ProjectDetailDTOBuilder createdById(Long createdById) {
            this.createdById = createdById;
            return this;
        }

        public ProjectDetailDTOBuilder createdByName(String createdByName) {
            this.createdByName = createdByName;
            return this;
        }

        public ProjectDetailDTOBuilder status(String status) {
            this.status = status;
            return this;
        }

        public ProjectDetailDTOBuilder lastSyncedAt(LocalDateTime lastSyncedAt) {
            this.lastSyncedAt = lastSyncedAt;
            return this;
        }

        public ProjectDetailDTOBuilder isArchived(boolean isArchived) {
            this.isArchived = isArchived;
            return this;
        }

        public ProjectDetailDTOBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public ProjectDetailDTOBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public ProjectDetailDTO build() {
            return new ProjectDetailDTO(id, name, description, teamId, teamName, createdById, createdByName,
                status, lastSyncedAt, isArchived, createdAt, updatedAt);
        }
    }
}
