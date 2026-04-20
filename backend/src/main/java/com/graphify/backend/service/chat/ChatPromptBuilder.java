package com.graphify.backend.service.chat;

import com.graphify.backend.config.properties.GraphifyChatProperties;
import com.graphify.backend.entity.ChatMessage;
import com.graphify.backend.entity.Document;
import com.graphify.backend.entity.DocumentChunk;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
public class ChatPromptBuilder {
    private static final String NEWLINE = "\n";

    private final GraphifyChatProperties chatProperties;

    public ChatPromptBuilder(GraphifyChatProperties chatProperties) {
        this.chatProperties = chatProperties;
    }

    public record BuiltPrompt(
        String systemPrompt,
        String userPrompt,
        List<Document> includedDocuments
    ) {}

    public BuiltPrompt build(String userQuestion,
                             List<Document> candidateDocuments,
                             List<ChatMessage> conversationHistory) {
        List<Document> sortedDocuments = candidateDocuments.stream()
            .sorted(Comparator.comparing(Document::getCreatedAt, Comparator.nullsLast(LocalDateTime::compareTo)).reversed())
            .limit(Math.max(0, chatProperties.getMaxDocumentsPerAnswer()))
            .toList();

        int usedChars = 0;
        int documentIndex = 1;
        StringBuilder documentBlock = new StringBuilder();
        List<Document> includedDocuments = new ArrayList<>();
        for (Document document : sortedDocuments) {
            String block = buildDocumentBlock(document, documentIndex);
            if (usedChars + block.length() > chatProperties.getMaxContextChars()) {
                break;
            }

            documentBlock.append(block);
            usedChars += block.length();
            includedDocuments.add(document);
            documentIndex++;
        }

        String systemPrompt = buildSystemPrompt(documentBlock.toString().trim()); /*
            당신은 회사 지식베이스 기반 질의응답 어시스턴트입니다.
            반드시 아래 제공된 문서의 내용만 사용해서 답변하세요.
            문서에 없는 내용은 추측하지 말고 "제공된 문서에서 찾을 수 없습니다"라고 답하세요.
            답변 끝에 반드시 "Sources: <사용한 문서 제목들을 쉼표로 구분>" 형식으로 인용을 명시하세요.
            사용하지 않은 문서는 인용하지 마세요.

            --- 제공된 문서 ---
            %s
            */

        return new BuiltPrompt(systemPrompt, buildUserPrompt(userQuestion, conversationHistory), List.copyOf(includedDocuments));
    }

    private String buildDocumentBlock(Document document, int documentIndex) {
        StringBuilder builder = new StringBuilder();
        builder.append("=== Document ")
            .append(documentIndex)
            .append(": ")
            .append(document.getTitle())
            .append(" (id=")
            .append(document.getId())
            .append(") ===")
            .append(NEWLINE);

        List<DocumentChunk> chunks = document.getChunks() == null
            ? List.of()
            : document.getChunks().stream()
                .sorted(Comparator.comparing(DocumentChunk::getChunkIndex, Comparator.nullsLast(Integer::compareTo)))
                .toList();

        for (DocumentChunk chunk : chunks) {
            builder.append(chunk.getContent()).append(NEWLINE);
        }

        builder.append("=== End Document ")
            .append(documentIndex)
            .append(" ===")
            .append(NEWLINE)
            .append(NEWLINE);
        return builder.toString();
    }

    private String buildSystemPrompt(String documentBlock) {
        return (
            "\uB2F9\uC2E0\uC740 \uD68C\uC0AC \uC9C0\uC2DD\uBCA0\uC774\uC2A4 \uAE30\uBC18 \uC9C8\uC758\uC751\uB2F5 \uC5B4\uC2DC\uC2A4\uD134\uD2B8\uC785\uB2C8\uB2E4.\n"
                + "\uBC18\uB4DC\uC2DC \uC544\uB798 \uC81C\uACF5\uB41C \uBB38\uC11C\uC758 \uB0B4\uC6A9\uB9CC \uC0AC\uC6A9\uD574\uC11C \uB2F5\uBCC0\uD558\uC138\uC694.\n"
                + "\uBB38\uC11C\uC5D0 \uC5C6\uB294 \uB0B4\uC6A9\uC740 \uCD94\uCE21\uD558\uC9C0 \uB9D0\uACE0 \"\uC81C\uACF5\uB41C \uBB38\uC11C\uC5D0\uC11C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4\"\uB77C\uACE0 \uB2F5\uD558\uC138\uC694.\n"
                + "\uB2F5\uBCC0 \uB05D\uC5D0 \uBC18\uB4DC\uC2DC \"Sources: <\uC0AC\uC6A9\uD55C \uBB38\uC11C \uC81C\uBAA9\uB4E4\uC744 \uC27C\uD45C\uB85C \uAD6C\uBD84>\" \uD615\uC2DD\uC73C\uB85C \uC778\uC6A9\uC744 \uBA85\uC2DC\uD558\uC138\uC694.\n"
                + "\uC0AC\uC6A9\uD558\uC9C0 \uC54A\uC740 \uBB38\uC11C\uB294 \uC778\uC6A9\uD558\uC9C0 \uB9C8\uC138\uC694.\n\n"
                + "--- \uC81C\uACF5\uB41C \uBB38\uC11C ---\n%s"
        ).formatted(documentBlock);
    }

    private String buildUserPrompt(String userQuestion, List<ChatMessage> conversationHistory) {
        List<ChatMessage> formattedHistory = conversationHistory.stream()
            .filter(message -> isSupportedRole(message.getRole()))
            .toList();

        if (!formattedHistory.isEmpty()) {
            ChatMessage lastMessage = formattedHistory.get(formattedHistory.size() - 1);
            if (isDuplicateCurrentQuestion(lastMessage, userQuestion)) {
                formattedHistory = formattedHistory.subList(0, formattedHistory.size() - 1);
            }
        }

        int fromIndex = Math.max(0, formattedHistory.size() - 5);
        List<String> lines = formattedHistory.subList(fromIndex, formattedHistory.size()).stream()
            .map(this::formatHistoryLine)
            .toList();

        if (lines.isEmpty()) {
            return "Current question:" + NEWLINE + userQuestion;
        }

        return "Conversation history:" + NEWLINE
            + String.join(NEWLINE, lines)
            + NEWLINE + NEWLINE
            + "Current question:" + NEWLINE
            + userQuestion;
    }

    private boolean isSupportedRole(String role) {
        if (role == null) {
            return false;
        }
        String normalized = role.trim().toUpperCase(Locale.ROOT);
        return "USER".equals(normalized) || "ASSISTANT".equals(normalized);
    }

    private boolean isDuplicateCurrentQuestion(ChatMessage message, String userQuestion) {
        return message.getContent() != null
            && userQuestion != null
            && "USER".equalsIgnoreCase(message.getRole())
            && message.getContent().trim().equals(userQuestion.trim());
    }

    private String formatHistoryLine(ChatMessage message) {
        String label = "USER".equalsIgnoreCase(message.getRole()) ? "User" : "Assistant";
        return label + ": " + message.getContent();
    }
}
