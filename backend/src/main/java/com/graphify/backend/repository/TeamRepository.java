// backend/src/main/java/com/graphify/backend/repository/TeamRepository.java
package com.graphify.backend.repository;

import com.graphify.backend.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {
    /**
     * Find all teams for a user by team member relationship.
     */
    @Query("SELECT t FROM Team t WHERE t.id IN " +
           "(SELECT tm.team.id FROM TeamMember tm WHERE tm.user.id = :userId) " +
           "AND t.isActive = true")
    List<Team> findTeamsByMemberId(@Param("userId") Long userId);

    /**
     * Find a team by ID (optional).
     */
    Optional<Team> findById(Long id);
}
