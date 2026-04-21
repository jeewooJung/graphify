package com.graphify.backend.service.document;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PdfTableExtractorTest {

    @Test
    void extractRows_mapsStructuredPriceColumnsFromHillstatePdf() throws IOException {
        PdfTableExtractor extractor = new PdfTableExtractor();

        try (InputStream inputStream = Files.newInputStream(resolveFixturePdf())) {
            List<PdfTableExtractor.TableRow> rows = extractor.extractRows(inputStream);

            assertFalse(rows.isEmpty(), "expected structured rows from the fixture PDF");

            PdfTableExtractor.TableRow matchingRow = rows.stream()
                .filter(row -> "공급금액 표".equals(row.tableId()))
                .filter(row -> containsValueFragment(row.cells(), "105동"))
                .filter(row -> containsValueFragment(row.cells(), "3호"))
                .filter(row -> containsValueFragment(row.cells(), "21층"))
                .findFirst()
                .orElseThrow(() -> new AssertionError("expected row for 105동 3호 21층: " + rows.stream().limit(20).toList()));

            assertEquals("11-1-1R", findCellValue(matchingRow.cells(), "블록 코드").orElseThrow());
            assertEquals("105동 3호, 4호", findCellValue(matchingRow.cells(), "세대 위치").orElseThrow());
            assertEquals("21층", findCellValue(matchingRow.cells(), "층").orElseThrow());
            assertEquals("602,300,000", findCellValue(matchingRow.cells(), "공급금액 계").orElseThrow());
            assertEquals("237,908,500", findCellValue(matchingRow.cells(), "대지비").orElseThrow());
            assertEquals("364,391,500", findCellValue(matchingRow.cells(), "건축비").orElseThrow());
            assertEquals("10,000,000", findCellValue(matchingRow.cells(), "계약금 1차").orElseThrow());
            assertEquals("50,230,000", findCellValue(matchingRow.cells(), "계약금 2차").orElseThrow());
            assertEquals("60,230,000", findCellValue(matchingRow.cells(), "중도금 6차").orElseThrow());
            assertEquals("180,690,000", findCellValue(matchingRow.cells(), "잔금").orElseThrow());
        }
    }

    @Test
    void extractRows_normalizesUnitSummaryRowsAndDropsProseFalsePositives() throws IOException {
        PdfTableExtractor extractor = new PdfTableExtractor();

        try (InputStream inputStream = Files.newInputStream(resolveFixturePdf())) {
            List<PdfTableExtractor.TableRow> rows = extractor.extractRows(inputStream);

            PdfTableExtractor.TableRow summaryRow = rows.stream()
                .filter(row -> "주택 관리번호 표".equals(row.tableId()))
                .filter(row -> "59A".equals(findCellValue(row.cells(), "타입").orElse(null)))
                .findFirst()
                .orElseThrow(() -> new AssertionError("expected normalized summary row for 59A: " + rows.stream().limit(20).toList()));

            assertEquals("59A", findCellValue(summaryRow.cells(), "타입").orElseThrow());
            assertEquals("59.8300", findCellValue(summaryRow.cells(), "전용면적").orElseThrow());
            assertEquals("407", findCellValue(summaryRow.cells(), "총 공급 세대수").orElseThrow());
            assertEquals("93", findCellValue(summaryRow.cells(), "신혼부부").orElseThrow());
            assertEquals("176", findCellValue(summaryRow.cells(), "일반공급").orElseThrow());

            PdfTableExtractor.TableRow newlywedRow = rows.stream()
                .filter(row -> "주택 관리번호 표".equals(row.tableId()))
                .filter(row -> "51".equals(findCellValue(row.cells(), "타입").orElse(null)))
                .findFirst()
                .orElseThrow(() -> new AssertionError("expected normalized summary row for 51 type"));

            assertEquals("24", findCellValue(newlywedRow.cells(), "신혼부부").orElseThrow());
            assertTrue(rows.stream().noneMatch(row -> row.cells().values().stream().anyMatch(value -> value != null && value.contains("■ 본 입주자모집공고"))),
                "structured table rows should not contain flattened prose blocks");
        }
    }

    private static Optional<String> findCellValue(Map<String, String> cells, String columnName) {
        return cells.entrySet().stream()
            .filter(entry -> entry.getKey() != null && entry.getKey().contains(columnName))
            .map(Map.Entry::getValue)
            .findFirst();
    }

    private static boolean containsValueFragment(Map<String, String> cells, String expectedFragment) {
        return cells.values().stream().anyMatch(value -> value != null && value.contains(expectedFragment));
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
