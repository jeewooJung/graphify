package com.graphify.backend.service.document;

import org.apache.tika.metadata.HttpHeaders;
import org.apache.tika.metadata.Metadata;
import org.apache.tika.metadata.TikaCoreProperties;
import org.apache.tika.parser.AutoDetectParser;
import org.apache.tika.parser.ParseContext;
import org.apache.tika.sax.BodyContentHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;

@Service
public class DocumentTextExtractor {

    private static final Logger log = LoggerFactory.getLogger(DocumentTextExtractor.class);
    private static final int MAX_TEXT_LENGTH = 1_000_000;
    private static final String TRUNCATION_SUFFIX = "...[truncated]";

    public String extractText(InputStream input, String originalFilename, String mimeType) throws IOException {
        AutoDetectParser parser = new AutoDetectParser();
        BodyContentHandler handler = new BodyContentHandler(-1);
        Metadata metadata = new Metadata();
        if (originalFilename != null && !originalFilename.isBlank()) {
            metadata.set(TikaCoreProperties.RESOURCE_NAME_KEY, originalFilename);
        }
        if (mimeType != null && !mimeType.isBlank()) {
            metadata.set(HttpHeaders.CONTENT_TYPE, mimeType);
        }

        try {
            parser.parse(input, handler, metadata, new ParseContext());
        } catch (Exception exception) {
            log.warn("Failed to extract text from document filename={} mimeType={}", originalFilename, mimeType, exception);
            return "";
        }

        String extractedText = handler.toString().trim();
        if (extractedText.length() > MAX_TEXT_LENGTH) {
            int endIndex = Math.max(0, MAX_TEXT_LENGTH - TRUNCATION_SUFFIX.length());
            return extractedText.substring(0, endIndex) + TRUNCATION_SUFFIX;
        }
        return extractedText;
    }
}
