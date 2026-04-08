// backend/src/main/java/com/graphify/backend/controller/TeamController.java
package com.graphify.backend.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.graphify.backend.service.TeamService;
import com.graphify.backend.service.PermissionService;
import com.graphify.backend.security.UserPrincipal;
import com.graphify.backend.dto.request.CreateTeamRequest;
import com.graphify.backend.dto.request.UpdateTeamRequest;
import com.graphify.backend.dto.request.InviteTeamMemberRequest;
import com.graphify.backend.dto.response.TeamDetailDTO;
import com.graphify.backend.dto.response.TeamMemberDTO;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/teams")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class TeamController {

    private final TeamService teamService;
    private final PermissionService permissionService;

    public TeamController(TeamService teamService, PermissionService permissionService) {
        this.teamService = teamService;
        this.permissionService = permissionService;
    }

    @PostMapping
    public ResponseEntity<TeamDetailDTO> createTeam(@Valid @RequestBody CreateTeamRequest request,
                                                    Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        var team = teamService.createTeam(request.getName(), request.getDescription(), principal.getId());
        return new ResponseEntity<>(TeamDetailDTO.fromEntity(team), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<TeamDetailDTO>> getMyTeams(Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        List<TeamDetailDTO> teams = teamService.getTeamsByUserId(principal.getId()).stream()
            .map(TeamDetailDTO::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(teams);
    }

    @GetMapping("/{teamId}")
    @PreAuthorize("@permissionService.canManageTeam(#teamId, authentication.principal.id)")
    public ResponseEntity<TeamDetailDTO> getTeamById(@PathVariable Long teamId) {
        var team = teamService.getTeamById(teamId);
        return ResponseEntity.ok(TeamDetailDTO.fromEntity(team));
    }

    @PutMapping("/{teamId}")
    @PreAuthorize("@permissionService.canManageTeam(#teamId, authentication.principal.id)")
    public ResponseEntity<TeamDetailDTO> updateTeam(@PathVariable Long teamId,
                                                   @Valid @RequestBody UpdateTeamRequest request) {
        var team = teamService.updateTeam(teamId, request.getName(), request.getDescription());
        return ResponseEntity.ok(TeamDetailDTO.fromEntity(team));
    }

    @DeleteMapping("/{teamId}")
    @PreAuthorize("hasRole('ADMIN') or @permissionService.canManageTeam(#teamId, authentication.principal.id)")
    public ResponseEntity<?> deleteTeam(@PathVariable Long teamId) {
        teamService.deleteTeam(teamId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{teamId}/members")
    @PreAuthorize("@permissionService.canManageTeam(#teamId, authentication.principal.id)")
    public ResponseEntity<List<TeamMemberDTO>> getTeamMembers(@PathVariable Long teamId) {
        List<TeamMemberDTO> members = teamService.getTeamMembers(teamId).stream()
            .map(TeamMemberDTO::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(members);
    }

    @PostMapping("/{teamId}/members")
    @PreAuthorize("@permissionService.canManageTeam(#teamId, authentication.principal.id)")
    public ResponseEntity<?> inviteTeamMember(@PathVariable Long teamId,
                                             @Valid @RequestBody InviteTeamMemberRequest request,
                                             Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        teamService.inviteTeamMember(teamId, request.getUserId(), principal.getId());
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @DeleteMapping("/{teamId}/members/{userId}")
    @PreAuthorize("@permissionService.canManageTeam(#teamId, authentication.principal.id)")
    public ResponseEntity<?> removeTeamMember(@PathVariable Long teamId, @PathVariable Long userId) {
        teamService.removeTeamMember(teamId, userId);
        return ResponseEntity.ok().build();
    }
}
