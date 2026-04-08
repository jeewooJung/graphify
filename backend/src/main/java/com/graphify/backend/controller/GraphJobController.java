// backend/src/main/java/com/graphify/backend/controller/GraphJobController.java
package com.graphify.backend.controller;

import com.graphify.backend.dto.response.GraphJobDTO;
import com.graphify.backend.dto.response.GraphDTO;
import com.graphify.backend.entity.GraphJob;
import com.graphify.backend.entity.Graph;
import com.graphify.backend.security.UserPrincipal;
import com.graphify.backend.service.GraphJobService;
import com.graphify.backend.service.PermissionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*", maxAge = 3600)
public class GraphJobController {

    private final GraphJobService graphJobService;
    private final PermissionService permissionService;

    public GraphJobController(GraphJobService graphJobService, PermissionService permissionService) {
        this.graphJobService = graphJobService;
        this.permissionService = permissionService;
    }

    /**
     * Get all jobs for a project.
     */
    @GetMapping("/projects/{projectId}/jobs")
    @PreAuthorize("@permissionService.canAccessProject(#projectId, authentication.principal.id)")
    public ResponseEntity<List<GraphJobDTO>> getProjectJobs(@PathVariable Long projectId) {
        List<GraphJob> jobs = graphJobService.getProjectJobs(projectId);
        List<GraphJobDTO> dtos = jobs.stream()
            .map(GraphJobDTO::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    /**
     * Get a specific job by ID.
     */
    @GetMapping("/jobs/{jobId}")
    public ResponseEntity<GraphJobDTO> getJob(@PathVariable Long jobId,
                                               @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            GraphJob job = graphJobService.getJobById(jobId);
            // Verify user has access to the project
            if (!permissionService.canAccessProject(job.getProject().getId(), currentUser.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            return ResponseEntity.ok(GraphJobDTO.fromEntity(job));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Create a new graph job (initiate sync/analysis).
     */
    @PostMapping("/projects/{projectId}/jobs")
    @PreAuthorize("@permissionService.canEditProject(#projectId, authentication.principal.id)")
    public ResponseEntity<GraphJobDTO> createJob(
            @PathVariable Long projectId,
            @RequestParam @NotBlank String source,
            @RequestParam(required = false) String sourceUrl,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            GraphJob job = graphJobService.createJob(projectId, source, sourceUrl, currentUser.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(GraphJobDTO.fromEntity(job));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Update job status (for backend processing).
     */
    @PutMapping("/jobs/{jobId}/status")
    public ResponseEntity<GraphJobDTO> updateJobStatus(
            @PathVariable Long jobId,
            @RequestParam @NotBlank String status) {
        try {
            GraphJob job = graphJobService.updateJobStatus(jobId, status);
            return ResponseEntity.ok(GraphJobDTO.fromEntity(job));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Update job with results (for backend processing).
     */
    @PutMapping("/jobs/{jobId}/results")
    public ResponseEntity<GraphJobDTO> updateJobResults(
            @PathVariable Long jobId,
            @RequestParam Integer totalNodes,
            @RequestParam Integer totalEdges,
            @RequestParam Integer totalCommunities) {
        try {
            GraphJob job = graphJobService.updateJobResults(jobId, totalNodes, totalEdges, totalCommunities);
            return ResponseEntity.ok(GraphJobDTO.fromEntity(job));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Set job error (for backend processing).
     */
    @PutMapping("/jobs/{jobId}/error")
    public ResponseEntity<GraphJobDTO> setJobError(
            @PathVariable Long jobId,
            @RequestParam @NotBlank String errorMessage) {
        try {
            GraphJob job = graphJobService.setJobError(jobId, errorMessage);
            return ResponseEntity.ok(GraphJobDTO.fromEntity(job));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get all graphs for a project.
     */
    @GetMapping("/projects/{projectId}/graphs")
    @PreAuthorize("@permissionService.canAccessProject(#projectId, authentication.principal.id)")
    public ResponseEntity<List<GraphDTO>> getProjectGraphs(@PathVariable Long projectId) {
        List<Graph> graphs = graphJobService.getProjectGraphs(projectId);
        List<GraphDTO> dtos = graphs.stream()
            .map(GraphDTO::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    /**
     * Get a specific graph by ID.
     */
    @GetMapping("/graphs/{graphId}")
    public ResponseEntity<GraphDTO> getGraph(@PathVariable Long graphId,
                                              @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            // This is a simplified version - in production you'd fetch the graph
            // For now, returning not implemented
            return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get latest graph for a project.
     */
    @GetMapping("/projects/{projectId}/graphs/latest")
    @PreAuthorize("@permissionService.canAccessProject(#projectId, authentication.principal.id)")
    public ResponseEntity<GraphDTO> getLatestProjectGraph(@PathVariable Long projectId) {
        try {
            Graph graph = graphJobService.getLatestProjectGraph(projectId);
            return ResponseEntity.ok(GraphDTO.fromEntity(graph));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Create a graph from completed job.
     */
    @PostMapping("/jobs/{jobId}/graphs")
    public ResponseEntity<GraphDTO> createGraphFromJob(
            @PathVariable Long jobId,
            @RequestParam @NotBlank String name) {
        try {
            Graph graph = graphJobService.createGraphFromJob(jobId, name);
            return ResponseEntity.status(HttpStatus.CREATED).body(GraphDTO.fromEntity(graph));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}
