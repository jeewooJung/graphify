// backend/src/main/java/com/graphify/backend/controller/ProjectController.java
package com.graphify.backend.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.graphify.backend.service.ProjectService;
import com.graphify.backend.service.PermissionService;
import com.graphify.backend.security.UserPrincipal;
import com.graphify.backend.dto.request.CreateProjectRequest;
import com.graphify.backend.dto.request.UpdateProjectRequest;
import com.graphify.backend.dto.response.ProjectDetailDTO;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/projects")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class ProjectController {

    private final ProjectService projectService;
    private final PermissionService permissionService;

    public ProjectController(ProjectService projectService, PermissionService permissionService) {
        this.projectService = projectService;
        this.permissionService = permissionService;
    }

    /**
     * POST /projects
     * Creates a new project within a team.
     * Requires the user to be a member of the specified team.
     * Creator is automatically added as the owner with full permissions.
     */
    @PostMapping
    public ResponseEntity<ProjectDetailDTO> createProject(@Valid @RequestBody CreateProjectRequest request,
                                                         Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        var project = projectService.createProject(
            request.getName(),
            request.getDescription(),
            request.getTeamId(),
            principal.getId()
        );
        return new ResponseEntity<>(ProjectDetailDTO.fromEntity(project), HttpStatus.CREATED);
    }

    /**
     * GET /projects
     * Retrieves all projects accessible to the current user.
     * A user can access projects they created or projects in teams they're a member of.
     */
    @GetMapping
    public ResponseEntity<List<ProjectDetailDTO>> getMyProjects(Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        List<ProjectDetailDTO> projects = projectService.getProjectsByUserId(principal.getId()).stream()
            .map(ProjectDetailDTO::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(projects);
    }

    /**
     * GET /projects/{projectId}
     * Retrieves a specific project by ID.
     * Requires canAccessProject permission check.
     */
    @GetMapping("/{projectId}")
    @PreAuthorize("@permissionService.canAccessProject(#projectId, authentication.principal.id)")
    public ResponseEntity<ProjectDetailDTO> getProjectById(@PathVariable Long projectId) {
        var project = projectService.getProjectById(projectId);
        return ResponseEntity.ok(ProjectDetailDTO.fromEntity(project));
    }

    /**
     * PUT /projects/{projectId}
     * Updates a project's name and/or description.
     * Requires canEditProject permission check (typically project owner or team lead).
     */
    @PutMapping("/{projectId}")
    @PreAuthorize("@permissionService.canEditProject(#projectId, authentication.principal.id)")
    public ResponseEntity<ProjectDetailDTO> updateProject(@PathVariable Long projectId,
                                                         @Valid @RequestBody UpdateProjectRequest request) {
        var project = projectService.updateProject(projectId, request.getName(), request.getDescription());
        return ResponseEntity.ok(ProjectDetailDTO.fromEntity(project));
    }

    /**
     * DELETE /projects/{projectId}
     * Soft deletes a project (archives it).
     * Requires canDeleteProject permission check (typically project owner or admin).
     */
    @DeleteMapping("/{projectId}")
    @PreAuthorize("@permissionService.canDeleteProject(#projectId, authentication.principal.id)")
    public ResponseEntity<?> deleteProject(@PathVariable Long projectId) {
        projectService.deleteProject(projectId);
        return ResponseEntity.ok().build();
    }

    /**
     * POST /projects/{projectId}/sync
     * Initiates a sync with the Python backend.
     * Calls the Python FastAPI service on port 8006.
     * Requires project access permission.
     */
    @PostMapping("/{projectId}/sync")
    @PreAuthorize("@permissionService.canAccessProject(#projectId, authentication.principal.id)")
    public ResponseEntity<?> syncProject(@PathVariable Long projectId) {
        try {
            projectService.syncProject(projectId);
            return ResponseEntity.ok().body("Sync initiated successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to sync project: " + e.getMessage());
        }
    }

    /**
     * GET /projects/{projectId}/jobs
     * Retrieves analysis jobs for a project.
     * This endpoint returns graph analysis jobs associated with the project.
     * Requires project access permission.
     */
    @GetMapping("/{projectId}/jobs")
    @PreAuthorize("@permissionService.canAccessProject(#projectId, authentication.principal.id)")
    public ResponseEntity<?> getGraphJobs(@PathVariable Long projectId) {
        // TODO: Implement job retrieval logic
        // For now, return an empty list
        // This will query the jobs associated with this project
        return ResponseEntity.ok().body(List.of());
    }
}
