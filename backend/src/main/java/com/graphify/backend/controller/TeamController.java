package com.graphify.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.graphify.backend.entity.Team;
import com.graphify.backend.entity.TeamMember;
import com.graphify.backend.entity.User;
import com.graphify.backend.repository.TeamMemberRepository;
import com.graphify.backend.repository.TeamRepository;
import com.graphify.backend.repository.UserRepository;
import com.graphify.backend.security.UserPrincipal;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/teams")
public class TeamController {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;

    public TeamController(TeamRepository teamRepository,
                          TeamMemberRepository teamMemberRepository,
                          UserRepository userRepository) {
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createTeam(
            @RequestBody Map<String, String> request,
            Authentication auth) {
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        User currentUser = userRepository.findById(principal.getId()).orElseThrow();

        Team team = new Team();
        team.setName(request.get("name"));
        team.setDescription(request.get("description"));
        team.setCreatedBy(currentUser);
        team.setIsActive(true);

        Team saved = teamRepository.save(team);
        return new ResponseEntity<>(toMap(saved), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listTeams() {
        List<Map<String, Object>> teams = teamRepository.findAll().stream()
            .filter(Team::isActive)
            .map(this::toMap)
            .collect(Collectors.toList());
        return ResponseEntity.ok(teams);
    }

    @GetMapping("/current")
    public ResponseEntity<Map<String, Object>> getCurrentTeam(Authentication auth) {
        Team currentTeam = resolveCurrentTeam(auth);

        if (currentTeam == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(toMap(currentTeam));
    }

    @GetMapping("/{teamId}")
    public ResponseEntity<Map<String, Object>> getTeam(@PathVariable Long teamId) {
        Team team = teamRepository.findById(teamId).orElse(null);
        if (team == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(toMap(team));
    }

    @PutMapping("/{teamId}")
    public ResponseEntity<Map<String, Object>> updateTeam(
            @PathVariable Long teamId,
            @RequestBody Map<String, String> request) {
        Team team = teamRepository.findById(teamId).orElse(null);
        if (team == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        if (request.containsKey("name")) team.setName(request.get("name"));
        if (request.containsKey("description")) team.setDescription(request.get("description"));
        Team updated = teamRepository.save(team);
        return ResponseEntity.ok(toMap(updated));
    }

    @DeleteMapping("/{teamId}")
    public ResponseEntity<Map<String, String>> deleteTeam(@PathVariable Long teamId) {
        Team team = teamRepository.findById(teamId).orElse(null);
        if (team == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        team.setIsActive(false);
        teamRepository.save(team);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Team deleted");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{teamId}/members")
    public ResponseEntity<Map<String, Object>> addMember(
            @PathVariable Long teamId,
            @RequestBody Map<String, Long> request) {
        Team team = teamRepository.findById(teamId).orElse(null);
        if (team == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        Long userId = request.get("userId");
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        // Check duplicate
        boolean exists = teamMemberRepository.findAll().stream()
            .anyMatch(m -> m.getTeam().getId().equals(teamId) && m.getUser().getId().equals(userId));
        if (exists) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        TeamMember member = new TeamMember();
        member.setTeam(team);
        member.setUser(user);
        member.setRole("MEMBER");
        member.setJoinedAt(LocalDateTime.now());
        TeamMember saved = teamMemberRepository.save(member);
        Map<String, Object> response = new HashMap<>();
        response.put("id", saved.getId());
        response.put("userId", userId);
        response.put("teamId", teamId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{teamId}/members")
    public ResponseEntity<List<Map<String, Object>>> getMembers(@PathVariable Long teamId) {
        List<Map<String, Object>> members = teamMemberRepository.findByTeamId(teamId).stream()
            .map(this::toMemberMap)
            .collect(Collectors.toList());
        return ResponseEntity.ok(members);
    }

    @GetMapping("/current/members")
    public ResponseEntity<List<Map<String, Object>>> getCurrentMembers(Authentication auth) {
        Team currentTeam = resolveCurrentTeam(auth);

        if (currentTeam == null) {
            return ResponseEntity.ok(List.of());
        }

        List<Map<String, Object>> members = teamMemberRepository.findByTeamId(currentTeam.getId()).stream()
            .map(this::toMemberMap)
            .collect(Collectors.toList());
        return ResponseEntity.ok(members);
    }

    @DeleteMapping("/{teamId}/members/{userId}")
    public ResponseEntity<Map<String, String>> removeMember(
            @PathVariable Long teamId,
            @PathVariable Long userId) {
        teamMemberRepository.findAll().stream()
            .filter(m -> m.getTeam().getId().equals(teamId) && m.getUser().getId().equals(userId))
            .findFirst()
            .ifPresent(teamMemberRepository::delete);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Member removed");
        return ResponseEntity.ok(response);
    }

    private Map<String, Object> toMap(Team team) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", team.getId());
        map.put("name", team.getName());
        map.put("description", team.getDescription());
        map.put("isActive", team.isActive());
        map.put("createdAt", team.getCreatedAt());
        map.put("memberCount", teamMemberRepository.findByTeamId(team.getId()).size());
        return map;
    }

    private Map<String, Object> toMemberMap(TeamMember member) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", member.getUser().getId());
        map.put("membershipId", member.getId());
        map.put("userId", member.getUser().getId());
        map.put("username", member.getUser().getUsername());
        map.put("displayName", member.getUser().getDisplayName());
        map.put("email", member.getUser().getEmail());
        map.put("role", member.getRole());
        map.put("joinedAt", member.getJoinedAt());
        map.put("status", member.getUser().isActive() ? "active" : "inactive");
        return map;
    }

    private Team resolveCurrentTeam(Authentication auth) {
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();

        return teamMemberRepository.findByUserId(principal.getId()).stream()
            .map(TeamMember::getTeam)
            .filter(Team::isActive)
            .findFirst()
            .orElseGet(() -> teamRepository.findAll().stream()
                .filter(Team::isActive)
                .findFirst()
                .orElse(null));
    }
}
