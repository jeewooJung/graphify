package com.graphify.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.graphify.backend.entity.Project;
import com.graphify.backend.entity.ProjectPermission;
import com.graphify.backend.entity.Team;
import com.graphify.backend.entity.TeamMember;
import com.graphify.backend.entity.User;
import com.graphify.backend.entity.enums.UserRole;
import com.graphify.backend.repository.ProjectPermissionRepository;
import com.graphify.backend.repository.ProjectRepository;
import com.graphify.backend.repository.TeamMemberRepository;
import com.graphify.backend.repository.TeamRepository;
import com.graphify.backend.repository.UserRepository;

import java.util.Optional;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(UserRepository userRepository,
                                      TeamRepository teamRepository,
                                      TeamMemberRepository teamMemberRepository,
                                      ProjectRepository projectRepository,
                                      ProjectPermissionRepository projectPermissionRepository,
                                      PasswordEncoder passwordEncoder) {
        return args -> {
            User demoUser = ensureUser(
                userRepository,
                passwordEncoder,
                "demo@graphify.com",
                "demo@graphify.com",
                "demo123",
                "Demo User",
                UserRole.ADMIN
            );

            User sarah = ensureUser(
                userRepository,
                passwordEncoder,
                "sarah.chen@graphify.com",
                "sarah.chen@graphify.com",
                "Graph1234!",
                "Sarah Chen",
                UserRole.TEAM_LEAD
            );

            User james = ensureUser(
                userRepository,
                passwordEncoder,
                "james.wilson@graphify.com",
                "james.wilson@graphify.com",
                "Graph1234!",
                "James Wilson",
                UserRole.MEMBER
            );

            User emma = ensureUser(
                userRepository,
                passwordEncoder,
                "emma.davis@graphify.com",
                "emma.davis@graphify.com",
                "Graph1234!",
                "Emma Davis",
                UserRole.VIEWER
            );

            User admin = ensureUser(
                userRepository,
                passwordEncoder,
                "admin@test.com",
                "admin@test.com",
                "Admin1234!",
                "Admin User",
                UserRole.ADMIN
            );

            User testUser = ensureUser(
                userRepository,
                passwordEncoder,
                "testuser1@test.com",
                "testuser1@test.com",
                "Test1234!",
                "Test User 1",
                UserRole.MEMBER
            );

            Team workspace = ensureTeam(
                teamRepository,
                "JJW Graph Lab",
                "Graph intelligence workspace for curated knowledge operations.",
                demoUser
            );

            ensureTeamMember(teamMemberRepository, workspace, demoUser, "TEAM_LEAD", demoUser);
            ensureTeamMember(teamMemberRepository, workspace, sarah, "TEAM_LEAD", demoUser);
            ensureTeamMember(teamMemberRepository, workspace, james, "MEMBER", demoUser);
            ensureTeamMember(teamMemberRepository, workspace, emma, "VIEWER", demoUser);
            ensureTeamMember(teamMemberRepository, workspace, testUser, "MEMBER", admin);

            Project companyGraph = ensureProject(
                projectRepository,
                workspace,
                demoUser,
                "Company Knowledge Graph",
                "Main knowledge base for company structure, teams, and institutional context.",
                "READY"
            );

            Project productArchitecture = ensureProject(
                projectRepository,
                workspace,
                sarah,
                "Product Architecture",
                "System design, components, and dependency graph for the product surface.",
                "SYNCING"
            );

            Project teamSkills = ensureProject(
                projectRepository,
                workspace,
                demoUser,
                "Team Skills Matrix",
                "Internal capability graph for teams, reviewers, and ownership coverage.",
                "READY"
            );

            ensurePermission(projectPermissionRepository, companyGraph, demoUser, "owner", demoUser);
            ensurePermission(projectPermissionRepository, companyGraph, james, "editor", demoUser);
            ensurePermission(projectPermissionRepository, companyGraph, emma, "viewer", demoUser);

            ensurePermission(projectPermissionRepository, productArchitecture, sarah, "owner", demoUser);
            ensurePermission(projectPermissionRepository, productArchitecture, demoUser, "editor", sarah);
            ensurePermission(projectPermissionRepository, productArchitecture, james, "editor", sarah);

            ensurePermission(projectPermissionRepository, teamSkills, demoUser, "owner", demoUser);
            ensurePermission(projectPermissionRepository, teamSkills, emma, "viewer", demoUser);
        };
    }

    private User ensureUser(UserRepository userRepository,
                            PasswordEncoder passwordEncoder,
                            String username,
                            String email,
                            String rawPassword,
                            String displayName,
                            UserRole role) {
        return userRepository.findByUsername(username)
            .orElseGet(() -> userRepository.save(
                User.builder()
                    .username(username)
                    .email(email)
                    .passwordHash(passwordEncoder.encode(rawPassword))
                    .role(role)
                    .displayName(displayName)
                    .isActive(true)
                    .build()
            ));
    }

    private Team ensureTeam(TeamRepository teamRepository,
                            String name,
                            String description,
                            User createdBy) {
        Optional<Team> existingTeam = teamRepository.findAll().stream()
            .filter(team -> name.equals(team.getName()))
            .findFirst();

        if (existingTeam.isPresent()) {
            return existingTeam.get();
        }

        Team team = new Team();
        team.setName(name);
        team.setDescription(description);
        team.setCreatedBy(createdBy);
        team.setIsActive(true);
        return teamRepository.save(team);
    }

    private void ensureTeamMember(TeamMemberRepository teamMemberRepository,
                                  Team team,
                                  User user,
                                  String role,
                                  User invitedBy) {
        if (teamMemberRepository.existsByTeamIdAndUserId(team.getId(), user.getId())) {
            return;
        }

        TeamMember teamMember = new TeamMember();
        teamMember.setTeam(team);
        teamMember.setUser(user);
        teamMember.setRole(role);
        teamMember.setInvitedBy(invitedBy);
        teamMemberRepository.save(teamMember);
    }

    private Project ensureProject(ProjectRepository projectRepository,
                                  Team team,
                                  User createdBy,
                                  String name,
                                  String description,
                                  String status) {
        Optional<Project> existingProject = projectRepository.findAll().stream()
            .filter(project -> name.equals(project.getName()))
            .findFirst();

        if (existingProject.isPresent()) {
            return existingProject.get();
        }

        Project project = new Project();
        project.setName(name);
        project.setDescription(description);
        project.setTeam(team);
        project.setCreatedBy(createdBy);
        project.setStatus(status);
        project.setArchived(false);
        return projectRepository.save(project);
    }

    private void ensurePermission(ProjectPermissionRepository projectPermissionRepository,
                                  Project project,
                                  User user,
                                  String role,
                                  User grantedBy) {
        if (projectPermissionRepository.findByProjectIdAndUserId(project.getId(), user.getId()).isPresent()) {
            return;
        }

        ProjectPermission permission = new ProjectPermission();
        permission.setProject(project);
        permission.setUser(user);
        permission.setRole(role);
        permission.setGrantedBy(grantedBy);
        projectPermissionRepository.save(permission);
    }
}
