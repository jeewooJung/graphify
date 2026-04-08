package com.graphify.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "projects")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;
    private String description;

    @ManyToOne
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @ManyToOne
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    private String gitlabUrl;
    private String gitlabRepoId;
    private String gitlabTokenEncrypted;

    @Column(nullable = false)
    private String status; // INITIALIZED, SYNCING, READY, ERROR

    private LocalDateTime lastSyncedAt;

    @Column(nullable = false)
    private boolean isArchived;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProjectPermission> permissions;

    @OneToMany(mappedBy = "project", fetch = FetchType.LAZY)
    private List<GraphJob> graphJobs;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Team getTeam() { return team; }
    public void setTeam(Team team) { this.team = team; }

    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }

    public String getGitlabUrl() { return gitlabUrl; }
    public void setGitlabUrl(String gitlabUrl) { this.gitlabUrl = gitlabUrl; }

    public String getGitlabRepoId() { return gitlabRepoId; }
    public void setGitlabRepoId(String gitlabRepoId) { this.gitlabRepoId = gitlabRepoId; }

    public String getGitlabTokenEncrypted() { return gitlabTokenEncrypted; }
    public void setGitlabTokenEncrypted(String gitlabTokenEncrypted) { this.gitlabTokenEncrypted = gitlabTokenEncrypted; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getLastSyncedAt() { return lastSyncedAt; }
    public void setLastSyncedAt(LocalDateTime lastSyncedAt) { this.lastSyncedAt = lastSyncedAt; }

    public boolean isArchived() { return isArchived; }
    public void setArchived(boolean archived) { isArchived = archived; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<ProjectPermission> getPermissions() { return permissions; }
    public void setPermissions(List<ProjectPermission> permissions) { this.permissions = permissions; }

    public List<GraphJob> getGraphJobs() { return graphJobs; }
    public void setGraphJobs(List<GraphJob> graphJobs) { this.graphJobs = graphJobs; }
}
