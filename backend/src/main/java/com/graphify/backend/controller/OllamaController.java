// backend/src/main/java/com/graphify/backend/controller/OllamaController.java
package com.graphify.backend.controller;

import com.graphify.backend.service.OllamaService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.constraints.NotBlank;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ollama")
@CrossOrigin(origins = "*", maxAge = 3600)
public class OllamaController {

    private final OllamaService ollamaService;

    public OllamaController(OllamaService ollamaService) {
        this.ollamaService = ollamaService;
    }

    /**
     * Check if Ollama service is available.
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> checkHealth() {
        Map<String, Object> response = new HashMap<>();
        boolean available = ollamaService.isAvailable();
        response.put("available", available);
        response.put("baseUrl", ollamaService.getOllamaBaseUrl());
        response.put("model", ollamaService.getModel());
        response.put("embeddingModel", ollamaService.getEmbeddingModel());

        if (available) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(503).body(response);
        }
    }

    /**
     * Get available models from Ollama.
     */
    @GetMapping("/models")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEAD')")
    public ResponseEntity<Map<String, Object>> getModels() {
        try {
            Object models = ollamaService.getAvailableModels();
            Map<String, Object> response = new HashMap<>();
            response.put("models", models);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                Map.of("error", "Failed to fetch models", "details", e.getMessage())
            );
        }
    }

    /**
     * Generate text using Ollama.
     */
    @PostMapping("/generate")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> generateText(@RequestBody Map<String, String> request) {
        try {
            String prompt = request.get("prompt");
            String model = request.getOrDefault("model", ollamaService.getModel());

            if (prompt == null || prompt.isBlank()) {
                return ResponseEntity.badRequest().body(
                    Map.of("error", "Prompt is required")
                );
            }

            String result = ollamaService.generateText(prompt, model);
            Map<String, Object> response = new HashMap<>();
            response.put("prompt", prompt);
            response.put("model", model);
            response.put("response", result);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                Map.of("error", "Failed to generate text", "details", e.getMessage())
            );
        }
    }

    /**
     * Generate embeddings for text.
     */
    @PostMapping("/embeddings")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> generateEmbeddings(@RequestBody Map<String, String> request) {
        try {
            String text = request.get("text");

            if (text == null || text.isBlank()) {
                return ResponseEntity.badRequest().body(
                    Map.of("error", "Text is required")
                );
            }

            double[] embeddings = ollamaService.generateEmbeddings(text);
            Map<String, Object> response = new HashMap<>();
            response.put("text", text);
            response.put("embedding", embeddings);
            response.put("dimension", embeddings.length);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                Map.of("error", "Failed to generate embeddings", "details", e.getMessage())
            );
        }
    }

    /**
     * Extract semantic meaning from code/text.
     */
    @PostMapping("/extract-meaning")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> extractMeaning(@RequestBody Map<String, String> request) {
        try {
            String text = request.get("text");

            if (text == null || text.isBlank()) {
                return ResponseEntity.badRequest().body(
                    Map.of("error", "Text is required")
                );
            }

            String meaning = ollamaService.extractSemanticMeaning(text);
            Map<String, Object> response = new HashMap<>();
            response.put("text", text);
            response.put("meaning", meaning);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                Map.of("error", "Failed to extract meaning", "details", e.getMessage())
            );
        }
    }

    /**
     * Generate description for code/text.
     */
    @PostMapping("/generate-description")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> generateDescription(@RequestBody Map<String, Object> request) {
        try {
            String text = (String) request.get("text");
            Integer maxLength = request.containsKey("maxLength") ? (Integer) request.get("maxLength") : 200;

            if (text == null || text.isBlank()) {
                return ResponseEntity.badRequest().body(
                    Map.of("error", "Text is required")
                );
            }

            String description = ollamaService.generateDescription(text, maxLength);
            Map<String, Object> response = new HashMap<>();
            response.put("text", text);
            response.put("description", description);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                Map.of("error", "Failed to generate description", "details", e.getMessage())
            );
        }
    }
}
