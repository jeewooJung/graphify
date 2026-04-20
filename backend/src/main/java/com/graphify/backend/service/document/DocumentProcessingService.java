package com.graphify.backend.service.document;

import com.graphify.backend.entity.Document;
import com.graphify.backend.entity.DocumentChunk;
import com.graphify.backend.entity.Project;
import com.graphify.backend.entity.User;
import com.graphify.backend.repository.DocumentChunkRepository;
import com.graphify.backend.repository.DocumentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class DocumentProcessingService {
    private static final Logger log = LoggerFactory.getLogger(DocumentProcessingService.class);

    private static final int CHUNK_TARGET_SIZE = 2_000;
    private static final int SHORT_CHUNK_THRESHOLD = 500;
    private static final int SUMMARY_LENGTH = 400;
    private static final Pattern BLANK_LINE_PATTERN = Pattern.compile("\\r?\\n\\s*\\r?\\n");
    private static final Pattern SENTENCE_BOUNDARY_PATTERN = Pattern.compile("(?<=[.!?])\\s+");

    private final DocumentStorageService storageService;
    private final DocumentTextExtractor textExtractor;
    private final DocumentRepository documentRepository;
    private final DocumentChunkRepository documentChunkRepository;

    public DocumentProcessingService(DocumentStorageService storageService,
                                     DocumentTextExtractor textExtractor,
                                     DocumentRepository documentRepository,
                                     DocumentChunkRepository documentChunkRepository) {
        this.storageService = storageService;
        this.textExtractor = textExtractor;
        this.documentRepository = documentRepository;
        this.documentChunkRepository = documentChunkRepository;
    }

    @Transactional
    public Document processUpload(Project project, User uploader, MultipartFile file, String titleHint) throws IOException {
        String originalFilename = resolveOriginalFilename(file);

        Document document = new Document();
        document.setProject(project);
        document.setUploadedBy(uploader);
        document.setTitle(resolveTitle(titleHint, originalFilename));
        document.setOriginalFilename(originalFilename);
        document.setMimeType(resolveMimeType(file));
        document.setFileSize(file.getSize());
        document.setSourceType("UPLOAD");
        document.setStatus("UPLOADED");
        document = documentRepository.save(document);

        log.info("Processing uploaded document id={} projectId={}", document.getId(), project.getId());

        String storagePath;
        try {
            storagePath = storageService.store(project.getId(), file);
            document.setStoragePath(storagePath);
            document.setUpdatedAt(LocalDateTime.now());
            document = documentRepository.save(document);
        } catch (IOException exception) {
            document.setStatus("FAILED");
            document.setUpdatedAt(LocalDateTime.now());
            documentRepository.save(document);
            throw exception;
        }

        document.setStatus("PARSING");
        document.setUpdatedAt(LocalDateTime.now());
        document = documentRepository.save(document);

        String extractedText;
        try (InputStream inputStream = storageService.read(storagePath)) {
            extractedText = textExtractor.extractText(inputStream, originalFilename, document.getMimeType());
        }

        String normalizedText = extractedText == null ? "" : extractedText.trim();
        if (normalizedText.isBlank()) {
            document.setStatus("FAILED");
            document.setUpdatedAt(LocalDateTime.now());
            log.info("Document processing failed id={} due to empty extracted text", document.getId());
            return documentRepository.save(document);
        }

        List<String> chunkContents = chunkText(normalizedText);
        List<DocumentChunk> chunks = new ArrayList<>(chunkContents.size());
        for (int index = 0; index < chunkContents.size(); index++) {
            String content = chunkContents.get(index);
            DocumentChunk chunk = new DocumentChunk();
            chunk.setDocument(document);
            chunk.setChunkIndex(index);
            chunk.setContent(content);
            chunk.setTokenCount(Math.max(1, content.length() / 4));
            chunk.setPageNumber(null);
            chunk.setSectionTitle(null);
            chunks.add(chunk);
        }
        documentChunkRepository.saveAll(chunks);

        document.setSummary(normalizedText.substring(0, Math.min(SUMMARY_LENGTH, normalizedText.length())));
        document.setStatus("INDEXING");
        document.setUpdatedAt(LocalDateTime.now());
        document = documentRepository.save(document);

        document.setStatus("READY");
        document.setUpdatedAt(LocalDateTime.now());
        document = documentRepository.save(document);
        log.info("Document processing completed id={} chunkCount={}", document.getId(), chunks.size());
        return document;
    }

    private String resolveTitle(String titleHint, String originalFilename) {
        if (titleHint != null && !titleHint.isBlank()) {
            return titleHint.trim();
        }
        return originalFilename;
    }

    private String resolveOriginalFilename(MultipartFile file) {
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            return "upload.bin";
        }
        return originalFilename.replace("\\", "_").replace("/", "_");
    }

    private String resolveMimeType(MultipartFile file) {
        return file.getContentType() == null || file.getContentType().isBlank()
            ? "application/octet-stream"
            : file.getContentType();
    }

    private List<String> chunkText(String text) {
        List<String> paragraphChunks = Arrays.stream(BLANK_LINE_PATTERN.split(text))
            .map(String::trim)
            .filter(chunk -> !chunk.isBlank())
            .flatMap(chunk -> splitLongChunk(chunk).stream())
            .toList();

        return mergeShortChunks(paragraphChunks);
    }

    private List<String> splitLongChunk(String chunk) {
        if (chunk.length() <= CHUNK_TARGET_SIZE) {
            return List.of(chunk);
        }

        List<String> chunks = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        String[] sentences = SENTENCE_BOUNDARY_PATTERN.split(chunk);

        for (String sentence : sentences) {
            String trimmedSentence = sentence.trim();
            if (trimmedSentence.isBlank()) {
                continue;
            }

            if (trimmedSentence.length() > CHUNK_TARGET_SIZE) {
                flushChunk(chunks, current);
                splitOversizedSentence(trimmedSentence, chunks);
                continue;
            }

            if (current.isEmpty()) {
                current.append(trimmedSentence);
                continue;
            }

            if (current.length() + 1 + trimmedSentence.length() <= CHUNK_TARGET_SIZE) {
                current.append(' ').append(trimmedSentence);
                continue;
            }

            chunks.add(current.toString());
            current.setLength(0);
            current.append(trimmedSentence);
        }

        flushChunk(chunks, current);
        return chunks;
    }

    private void splitOversizedSentence(String sentence, List<String> chunks) {
        int start = 0;
        while (start < sentence.length()) {
            int end = Math.min(start + CHUNK_TARGET_SIZE, sentence.length());
            if (end < sentence.length()) {
                int lastWhitespace = sentence.lastIndexOf(' ', end);
                if (lastWhitespace > start + (CHUNK_TARGET_SIZE / 2)) {
                    end = lastWhitespace;
                }
            }
            chunks.add(sentence.substring(start, end).trim());
            start = end;
            while (start < sentence.length() && Character.isWhitespace(sentence.charAt(start))) {
                start++;
            }
        }
    }

    private void flushChunk(List<String> chunks, StringBuilder current) {
        if (!current.isEmpty()) {
            chunks.add(current.toString());
            current.setLength(0);
        }
    }

    private List<String> mergeShortChunks(List<String> chunks) {
        List<String> merged = new ArrayList<>();
        StringBuilder pendingShortChunk = new StringBuilder();

        for (String chunk : chunks) {
            if (chunk.length() < SHORT_CHUNK_THRESHOLD) {
                appendChunk(pendingShortChunk, chunk);
                continue;
            }

            if (!pendingShortChunk.isEmpty()) {
                StringBuilder combinedChunk = new StringBuilder(pendingShortChunk);
                appendChunk(combinedChunk, chunk);
                merged.add(combinedChunk.toString());
                pendingShortChunk.setLength(0);
                continue;
            }

            merged.add(chunk);
        }

        if (!pendingShortChunk.isEmpty()) {
            if (merged.isEmpty()) {
                merged.add(pendingShortChunk.toString());
            } else {
                int lastIndex = merged.size() - 1;
                StringBuilder combinedChunk = new StringBuilder(merged.get(lastIndex));
                appendChunk(combinedChunk, pendingShortChunk.toString());
                merged.set(lastIndex, combinedChunk.toString());
            }
        }

        return merged;
    }

    private void appendChunk(StringBuilder builder, String chunk) {
        if (!builder.isEmpty()) {
            builder.append("\n\n");
        }
        builder.append(chunk);
    }
}
