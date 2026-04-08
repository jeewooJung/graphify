// backend/src/main/java/com/graphify/backend/service/GraphJobService.java
package com.graphify.backend.service;

import com.graphify.backend.entity.GraphJob;
import com.graphify.backend.entity.Graph;
import com.graphify.backend.entity.Project;
import com.graphify.backend.entity.User;
import com.graphify.backend.repository.GraphJobRepository;
import com.graphify.backend.repository.GraphRepository;
import com.graphify.backend.repository.ProjectRepository;
import com.graphify.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class GraphJobService {

    private final GraphJobRepository jobRepository;
    private final GraphRepository graphRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public GraphJobService(GraphJobRepository jobRepository,
                          GraphRepository graphRepository,
                          ProjectRepository projectRepository,
                          UserRepository userRepository) {
        this.jobRepository = jobRepository;
        this.graphRepository = graphRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    /**
     * Create a new graph job.
     */
    public GraphJob createJob(Long projectId, String source, String sourceUrl, Long userId) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        GraphJob job = new GraphJob(project, "PENDING", source, user);
        job.setSourceUrl(sourceUrl);
        return jobRepository.save(job);
    }

    /**
     * Get a job by ID.
     */
    public GraphJob getJobById(Long jobId) {
        return jobRepository.findById(jobId)
            .orElseThrow(() -> new IllegalArgumentException("Graph job not found"));
    }

    /**
     * Get all jobs for a project.
     */
    public List<GraphJob> getProjectJobs(Long projectId) {
        return jobRepository.findByProjectId(projectId);
    }

    /**
     * Get jobs by status.
     */
    public List<GraphJob> getJobsByStatus(String status) {
        return jobRepository.findByStatus(status);
    }

    /**
     * Update job status.
     */
    public GraphJob updateJobStatus(Long jobId, String status) {
        GraphJob job = getJobById(jobId);
        job.setStatus(status);
        job.setUpdatedAt(LocalDateTime.now());

        if ("RUNNING".equals(status) && job.getStartedAt() == null) {
            job.setStartedAt(LocalDateTime.now());
        }

        if ("COMPLETED".equals(status) || "FAILED".equals(status)) {
            job.setCompletedAt(LocalDateTime.now());
        }

        return jobRepository.save(job);
    }

    /**
     * Update job with results.
     */
    public GraphJob updateJobResults(Long jobId, Integer totalNodes, Integer totalEdges, Integer totalCommunities) {
        GraphJob job = getJobById(jobId);
        job.setTotalNodes(totalNodes);
        job.setTotalEdges(totalEdges);
        job.setTotalCommunities(totalCommunities);
        job.setUpdatedAt(LocalDateTime.now());
        return jobRepository.save(job);
    }

    /**
     * Set job error.
     */
    public GraphJob setJobError(Long jobId, String errorMessage) {
        GraphJob job = getJobById(jobId);
        job.setStatus("FAILED");
        job.setErrorMessage(errorMessage);
        job.setCompletedAt(LocalDateTime.now());
        job.setUpdatedAt(LocalDateTime.now());
        return jobRepository.save(job);
    }

    /**
     * Get the latest job for a project.
     */
    public GraphJob getLatestProjectJob(Long projectId) {
        return jobRepository.findFirstByProjectIdOrderByCreatedAtDesc(projectId)
            .orElseThrow(() -> new IllegalArgumentException("No jobs found for project"));
    }

    /**
     * Create a graph from a completed job.
     */
    public Graph createGraphFromJob(Long jobId, String graphName) {
        GraphJob job = getJobById(jobId);

        if (!"COMPLETED".equals(job.getStatus())) {
            throw new IllegalArgumentException("Job must be in COMPLETED status");
        }

        // Mark previous latest as not latest
        graphRepository.findByProjectIdAndIsLatestTrue(job.getProject().getId())
            .ifPresent(graph -> {
                graph.setLatest(false);
                graphRepository.save(graph);
            });

        // Create new graph
        Graph graph = new Graph(job.getProject(), job, graphName);
        graph.setNodesCount(job.getTotalNodes());
        graph.setEdgesCount(job.getTotalEdges());
        graph.setCommunitiesCount(job.getTotalCommunities());
        graph.setLatest(true);
        return graphRepository.save(graph);
    }

    /**
     * Get all graphs for a project.
     */
    public List<Graph> getProjectGraphs(Long projectId) {
        return graphRepository.findByProjectIdOrderByCreatedAtDesc(projectId);
    }

    /**
     * Get the latest graph for a project.
     */
    public Graph getLatestProjectGraph(Long projectId) {
        return graphRepository.findByProjectIdAndIsLatestTrue(projectId)
            .orElseThrow(() -> new IllegalArgumentException("No latest graph found for project"));
    }
}
