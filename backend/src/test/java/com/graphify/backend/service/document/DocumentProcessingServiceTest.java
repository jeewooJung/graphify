package com.graphify.backend.service.document;

import com.graphify.backend.entity.Document;
import com.graphify.backend.entity.DocumentChunk;
import com.graphify.backend.entity.Project;
import com.graphify.backend.entity.User;
import com.graphify.backend.repository.DocumentChunkRepository;
import com.graphify.backend.repository.DocumentRepository;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.lang.reflect.Proxy;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
class DocumentProcessingServiceTest {

    @Test
    void processUpload_persistsProseChunksFirstThenGroupedTableChunks() throws Exception {
        DocumentStorageService storageService = new DocumentStorageService() {
            @Override
            public String store(Long projectId, org.springframework.web.multipart.MultipartFile file) {
                return "stored/path.pdf";
            }

            @Override
            public InputStream read(String storagePath) {
                return new ByteArrayInputStream(new byte[0]);
            }
        };
        DocumentTextExtractor textExtractor = new DocumentTextExtractor(new PdfTableExtractor()) {
            @Override
            public ExtractionResult extractAll(InputStream input, String originalFilename, String mimeType) {
                return new ExtractionResult(
                "Paragraph one.\n\nParagraph two.",
                List.of(
                    "[공급금액 표 · 39A형 11-1-1R] 105동 3호, 21층. 공급금액 계 602,300,000원.",
                    "[공급금액 표 · 39A형 11-1-2R] 204동 5호, 22층. 공급금액 계 602,300,000원.",
                    "[납부일정 표 · 39A형 11-1-1R] 계약금 1차 10,000,000원."
                )
                );
            }
        };

        AtomicReference<List<DocumentChunk>> savedChunksRef = new AtomicReference<>();
        DocumentRepository documentRepository = (DocumentRepository) Proxy.newProxyInstance(
            DocumentRepository.class.getClassLoader(),
            new Class<?>[]{DocumentRepository.class},
            (proxy, method, args) -> {
                if ("save".equals(method.getName())) {
                    Document document = (Document) args[0];
                    if (document.getId() == null) {
                        document.setId(700L);
                    }
                    return document;
                }
                throw new UnsupportedOperationException("Unexpected repository method: " + method.getName());
            }
        );
        DocumentChunkRepository documentChunkRepository = (DocumentChunkRepository) Proxy.newProxyInstance(
            DocumentChunkRepository.class.getClassLoader(),
            new Class<?>[]{DocumentChunkRepository.class},
            (proxy, method, args) -> {
                if ("saveAll".equals(method.getName())) {
                    @SuppressWarnings("unchecked")
                    Iterable<DocumentChunk> iterable = (Iterable<DocumentChunk>) args[0];
                    List<DocumentChunk> chunks = new java.util.ArrayList<>();
                    iterable.forEach(chunks::add);
                    savedChunksRef.set(chunks);
                    return chunks;
                }
                throw new UnsupportedOperationException("Unexpected chunk repository method: " + method.getName());
            }
        );
        DocumentProcessingService documentProcessingService = new DocumentProcessingService(
            storageService,
            textExtractor,
            documentRepository,
            documentChunkRepository
        );

        Project project = new Project();
        project.setId(11L);
        User uploader = new User();
        uploader.setId(5L);

        MockMultipartFile file = new MockMultipartFile(
            "file",
            "sample.pdf",
            "application/pdf",
            "pdf".getBytes()
        );

        documentProcessingService.processUpload(project, uploader, file, "Sample");

        List<DocumentChunk> savedChunks = savedChunksRef.get();
        assertEquals(3, savedChunks.size());

        DocumentChunk proseChunk = savedChunks.get(0);
        assertEquals(0, proseChunk.getChunkIndex());
        assertNull(proseChunk.getSectionTitle());
        assertEquals("Paragraph one.\n\nParagraph two.", proseChunk.getContent());

        DocumentChunk groupedPriceTableChunk = savedChunks.get(1);
        assertEquals(1, groupedPriceTableChunk.getChunkIndex());
        assertEquals("table:공급금액 표", groupedPriceTableChunk.getSectionTitle());
        assertEquals(
            "[공급금액 표 · 39A형 11-1-1R] 105동 3호, 21층. 공급금액 계 602,300,000원.\n\n" +
                "[공급금액 표 · 39A형 11-1-2R] 204동 5호, 22층. 공급금액 계 602,300,000원.",
            groupedPriceTableChunk.getContent()
        );

        DocumentChunk paymentTableChunk = savedChunks.get(2);
        assertEquals(2, paymentTableChunk.getChunkIndex());
        assertEquals("table:납부일정 표", paymentTableChunk.getSectionTitle());
        assertEquals("[납부일정 표 · 39A형 11-1-1R] 계약금 1차 10,000,000원.", paymentTableChunk.getContent());
    }
}
