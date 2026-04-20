package com.graphify.backend.service.chat;

import com.graphify.backend.config.properties.GraphifyOllamaProperties;
import com.graphify.backend.entity.AnswerCitation;
import com.graphify.backend.entity.ChatMessage;
import com.graphify.backend.entity.ChatSession;
import com.graphify.backend.entity.Document;
import com.graphify.backend.repository.AnswerCitationRepository;
import com.graphify.backend.repository.ChatMessageRepository;
import com.graphify.backend.repository.DocumentRepository;
import com.graphify.backend.service.llm.OllamaClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class AnswerGeneratorService {
    private static final Logger log = LoggerFactory.getLogger(AnswerGeneratorService.class);
    private static final List<String> READY_STATUS = List.of("READY");
    private static final String NO_DOCUMENTS_SYSTEM_PROMPT =
        "\uC81C\uACF5\uB41C \uBB38\uC11C\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4. "
            + "\uC0AC\uC6A9\uC790\uAC00 \uC5C5\uB85C\uB4DC\uD55C \uBB38\uC11C \uC5C6\uC774 \uC77C\uBC18 \uC9C0\uC2DD\uC73C\uB85C \uB2F5\uBCC0\uD558\uB418, "
            + "\"\uC81C\uACF5\uB41C \uBB38\uC11C \uC5C6\uC774 \uC77C\uBC18 \uC9C0\uC2DD\uC73C\uB85C \uB2F5\uBCC0\uD569\uB2C8\uB2E4\"\uB77C\uACE0 \uBA85\uC2DC\uD558\uC138\uC694."; /*
        제공된 문서가 없습니다. 사용자가 업로드한 문서 없이 일반 지식으로 답변하되, "제공된 문서 없이 일반 지식으로 답변합니다"라고 명시하세요.
        */

    private final OllamaClient ollamaClient;
    private final ChatPromptBuilder chatPromptBuilder;
    private final CitationParser citationParser;
    private final DocumentRepository documentRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final AnswerCitationRepository answerCitationRepository;
    private final GraphifyOllamaProperties ollamaProperties;

    public AnswerGeneratorService(OllamaClient ollamaClient,
                                  ChatPromptBuilder chatPromptBuilder,
                                  CitationParser citationParser,
                                  DocumentRepository documentRepository,
                                  ChatMessageRepository chatMessageRepository,
                                  AnswerCitationRepository answerCitationRepository,
                                  GraphifyOllamaProperties ollamaProperties) {
        this.ollamaClient = ollamaClient;
        this.chatPromptBuilder = chatPromptBuilder;
        this.citationParser = citationParser;
        this.documentRepository = documentRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.answerCitationRepository = answerCitationRepository;
        this.ollamaProperties = ollamaProperties;
    }

    public record GeneratedAnswer(
        ChatMessage assistantMessage,
        List<AnswerCitation> citations,
        List<Document> includedDocuments
    ) {}

    @Transactional
    public GeneratedAnswer generate(ChatSession session, String userQuestion, List<ChatMessage> history) {
        return generateInternal(session, userQuestion, history, true);
    }

    @Transactional(readOnly = true)
    public GeneratedAnswer generateSingleShot(ChatSession session, String userQuestion, List<ChatMessage> history) {
        return generateInternal(session, userQuestion, history, false);
    }

    private GeneratedAnswer generateInternal(ChatSession session,
                                             String userQuestion,
                                             List<ChatMessage> history,
                                             boolean persist) {
        List<Document> candidateDocuments = resolveAccessibleDocuments(session);
        ChatPromptBuilder.BuiltPrompt builtPrompt = chatPromptBuilder.build(userQuestion, candidateDocuments, history);
        String systemPrompt = builtPrompt.includedDocuments().isEmpty()
            ? NO_DOCUMENTS_SYSTEM_PROMPT
            : builtPrompt.systemPrompt();

        log.info(
            "Generating answer sessionId={} scopeType={} scopeId={} includedDocuments={}",
            session.getId(),
            session.getScopeType(),
            session.getScopeId(),
            builtPrompt.includedDocuments().size()
        );

        try {
            OllamaClient.OllamaChatResponse response = ollamaClient.chat(
                new OllamaClient.OllamaChatRequest(systemPrompt, builtPrompt.userPrompt())
            );
            CitationParser.ParsedAnswer parsedAnswer = citationParser.parse(response.content(), builtPrompt.includedDocuments());

            ChatMessage assistantMessage = new ChatMessage();
            assistantMessage.setSession(session);
            assistantMessage.setRole("ASSISTANT");
            assistantMessage.setContent(parsedAnswer.content());
            assistantMessage.setModelName(ollamaProperties.getModel());
            assistantMessage.setConfidence(null);
            if (persist) {
                assistantMessage = chatMessageRepository.save(assistantMessage);
            }

            List<AnswerCitation> citations = buildCitations(assistantMessage, parsedAnswer.citedDocumentIds(), builtPrompt.includedDocuments());
            if (persist && !citations.isEmpty()) {
                citations = answerCitationRepository.saveAll(citations);
            }

            return new GeneratedAnswer(assistantMessage, citations, builtPrompt.includedDocuments());
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            log.warn("Interrupted while calling LLM for sessionId={}: {}", session.getId(), ex.getMessage());
            return new GeneratedAnswer(buildErrorMessage(session), List.of(), builtPrompt.includedDocuments());
        } catch (IOException | IllegalStateException ex) {
            log.warn("LLM request failed for sessionId={}: {}", session.getId(), ex.getMessage());
            return new GeneratedAnswer(buildErrorMessage(session), List.of(), builtPrompt.includedDocuments());
        }
    }

    private List<Document> resolveAccessibleDocuments(ChatSession session) {
        String scopeType = session.getScopeType() == null
            ? "WORKSPACE"
            : session.getScopeType().trim().toUpperCase(Locale.ROOT);

        return switch (scopeType) {
            case "PROJECT" -> session.getScopeId() == null
                ? List.of()
                : documentRepository.findByProjectIdAndStatusIn(session.getScopeId(), READY_STATUS);
            case "TEAM" -> {
                // TODO: Restrict TEAM scope to projects visible to the team.
                yield documentRepository.findByStatusIn(READY_STATUS);
            }
            default -> documentRepository.findByStatusIn(READY_STATUS);
        };
    }

    private List<AnswerCitation> buildCitations(ChatMessage message,
                                                List<Long> citedDocumentIds,
                                                List<Document> includedDocuments) {
        if (citedDocumentIds.isEmpty()) {
            return List.of();
        }

        Map<Long, Document> documentMap = new LinkedHashMap<>();
        for (Document document : includedDocuments) {
            documentMap.put(document.getId(), document);
        }

        List<AnswerCitation> citations = new ArrayList<>();
        for (Long documentId : citedDocumentIds) {
            Document document = documentMap.get(documentId);
            if (document == null) {
                continue;
            }

            AnswerCitation citation = new AnswerCitation();
            citation.setMessage(message);
            citation.setDocument(document);
            citation.setChunk(null);
            citation.setQuoteText(null);
            citation.setRelevanceScore(1.0);
            citations.add(citation);
        }
        return citations;
    }

    private ChatMessage buildErrorMessage(ChatSession session) {
        ChatMessage errorMessage = new ChatMessage();
        errorMessage.setSession(session);
        errorMessage.setRole("SYSTEM");
        errorMessage.setVariant("info");
        errorMessage.setContent("LLM \uC11C\uBC84 \uC624\uB958"); /*
        errorMessage.setContent("LLM 서버 오류");
        */
        return errorMessage;
    }
}
