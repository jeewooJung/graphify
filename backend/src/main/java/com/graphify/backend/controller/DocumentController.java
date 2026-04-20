package com.graphify.backend.controller;

import com.graphify.backend.entity.Document;
import com.graphify.backend.entity.DocumentChunk;
import com.graphify.backend.entity.Project;
import com.graphify.backend.entity.User;
import com.graphify.backend.repository.DocumentChunkRepository;
import com.graphify.backend.repository.DocumentRepository;
import com.graphify.backend.repository.ProjectRepository;
import com.graphify.backend.repository.UserRepository;
import com.graphify.backend.security.UserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
public class DocumentController {

    private final DocumentRepository documentRepository;
    private final DocumentChunkRepository documentChunkRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public DocumentController(DocumentRepository documentRepository,
                              DocumentChunkRepository documentChunkRepository,
                              ProjectRepository projectRepository,
                              UserRepository userRepository) {
        this.documentRepository = documentRepository;
        this.documentChunkRepository = documentChunkRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/projects/{projectId}/documents")
    public ResponseEntity<Map<String, Object>> uploadDocument(@PathVariable Long projectId,
                                                              @RequestParam("file") MultipartFile file,
                                                              @RequestParam(name = "title", required = false) String title,
                                                              @RequestParam(name = "docType", required = false) String docType,
                                                              @RequestParam(name = "tags", required = false) String tags,
                                                              Authentication authentication) {
        Project project = projectRepository.findById(projectId).orElse(null);
        if (project == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(error("Project not found"));
        }

        User currentUser = currentUser(authentication);
        String originalFilename = resolveOriginalFilename(file);
        String resolvedTitle = title != null && !title.isBlank()
            ? title.trim()
            : stripExtension(originalFilename);

        Document document = new Document();
        document.setProject(project);
        document.setUploadedBy(currentUser);
        document.setTitle(resolvedTitle);
        document.setOriginalFilename(originalFilename);
        document.setMimeType(resolveMimeType(file));
        document.setFileSize(file.getSize());
        // TODO: Persist the uploaded file to durable storage in Phase 2.
        document.setStoragePath("uploads/" + UUID.randomUUID() + "-" + originalFilename);
        document.setSourceType("UPLOAD");
        document.setStatus("UPLOADED");
        document.setSummary("Stub summary for \"" + resolvedTitle + "\". Document analysis will be wired in Phase 2.");

        Document saved = documentRepository.save(document);
        documentChunkRepository.saveAll(buildStubChunks(saved, docType, tags));

        Map<String, Object> response = new HashMap<>();
        response.put("documentId", saved.getId());
        response.put("jobId", saved.getId() * 1000);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/projects/{projectId}/documents")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Map<String, Object>>> listDocuments(@PathVariable Long projectId,
                                                                   @RequestParam(name = "status", required = false) List<String> statusParams,
                                                                   @RequestParam(name = "statuses", required = false) List<String> statusesParams,
                                                                   @RequestParam(name = "q", required = false) String query,
                                                                   @RequestParam(name = "limit", required = false) Integer limit,
                                                                   @RequestParam(name = "offset", defaultValue = "0") Integer offset,
                                                                   @RequestParam(name = "sort", required = false) String sort) {
        if (!projectRepository.existsById(projectId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.emptyList());
        }

        List<String> statuses = normalizeStatuses(statusParams, statusesParams);
        List<Document> documents = statuses.isEmpty()
            ? documentRepository.findByProjectId(projectId)
            : documentRepository.findByProjectIdAndStatusIn(projectId, statuses);

        String normalizedQuery = query == null ? "" : query.trim().toLowerCase(Locale.ROOT);
        Comparator<Document> comparator = "title".equalsIgnoreCase(sort)
            ? Comparator.comparing(Document::getTitle, Comparator.nullsLast(String::compareToIgnoreCase))
            : Comparator.comparing(Document::getCreatedAt, Comparator.nullsLast(LocalDateTime::compareTo)).reversed();

        List<Map<String, Object>> response = documents.stream()
            .filter(document -> matchesQuery(document, normalizedQuery))
            .sorted(comparator)
            .skip(Math.max(offset, 0))
            .limit(limit == null || limit <= 0 ? Long.MAX_VALUE : limit)
            .map(this::toSummaryMap)
            .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/documents/{documentId}")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getDocument(@PathVariable Long documentId) {
        Document document = documentRepository.findById(documentId).orElse(null);
        if (document == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(error("Document not found"));
        }

        return ResponseEntity.ok(toDetailMap(document));
    }

    @GetMapping("/documents/{documentId}/chunks")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Map<String, Object>>> getDocumentChunks(@PathVariable Long documentId,
                                                                       @RequestParam(name = "limit", defaultValue = "10") Integer limit) {
        Document document = documentRepository.findById(documentId).orElse(null);
        if (document == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.emptyList());
        }

        List<Map<String, Object>> chunks = documentChunkRepository.findByDocumentIdOrderByChunkIndex(documentId).stream()
            .limit(limit == null || limit <= 0 ? Long.MAX_VALUE : limit)
            .map(this::toChunkMap)
            .collect(Collectors.toList());

        return ResponseEntity.ok(chunks);
    }

    @DeleteMapping("/documents/{documentId}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long documentId) {
        Document document = documentRepository.findById(documentId).orElse(null);
        if (document == null) {
            return ResponseEntity.notFound().build();
        }

        documentRepository.delete(document);
        return ResponseEntity.noContent().build();
    }

    private User currentUser(Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return userRepository.findById(principal.getId()).orElseThrow();
    }

    private List<String> normalizeStatuses(List<String> statusParams, List<String> statusesParams) {
        List<String> values = new ArrayList<>();
        if (statusParams != null) {
            values.addAll(statusParams);
        }
        if (statusesParams != null) {
            values.addAll(statusesParams);
        }

        return values.stream()
            .filter(Objects::nonNull)
            .map(value -> value.trim().toUpperCase(Locale.ROOT))
            .filter(value -> !value.isBlank())
            .distinct()
            .collect(Collectors.toList());
    }

    private boolean matchesQuery(Document document, String normalizedQuery) {
        if (normalizedQuery.isBlank()) {
            return true;
        }

        return containsIgnoreCase(document.getTitle(), normalizedQuery)
            || containsIgnoreCase(document.getOriginalFilename(), normalizedQuery)
            || containsIgnoreCase(document.getSummary(), normalizedQuery);
    }

    private boolean containsIgnoreCase(String value, String normalizedQuery) {
        return value != null && value.toLowerCase(Locale.ROOT).contains(normalizedQuery);
    }

    private String resolveOriginalFilename(MultipartFile file) {
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            return "upload.bin";
        }

        return originalFilename.replace("\\", "_").replace("/", "_");
    }

    private String resolveMimeType(MultipartFile file) {
        return file.getContentType() != null && !file.getContentType().isBlank()
            ? file.getContentType()
            : "application/octet-stream";
    }

    private String stripExtension(String filename) {
        int index = filename.lastIndexOf('.');
        return index > 0 ? filename.substring(0, index) : filename;
    }

    private List<DocumentChunk> buildStubChunks(Document document, String docType, String tags) {
        List<DocumentChunk> chunks = new ArrayList<>();
        String typeLabel = docType != null && !docType.isBlank() ? docType : "DOCUMENT";
        String tagLabel = tags != null && !tags.isBlank() ? tags : "[]";
        String[] contents = new String[] {
            "Stub chunk 1 for \"" + document.getTitle() + "\". This upload was accepted for project "
                + document.getProject().getName() + " and recorded as type " + typeLabel + ".",
            "Stub chunk 2 captures placeholder metadata for development. Original filename: "
                + document.getOriginalFilename() + ". Tags payload: " + tagLabel + ".",
            "Stub chunk 3 exists so the frontend can render realistic previews before parsing, indexing, and RAG retrieval are implemented."
        };

        for (int index = 0; index < contents.length; index++) {
            DocumentChunk chunk = new DocumentChunk();
            chunk.setDocument(document);
            chunk.setChunkIndex(index);
            chunk.setContent(contents[index]);
            chunk.setTokenCount(Math.max(8, contents[index].split("\\s+").length));
            chunk.setPageNumber(index + 1);
            chunk.setSectionTitle("Stub Section " + (index + 1));
            chunks.add(chunk);
        }

        return chunks;
    }

    private Map<String, Object> toSummaryMap(Document document) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", document.getId());
        map.put("title", document.getTitle());
        map.put("originalFilename", document.getOriginalFilename());
        map.put("mimeType", document.getMimeType());
        map.put("fileSize", document.getFileSize());
        map.put("status", document.getStatus());
        map.put("jobStatus", "COMPLETED");
        map.put("uploadedBy", userDisplayName(document.getUploadedBy()));
        map.put("uploadedAt", document.getCreatedAt());
        map.put("tags", Collections.emptyList());
        map.put("summary", document.getSummary());
        return map;
    }

    private Map<String, Object> toDetailMap(Document document) {
        Map<String, Object> map = toSummaryMap(document);
        map.put("updatedAt", document.getUpdatedAt());
        map.put("storagePath", document.getStoragePath());
        map.put("sourceType", document.getSourceType());
        map.put("chunkCount", documentChunkRepository.findByDocumentIdOrderByChunkIndex(document.getId()).size());
        map.put("lastAnalysisLog", null);
        return map;
    }

    private Map<String, Object> toChunkMap(DocumentChunk chunk) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", chunk.getId());
        map.put("documentId", chunk.getDocument().getId());
        map.put("chunkIndex", chunk.getChunkIndex());
        map.put("content", chunk.getContent());
        map.put("tokenCount", chunk.getTokenCount() != null ? chunk.getTokenCount() : 0);
        map.put("pageNumber", chunk.getPageNumber());
        map.put("sectionTitle", chunk.getSectionTitle());
        map.put("createdAt", chunk.getCreatedAt());
        return map;
    }

    private String userDisplayName(User user) {
        if (user == null) {
            return "Unknown";
        }

        return user.getDisplayName() != null && !user.getDisplayName().isBlank()
            ? user.getDisplayName()
            : user.getUsername();
    }

    private Map<String, Object> error(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", message);
        return response;
    }
}
