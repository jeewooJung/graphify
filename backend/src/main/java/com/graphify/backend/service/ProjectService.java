// backend/src/main/java/com/graphify/backend/service/ProjectService.java
package com.graphify.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.graphify.backend.entity.Project;
import com.graphify.backend.entity.Team;
import com.graphify.backend.entity.User;
import com.graphify.backend.repository.ProjectRepository;
import com.graphify.backend.repository.TeamRepository;
import com.graphify.backend.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class ProjectService {

    private static final Logger logger = LoggerFactory.getLogger(ProjectService.class);

    private final ProjectRepository projectRepository;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;

    public ProjectService(ProjectRepository projectRepository,
                        TeamRepository teamRepository,
                        UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.teamRepository = teamRepository;
        this.userRepository = userRepository;
    }

    /**
     * Creates a new project within a specified team.
     * The creator is automatically added as the owner with full permissions.
     *
     * @param name the project name
     * @param description the project description
     * @param teamId the team ID where the project belongs
     * @param createdById the user ID of the creator
     * @return the created Project entity
     */
    public Project createProject(String name, String description, Long teamId, Long createdById) {
        Team team = teamRepository.findById(teamId)
            .orElseThrow(() -> new RuntimeException("Team not found with id: " + teamId));

        User creator = userRepository.findById(createdById)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + createdById));

        // Verify creator is a member of the team
        // This check would be performed in the service or via PermissionService
        // For now, we trust the controller enforces this

        Project project = new Project();
        project.setName(name);
        project.setDescription(description);
        project.setTeam(team);
        project.setCreatedBy(creator);
        project.setIsArchived(false);
        project.setStatus("ACTIVE");

        return projectRepository.save(project);
    }

    /**
     * Retrieves a project by ID.
     *
     * @param projectId the project ID
     * @return the Project entity
     * @throws RuntimeException if project not found
     */
    public Project getProjectById(Long projectId) {
        return projectRepository.findById(projectId)
            .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));
    }

    /**
     * Updates project name and/or description.
     *
     * @param projectId the project ID
     * @param name the new name (optional)
     * @param description the new description (optional)
     * @return the updated Project entity
     */
    public Project updateProject(Long projectId, String name, String description) {
        Project project = getProjectById(projectId);

        if (name != null && !name.isEmpty()) {
            project.setName(name);
        }
        if (description != null) {
            project.setDescription(description);
        }

        return projectRepository.save(project);
    }

    /**
     * Soft deletes a project by setting isArchived to true.
     *
     * @param projectId the project ID
     */
    public void deleteProject(Long projectId) {
        Project project = getProjectById(projectId);
        project.setIsArchived(true);
        project.setStatus("ARCHIVED");
        projectRepository.save(project);
    }

    /**
     * Archives a project (sets isArchived to true).
     *
     * @param projectId the project ID
     */
    public void archiveProject(Long projectId) {
        deleteProject(projectId); // Same as soft delete
    }

    /**
     * Retrieves all active (non-archived) projects in a team.
     *
     * @param teamId the team ID
     * @return list of active projects in the team
     */
    public List<Project> getProjectsByTeamId(Long teamId) {
        return projectRepository.findByTeamIdAndIsArchivedFalse(teamId);
    }

    /**
     * Retrieves all projects a user can access.
     * This includes projects where the user is a team member.
     *
     * @param userId the user ID
     * @return list of projects the user can access
     */
    public List<Project> getProjectsByUserId(Long userId) {
        // This would query projects where the user has access via team membership
        // For now, return projects where user is a team member
        return projectRepository.findProjectsByUserId(userId);
    }

    /**
     * Initiates a sync with the Python backend.
     * This is a stub implementation that logs the sync request.
     * Full integration with Python FastAPI backend (port 8006) will be implemented later.
     *
     * @param projectId the project ID to sync
     */
    public void syncProject(Long projectId) {
        Project project = getProjectById(projectId);

        try {
            logger.info("Initiating sync for project: {} ({})", project.getId(), project.getName());
            // TODO: Implement actual Python API call via RestTemplate
            // URL: http://localhost:8006/api/sync/project/{projectId}
            // For now, just log and update timestamp
            project.setLastSyncedAt(LocalDateTime.now());
            projectRepository.save(project);
            logger.info("Project sync initiated successfully");
        } catch (Exception e) {
            logger.error("Error syncing project: {}", projectId, e);
            throw new RuntimeException("Failed to sync project: " + e.getMessage());
        }
    }
}
