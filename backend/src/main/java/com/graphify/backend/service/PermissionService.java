// backend/src/main/java/com/graphify/backend/service/PermissionService.java
package com.graphify.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import com.graphify.backend.entity.Project;
import com.graphify.backend.entity.ProjectPermission;
import com.graphify.backend.entity.Team;
import com.graphify.backend.entity.User;
import com.graphify.backend.repository.ProjectRepository;
import com.graphify.backend.repository.ProjectPermissionRepository;
import com.graphify.backend.repository.TeamRepository;
import com.graphify.backend.repository.TeamMemberRepository;
import com.graphify.backend.repository.UserRepository;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PermissionService {

    private final ProjectRepository projectRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final ProjectPermissionRepository permissionRepository;
    private final UserRepository userRepository;

    public PermissionService(ProjectRepository projectRepository,
                            TeamRepository teamRepository,
                            TeamMemberRepository teamMemberRepository,
                            ProjectPermissionRepository permissionRepository,
                            UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.permissionRepository = permissionRepository;
        this.userRepository = userRepository;
    }

    /**
     * Check if a user can access (read) a project.
     * User can access if they are a member of the project's team or created the project.
     */
    public boolean canAccessProject(Long projectId, Long userId) {
        return projectRepository.findById(projectId)
            .map(project -> canAccessProject(project, userId))
            .orElse(false);
    }

    private boolean canAccessProject(Project project, Long userId) {
        // User can access if they created the project
        if (project.getCreatedBy().getId().equals(userId)) {
            return true;
        }
        // User can access if they are a member of the team
        return teamMemberRepository.existsByTeamIdAndUserId(project.getTeam().getId(), userId);
    }

    /**
     * Check if a user can edit (update) a project.
     * User can edit if they are the creator or a team lead in the project's team.
     */
    public boolean canEditProject(Long projectId, Long userId) {
        return projectRepository.findById(projectId)
            .map(project -> canEditProject(project, userId))
            .orElse(false);
    }

    private boolean canEditProject(Project project, Long userId) {
        // Creator can always edit
        if (project.getCreatedBy().getId().equals(userId)) {
            return true;
        }
        // Team leads can edit projects in their team
        return teamMemberRepository.findByTeamIdAndUserId(project.getTeam().getId(), userId)
            .map(member -> "TEAM_LEAD".equals(member.getRole()))
            .orElse(false);
    }

    /**
     * Check if a user can delete (archive) a project.
     * User can delete if they are the creator or have admin privileges.
     */
    public boolean canDeleteProject(Long projectId, Long userId) {
        return projectRepository.findById(projectId)
            .map(project -> project.getCreatedBy().getId().equals(userId))
            .orElse(false);
    }

    /**
     * Check if a user can manage a team.
     * User can manage if they are a team lead in the team.
     */
    public boolean canManageTeam(Long teamId, Long userId) {
        return teamRepository.findById(teamId)
            .map(team -> canManageTeam(team, userId))
            .orElse(false);
    }

    private boolean canManageTeam(Team team, Long userId) {
        // Creator is automatically a team lead
        if (team.getCreatedBy().getId().equals(userId)) {
            return true;
        }
        // Check if user is a team lead
        return teamMemberRepository.findByTeamIdAndUserId(team.getId(), userId)
            .map(member -> "TEAM_LEAD".equals(member.getRole()))
            .orElse(false);
    }

    /**
     * Grant a project permission to a user.
     * User can only grant if they have 'owner' role or are creator.
     */
    @CacheEvict(value = "projectPermissions", allEntries = true)
    public ProjectPermission grantPermission(Long projectId, Long userId, String role, Long currentUserId) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        User currentUser = userRepository.findById(currentUserId)
            .orElseThrow(() -> new IllegalArgumentException("Current user not found"));

        // Check if current user has permission to grant (owner role or project creator)
        Optional<ProjectPermission> existingPerm = permissionRepository.findByProjectIdAndUserId(projectId, currentUserId);
        boolean isOwner = existingPerm.map(p -> "owner".equals(p.getRole())).orElse(false);
        boolean isCreator = project.getCreatedBy().getId().equals(currentUserId);

        if (!isOwner && !isCreator) {
            throw new IllegalArgumentException("User does not have permission to grant project access");
        }

        // Check if permission already exists, update it instead
        Optional<ProjectPermission> existing = permissionRepository.findByProjectIdAndUserId(projectId, userId);
        if (existing.isPresent()) {
            ProjectPermission perm = existing.get();
            perm.setRole(role);
            perm.setUpdatedAt(java.time.LocalDateTime.now());
            return permissionRepository.save(perm);
        }

        // Create new permission
        ProjectPermission permission = new ProjectPermission(project, user, role, currentUser);
        return permissionRepository.save(permission);
    }

    /**
     * Revoke a project permission.
     */
    @CacheEvict(value = "projectPermissions", allEntries = true)
    public void revokePermission(Long permissionId, Long currentUserId) {
        ProjectPermission permission = permissionRepository.findById(permissionId)
            .orElseThrow(() -> new IllegalArgumentException("Permission not found"));

        // Check if current user has permission to revoke (owner role or project creator)
        Optional<ProjectPermission> currentUserPerm = permissionRepository.findByProjectIdAndUserId(
            permission.getProject().getId(), currentUserId);
        boolean isOwner = currentUserPerm.map(p -> "owner".equals(p.getRole())).orElse(false);
        boolean isCreator = permission.getProject().getCreatedBy().getId().equals(currentUserId);

        if (!isOwner && !isCreator) {
            throw new IllegalArgumentException("User does not have permission to revoke project access");
        }

        permissionRepository.deleteById(permissionId);
    }

    /**
     * Update a project permission role.
     */
    @CacheEvict(value = "projectPermissions", allEntries = true)
    public ProjectPermission updatePermission(Long permissionId, String newRole, Long currentUserId) {
        ProjectPermission permission = permissionRepository.findById(permissionId)
            .orElseThrow(() -> new IllegalArgumentException("Permission not found"));

        // Check if current user has permission to update (owner role or project creator)
        Optional<ProjectPermission> currentUserPerm = permissionRepository.findByProjectIdAndUserId(
            permission.getProject().getId(), currentUserId);
        boolean isOwner = currentUserPerm.map(p -> "owner".equals(p.getRole())).orElse(false);
        boolean isCreator = permission.getProject().getCreatedBy().getId().equals(currentUserId);

        if (!isOwner && !isCreator) {
            throw new IllegalArgumentException("User does not have permission to update project access");
        }

        permission.setRole(newRole);
        permission.setUpdatedAt(java.time.LocalDateTime.now());
        return permissionRepository.save(permission);
    }

    /**
     * Get all permissions for a project.
     */
    @Cacheable(value = "projectPermissions", key = "#projectId")
    public List<ProjectPermission> getProjectPermissions(Long projectId) {
        return permissionRepository.findByProjectId(projectId);
    }

    /**
     * Get all permissions for a user.
     */
    public List<ProjectPermission> getUserPermissions(Long userId) {
        return permissionRepository.findByUserId(userId);
    }
}
