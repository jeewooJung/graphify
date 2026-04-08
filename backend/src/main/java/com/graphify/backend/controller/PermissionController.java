// backend/src/main/java/com/graphify/backend/controller/PermissionController.java
package com.graphify.backend.controller;

import com.graphify.backend.dto.request.GrantPermissionRequest;
import com.graphify.backend.dto.response.PermissionDTO;
import com.graphify.backend.entity.ProjectPermission;
import com.graphify.backend.security.UserPrincipal;
import com.graphify.backend.service.PermissionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/projects/{projectId}/permissions")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PermissionController {

    private final PermissionService permissionService;

    public PermissionController(PermissionService permissionService) {
        this.permissionService = permissionService;
    }

    /**
     * Get all permissions for a project.
     */
    @GetMapping
    @PreAuthorize("@permissionService.canAccessProject(#projectId, authentication.principal.id)")
    public ResponseEntity<List<PermissionDTO>> getProjectPermissions(
            @PathVariable Long projectId) {
        List<ProjectPermission> permissions = permissionService.getProjectPermissions(projectId);
        List<PermissionDTO> dtos = permissions.stream()
            .map(PermissionDTO::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    /**
     * Grant a project permission to a user.
     */
    @PostMapping
    @PreAuthorize("@permissionService.canEditProject(#projectId, authentication.principal.id)")
    public ResponseEntity<PermissionDTO> grantPermission(
            @PathVariable Long projectId,
            @Valid @RequestBody GrantPermissionRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            ProjectPermission permission = permissionService.grantPermission(
                projectId,
                request.getUserId(),
                request.getRole(),
                currentUser.getId()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(PermissionDTO.fromEntity(permission));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    /**
     * Update a project permission role.
     */
    @PutMapping("/{permissionId}")
    @PreAuthorize("@permissionService.canEditProject(#projectId, authentication.principal.id)")
    public ResponseEntity<PermissionDTO> updatePermission(
            @PathVariable Long projectId,
            @PathVariable Long permissionId,
            @Valid @RequestBody GrantPermissionRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            ProjectPermission permission = permissionService.updatePermission(
                permissionId,
                request.getRole(),
                currentUser.getId()
            );
            return ResponseEntity.ok(PermissionDTO.fromEntity(permission));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    /**
     * Revoke a project permission.
     */
    @DeleteMapping("/{permissionId}")
    @PreAuthorize("@permissionService.canEditProject(#projectId, authentication.principal.id)")
    public ResponseEntity<Void> revokePermission(
            @PathVariable Long projectId,
            @PathVariable Long permissionId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            permissionService.revokePermission(permissionId, currentUser.getId());
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }
}
