package com.graphify.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@RestController
public class GraphJobController {

    private final Map<Long, Map<String, Object>> jobs = new ConcurrentHashMap<>();
    private final Map<Long, Map<String, Object>> graphs = new ConcurrentHashMap<>();
    private final AtomicLong jobIdSequence = new AtomicLong(1);
    private final AtomicLong graphIdSequence = new AtomicLong(1);

    @PostMapping("/projects/{projectId}/jobs")
    public ResponseEntity<Map<String, Object>> createJob(
            @PathVariable Long projectId,
            @RequestParam(defaultValue = "UPLOAD") String source) {
        Long jobId = jobIdSequence.getAndIncrement();
        Map<String, Object> job = new HashMap<>();
        job.put("id", jobId);
        job.put("projectId", projectId);
        job.put("status", "PENDING");
        job.put("source", source);
        job.put("createdAt", LocalDateTime.now());
        jobs.put(jobId, job);
        return new ResponseEntity<>(job, HttpStatus.CREATED);
    }

    @GetMapping("/projects/{projectId}/jobs")
    public ResponseEntity<List<Map<String, Object>>> listJobs(@PathVariable Long projectId) {
        List<Map<String, Object>> projectJobs = jobs.values().stream()
            .filter(j -> projectId.equals(j.get("projectId")))
            .toList();
        return ResponseEntity.ok(projectJobs);
    }

    @GetMapping("/jobs/{jobId}")
    public ResponseEntity<Map<String, Object>> getJob(@PathVariable Long jobId) {
        Map<String, Object> job = jobs.get(jobId);
        if (job == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(job);
    }

    @PutMapping("/jobs/{jobId}/status")
    public ResponseEntity<Map<String, Object>> updateJobStatus(
            @PathVariable Long jobId,
            @RequestParam String status) {
        Map<String, Object> job = jobs.get(jobId);
        if (job == null) {
            return ResponseEntity.notFound().build();
        }
        job.put("status", status);
        if ("RUNNING".equals(status)) {
            job.put("startedAt", LocalDateTime.now());
        } else if ("COMPLETED".equals(status)) {
            job.put("completedAt", LocalDateTime.now());
        }
        return ResponseEntity.ok(job);
    }

    @PutMapping("/jobs/{jobId}/results")
    public ResponseEntity<Map<String, Object>> updateJobResults(
            @PathVariable Long jobId,
            @RequestParam Integer totalNodes,
            @RequestParam Integer totalEdges,
            @RequestParam Integer totalCommunities) {
        Map<String, Object> job = jobs.get(jobId);
        if (job == null) {
            return ResponseEntity.notFound().build();
        }
        job.put("totalNodes", totalNodes);
        job.put("totalEdges", totalEdges);
        job.put("totalCommunities", totalCommunities);
        return ResponseEntity.ok(job);
    }

    @PutMapping("/jobs/{jobId}/error")
    public ResponseEntity<Map<String, Object>> failJob(
            @PathVariable Long jobId,
            @RequestParam String errorMessage) {
        Map<String, Object> job = jobs.get(jobId);
        if (job == null) {
            return ResponseEntity.notFound().build();
        }
        job.put("status", "FAILED");
        job.put("errorMessage", errorMessage);
        return ResponseEntity.ok(job);
    }

    @PostMapping("/jobs/{jobId}/graphs")
    public ResponseEntity<Map<String, Object>> createGraphFromJob(
            @PathVariable Long jobId,
            @RequestParam String name) {
        Map<String, Object> job = jobs.get(jobId);
        if (job == null) {
            return ResponseEntity.notFound().build();
        }
        // Only allow creating graph from COMPLETED job
        if (!"COMPLETED".equals(job.get("status"))) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        Long graphId = graphIdSequence.getAndIncrement();
        Map<String, Object> graph = new HashMap<>();
        graph.put("id", graphId);
        graph.put("jobId", jobId);
        graph.put("projectId", job.get("projectId"));
        graph.put("name", name);
        graph.put("isLatest", true);
        graph.put("createdAt", LocalDateTime.now());
        // Mark previous as non-latest
        for (Map<String, Object> g : graphs.values()) {
            if (graph.get("projectId").equals(g.get("projectId"))) {
                g.put("isLatest", false);
            }
        }
        graph.put("isLatest", true);
        graphs.put(graphId, graph);
        return new ResponseEntity<>(graph, HttpStatus.CREATED);
    }

    @GetMapping("/projects/{projectId}/graphs")
    public ResponseEntity<List<Map<String, Object>>> listGraphs(@PathVariable Long projectId) {
        List<Map<String, Object>> projectGraphs = graphs.values().stream()
            .filter(g -> projectId.equals(g.get("projectId")))
            .toList();
        return ResponseEntity.ok(projectGraphs);
    }

    @GetMapping("/projects/{projectId}/graphs/latest")
    public ResponseEntity<Map<String, Object>> getLatestGraph(@PathVariable Long projectId) {
        return graphs.values().stream()
            .filter(g -> projectId.equals(g.get("projectId")))
            .filter(g -> Boolean.TRUE.equals(g.get("isLatest")))
            .findFirst()
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
}
