package com.graphify.backend.service.document;

import org.junit.jupiter.api.Test;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class DocumentTextExtractorTest {

    @Test
    void extractAll_emitsStructuredTableSentencesWithoutFlattenedProseNoise() throws Exception {
        DocumentTextExtractor extractor = new DocumentTextExtractor(new PdfTableExtractor());

        try (InputStream inputStream = Files.newInputStream(resolveFixturePdf())) {
            DocumentTextExtractor.ExtractionResult result =
                extractor.extractAll(inputStream, "20251107061002019933.pdf", "application/pdf");

            List<String> tableSentences = result.tableSentences();
            assertFalse(tableSentences.isEmpty(), "expected structured table sentences for the fixture PDF");
            assertTrue(tableSentences.stream().noneMatch(sentence -> sentence.contains("■ 본 입주자모집공고")),
                "table sentences should not contain flattened prose blocks");
            assertTrue(tableSentences.stream().anyMatch(sentence ->
                    sentence.contains("59A형") && sentence.contains("총 공급 세대수 407세대")),
                "expected 59A summary sentence with total household count");
            assertTrue(tableSentences.stream().anyMatch(sentence ->
                    sentence.contains("51형") && sentence.contains("신혼부부 24세대")),
                "expected 51-type sentence with 신혼부부 allocation");
            assertTrue(tableSentences.stream().anyMatch(sentence ->
                    sentence.contains("105동 3호") && sentence.contains("21층") && sentence.contains("공급금액 계 602,300,000원")),
                "expected pinpoint supply sentence for 105동 3호 21층");
        }
    }

    private static Path resolveFixturePdf() {
        Path fromBackendDir = Path.of("..", "tests", "doc", "20251107061002019933.pdf").normalize();
        if (Files.exists(fromBackendDir)) {
            return fromBackendDir;
        }

        Path fromRepoRoot = Path.of("tests", "doc", "20251107061002019933.pdf").normalize();
        if (Files.exists(fromRepoRoot)) {
            return fromRepoRoot;
        }

        throw new IllegalStateException("Fixture PDF not found under tests/doc");
    }
}
