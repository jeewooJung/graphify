// backend/src/main/java/com/graphify/backend/dto/request/UpdateProjectRequest.java
package com.graphify.backend.dto.request;

public class UpdateProjectRequest {
    private String name;
    private String description;

    public UpdateProjectRequest() {
    }

    public UpdateProjectRequest(String name, String description) {
        this.name = name;
        this.description = description;
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
}
