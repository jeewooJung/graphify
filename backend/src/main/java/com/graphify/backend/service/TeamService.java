// backend/src/main/java/com/graphify/backend/service/TeamService.java
package com.graphify.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.graphify.backend.entity.Team;
import com.graphify.backend.entity.TeamMember;
import com.graphify.backend.entity.User;
import com.graphify.backend.repository.TeamRepository;
import com.graphify.backend.repository.TeamMemberRepository;
import com.graphify.backend.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;

    public TeamService(TeamRepository teamRepository,
                      TeamMemberRepository teamMemberRepository,
                      UserRepository userRepository) {
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.userRepository = userRepository;
    }

    public Team createTeam(String name, String description, Long createdById) {
        User creator = userRepository.findById(createdById).orElseThrow();

        Team team = new Team();
        team.setName(name);
        team.setDescription(description);
        team.setCreatedBy(creator);
        team.setIsActive(true);

        team = teamRepository.save(team);

        // Add creator as TEAM_LEAD
        TeamMember member = new TeamMember();
        member.setTeam(team);
        member.setUser(creator);
        member.setRole("TEAM_LEAD");
        member.setInvitedBy(creator);
        member.setInvitedAt(LocalDateTime.now());

        teamMemberRepository.save(member);
        return team;
    }

    public Team getTeamById(Long teamId) {
        return teamRepository.findById(teamId)
            .orElseThrow(() -> new RuntimeException("Team not found with id: " + teamId));
    }

    public Team updateTeam(Long teamId, String name, String description) {
        Team team = getTeamById(teamId);
        if (name != null) {
            team.setName(name);
        }
        if (description != null) {
            team.setDescription(description);
        }
        return teamRepository.save(team);
    }

    public void deleteTeam(Long teamId) {
        Team team = getTeamById(teamId);
        team.setIsActive(false);
        teamRepository.save(team);
    }

    public List<Team> getTeamsByUserId(Long userId) {
        return teamRepository.findTeamsByMemberId(userId);
    }

    public void inviteTeamMember(Long teamId, Long userId, Long invitedBy) {
        Team team = getTeamById(teamId);
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        User invitedByUser = userRepository.findById(invitedBy).orElseThrow();

        // Check if member already exists
        if (teamMemberRepository.existsByTeamIdAndUserId(teamId, userId)) {
            throw new RuntimeException("User is already a member of this team");
        }

        TeamMember member = new TeamMember();
        member.setTeam(team);
        member.setUser(user);
        member.setRole("MEMBER");
        member.setInvitedBy(invitedByUser);
        member.setInvitedAt(LocalDateTime.now());

        teamMemberRepository.save(member);
    }

    public void removeTeamMember(Long teamId, Long userId) {
        TeamMember member = teamMemberRepository.findByTeamIdAndUserId(teamId, userId)
            .orElseThrow(() -> new RuntimeException("Team member not found"));
        teamMemberRepository.delete(member);
    }

    public List<TeamMember> getTeamMembers(Long teamId) {
        return teamMemberRepository.findByTeamId(teamId);
    }
}
