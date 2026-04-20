package com.graphify.backend.repository;

import com.graphify.backend.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByProjectId(Long projectId);

    List<Document> findByProjectIdAndStatusIn(Long projectId, List<String> statuses);

    long countByProjectId(Long projectId);
}
