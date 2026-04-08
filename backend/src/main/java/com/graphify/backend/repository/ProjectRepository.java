// backend/src/main/java/com/graphify/backend/repository/ProjectRepository.java
package com.graphify.backend.repository;

import com.graphify.backend.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    /**
     * Find all non-archived projects in a team.
     */
    List<Project> findByTeamIdAndIsArchivedFalse(Long teamId);

    /**
     * Find all projects a user can access via team membership.
     */
    @Query("SELECT p FROM Project p WHERE p.team.id IN " +
           "(SELECT tm.team.id FROM TeamMember tm WHERE tm.user.id = :userId) " +
           "AND p.isArchived = false")
    List<Project> findProjectsByUserId(@Param("userId") Long userId);

    /**
     * Find a project by ID (optional).
     */
    Optional<Project> findById(Long id);
}
