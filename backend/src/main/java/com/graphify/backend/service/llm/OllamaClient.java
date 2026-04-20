package com.graphify.backend.service.llm;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
public class OllamaClient {

    public record OllamaChatRequest(String system, String user) {}

    public record OllamaChatResponse(String content, String modelName) {}

    private static final Logger log = LoggerFactory.getLogger(OllamaClient.class);

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    @Value("${graphify.ollama.base-url}")
    private String baseUrl;

    @Value("${graphify.ollama.model}")
    private String model;

    @Value("${graphify.ollama.timeout-seconds}")
    private long timeoutSeconds;

    public OllamaClient(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newHttpClient();
    }

    public OllamaChatResponse chat(OllamaChatRequest request) throws IOException, InterruptedException {
        String url = normalizedBaseUrl() + "/api/chat";
        String requestBody = objectMapper.writeValueAsString(Map.of(
            "model", model,
            "messages", List.of(
                Map.of("role", "system", "content", defaultString(request.system())),
                Map.of("role", "user", "content", defaultString(request.user()))
            ),
            "stream", false
        ));

        HttpRequest httpRequest = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .timeout(Duration.ofSeconds(timeoutSeconds))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(requestBody, StandardCharsets.UTF_8))
            .build();

        HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
        String body = response.body() == null ? "" : response.body();
        log.debug("Ollama response url={} model={} body={}", url, model, abbreviate(body, 200));

        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new IOException("Ollama chat request failed with status " + response.statusCode() + ": " + body);
        }

        try {
            JsonNode root = objectMapper.readTree(body);
            JsonNode messageNode = root.path("message");
            String content = messageNode.path("content").isMissingNode() ? null : messageNode.path("content").asText(null);
            if (content == null) {
                throw new IllegalStateException("Failed to parse Ollama response: " + body);
            }
            String modelName = root.path("model").isMissingNode() ? model : root.path("model").asText(model);
            return new OllamaChatResponse(content, modelName);
        } catch (IllegalStateException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new IllegalStateException("Failed to parse Ollama response: " + body, exception);
        }
    }

    private String normalizedBaseUrl() {
        if (baseUrl == null || baseUrl.isBlank()) {
            throw new IllegalStateException("graphify.ollama.base-url must be configured");
        }
        return baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
    }

    private String defaultString(String value) {
        return value == null ? "" : value;
    }

    private String abbreviate(String value, int maxLength) {
        if (value == null) {
            return "";
        }
        return value.length() <= maxLength ? value : value.substring(0, maxLength);
    }
}
