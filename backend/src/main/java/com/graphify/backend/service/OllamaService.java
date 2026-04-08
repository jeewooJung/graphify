// backend/src/main/java/com/graphify/backend/service/OllamaService.java
package com.graphify.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.Map;

@Service
public class OllamaService {

    @Value("${ollama.base-url}")
    private String ollamaBaseUrl;

    @Value("${ollama.model}")
    private String model;

    @Value("${ollama.embedding-model}")
    private String embeddingModel;

    private final RestTemplate restTemplate;

    public OllamaService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Generate embeddings for text using Ollama.
     */
    public double[] generateEmbeddings(String text) {
        try {
            Map<String, Object> request = new HashMap<>();
            request.put("model", embeddingModel);
            request.put("prompt", text);

            String url = ollamaBaseUrl + "/api/embed";
            Map<String, Object> response = restTemplate.postForObject(url, request, Map.class);

            if (response != null && response.containsKey("embedding")) {
                Object embedding = response.get("embedding");
                if (embedding instanceof java.util.List) {
                    java.util.List<?> list = (java.util.List<?>) embedding;
                    double[] result = new double[list.size()];
                    for (int i = 0; i < list.size(); i++) {
                        result[i] = ((Number) list.get(i)).doubleValue();
                    }
                    return result;
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate embeddings: " + e.getMessage(), e);
        }
        return new double[0];
    }

    /**
     * Generate text using Ollama language model.
     */
    public String generateText(String prompt) {
        return generateText(prompt, model);
    }

    /**
     * Generate text using specified Ollama model.
     */
    public String generateText(String prompt, String modelName) {
        try {
            Map<String, Object> request = new HashMap<>();
            request.put("model", modelName);
            request.put("prompt", prompt);
            request.put("stream", false);

            String url = ollamaBaseUrl + "/api/generate";
            Map<String, Object> response = restTemplate.postForObject(url, request, Map.class);

            if (response != null && response.containsKey("response")) {
                return response.get("response").toString();
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate text: " + e.getMessage(), e);
        }
        return "";
    }

    /**
     * Check if Ollama service is available.
     */
    public boolean isAvailable() {
        try {
            String url = ollamaBaseUrl + "/api/tags";
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            return response != null && response.containsKey("models");
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Get list of available models.
     */
    public Object getAvailableModels() {
        try {
            String url = ollamaBaseUrl + "/api/tags";
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response != null && response.containsKey("models")) {
                return response.get("models");
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch available models: " + e.getMessage(), e);
        }
        return null;
    }

    /**
     * Extract semantic meaning from code/text.
     */
    public String extractSemanticMeaning(String codeOrText) {
        String prompt = String.format(
            "Analyze the following code/text and extract its semantic meaning in one concise sentence:\n\n%s",
            codeOrText
        );
        return generateText(prompt);
    }

    /**
     * Generate a description for code/text.
     */
    public String generateDescription(String codeOrText, int maxLength) {
        String prompt = String.format(
            "Generate a brief description (max %d characters) for the following code/text:\n\n%s",
            maxLength, codeOrText
        );
        return generateText(prompt);
    }

    public String getOllamaBaseUrl() {
        return ollamaBaseUrl;
    }

    public String getModel() {
        return model;
    }

    public String getEmbeddingModel() {
        return embeddingModel;
    }
}
