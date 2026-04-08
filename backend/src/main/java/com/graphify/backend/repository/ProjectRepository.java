package com.graphify.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.graphify.backend.entity.Project;
import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByTeamId(Long teamId);

    List<Project> findByCreatedById(Long userId);

    List<Project> findByIsArchivedFalse();

    @Query("SELECT p FROM Project p WHERE p.team.id = :teamId AND p.isArchived = false")
    List<Project> findActiveProjectsByTeamId(@Param("teamId") Long teamId);

    @Query("SELECT DISTINCT p FROM Project p JOIN p.permissions pp " +
           "WHERE pp.user.id = :userId AND p.isArchived = false")
    List<Project> findProjectsByUserPermissions(@Param("userId") Long userId);
}
