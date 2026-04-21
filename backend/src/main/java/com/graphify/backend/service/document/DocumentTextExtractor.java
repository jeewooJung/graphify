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
import java.io.ByteArrayInputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.Map;

@Service
public class DocumentTextExtractor {

    private static final Logger log = LoggerFactory.getLogger(DocumentTextExtractor.class);
    private static final int MAX_TEXT_LENGTH = 1_000_000;
    private static final String TRUNCATION_SUFFIX = "...[truncated]";
    private static final Pattern NUMERIC_VALUE_PATTERN = Pattern.compile("^[\\d,]+(?:\\.\\d+)?$");
    private static final Pattern RANGE_HEADER_PATTERN = Pattern.compile("^(.*) (\\d+)차$");

    public record ExtractionResult(String proseText, List<String> tableSentences) {}

    private final PdfTableExtractor pdfTableExtractor;

    public DocumentTextExtractor(PdfTableExtractor pdfTableExtractor) {
        this.pdfTableExtractor = pdfTableExtractor;
    }

    public String extractText(InputStream input, String originalFilename, String mimeType) throws IOException {
        return extractAll(input, originalFilename, mimeType).proseText();
    }

    public ExtractionResult extractAll(InputStream input, String originalFilename, String mimeType) throws IOException {
        byte[] bytes = input.readAllBytes();
        String proseText = extractProse(new ByteArrayInputStream(bytes), originalFilename, mimeType);
        if (!isPdf(originalFilename, mimeType)) {
            return new ExtractionResult(proseText, List.of());
        }

        List<String> tableSentences;
        try {
            List<PdfTableExtractor.TableRow> rows = pdfTableExtractor.extractRows(new ByteArrayInputStream(bytes));
            tableSentences = rows.stream()
                .map(this::toTableSentence)
                .filter(sentence -> !sentence.isBlank())
                .toList();
        } catch (Exception exception) {
            log.warn("Failed to extract structured PDF tables filename={} mimeType={}", originalFilename, mimeType, exception);
            tableSentences = List.of();
        }

        return new ExtractionResult(proseText, tableSentences);
    }

    private String extractProse(InputStream input, String originalFilename, String mimeType) throws IOException {
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

    private String toTableSentence(PdfTableExtractor.TableRow row) {
        Map<String, String> cells = row.cells();
        if (cells.isEmpty()) {
            return "";
        }

        if (cells.containsKey("총 공급 세대수")) {
            return toUnitSummarySentence(row, cells);
        }
        if (cells.containsKey("공급금액 계")) {
            return toPriceSentence(row, cells);
        }
        if (cells.keySet().stream().anyMatch(key -> key != null && key.endsWith("납부일"))) {
            return toScheduleSentence(row, cells);
        }
        return toGenericSentence(row, cells);
    }

    private String toUnitSummarySentence(PdfTableExtractor.TableRow row, Map<String, String> cells) {
        String type = firstNonBlank(findFirstValue(cells, "타입"), findFirstValue(cells, "주택형"));
        String block = firstNonBlank(findFirstValue(cells, "블록 코드"), findValueByPattern(cells, "\\d{2}-\\d-\\dR"));
        String area = findFirstValue(cells, "전용면적");

        StringBuilder sentence = new StringBuilder();
        sentence.append(buildBracketLabel(row.tableId(), type, block)).append(' ');

        List<String> introParts = new ArrayList<>();
        if (!type.isBlank()) {
            introParts.add("전용면적 " + ensureTypeLabel(type));
        }
        if (!area.isBlank()) {
            introParts.add(area + "㎡");
        }
        if (!introParts.isEmpty()) {
            sentence.append(String.join(", ", introParts)).append(". ");
        }

        appendSentence(sentence, "총 공급 세대수", findFirstValue(cells, "총 공급 세대수"), "세대");
        appendSentence(sentence, "특별공급 계", findFirstValue(cells, "특별공급 계"), "세대");
        appendSentence(sentence, "일반공급", findFirstValue(cells, "일반공급"), "세대");
        appendSentence(sentence, "기관추천", findFirstValue(cells, "기관추천"), "세대");
        appendSentence(sentence, "다자녀가구", findFirstValue(cells, "다자녀가구"), "세대");
        appendSentence(sentence, "신혼부부", findFirstValue(cells, "신혼부부"), "세대");
        appendSentence(sentence, "노부모부양", findFirstValue(cells, "노부모부양"), "세대");
        appendSentence(sentence, "생애최초", findFirstValue(cells, "생애최초"), "세대");
        return sentence.toString().trim();
    }

    private String toPriceSentence(PdfTableExtractor.TableRow row, Map<String, String> cells) {
        String type = firstNonBlank(findFirstValue(cells, "타입"), findFirstValue(cells, "주택형"));
        String block = firstNonBlank(findFirstValue(cells, "블록 코드"), findValueByPattern(cells, "\\d{2}-\\d-\\dR"));
        String location = firstNonBlank(findFirstValue(cells, "세대 위치"), findValueByPattern(cells, ".*\\d+동.*\\d+호.*"));
        String floor = firstNonBlank(findExactValue(cells, "층"), findValueByPattern(cells, ".*층.*"));

        StringBuilder sentence = new StringBuilder();
        sentence.append(buildBracketLabel(row.tableId(), type, block)).append(' ');

        List<String> introParts = new ArrayList<>();
        if (!location.isBlank()) {
            introParts.add(location);
        }
        if (!floor.isBlank()) {
            introParts.add(floor);
        }
        if (!type.isBlank()) {
            introParts.add("전용면적 " + ensureTypeLabel(type));
        }
        if (!introParts.isEmpty()) {
            sentence.append(String.join(", ", introParts)).append(". ");
        }

        appendSentence(sentence, "공급금액 계", findFirstValue(cells, "공급금액 계"), "원");
        appendSentence(sentence, "대지비", findFirstValue(cells, "대지비"), "원");
        appendSentence(sentence, "건축비", findFirstValue(cells, "건축비"), "원");
        appendSentence(sentence, "계약금 1차", findFirstValue(cells, "계약금 1차"), "원");
        appendSentence(sentence, "계약금 2차", findFirstValue(cells, "계약금 2차"), "원");

        String middlePayment = findFirstValue(cells, "중도금 1차");
        if (!middlePayment.isBlank()) {
            String endPayment = findFirstValue(cells, "중도금 6차");
            if (!endPayment.isBlank() && middlePayment.equals(endPayment)) {
                sentence.append("중도금 1차~6차 각 ").append(middlePayment).append("원. ");
            } else {
                appendSentence(sentence, "중도금 1차", middlePayment, "원");
            }
        }

        appendSentence(sentence, "잔금", findFirstValue(cells, "잔금"), "원");
        appendSentence(sentence, "세대수", findFirstValue(cells, "세대수"), "세대");
        return sentence.toString().trim();
    }

    private String toScheduleSentence(PdfTableExtractor.TableRow row, Map<String, String> cells) {
        String type = firstNonBlank(findFirstValue(cells, "타입"), findFirstValue(cells, "주택형"));
        String block = firstNonBlank(findFirstValue(cells, "블록 코드"), findValueByPattern(cells, "\\d{2}-\\d-\\dR"));

        StringBuilder sentence = new StringBuilder();
        sentence.append(buildBracketLabel(row.tableId(), type, block)).append(' ');
        appendSentence(sentence, "계약금 1차 납부일", findFirstValue(cells, "계약금 1차 납부일"), "");
        appendSentence(sentence, "계약금 2차 납부일", findFirstValue(cells, "계약금 2차 납부일"), "");

        List<Map.Entry<String, String>> remainingDates = cells.entrySet().stream()
            .filter(entry -> entry.getKey() != null && entry.getKey().startsWith("중도금 "))
            .sorted((left, right) -> left.getKey().compareTo(right.getKey()))
            .toList();
        for (Map.Entry<String, String> entry : remainingDates) {
            appendSentence(sentence, entry.getKey(), entry.getValue(), "");
        }
        return sentence.toString().trim();
    }

    private String toGenericSentence(PdfTableExtractor.TableRow row, Map<String, String> cells) {
        String type = firstNonBlank(
            findFirstValue(cells, "타입"),
            findFirstValue(cells, "주택형"),
            findValueByPattern(cells, "\\d{2}[A-Z]")
        );
        String block = firstNonBlank(
            findFirstValue(cells, "블록 코드"),
            findValueByPattern(cells, "\\d{2}-\\d-\\dR")
        );
        String location = firstNonBlank(
            findFirstValue(cells, "세대 위치"),
            findValueByPattern(cells, ".*\\d+동.*\\d+호.*")
        );
        String floor = firstNonBlank(
            findExactValue(cells, "층"),
            findValueByPattern(cells, ".*층.*")
        );

        String rowLabel = buildRowLabel(type, block);
        String locationSummary = buildLocation(location, floor, type);

        List<String> detailParts = buildDetailParts(cells, type, block, location, floor);
        if (detailParts.isEmpty()) {
            return "";
        }

        StringBuilder sentence = new StringBuilder();
        sentence.append('[').append(row.tableId());
        if (!rowLabel.isBlank()) {
            sentence.append(" · ").append(rowLabel);
        }
        sentence.append("] ");

        if (!locationSummary.isBlank()) {
            sentence.append(locationSummary);
            if (!locationSummary.endsWith(".")) {
                sentence.append('.');
            }
            sentence.append(' ');
        }

        for (int index = 0; index < detailParts.size(); index++) {
            if (index > 0) {
                sentence.append(' ');
            }
            sentence.append(detailParts.get(index));
        }
        return sentence.toString().trim();
    }

    private List<String> buildDetailParts(Map<String, String> cells,
                                          String type,
                                          String block,
                                          String location,
                                          String floor) {
        List<Map.Entry<String, String>> remainingEntries = new ArrayList<>();
        for (Map.Entry<String, String> entry : cells.entrySet()) {
            String key = entry.getKey();
            String value = entry.getValue();
            if (Objects.equals(value, type) || Objects.equals(value, block)
                || Objects.equals(value, location)
                || Objects.equals(value, floor)) {
                continue;
            }
            remainingEntries.add(entry);
        }

        remainingEntries.sort((left, right) -> Integer.compare(scoreHeader(left.getKey()), scoreHeader(right.getKey())));

        List<String> detailParts = new ArrayList<>();
        int index = 0;
        while (index < remainingEntries.size()) {
            Map.Entry<String, String> entry = remainingEntries.get(index);
            String currentHeader = entry.getKey();
            String currentValue = entry.getValue();
            Matcher matcher = RANGE_HEADER_PATTERN.matcher(currentHeader);

            if (matcher.matches()) {
                String prefix = matcher.group(1);
                int startNumber = Integer.parseInt(matcher.group(2));
                int endNumber = startNumber;
                int cursor = index + 1;
                while (cursor < remainingEntries.size()) {
                    Map.Entry<String, String> nextEntry = remainingEntries.get(cursor);
                    Matcher nextMatcher = RANGE_HEADER_PATTERN.matcher(nextEntry.getKey());
                    if (!nextMatcher.matches()) {
                        break;
                    }
                    String nextPrefix = nextMatcher.group(1);
                    int nextNumber = Integer.parseInt(nextMatcher.group(2));
                    if (!prefix.equals(nextPrefix) || !currentValue.equals(nextEntry.getValue()) || nextNumber != endNumber + 1) {
                        break;
                    }
                    endNumber = nextNumber;
                    cursor++;
                }

                if (endNumber > startNumber) {
                    detailParts.add(prefix + " " + startNumber + "차~" + endNumber + "차 각 " + formatValueWithUnit(prefix, currentValue));
                    index = cursor;
                    continue;
                }
            }

            detailParts.add(currentHeader + " " + formatValueWithUnit(currentHeader, currentValue));
            index++;
        }

        return detailParts.stream()
            .map(part -> part.endsWith(".") ? part : part + ".")
            .toList();
    }

    private int scoreHeader(String header) {
        if (header.contains("총 공급")) {
            return 0;
        }
        if (header.contains("특별공급")) {
            return 1;
        }
        if (header.contains("일반공급")) {
            return 2;
        }
        if (header.contains("신혼부부") || header.contains("기관추천") || header.contains("다자녀") || header.contains("노부모") || header.contains("생애최초")) {
            return 3;
        }
        if (header.contains("공급금액") && header.contains("계")) {
            return 4;
        }
        if (header.contains("대지비")) {
            return 5;
        }
        if (header.contains("건축비")) {
            return 6;
        }
        if (header.contains("계약금")) {
            return 7;
        }
        if (header.contains("중도금")) {
            return 8;
        }
        if (header.contains("잔금")) {
            return 9;
        }
        return 10;
    }

    private String formatValueWithUnit(String header, String value) {
        if (value == null || value.isBlank()) {
            return "";
        }
        if (!NUMERIC_VALUE_PATTERN.matcher(value).matches()) {
            return value;
        }
        if (header.contains("면적")) {
            return value + "㎡";
        }
        if (header.contains("세대수") || header.contains("세대") || header.contains("기관추천")
            || header.contains("다자녀") || header.contains("신혼부부") || header.contains("노부모")
            || header.contains("생애최초") || header.contains("일반공급") || header.contains("특별공급")) {
            return value + "세대";
        }
        if (header.contains("공급금액") || header.contains("대지비") || header.contains("건축비")
            || header.contains("계약금") || header.contains("중도금") || header.contains("잔금")) {
            return value + "원";
        }
        return value;
    }

    private String buildRowLabel(String type, String block) {
        List<String> parts = new ArrayList<>();
        if (type != null && !type.isBlank()) {
            parts.add(type.endsWith("형") ? type : type + "형");
        }
        if (block != null && !block.isBlank()) {
            parts.add(block);
        }
        return String.join(" ", parts);
    }

    private String buildLocation(String location, String floor, String type) {
        List<String> locationParts = new ArrayList<>();
        if (location != null && !location.isBlank()) {
            locationParts.add(location);
        }
        if (floor != null && !floor.isBlank()) {
            locationParts.add(floor);
        }
        if (type != null && !type.isBlank()) {
            locationParts.add("전용면적 " + (type.endsWith("형") ? type : type + "형"));
        }
        return String.join(", ", locationParts);
    }

    private String buildBracketLabel(String tableId, String type, String block) {
        StringBuilder label = new StringBuilder();
        label.append('[').append(tableId);
        String rowLabel = buildRowLabel(type, block);
        if (!rowLabel.isBlank()) {
            label.append(" · ").append(rowLabel);
        }
        label.append(']');
        return label.toString();
    }

    private String ensureTypeLabel(String type) {
        return type.endsWith("형") ? type : type + "형";
    }

    private void appendSentence(StringBuilder builder, String header, String value, String unit) {
        if (value == null || value.isBlank()) {
            return;
        }
        builder.append(header).append(' ').append(value);
        if (!unit.isBlank()) {
            builder.append(unit);
        }
        builder.append(". ");
    }

    private String findFirstValue(Map<String, String> cells, String... headerKeywords) {
        for (String keyword : headerKeywords) {
            for (Map.Entry<String, String> entry : cells.entrySet()) {
                if (entry.getKey() != null && entry.getKey().contains(keyword) && entry.getValue() != null && !entry.getValue().isBlank()) {
                    return entry.getValue().trim();
                }
            }
        }
        return "";
    }

    private String findExactValue(Map<String, String> cells, String header) {
        return cells.entrySet().stream()
            .filter(entry -> header.equals(entry.getKey()))
            .map(Map.Entry::getValue)
            .filter(Objects::nonNull)
            .map(String::trim)
            .filter(value -> !value.isBlank())
            .findFirst()
            .orElse("");
    }

    private String findValueByPattern(Map<String, String> cells, String regex) {
        Pattern pattern = Pattern.compile(regex);
        return cells.values().stream()
            .filter(Objects::nonNull)
            .map(String::trim)
            .filter(value -> !value.isBlank())
            .filter(value -> pattern.matcher(value).matches())
            .findFirst()
            .orElse("");
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value.trim();
            }
        }
        return "";
    }

    private boolean isPdf(String originalFilename, String mimeType) {
        if (mimeType != null && mimeType.equalsIgnoreCase("application/pdf")) {
            return true;
        }
        return originalFilename != null && originalFilename.toLowerCase().endsWith(".pdf");
    }
}
