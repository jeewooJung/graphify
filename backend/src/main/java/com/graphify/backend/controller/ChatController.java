package com.graphify.backend.controller;

import com.graphify.backend.entity.AnswerCitation;
import com.graphify.backend.entity.ChatMessage;
import com.graphify.backend.entity.ChatSession;
import com.graphify.backend.entity.Document;
import com.graphify.backend.entity.DocumentChunk;
import com.graphify.backend.entity.Project;
import com.graphify.backend.entity.User;
import com.graphify.backend.repository.AnswerCitationRepository;
import com.graphify.backend.repository.ChatMessageRepository;
import com.graphify.backend.repository.ChatSessionRepository;
import com.graphify.backend.repository.UserRepository;
import com.graphify.backend.security.UserPrincipal;
import com.graphify.backend.service.chat.AnswerGeneratorService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/chat")
public class ChatController {

    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final AnswerCitationRepository answerCitationRepository;
    private final AnswerGeneratorService answerGeneratorService;

    public ChatController(ChatSessionRepository chatSessionRepository,
                          ChatMessageRepository chatMessageRepository,
                          UserRepository userRepository,
                          AnswerCitationRepository answerCitationRepository,
                          AnswerGeneratorService answerGeneratorService) {
        this.chatSessionRepository = chatSessionRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.userRepository = userRepository;
        this.answerCitationRepository = answerCitationRepository;
        this.answerGeneratorService = answerGeneratorService;
    }

    @PostMapping("/sessions")
    @Transactional
    public ResponseEntity<Map<String, Object>> createSession(@RequestBody Map<String, Object> request,
                                                             Authentication authentication) {
        User currentUser = currentUser(authentication);

        ChatSession session = new ChatSession();
        session.setScopeType(resolveScopeType(request));
        session.setScopeId(resolveScopeId(request));
        session.setCreatedBy(currentUser);
        session.setTitle(readNullableString(request.get("title")));

        ChatSession saved = chatSessionRepository.save(session);
        return new ResponseEntity<>(toSessionMap(saved), HttpStatus.CREATED);
    }

    @GetMapping("/sessions")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Map<String, Object>>> listSessions(@RequestParam(name = "scopeType", required = false) String scopeType,
                                                                  @RequestParam(name = "scopeId", required = false) Long scopeId,
                                                                  @RequestParam(name = "limit", defaultValue = "20") Integer limit,
                                                                  Authentication authentication) {
        User currentUser = currentUser(authentication);
        Pageable pageable = PageRequest.of(0, Math.max(1, limit));

        List<ChatSession> sessions;
        if (scopeType != null && !scopeType.isBlank()) {
            String normalizedScopeType = scopeType.trim().toUpperCase(Locale.ROOT);
            if (!"WORKSPACE".equals(normalizedScopeType) && scopeId == null) {
                return ResponseEntity.badRequest().build();
            }
            sessions = chatSessionRepository.findByScopeTypeAndScopeIdOrderByUpdatedAtDesc(normalizedScopeType, scopeId, pageable);
        } else {
            sessions = chatSessionRepository.findByCreatedByIdOrderByUpdatedAtDesc(currentUser.getId(), pageable);
        }

        return ResponseEntity.ok(
            sessions.stream()
                .map(this::toSessionMap)
                .collect(Collectors.toList())
        );
    }

    @GetMapping("/sessions/{sessionId}")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getSession(@PathVariable Long sessionId) {
        ChatSession session = chatSessionRepository.findById(sessionId).orElse(null);
        if (session == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(error("Chat session not found"));
        }

        return ResponseEntity.ok(toSessionMap(session));
    }

    @PostMapping("/sessions/{sessionId}/messages")
    @Transactional
    public ResponseEntity<Map<String, Object>> postMessage(@PathVariable Long sessionId,
                                                           @RequestBody Map<String, Object> request) {
        ChatSession session = chatSessionRepository.findById(sessionId).orElse(null);
        if (session == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(error("Chat session not found"));
        }

        String content = readNullableString(request.get("content"));
        if (content == null || content.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(error("Message content is required"));
        }

        ChatMessage userMessage = new ChatMessage();
        userMessage.setSession(session);
        userMessage.setRole("USER");
        userMessage.setContent(content.trim());
        userMessage = chatMessageRepository.save(userMessage);

        if (session.getTitle() == null || session.getTitle().isBlank()) {
            session.setTitle(deriveTitle(content));
        }
        session.setUpdatedAt(LocalDateTime.now());
        chatSessionRepository.save(session);

        List<ChatMessage> history = new ArrayList<>(chatMessageRepository.findBySessionIdOrderByCreatedAt(sessionId));
        AnswerGeneratorService.GeneratedAnswer generatedAnswer =
            answerGeneratorService.generateForSession(session, content.trim(), history);

        session.setUpdatedAt(LocalDateTime.now());
        chatSessionRepository.save(session);

        Map<String, Object> response = new HashMap<>();
        response.put("user", toMessageMap(userMessage, List.of()));
        response.put("answer", toAnswerJson(generatedAnswer.assistantMessage(), generatedAnswer.citations()));
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/sessions/{sessionId}/messages")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Map<String, Object>>> getMessages(@PathVariable Long sessionId,
                                                                 @RequestParam(name = "before", required = false) String before,
                                                                 @RequestParam(name = "limit", defaultValue = "50") Integer limit) {
        ChatSession session = chatSessionRepository.findById(sessionId).orElse(null);
        if (session == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.emptyList());
        }

        List<ChatMessage> messages = new ArrayList<>(chatMessageRepository.findBySessionIdOrderByCreatedAt(sessionId));
        if (before != null && !before.isBlank()) {
            messages = filterBefore(messages, before);
        }
        if (limit != null && limit > 0 && messages.size() > limit) {
            messages = messages.subList(messages.size() - limit, messages.size());
        }

        Map<Long, List<AnswerCitation>> citationsByMessageId = citationsByMessageId(messages);
        return ResponseEntity.ok(
            messages.stream()
                .map(message -> toMessageMap(message, citationsByMessageId.getOrDefault(message.getId(), List.of())))
                .collect(Collectors.toList())
        );
    }

    @PostMapping("/answer")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> answer(@RequestBody Map<String, Object> request,
                                                      Authentication authentication) {
        String content = readNullableString(request.get("content"));
        if (content == null || content.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(error("Message content is required"));
        }

        User currentUser = currentUser(authentication);
        String scopeType = resolveScopeType(request);
        Long scopeId = resolveScopeId(request);

        AnswerGeneratorService.GeneratedAnswer generatedAnswer =
            answerGeneratorService.generateSingleShot(currentUser, scopeType, scopeId, content.trim());

        return ResponseEntity.ok(toAnswerJson(generatedAnswer.assistantMessage(), generatedAnswer.citations()));
    }

    private User currentUser(Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return userRepository.findById(principal.getId()).orElseThrow();
    }

    private String resolveScopeType(Map<String, Object> request) {
        String nestedKind = readNullableString(asMap(request.get("scope")).get("kind"));
        String flatScopeType = readNullableString(request.get("scopeType"));
        String resolved = nestedKind != null ? nestedKind : flatScopeType;
        return resolved != null && !resolved.isBlank()
            ? resolved.trim().toUpperCase(Locale.ROOT)
            : "WORKSPACE";
    }

    private Long resolveScopeId(Map<String, Object> request) {
        Map<String, Object> scope = asMap(request.get("scope"));
        String kind = resolveScopeType(request);

        if ("TEAM".equals(kind)) {
            return readLong(scope.getOrDefault("teamId", request.get("scopeId")));
        }
        if ("PROJECT".equals(kind)) {
            return readLong(scope.getOrDefault("projectId", request.get("scopeId")));
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> asMap(Object value) {
        return value instanceof Map<?, ?> ? (Map<String, Object>) value : Collections.emptyMap();
    }

    private String readNullableString(Object value) {
        if (value == null) {
            return null;
        }
        String text = value.toString().trim();
        return text.isBlank() ? null : text;
    }

    private Long readLong(Object value) {
        if (value == null) {
            return null;
        }
        try {
            return Long.valueOf(value.toString());
        } catch (NumberFormatException ignored) {
            return null;
        }
    }

    private List<ChatMessage> filterBefore(List<ChatMessage> messages, String before) {
        Long beforeId = readLong(before);
        if (beforeId != null) {
            return messages.stream()
                .filter(message -> message.getId() != null && message.getId() < beforeId)
                .collect(Collectors.toList());
        }

        try {
            LocalDateTime beforeTime = LocalDateTime.parse(before);
            return messages.stream()
                .filter(message -> message.getCreatedAt() != null && message.getCreatedAt().isBefore(beforeTime))
                .collect(Collectors.toList());
        } catch (DateTimeParseException ignored) {
            return messages;
        }
    }

    private Map<Long, List<AnswerCitation>> citationsByMessageId(List<ChatMessage> messages) {
        List<Long> messageIds = messages.stream()
            .map(ChatMessage::getId)
            .filter(id -> id != null)
            .toList();
        if (messageIds.isEmpty()) {
            return Map.of();
        }

        Map<Long, List<AnswerCitation>> citations = new LinkedHashMap<>();
        for (AnswerCitation citation : answerCitationRepository.findByMessageIdIn(messageIds)) {
            Long messageId = citation.getMessage() != null ? citation.getMessage().getId() : null;
            if (messageId == null) {
                continue;
            }
            citations.computeIfAbsent(messageId, ignored -> new ArrayList<>()).add(citation);
        }
        return citations;
    }

    private String deriveTitle(String content) {
        String normalized = content.trim().replaceAll("\\s+", " ");
        if (normalized.length() <= 60) {
            return normalized;
        }
        return normalized.substring(0, 57) + "...";
    }

    private Map<String, Object> toSessionMap(ChatSession session) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", session.getId());
        map.put("title", session.getTitle() != null && !session.getTitle().isBlank() ? session.getTitle() : "Untitled chat");
        map.put("scopeType", session.getScopeType());
        map.put("scopeId", session.getScopeId());
        map.put("scope", toScopeMap(session));
        map.put("createdBy", userDisplayName(session.getCreatedBy()));
        map.put("createdAt", session.getCreatedAt());
        map.put("updatedAt", session.getUpdatedAt());
        map.put("lastMessageAt", session.getUpdatedAt());
        return map;
    }

    private Map<String, Object> toScopeMap(ChatSession session) {
        Map<String, Object> scope = new HashMap<>();
        scope.put("kind", session.getScopeType());
        if ("TEAM".equals(session.getScopeType()) && session.getScopeId() != null) {
            scope.put("teamId", session.getScopeId());
        }
        if ("PROJECT".equals(session.getScopeType()) && session.getScopeId() != null) {
            scope.put("projectId", session.getScopeId());
        }
        return scope;
    }

    private Map<String, Object> toMessageMap(ChatMessage message, List<AnswerCitation> citations) {
        String role = message.getRole() == null ? "system" : message.getRole().toLowerCase(Locale.ROOT);
        if ("assistant".equals(role)) {
            return toAnswerJson(message, citations);
        }

        Map<String, Object> map = new HashMap<>();
        map.put("id", message.getId() != null ? message.getId() : "message-" + UUID.randomUUID());
        map.put("sessionId", message.getSession() != null ? message.getSession().getId() : null);
        map.put("role", role);
        map.put("content", message.getContent());
        map.put("createdAt", message.getCreatedAt() != null ? message.getCreatedAt() : LocalDateTime.now());

        if ("system".equals(role)) {
            map.put("variant", message.getVariant() != null ? message.getVariant() : "info");
        }

        return map;
    }

    private Map<String, Object> toAnswerJson(ChatMessage message, List<AnswerCitation> citations) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", message.getId() != null ? message.getId() : "single-shot-" + UUID.randomUUID());
        map.put("sessionId", message.getSession() != null ? message.getSession().getId() : null);
        map.put("role", "assistant");
        map.put("content", message.getContent());
        map.put("modelName", message.getModelName());
        map.put("confidence", message.getConfidence());
        map.put("createdAt", message.getCreatedAt() != null ? message.getCreatedAt() : LocalDateTime.now());
        map.put("citations", citations.stream().map(this::toCitationMap).collect(Collectors.toList()));
        return map;
    }

    private Map<String, Object> toCitationMap(AnswerCitation citation) {
        Map<String, Object> map = new HashMap<>();
        Document document = citation.getDocument();
        DocumentChunk chunk = citation.getChunk();
        Project project = document != null ? document.getProject() : null;

        map.put("id", citation.getId() != null ? citation.getId() : "citation-" + UUID.randomUUID());
        map.put("documentId", document != null ? document.getId() : null);
        map.put("chunkId", chunk != null ? chunk.getId() : null);
        map.put("projectId", project != null ? project.getId() : null);
        map.put("projectName", project != null ? project.getName() : null);
        map.put("documentTitle", document != null ? document.getTitle() : null);
        map.put("quoteText", citation.getQuoteText());
        map.put("pageNumber", chunk != null ? chunk.getPageNumber() : null);
        map.put("relevanceScore", citation.getRelevanceScore() != null ? citation.getRelevanceScore() : 0.0);
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
