package com.graphify.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.graphify.backend.entity.Project;
import com.graphify.backend.entity.Team;
import com.graphify.backend.entity.User;
import com.graphify.backend.repository.ProjectRepository;
import com.graphify.backend.repository.TeamRepository;
import com.graphify.backend.repository.UserRepository;
import com.graphify.backend.security.UserPrincipal;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/projects")
public class ProjectController {

    private final ProjectRepository projectRepository;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;

    public ProjectController(ProjectRepository projectRepository,
                             TeamRepository teamRepository,
                             UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.teamRepository = teamRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createProject(
            @RequestBody Map<String, Object> request,
            Authentication auth) {
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        User currentUser = userRepository.findById(principal.getId()).orElseThrow();

        Long teamId = request.get("teamId") != null
            ? Long.valueOf(request.get("teamId").toString())
            : null;
        Team team = teamId != null ? teamRepository.findById(teamId).orElse(null) : null;
        if (team == null) {
            // Create a default team for the user
            team = new Team();
            team.setName("Default Team");
            team.setDescription("Auto-created");
            team.setCreatedBy(currentUser);
            team.setIsActive(true);
            team = teamRepository.save(team);
        }

        Project project = new Project();
        project.setName((String) request.get("name"));
        project.setDescription((String) request.get("description"));
        project.setTeam(team);
        project.setCreatedBy(currentUser);
        project.setStatus("INITIALIZED");
        project.setArchived(false);

        Project saved = projectRepository.save(project);
        return new ResponseEntity<>(toMap(saved), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listProjects() {
        List<Map<String, Object>> projects = projectRepository.findAll().stream()
            .filter(p -> !p.isArchived())
            .map(this::toMap)
            .collect(Collectors.toList());
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/{projectId}")
    public ResponseEntity<Map<String, Object>> getProject(@PathVariable Long projectId) {
        Project project = projectRepository.findById(projectId).orElse(null);
        if (project == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(toMap(project));
    }

    @PutMapping("/{projectId}")
    public ResponseEntity<Map<String, Object>> updateProject(
            @PathVariable Long projectId,
            @RequestBody Map<String, Object> request) {
        Project project = projectRepository.findById(projectId).orElse(null);
        if (project == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        if (request.containsKey("name")) project.setName((String) request.get("name"));
        if (request.containsKey("description")) project.setDescription((String) request.get("description"));
        Project updated = projectRepository.save(project);
        return ResponseEntity.ok(toMap(updated));
    }

    @DeleteMapping("/{projectId}")
    public ResponseEntity<Map<String, Object>> deleteProject(@PathVariable Long projectId) {
        Project project = projectRepository.findById(projectId).orElse(null);
        if (project == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        project.setArchived(true);
        Project updated = projectRepository.save(project);
        Map<String, Object> response = toMap(updated);
        response.put("isArchived", true);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{projectId}/sync")
    public ResponseEntity<Map<String, Object>> syncProject(@PathVariable Long projectId) {
        Project project = projectRepository.findById(projectId).orElse(null);
        if (project == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        // Simulate sync (Python API likely unavailable → 503)
        Map<String, Object> response = new HashMap<>();
        response.put("status", "SYNCING");
        response.put("projectId", projectId);
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }

    private Map<String, Object> toMap(Project project) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", project.getId());
        map.put("name", project.getName());
        map.put("description", project.getDescription());
        map.put("status", project.getStatus());
        map.put("isArchived", project.isArchived());
        map.put("createdAt", project.getCreatedAt());
        return map;
    }
}
