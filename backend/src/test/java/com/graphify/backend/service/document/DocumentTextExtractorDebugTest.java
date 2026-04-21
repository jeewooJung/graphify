package com.graphify.backend.service.document;

import org.junit.jupiter.api.Test;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;

class DocumentTextExtractorDebugTest {

    @Test
    void printTableSentences() throws Exception {
        DocumentTextExtractor extractor = new DocumentTextExtractor(new PdfTableExtractor());
        Path pdfPath = Path.of("..", "tests", "doc", "20251107061002019933.pdf").normalize();
        try (InputStream input = Files.newInputStream(pdfPath)) {
            DocumentTextExtractor.ExtractionResult result =
                extractor.extractAll(input, pdfPath.getFileName().toString(), "application/pdf");
            System.out.println("TABLE_SENTENCE_COUNT=" + result.tableSentences().size());
            for (int i = 0; i < result.tableSentences().size(); i++) {
                System.out.println("SENTENCE " + i + " => " + result.tableSentences().get(i));
            }
        }
    }
}
