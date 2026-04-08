// backend/src/main/java/com/graphify/backend/dto/response/TeamDetailDTO.java
package com.graphify.backend.dto.response;

import com.graphify.backend.entity.Team;
import java.time.LocalDateTime;

public class TeamDetailDTO {
    private Long id;
    private String name;
    private String description;
    private Long createdById;
    private String createdByName;
    private boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public TeamDetailDTO() {
    }

    public TeamDetailDTO(Long id, String name, String description, Long createdById, String createdByName, boolean isActive, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.createdById = createdById;
        this.createdByName = createdByName;
        this.isActive = isActive;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static TeamDetailDTOBuilder builder() {
        return new TeamDetailDTOBuilder();
    }

    public static TeamDetailDTO fromEntity(Team team) {
        return TeamDetailDTO.builder()
            .id(team.getId())
            .name(team.getName())
            .description(team.getDescription())
            .createdById(team.getCreatedBy().getId())
            .createdByName(team.getCreatedBy().getUsername())
            .isActive(team.isActive())
            .createdAt(team.getCreatedAt())
            .updatedAt(team.getUpdatedAt())
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

    public boolean isActive() {
        return isActive;
    }

    public void setIsActive(boolean isActive) {
        this.isActive = isActive;
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

    public static class TeamDetailDTOBuilder {
        private Long id;
        private String name;
        private String description;
        private Long createdById;
        private String createdByName;
        private boolean isActive;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public TeamDetailDTOBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public TeamDetailDTOBuilder name(String name) {
            this.name = name;
            return this;
        }

        public TeamDetailDTOBuilder description(String description) {
            this.description = description;
            return this;
        }

        public TeamDetailDTOBuilder createdById(Long createdById) {
            this.createdById = createdById;
            return this;
        }

        public TeamDetailDTOBuilder createdByName(String createdByName) {
            this.createdByName = createdByName;
            return this;
        }

        public TeamDetailDTOBuilder isActive(boolean isActive) {
            this.isActive = isActive;
            return this;
        }

        public TeamDetailDTOBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public TeamDetailDTOBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public TeamDetailDTO build() {
            return new TeamDetailDTO(id, name, description, createdById, createdByName, isActive, createdAt, updatedAt);
        }
    }
}
