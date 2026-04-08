package com.graphify.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.graphify.backend.entity.Team;
import java.util.List;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {
    List<Team> findByCreatedById(Long userId);

    List<Team> findByIsActiveTrue();

    @Query("SELECT t FROM Team t JOIN t.members tm WHERE tm.user.id = :userId AND t.isActive = true")
    List<Team> findTeamsByMemberId(@Param("userId") Long userId);
}
