// backend/src/main/java/com/graphify/backend/dto/request/CreateProjectRequest.java
package com.graphify.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateProjectRequest {
    @NotBlank(message = "Project name is required")
    @Size(min = 3, max = 100, message = "Project name must be between 3 and 100 characters")
    private String name;

    private String description;

    @NotNull(message = "Team ID is required")
    private Long teamId;

    private String gitlabUrl;

    public CreateProjectRequest() {
    }

    public CreateProjectRequest(String name, String description, Long teamId, String gitlabUrl) {
        this.name = name;
        this.description = description;
        this.teamId = teamId;
        this.gitlabUrl = gitlabUrl;
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

    public String getGitlabUrl() {
        return gitlabUrl;
    }

    public void setGitlabUrl(String gitlabUrl) {
        this.gitlabUrl = gitlabUrl;
    }
}
