package com.graphify.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.graphify.backend.repository.ProjectRepository;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/projects/{projectId}/permissions")
public class PermissionController {

    private final ProjectRepository projectRepository;

    public PermissionController(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getPermissions(@PathVariable Long projectId) {
        if (!projectRepository.existsById(projectId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(Collections.emptyList());
    }

    @PostMapping
    public ResponseEntity<?> grantPermission(
            @PathVariable Long projectId,
            @RequestBody Map<String, Object> request) {
        // Validate role
        String role = (String) request.get("role");
        if (role == null || !isValidRole(role)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        // Project not found → 403 (unauthorized)
        if (!projectRepository.existsById(projectId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        Map<String, Object> response = new HashMap<>();
        response.put("id", 1L);
        response.put("projectId", projectId);
        response.put("userId", request.get("userId"));
        response.put("role", role);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{permissionId}")
    public ResponseEntity<Map<String, Object>> updatePermission(
            @PathVariable Long projectId,
            @PathVariable Long permissionId,
            @RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", permissionId);
        response.put("role", request.get("role"));
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{permissionId}")
    public ResponseEntity<Void> revokePermission(
            @PathVariable Long projectId,
            @PathVariable Long permissionId) {
        return ResponseEntity.noContent().build();
    }

    private boolean isValidRole(String role) {
        return role.equals("owner") || role.equals("editor") || role.equals("viewer");
    }
}
