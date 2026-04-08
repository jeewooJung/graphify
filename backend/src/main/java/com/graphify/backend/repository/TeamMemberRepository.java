// backend/src/main/java/com/graphify/backend/repository/TeamMemberRepository.java
package com.graphify.backend.repository;

import com.graphify.backend.entity.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {
    /**
     * Find all members of a team.
     */
    List<TeamMember> findByTeamId(Long teamId);

    /**
     * Find a specific team member.
     */
    Optional<TeamMember> findByTeamIdAndUserId(Long teamId, Long userId);

    /**
     * Check if a user is a member of a team.
     */
    boolean existsByTeamIdAndUserId(Long teamId, Long userId);
}
