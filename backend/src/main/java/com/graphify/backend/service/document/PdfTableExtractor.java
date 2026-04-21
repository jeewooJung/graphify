package com.graphify.backend.service.document;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import technology.tabula.ObjectExtractor;
import technology.tabula.Page;
import technology.tabula.PageIterator;
import technology.tabula.RectangularTextContainer;
import technology.tabula.Table;
import technology.tabula.extractors.BasicExtractionAlgorithm;
import technology.tabula.extractors.SpreadsheetExtractionAlgorithm;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;

@Service
public class PdfTableExtractor {

    public record TableRow(String tableId, Map<String, String> cells) {}

    private static final Logger log = LoggerFactory.getLogger(PdfTableExtractor.class);
    private static final Pattern NUMERIC_LIKE_PATTERN = Pattern.compile("^[\\d\\s,./()%~-]+$");
    private static final Pattern COUNT_VALUE_PATTERN = Pattern.compile("^(?:-|\\d+)$");
    private static final Pattern MONEY_HEADER_PATTERN = Pattern.compile(".*(금액|대지비|건축비|계약금|중도금|잔금|공급).*");
    private static final Pattern MONEY_VALUE_PATTERN = Pattern.compile("^[\\d,]+$");
    private static final Pattern DATE_VALUE_PATTERN = Pattern.compile("^(계약시|\\d{4}[.-]\\d{2}[.-]\\d{2})$");
    private static final Pattern BLOCK_CODE_PATTERN = Pattern.compile("\\d{2}-\\d-\\dR");
    private static final Pattern TYPE_TOKEN_PATTERN = Pattern.compile("(?<![A-Za-z0-9-])(\\d{2}[A-Z])(?![A-Za-z0-9-])");
    private static final Pattern EXACT_TYPE_PATTERN = Pattern.compile("^(\\d{2}[A-Z]?)(?:형)?$");
    private static final Pattern AREA_VALUE_PATTERN = Pattern.compile("^\\d{2,3}\\.\\d{4}$");
    private static final Pattern PROSE_MARKER_PATTERN = Pattern.compile("[■※]");
    private static final int MAX_GENERIC_ROW_TEXT_LENGTH = 240;
    private static final int MAX_SPECIALIZED_ROW_TEXT_LENGTH = 320;

    public List<TableRow> extractRows(InputStream pdf) throws IOException {
        List<TableRow> extractedRows = new ArrayList<>();

        try (PDDocument document = PDDocument.load(pdf);
             ObjectExtractor objectExtractor = new ObjectExtractor(document)) {
            SpreadsheetExtractionAlgorithm lattice = new SpreadsheetExtractionAlgorithm();
            BasicExtractionAlgorithm stream = new BasicExtractionAlgorithm();
            PageIterator pages = objectExtractor.extract();
            int tableSequence = 1;

            while (pages.hasNext()) {
                Page page = pages.next();
                List<Table> tables = extractTables(page, lattice, stream);
                for (Table table : tables) {
                    extractedRows.addAll(extractRows(table, tableSequence++));
                }
            }
        } catch (IOException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new IOException("Failed to extract tables from PDF", exception);
        }

        return extractedRows;
    }

    private List<Table> extractTables(Page page,
                                      SpreadsheetExtractionAlgorithm lattice,
                                      BasicExtractionAlgorithm stream) {
        List<Table> latticeTables = lattice.extract(page);
        if (!latticeTables.isEmpty()) {
            return latticeTables;
        }
        return stream.extract(page);
    }

    private List<TableRow> extractRows(Table table, int tableSequence) {
        List<List<String>> matrix = toMatrix(table);
        if (matrix.isEmpty()) {
            return List.of();
        }

        int headerStartIndex = detectHeaderStartIndex(matrix);
        List<List<String>> titleRows = headerStartIndex > 0 ? matrix.subList(0, headerStartIndex) : List.of();
        int headerRowCount = detectHeaderRowCount(matrix, headerStartIndex);
        List<List<String>> headerRows = matrix.subList(
            headerStartIndex,
            Math.min(matrix.size(), headerStartIndex + headerRowCount)
        );
        List<String> headers = buildHeaders(headerRows);
        if (headers.stream().allMatch(String::isBlank)) {
            return List.of();
        }

        String tableId = deriveTableId(titleRows, headerRows, headers, tableSequence);
        String typeHint = detectTypeHint(matrix);
        TableContext context = new TableContext(typeHint);
        List<TableRow> rows = new ArrayList<>();
        for (int rowIndex = headerStartIndex + headerRowCount; rowIndex < matrix.size(); rowIndex++) {
            Map<String, String> rawCells = mapRow(headers, matrix.get(rowIndex));
            NormalizedRow normalizedRow = normalizeRow(tableId, typeHint, rawCells);
            Map<String, String> cells = applyContext(normalizedRow.tableId(), normalizedRow.cells(), context);
            if (shouldSkipRow(normalizedRow.tableId(), cells)) {
                continue;
            }
            updateContext(context, normalizedRow.tableId(), cells);
            rows.add(new TableRow(normalizedRow.tableId(), cells));
        }

        return rows;
    }

    private List<List<String>> toMatrix(Table table) {
        List<List<RectangularTextContainer>> rows = table.getRows();
        if (rows == null || rows.isEmpty()) {
            return List.of();
        }

        int columnCount = rows.stream().mapToInt(List::size).max().orElse(0);
        if (columnCount == 0) {
            return List.of();
        }

        List<List<String>> matrix = new ArrayList<>(rows.size());
        for (List<RectangularTextContainer> row : rows) {
            List<String> normalizedRow = new ArrayList<>(columnCount);
            for (int columnIndex = 0; columnIndex < columnCount; columnIndex++) {
                String cellText = columnIndex < row.size() ? normalizeCell(row.get(columnIndex)) : "";
                normalizedRow.add(cellText);
            }
            matrix.add(normalizedRow);
        }
        return matrix;
    }

    private int detectHeaderStartIndex(List<List<String>> matrix) {
        if (matrix.size() <= 1) {
            return 0;
        }

        List<String> firstRow = matrix.get(0);
        if (nonEmptyCount(firstRow) == 1 && isHeaderLike(matrix.get(1))) {
            return 1;
        }
        return 0;
    }

    private int detectHeaderRowCount(List<List<String>> matrix, int headerStartIndex) {
        int headerRows = 1;
        int nextIndex = headerStartIndex + 1;
        if (nextIndex < matrix.size() && isHeaderLike(matrix.get(nextIndex))) {
            headerRows++;
        }
        return headerRows;
    }

    private boolean isHeaderLike(List<String> row) {
        List<String> nonEmptyCells = row.stream()
            .map(String::trim)
            .filter(value -> !value.isBlank())
            .toList();
        if (nonEmptyCells.isEmpty()) {
            return false;
        }

        long nonNumericCells = nonEmptyCells.stream()
            .filter(value -> !isNumericLike(value))
            .count();
        if (nonNumericCells * 2 >= nonEmptyCells.size()) {
            return true;
        }

        return nonEmptyCells.stream().anyMatch(cell -> MONEY_HEADER_PATTERN.matcher(cell).matches());
    }

    private List<String> buildHeaders(List<List<String>> headerRows) {
        if (headerRows.isEmpty()) {
            return List.of();
        }

        if (headerRows.size() == 1) {
            return deduplicateHeaders(headerRows.get(0));
        }

        List<String> parentRow = forwardFill(headerRows.get(0));
        List<String> childRow = headerRows.get(1);
        List<String> headers = new ArrayList<>(Math.max(parentRow.size(), childRow.size()));
        int columnCount = Math.max(parentRow.size(), childRow.size());

        for (int columnIndex = 0; columnIndex < columnCount; columnIndex++) {
            String parent = columnIndex < parentRow.size() ? parentRow.get(columnIndex) : "";
            String child = columnIndex < childRow.size() ? childRow.get(columnIndex) : "";
            headers.add(resolveHeader(parent, child));
        }

        return deduplicateHeaders(headers);
    }

    private List<String> forwardFill(List<String> row) {
        List<String> filled = new ArrayList<>(row.size());
        String lastSeen = "";
        for (String cell : row) {
            String trimmed = cell == null ? "" : cell.trim();
            if (!trimmed.isBlank()) {
                lastSeen = trimmed;
                filled.add(trimmed);
            } else {
                filled.add(lastSeen);
            }
        }
        return filled;
    }

    private String resolveHeader(String parent, String child) {
        String normalizedParent = parent == null ? "" : parent.trim();
        String normalizedChild = child == null ? "" : child.trim();

        if (normalizedParent.isBlank()) {
            return normalizedChild;
        }
        if (normalizedChild.isBlank()) {
            return normalizedParent;
        }
        if (normalizedParent.equals(normalizedChild)) {
            return normalizedChild;
        }
        if (normalizedChild.contains(normalizedParent)) {
            return normalizedChild;
        }
        return normalizedParent + " " + normalizedChild;
    }

    private List<String> deduplicateHeaders(List<String> headers) {
        Map<String, Integer> seen = new LinkedHashMap<>();
        List<String> deduplicated = new ArrayList<>(headers.size());

        for (String header : headers) {
            String normalizedHeader = header == null ? "" : header.trim();
            if (normalizedHeader.isBlank()) {
                deduplicated.add("");
                continue;
            }

            int seenCount = seen.getOrDefault(normalizedHeader, 0) + 1;
            seen.put(normalizedHeader, seenCount);
            deduplicated.add(seenCount == 1 ? normalizedHeader : normalizedHeader + " " + seenCount);
        }

        return deduplicated;
    }

    private String deriveTableId(List<List<String>> titleRows,
                                 List<List<String>> headerRows,
                                 List<String> headers,
                                 int tableSequence) {
        String semanticCandidate = firstSemanticLabel(titleRows, headerRows, headers);
        if (!semanticCandidate.isBlank()) {
            return semanticCandidate;
        }

        for (List<String> row : headerRows) {
            for (String cell : row) {
                String candidate = normalizeTableIdCandidate(cell);
                if (!candidate.isBlank()) {
                    return candidate;
                }
            }
        }

        for (String header : headers) {
            String candidate = normalizeTableIdCandidate(header);
            if (!candidate.isBlank()) {
                return candidate;
            }
        }

        return "표 " + tableSequence;
    }

    private String firstSemanticLabel(List<List<String>> titleRows, List<List<String>> headerRows, List<String> headers) {
        List<String> candidates = new ArrayList<>();
        titleRows.forEach(candidates::addAll);
        headerRows.forEach(candidates::addAll);
        candidates.addAll(headers);

        for (String candidate : candidates) {
            if (candidate == null || candidate.isBlank() || candidate.length() > 30) {
                continue;
            }
            String normalized = normalizeTableIdCandidate(candidate);
            if ("공급금액 표".equals(normalized) || "납부일정 표".equals(normalized) || "주택 관리번호 표".equals(normalized)) {
                return normalized;
            }
        }
        return "";
    }

    private String normalizeTableIdCandidate(String cell) {
        if (cell == null) {
            return "";
        }

        String trimmed = cell.trim();
        if (trimmed.isBlank() || isNumericLike(trimmed)) {
            return "";
        }

        String lowered = trimmed.toLowerCase(Locale.ROOT);
        if (lowered.contains("공급금액")) {
            return "공급금액 표";
        }
        if (lowered.contains("납부") || lowered.contains("계약금") || lowered.contains("중도금") || lowered.contains("잔금")) {
            return "납부일정 표";
        }
        if (lowered.contains("주택 관리번호") || lowered.contains("주택형")) {
            return "주택 관리번호 표";
        }
        if (trimmed.contains("표")) {
            return trimmed;
        }
        return trimmed + " 표";
    }

    private String detectTypeHint(List<List<String>> matrix) {
        Map<String, Integer> frequency = new LinkedHashMap<>();
        for (List<String> row : matrix) {
            for (String cell : row) {
                String typeToken = extractAlphaTypeToken(cell);
                if (typeToken.isBlank()) {
                    continue;
                }
                frequency.merge(typeToken, 1, Integer::sum);
            }
        }
        return frequency.entrySet().stream()
            .max(Map.Entry.comparingByValue())
            .map(Map.Entry::getKey)
            .orElse("");
    }

    private Map<String, String> mapRow(List<String> headers, List<String> row) {
        Map<String, String> cells = new LinkedHashMap<>();
        int columnCount = Math.min(headers.size(), row.size());
        for (int columnIndex = 0; columnIndex < columnCount; columnIndex++) {
            String header = headers.get(columnIndex);
            String value = row.get(columnIndex);
            if (header == null || header.isBlank() || value == null || value.isBlank()) {
                continue;
            }
            cells.put(header, value);
        }
        return cells;
    }

    private NormalizedRow normalizeRow(String tableId, String typeHint, Map<String, String> rawCells) {
        if (rawCells.isEmpty()) {
            return new NormalizedRow(tableId, Map.of());
        }
        if (isNoiseTable(tableId)) {
            return new NormalizedRow(tableId, Map.of());
        }

        String resolvedTypeHint = firstNonBlank(
            extractExplicitType(rawCells),
            extractAlphaTypeToken(rawCells.keySet()),
            extractAlphaTypeToken(rawCells.values()),
            typeHint
        );

        Map<String, String> unitSummaryRow = normalizeUnitSummaryRow(tableId, resolvedTypeHint, rawCells);
        if (!unitSummaryRow.isEmpty()) {
            return new NormalizedRow("주택 관리번호 표", unitSummaryRow);
        }

        Map<String, String> scheduleRow = normalizeScheduleRow(resolvedTypeHint, rawCells);
        if (!scheduleRow.isEmpty()) {
            return new NormalizedRow("납부일정 표", scheduleRow);
        }

        Map<String, String> priceRow = normalizePriceRow(resolvedTypeHint, rawCells);
        if (!priceRow.isEmpty()) {
            return new NormalizedRow("공급금액 표", priceRow);
        }

        if (isSpecializedTable(tableId)) {
            return new NormalizedRow(tableId, Map.of());
        }

        if (rawCells.values().stream().anyMatch(this::looksLikeFlattenedProseCell) || combinedLength(rawCells) > MAX_GENERIC_ROW_TEXT_LENGTH) {
            return new NormalizedRow(tableId, Map.of());
        }

        LinkedHashMap<String, String> genericCells = new LinkedHashMap<>();
        if (!resolvedTypeHint.isBlank()) {
            genericCells.put("타입", resolvedTypeHint);
        }
        genericCells.putAll(rawCells);
        return new NormalizedRow(tableId, genericCells);
    }

    private Map<String, String> normalizePriceRow(String typeHint, Map<String, String> rawCells) {
        if (rawCells.values().stream().anyMatch(this::looksLikeFlattenedProseCell)) {
            return Map.of();
        }

        List<String> moneyValues = rawCells.values().stream()
            .filter(this::isMoneyValue)
            .map(String::trim)
            .toList();
        if (moneyValues.size() < 5) {
            return Map.of();
        }

        LinkedHashMap<String, String> normalized = new LinkedHashMap<>();
        if (!typeHint.isBlank()) {
            normalized.put("타입", typeHint);
        }

        String blockCode = findFirstPatternToken(rawCells, BLOCK_CODE_PATTERN);
        if (!blockCode.isBlank()) {
            normalized.put("블록 코드", blockCode);
        }

        String location = findFirstValueContaining(rawCells, "동", "호");
        if (!location.isBlank()) {
            normalized.put("세대 위치", location);
        }

        String floor = findFirstValueContaining(rawCells, "층");
        if (!floor.isBlank()) {
            normalized.put("층", floor);
        }

        if (blockCode.isBlank() && location.isBlank() && floor.isBlank() && typeHint.isBlank()) {
            return Map.of();
        }

        String householdCount = rawCells.values().stream()
            .filter(this::isSmallWholeNumber)
            .findFirst()
            .orElse("");
        if (!householdCount.isBlank()) {
            normalized.put("세대수", householdCount);
        }

        normalized.put("대지비", moneyValues.get(0));
        normalized.put("건축비", moneyValues.get(1));
        normalized.put("공급금액 계", moneyValues.get(2));
        if (moneyValues.size() >= 4) {
            normalized.put("계약금 1차", moneyValues.get(3));
        }
        if (moneyValues.size() >= 5) {
            normalized.put("계약금 2차", moneyValues.get(4));
            normalized.put("계약금 합계", formatMoney(parseMoney(moneyValues.get(3)) + parseMoney(moneyValues.get(4))));
        }

        int installmentCount = Math.min(6, Math.max(0, moneyValues.size() - 5));
        long middlePaymentTotal = 0L;
        for (int index = 0; index < installmentCount; index++) {
            String value = moneyValues.get(5 + index);
            normalized.put("중도금 " + (index + 1) + "차", value);
            middlePaymentTotal += parseMoney(value);
        }

        if (moneyValues.size() >= 12) {
            normalized.put("잔금", moneyValues.get(11));
        } else if (moneyValues.size() >= 5) {
            long total = parseMoney(moneyValues.get(2));
            long contractTotal = parseMoney(moneyValues.get(3)) + parseMoney(moneyValues.get(4));
            long balance = total - contractTotal - middlePaymentTotal;
            if (balance > 0) {
                normalized.put("잔금", formatMoney(balance));
            }
        }

        return normalized;
    }

    private Map<String, String> normalizeScheduleRow(String typeHint, Map<String, String> rawCells) {
        if (rawCells.values().stream().anyMatch(this::looksLikeFlattenedProseCell)) {
            return Map.of();
        }

        List<String> scheduleValues = extractValues(rawCells, DATE_VALUE_PATTERN);
        if (scheduleValues.size() < 4) {
            return Map.of();
        }

        LinkedHashMap<String, String> normalized = new LinkedHashMap<>();
        if (!typeHint.isBlank()) {
            normalized.put("타입", typeHint);
        }
        normalized.put("계약금 1차 납부일", scheduleValues.get(0));
        normalized.put("계약금 2차 납부일", scheduleValues.get(1));

        for (int index = 2; index < scheduleValues.size(); index++) {
            normalized.put("중도금 " + (index - 1) + "차 납부일", scheduleValues.get(index));
        }
        return normalized;
    }

    private Map<String, String> normalizeUnitSummaryRow(String tableId, String typeHint, Map<String, String> rawCells) {
        if (!isUnitSummaryTable(tableId, rawCells)) {
            return Map.of();
        }

        List<String> orderedValues = rawCells.values().stream()
            .filter(value -> value != null && !value.isBlank())
            .map(String::trim)
            .toList();
        List<String> areaValues = orderedValues.stream()
            .filter(value -> AREA_VALUE_PATTERN.matcher(value).matches())
            .toList();
        List<String> countValues = orderedValues.stream()
            .filter(value -> COUNT_VALUE_PATTERN.matcher(value).matches())
            .toList();

        if (typeHint.isBlank() || areaValues.isEmpty() || countValues.size() < 8) {
            return Map.of();
        }

        List<String> trailingCounts = countValues.subList(countValues.size() - 8, countValues.size());
        LinkedHashMap<String, String> normalized = new LinkedHashMap<>();
        normalized.put("타입", typeHint);

        String blockCode = findFirstPatternToken(rawCells, BLOCK_CODE_PATTERN);
        if (!blockCode.isBlank()) {
            normalized.put("블록 코드", blockCode);
        }

        normalized.put("전용면적", areaValues.get(0));
        putIfMeaningful(normalized, "총 공급 세대수", trailingCounts.get(0));
        putIfMeaningful(normalized, "기관추천", trailingCounts.get(1));
        putIfMeaningful(normalized, "다자녀가구", trailingCounts.get(2));
        putIfMeaningful(normalized, "신혼부부", trailingCounts.get(3));
        putIfMeaningful(normalized, "노부모부양", trailingCounts.get(4));
        putIfMeaningful(normalized, "생애최초", trailingCounts.get(5));
        putIfMeaningful(normalized, "특별공급 계", trailingCounts.get(6));
        putIfMeaningful(normalized, "일반공급", trailingCounts.get(7));
        return normalized;
    }

    private boolean shouldSkipRow(String tableId, Map<String, String> cells) {
        if (cells.isEmpty()) {
            return true;
        }

        if (cells.values().stream().anyMatch(this::looksLikeFlattenedProseCell)) {
            return true;
        }

        int maxLength = isSpecializedTable(tableId) ? MAX_SPECIALIZED_ROW_TEXT_LENGTH : MAX_GENERIC_ROW_TEXT_LENGTH;
        if (combinedLength(cells) > maxLength) {
            return true;
        }

        boolean hasNonNumericValue = cells.values().stream().anyMatch(value -> !isNumericLike(value));
        if (!hasNonNumericValue) {
            log.debug("Skipping numeric-only PDF table row with no identifiers: {}", cells);
            return true;
        }

        return false;
    }

    private boolean isSpecializedTable(String tableId) {
        return "공급금액 표".equals(tableId) || "납부일정 표".equals(tableId) || "주택 관리번호 표".equals(tableId);
    }

    private boolean isNoiseTable(String tableId) {
        if (tableId == null || tableId.isBlank()) {
            return false;
        }
        return tableId.contains("구글플레이스토어") || tableId.contains("애플앱스토어");
    }

    private boolean isUnitSummaryTable(String tableId, Map<String, String> rawCells) {
        if ("주택 관리번호 표".equals(tableId)) {
            return true;
        }

        boolean hasManagementHeader = rawCells.keySet().stream().anyMatch(key ->
            key != null && (key.contains("주택 관리번호") || key.contains("주택형"))
        );
        boolean hasTypeToken = !extractTypeToken(rawCells.values()).isBlank();
        return hasManagementHeader && hasTypeToken;
    }

    private Map<String, String> applyContext(String tableId, Map<String, String> cells, TableContext context) {
        if (cells.isEmpty()) {
            return cells;
        }

        LinkedHashMap<String, String> contextualized = new LinkedHashMap<>();
        if (("공급금액 표".equals(tableId) || "주택 관리번호 표".equals(tableId)) && !context.type().isBlank() && !cells.containsKey("타입")) {
            contextualized.put("타입", context.type());
        }
        if ("공급금액 표".equals(tableId) && !context.blockCode().isBlank() && !cells.containsKey("블록 코드")) {
            contextualized.put("블록 코드", context.blockCode());
        }
        if ("공급금액 표".equals(tableId) && !context.location().isBlank() && !cells.containsKey("세대 위치")) {
            contextualized.put("세대 위치", context.location());
        }
        contextualized.putAll(cells);
        return contextualized;
    }

    private void updateContext(TableContext context, String tableId, Map<String, String> cells) {
        if (!"공급금액 표".equals(tableId) && !"주택 관리번호 표".equals(tableId)) {
            return;
        }

        String type = cells.getOrDefault("타입", "");
        if (!type.isBlank()) {
            context.setType(type);
        }

        String blockCode = cells.getOrDefault("블록 코드", "");
        if (!blockCode.isBlank()) {
            context.setBlockCode(blockCode);
        }

        if ("공급금액 표".equals(tableId)) {
            String location = cells.getOrDefault("세대 위치", "");
            if (!location.isBlank()) {
                context.setLocation(location);
            }
        }
    }

    private int nonEmptyCount(List<String> row) {
        return (int) row.stream().filter(cell -> cell != null && !cell.isBlank()).count();
    }

    private String normalizeCell(RectangularTextContainer cell) {
        if (cell == null) {
            return "";
        }
        return cell.getText()
            .replace('\r', ' ')
            .replace('\n', ' ')
            .replaceAll("\\s+", " ")
            .trim();
    }

    private boolean isNumericLike(String value) {
        if (value == null) {
            return false;
        }
        String trimmed = value.trim();
        return !trimmed.isBlank() && NUMERIC_LIKE_PATTERN.matcher(trimmed).matches();
    }

    private List<String> extractValues(Map<String, String> cells, Pattern pattern) {
        return cells.values().stream()
            .filter(value -> value != null && pattern.matcher(value.trim()).matches())
            .map(String::trim)
            .toList();
    }

    private String findFirstPatternToken(Map<String, String> cells, Pattern pattern) {
        return cells.values().stream()
            .map(value -> extractPatternToken(value, pattern))
            .filter(value -> !value.isBlank())
            .findFirst()
            .orElse("");
    }

    private String extractPatternToken(String value, Pattern pattern) {
        if (value == null) {
            return "";
        }
        var matcher = pattern.matcher(value.trim());
        return matcher.find() ? matcher.group() : "";
    }

    private String findFirstValueContaining(Map<String, String> cells, String... requiredFragments) {
        return cells.values().stream()
            .filter(value -> value != null && !value.isBlank())
            .map(String::trim)
            .filter(value -> {
                for (String fragment : requiredFragments) {
                    if (!value.contains(fragment)) {
                        return false;
                    }
                }
                return true;
            })
            .findFirst()
            .orElse("");
    }

    private boolean isSmallWholeNumber(String value) {
        if (value == null) {
            return false;
        }
        String trimmed = value.trim();
        if (!trimmed.matches("\\d+")) {
            return false;
        }
        try {
            int number = Integer.parseInt(trimmed);
            return number > 0 && number < 100;
        } catch (NumberFormatException exception) {
            return false;
        }
    }

    private boolean isMoneyValue(String value) {
        if (value == null) {
            return false;
        }
        String trimmed = value.trim();
        if (!MONEY_VALUE_PATTERN.matcher(trimmed).matches()) {
            return false;
        }
        return trimmed.contains(",") || trimmed.length() >= 7;
    }

    private long parseMoney(String value) {
        return Long.parseLong(value.replace(",", ""));
    }

    private String formatMoney(long value) {
        return String.format("%,d", value);
    }

    private String extractTypeToken(Iterable<String> values) {
        for (String value : values) {
            String typeToken = extractTypeToken(value);
            if (!typeToken.isBlank()) {
                return typeToken;
            }
        }
        return "";
    }

    private String extractAlphaTypeToken(Iterable<String> values) {
        for (String value : values) {
            String typeToken = extractAlphaTypeToken(value);
            if (!typeToken.isBlank()) {
                return typeToken;
            }
        }
        return "";
    }

    private String extractTypeToken(String value) {
        if (value == null) {
            return "";
        }
        String trimmed = value.trim().replace(" ", "");
        var exactMatcher = EXACT_TYPE_PATTERN.matcher(trimmed);
        if (exactMatcher.matches()) {
            return exactMatcher.group(1);
        }

        var matcher = TYPE_TOKEN_PATTERN.matcher(trimmed);
        return matcher.find() ? matcher.group(1) : "";
    }

    private String extractAlphaTypeToken(String value) {
        if (value == null) {
            return "";
        }
        String trimmed = value.trim().replace(" ", "");
        var matcher = TYPE_TOKEN_PATTERN.matcher(trimmed);
        return matcher.find() ? matcher.group(1) : "";
    }

    private String extractExplicitType(Map<String, String> rawCells) {
        return rawCells.entrySet().stream()
            .filter(entry -> entry.getKey() != null && (entry.getKey().contains("주택형") || entry.getKey().contains("타입")))
            .map(Map.Entry::getValue)
            .map(this::extractTypeToken)
            .filter(value -> !value.isBlank())
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

    private void putIfMeaningful(Map<String, String> cells, String key, String value) {
        if (value == null) {
            return;
        }
        String trimmed = value.trim();
        if (trimmed.isBlank() || "-".equals(trimmed)) {
            return;
        }
        cells.put(key, trimmed);
    }

    private boolean looksLikeFlattenedProseCell(String value) {
        if (value == null) {
            return false;
        }
        String trimmed = value.trim();
        return trimmed.length() > MAX_GENERIC_ROW_TEXT_LENGTH || PROSE_MARKER_PATTERN.matcher(trimmed).find();
    }

    private int combinedLength(Map<String, String> cells) {
        return cells.entrySet().stream()
            .mapToInt(entry -> (entry.getKey() == null ? 0 : entry.getKey().length())
                + (entry.getValue() == null ? 0 : entry.getValue().length()))
            .sum();
    }

    private record NormalizedRow(String tableId, Map<String, String> cells) {}

    private static final class TableContext {
        private String type;
        private String blockCode = "";
        private String location = "";

        private TableContext(String type) {
            this.type = type == null ? "" : type;
        }

        private String type() {
            return type == null ? "" : type;
        }

        private void setType(String type) {
            this.type = type;
        }

        private String blockCode() {
            return blockCode == null ? "" : blockCode;
        }

        private void setBlockCode(String blockCode) {
            this.blockCode = blockCode;
        }

        private String location() {
            return location == null ? "" : location;
        }

        private void setLocation(String location) {
            this.location = location;
        }
    }
}
