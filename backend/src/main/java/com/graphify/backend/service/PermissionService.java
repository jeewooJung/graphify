package com.graphify.backend.service;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.graphify.backend.entity.*;
import com.graphify.backend.entity.enums.UserRole;
import com.graphify.backend.repository.*;
import java.util.List;

@Service
@Transactional
public class PermissionService {

    private final ProjectPermissionRepository projectPermissionRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TeamRepository teamRepository;

    public PermissionService(ProjectPermissionRepository projectPermissionRepository,
                           TeamMemberRepository teamMemberRepository,
                           ProjectRepository projectRepository,
                           UserRepository userRepository,
                           TeamRepository teamRepository) {
        this.projectPermissionRepository = projectPermissionRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.teamRepository = teamRepository;
    }

    @Cacheable(value = "projectPermissions", key = "#projectId + ':' + #userId", unless = "#result == null")
    public String getProjectPermission(Long projectId, Long userId) {
        return projectPermissionRepository.findByProjectIdAndUserId(projectId, userId)
            .map(ProjectPermission::getRole)
            .orElse(null);
    }

    public boolean canAccessProject(Long projectId, Long userId) {
        User user = userRepository.findById(userId).orElseThrow();

        // ADMIN can access everything
        if (user.getRole() == UserRole.ADMIN) {
            return true;
        }

        Project project = projectRepository.findById(projectId).orElseThrow();

        // Check explicit project permissions (ABAC)
        String permission = getProjectPermission(projectId, userId);
        if (permission != null) {
            return true;
        }

        // Check team membership
        return teamMemberRepository.existsByTeamIdAndUserId(project.getTeam().getId(), userId);
    }

    public boolean canEditProject(Long projectId, Long userId) {
        User user = userRepository.findById(userId).orElseThrow();

        if (user.getRole() == UserRole.ADMIN) {
            return true;
        }

        String permission = getProjectPermission(projectId, userId);
        return permission != null && (permission.equals("owner") || permission.equals("editor"));
    }

    public boolean canDeleteProject(Long projectId, Long userId) {
        User user = userRepository.findById(userId).orElseThrow();

        if (user.getRole() == UserRole.ADMIN) {
            return true;
        }

        String permission = getProjectPermission(projectId, userId);
        return permission != null && permission.equals("owner");
    }

    @CacheEvict(value = "projectPermissions", key = "#projectId + ':' + #userId")
    public void grantPermission(Long projectId, Long userId, String role, Long grantedBy) {
        var grantedByUser = userRepository.findById(grantedBy).orElseThrow();
        var project = projectRepository.findById(projectId).orElseThrow();
        var user = userRepository.findById(userId).orElseThrow();

        ProjectPermission permission = projectPermissionRepository
            .findByProjectIdAndUserId(projectId, userId)
            .orElse(new ProjectPermission());

        permission.setProject(project);
        permission.setUser(user);
        permission.setRole(role);
        permission.setGrantedBy(grantedByUser);

        projectPermissionRepository.save(permission);
    }

    @CacheEvict(value = "projectPermissions", key = "#projectId + ':' + #userId")
    public void revokePermission(Long projectId, Long userId) {
        projectPermissionRepository.findByProjectIdAndUserId(projectId, userId)
            .ifPresent(projectPermissionRepository::delete);
    }

    public List<ProjectPermission> getProjectPermissions(Long projectId) {
        return projectPermissionRepository.findByProjectId(projectId);
    }

    public boolean canManageTeam(Long teamId, Long userId) {
        User user = userRepository.findById(userId).orElseThrow();

        if (user.getRole() == UserRole.ADMIN) {
            return true;
        }

        var teamMember = teamMemberRepository.findByTeamIdAndUserId(teamId, userId);
        return teamMember.isPresent() &&
               (teamMember.get().getRole().equals("TEAM_LEAD") ||
                user.getRole() == UserRole.TEAM_LEAD);
    }

    public boolean canViewUser(Long userId, Long requesterId) {
        User requester = userRepository.findById(requesterId).orElseThrow();
        if (requester.getRole() == UserRole.ADMIN) {
            return true;
        }
        return userId.equals(requesterId);
    }

    public boolean canEditUser(Long userId, Long requesterId) {
        User requester = userRepository.findById(requesterId).orElseThrow();
        if (requester.getRole() == UserRole.ADMIN) {
            return true;
        }
        return userId.equals(requesterId);
    }
}
