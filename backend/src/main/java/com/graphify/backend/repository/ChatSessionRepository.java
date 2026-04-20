package com.graphify.backend.repository;

import com.graphify.backend.entity.ChatSession;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {
    List<ChatSession> findByCreatedByIdOrderByUpdatedAtDesc(Long userId, Pageable pageable);

    List<ChatSession> findByScopeTypeAndScopeIdOrderByUpdatedAtDesc(String scopeType, Long scopeId, Pageable pageable);
}
