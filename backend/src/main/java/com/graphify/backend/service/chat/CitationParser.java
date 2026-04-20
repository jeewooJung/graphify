package com.graphify.backend.service.chat;

import com.graphify.backend.entity.Document;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class CitationParser {
    private static final String SOURCES_PREFIX = "sources:";

    public record ParsedAnswer(String content, List<Long> citedDocumentIds) {}

    public ParsedAnswer parse(String rawAnswer, List<Document> includedDocuments) {
        if (rawAnswer == null || rawAnswer.isBlank()) {
            return new ParsedAnswer("", List.of());
        }

        String[] lines = rawAnswer.split("\\R");
        int sourcesLineIndex = -1;
        String sourcesLine = null;
        for (int index = 0; index < lines.length; index++) {
            String line = lines[index];
            if (line.toLowerCase(Locale.ROOT).contains(SOURCES_PREFIX)) {
                sourcesLineIndex = index;
                sourcesLine = line;
            }
        }

        if (sourcesLineIndex < 0 || sourcesLine == null) {
            return new ParsedAnswer(rawAnswer.trim(), List.of());
        }

        int prefixIndex = sourcesLine.toLowerCase(Locale.ROOT).lastIndexOf(SOURCES_PREFIX);
        String sourcesPart = prefixIndex >= 0
            ? sourcesLine.substring(prefixIndex + SOURCES_PREFIX.length()).trim()
            : "";

        Set<Long> documentIds = new LinkedHashSet<>();
        if (!sourcesPart.isBlank()) {
            String[] entries = sourcesPart.split(",");
            for (String entry : entries) {
                String normalizedEntry = entry.trim().toLowerCase(Locale.ROOT);
                if (normalizedEntry.isBlank()) {
                    continue;
                }
                for (Document document : includedDocuments) {
                    String title = document.getTitle() == null ? "" : document.getTitle().toLowerCase(Locale.ROOT);
                    if (!title.isBlank() && (normalizedEntry.contains(title) || title.contains(normalizedEntry))) {
                        documentIds.add(document.getId());
                    }
                }
            }
        }

        List<String> contentLines = new ArrayList<>();
        for (int index = 0; index < lines.length; index++) {
            if (index != sourcesLineIndex) {
                contentLines.add(lines[index]);
            }
        }

        return new ParsedAnswer(String.join("\n", contentLines).trim(), List.copyOf(documentIds));
    }
}
