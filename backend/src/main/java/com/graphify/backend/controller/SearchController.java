package com.graphify.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.graphify.backend.entity.Project;
import com.graphify.backend.entity.ProjectPermission;
import com.graphify.backend.entity.Team;
import com.graphify.backend.entity.TeamMember;
import com.graphify.backend.repository.ProjectPermissionRepository;
import com.graphify.backend.repository.ProjectRepository;
import com.graphify.backend.repository.TeamMemberRepository;
import com.graphify.backend.repository.TeamRepository;
import com.graphify.backend.security.UserPrincipal;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@RestController
@RequestMapping("/search")
public class SearchController {

    private final ProjectRepository projectRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final ProjectPermissionRepository projectPermissionRepository;

    public SearchController(ProjectRepository projectRepository,
                            TeamRepository teamRepository,
                            TeamMemberRepository teamMemberRepository,
                            ProjectPermissionRepository projectPermissionRepository) {
        this.projectRepository = projectRepository;
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.projectPermissionRepository = projectPermissionRepository;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> search(
            @RequestParam(name = "q", required = false) String query,
            @RequestParam(name = "type", required = false) String type,
            @RequestParam(name = "limit", defaultValue = "25") int limit,
            Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        boolean isAdmin = authentication.getAuthorities().stream()
            .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));

        List<Project> projects = isAdmin
            ? projectRepository.findByIsArchivedFalse()
            : projectRepository.findProjectsByUserPermissions(principal.getId());
        List<Team> teams = isAdmin
            ? teamRepository.findByIsActiveTrue()
            : teamRepository.findTeamsByMemberId(principal.getId());

        List<TeamMember> teamMembers = resolveTeamMembers(teams);
        List<ProjectPermission> permissions = isAdmin
            ? projectPermissionRepository.findAll()
            : projectPermissionRepository.findByUserId(principal.getId());

        String normalizedType = normalize(type);
        String normalizedQuery = normalize(query);

        List<Map<String, Object>> results = Stream.of(
                toProjectResults(projects).stream(),
                toTeamResults(teams).stream(),
                toMemberResults(teamMembers).stream(),
                toPermissionResults(permissions).stream()
            )
            .flatMap(stream -> stream)
            .filter(result -> matchesType(result, normalizedType))
            .filter(result -> matchesQuery(result, normalizedQuery))
            .sorted(Comparator.comparing(
                result -> (LocalDateTime) result.getOrDefault("sortDate", LocalDateTime.MIN),
                Comparator.reverseOrder()
            ))
            .limit(Math.max(limit, 1))
            .map(this::stripSortDate)
            .collect(Collectors.toList());

        return ResponseEntity.ok(results);
    }

    @GetMapping("/recent")
    public ResponseEntity<List<String>> recentSearches(Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        boolean isAdmin = authentication.getAuthorities().stream()
            .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));

        List<Project> projects = isAdmin
            ? projectRepository.findByIsArchivedFalse()
            : projectRepository.findProjectsByUserPermissions(principal.getId());
        List<Team> teams = isAdmin
            ? teamRepository.findByIsActiveTrue()
            : teamRepository.findTeamsByMemberId(principal.getId());

        List<String> recent = Stream.concat(
                projects.stream()
                    .sorted(Comparator.comparing(Project::getUpdatedAt, Comparator.reverseOrder()))
                    .map(Project::getName),
                teams.stream()
                    .sorted(Comparator.comparing(Team::getUpdatedAt, Comparator.reverseOrder()))
                    .map(Team::getName)
            )
            .filter(value -> value != null && !value.isBlank())
            .distinct()
            .limit(6)
            .collect(Collectors.toList());

        return ResponseEntity.ok(recent);
    }

    private List<TeamMember> resolveTeamMembers(List<Team> teams) {
        Set<Long> seenMembershipIds = new LinkedHashSet<>();
        List<TeamMember> members = new ArrayList<>();

        for (Team team : teams) {
            for (TeamMember member : teamMemberRepository.findByTeamId(team.getId())) {
                if (seenMembershipIds.add(member.getId())) {
                    members.add(member);
                }
            }
        }

        return members;
    }

    private List<Map<String, Object>> toProjectResults(List<Project> projects) {
        return projects.stream()
            .map(project -> {
                Map<String, Object> result = baseResult(
                    "project-" + project.getId(),
                    project.getName(),
                    project.getDescription(),
                    "graph",
                    project.getUpdatedAt()
                );
                result.put("connections", projectPermissionRepository.findByProjectId(project.getId()).size());
                result.put("graphId", String.valueOf(project.getId()));
                result.put("color", "#4f6ef7");
                return result;
            })
            .collect(Collectors.toList());
    }

    private List<Map<String, Object>> toTeamResults(List<Team> teams) {
        return teams.stream()
            .map(team -> {
                Map<String, Object> result = baseResult(
                    "team-" + team.getId(),
                    team.getName(),
                    team.getDescription(),
                    "concept",
                    team.getUpdatedAt()
                );
                result.put("connections", teamMemberRepository.findByTeamId(team.getId()).size());
                result.put("color", "#8b5cf6");
                return result;
            })
            .collect(Collectors.toList());
    }

    private List<Map<String, Object>> toMemberResults(List<TeamMember> members) {
        return members.stream()
            .map(member -> {
                String name = member.getUser().getDisplayName() != null && !member.getUser().getDisplayName().isBlank()
                    ? member.getUser().getDisplayName()
                    : member.getUser().getUsername();
                Map<String, Object> result = baseResult(
                    "user-" + member.getUser().getId(),
                    name,
                    member.getUser().getEmail() + " • " + member.getRole() + " in " + member.getTeam().getName(),
                    "entity",
                    member.getJoinedAt() != null ? member.getJoinedAt() : member.getUser().getUpdatedAt()
                );
                result.put("connections", 1);
                result.put("color", "#1f8f5f");
                return result;
            })
            .collect(Collectors.toList());
    }

    private List<Map<String, Object>> toPermissionResults(List<ProjectPermission> permissions) {
        return permissions.stream()
            .map(permission -> {
                String name = permission.getUser().getDisplayName() != null && !permission.getUser().getDisplayName().isBlank()
                    ? permission.getUser().getDisplayName()
                    : permission.getUser().getUsername();
                Map<String, Object> result = baseResult(
                    "permission-" + permission.getId(),
                    name + " -> " + permission.getProject().getName(),
                    permission.getRole() + " access to " + permission.getProject().getName(),
                    "relation",
                    permission.getGrantedAt()
                );
                result.put("color", "#f59e0b");
                return result;
            })
            .collect(Collectors.toList());
    }

    private Map<String, Object> baseResult(String id,
                                           String title,
                                           String description,
                                           String type,
                                           LocalDateTime sortDate) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", id);
        result.put("title", title);
        result.put("description", description != null ? description : "");
        result.put("type", type);
        result.put("lastUpdated", sortDate);
        result.put("sortDate", sortDate != null ? sortDate : LocalDateTime.MIN);
        return result;
    }

    private boolean matchesType(Map<String, Object> result, String normalizedType) {
        return normalizedType.isBlank() || normalizedType.equals(normalize((String) result.get("type")));
    }

    private boolean matchesQuery(Map<String, Object> result, String normalizedQuery) {
        if (normalizedQuery.isBlank()) {
            return true;
        }

        String title = normalize((String) result.get("title"));
        String description = normalize((String) result.get("description"));
        return title.contains(normalizedQuery) || description.contains(normalizedQuery);
    }

    private String normalize(String value) {
        return value == null ? "" : value.toLowerCase(Locale.ROOT).trim();
    }

    private Map<String, Object> stripSortDate(Map<String, Object> result) {
        result.remove("sortDate");
        return result;
    }
}
