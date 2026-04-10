package com.graphify.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.graphify.backend.entity.ProjectPermission;
import com.graphify.backend.repository.ProjectPermissionRepository;
import com.graphify.backend.security.UserPrincipal;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/permissions")
public class PermissionOverviewController {

    private final ProjectPermissionRepository projectPermissionRepository;

    public PermissionOverviewController(ProjectPermissionRepository projectPermissionRepository) {
        this.projectPermissionRepository = projectPermissionRepository;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listPermissions(Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        boolean isAdmin = authentication.getAuthorities().stream()
            .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));

        List<ProjectPermission> permissions = isAdmin
            ? projectPermissionRepository.findAll()
            : projectPermissionRepository.findByUserId(principal.getId());

        List<Map<String, Object>> response = permissions.stream()
            .map(this::toMap)
            .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    private Map<String, Object> toMap(ProjectPermission permission) {
        String accessRole = permission.getRole();
        String projectName = permission.getProject().getName();
        String granteeName = permission.getUser().getDisplayName() != null
            ? permission.getUser().getDisplayName()
            : permission.getUser().getUsername();

        Map<String, Object> map = new HashMap<>();
        map.put("id", permission.getId());
        map.put("role", accessRole);
        map.put("resource", projectName);
        map.put("action", toAction(accessRole));
        map.put("description", granteeName + " has " + accessRole + " access to " + projectName);
        map.put("grantedTo", List.of(permission.getUser().getEmail()));
        map.put("createdDate", permission.getGrantedAt());
        map.put("projectId", permission.getProject().getId());
        map.put("userId", permission.getUser().getId());
        return map;
    }

    private String toAction(String accessRole) {
        return switch (accessRole.toLowerCase()) {
            case "owner" -> "create";
            case "editor" -> "update";
            case "viewer" -> "read";
            default -> "read";
        };
    }
}
