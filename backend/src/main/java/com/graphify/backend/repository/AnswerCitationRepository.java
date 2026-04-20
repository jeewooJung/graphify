package com.graphify.backend.repository;

import com.graphify.backend.entity.AnswerCitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnswerCitationRepository extends JpaRepository<AnswerCitation, Long> {
    List<AnswerCitation> findByMessageId(Long messageId);

    List<AnswerCitation> findByMessageIdIn(List<Long> messageIds);
}
