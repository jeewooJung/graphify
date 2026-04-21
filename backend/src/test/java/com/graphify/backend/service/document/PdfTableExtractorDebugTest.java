package com.graphify.backend.service.document;

import org.junit.jupiter.api.Test;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

class PdfTableExtractorDebugTest {

    @Test
    void printRows() throws Exception {
        PdfTableExtractor extractor = new PdfTableExtractor();
        Path pdfPath = Path.of("..", "tests", "doc", "20251107061002019933.pdf").normalize();
        try (InputStream input = Files.newInputStream(pdfPath)) {
            List<PdfTableExtractor.TableRow> rows = extractor.extractRows(input);
            for (int i = 0; i < rows.size(); i++) {
                System.out.println("ROW " + i + " " + rows.get(i).tableId() + " => " + rows.get(i).cells());
            }
        }
    }
}
