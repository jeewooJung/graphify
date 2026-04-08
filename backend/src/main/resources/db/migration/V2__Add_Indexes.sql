-- V2__Add_Indexes.sql

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_is_active ON users(is_active);

CREATE INDEX idx_teams_created_by ON teams(created_by);
CREATE INDEX idx_teams_is_active ON teams(is_active);

CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);

CREATE INDEX idx_projects_team_id ON projects(team_id);
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_projects_status ON projects(status);

CREATE INDEX idx_project_permissions_project_id ON project_permissions(project_id);
CREATE INDEX idx_project_permissions_user_id ON project_permissions(user_id);

CREATE INDEX idx_graph_jobs_project_id ON graph_jobs(project_id);
CREATE INDEX idx_graph_jobs_status ON graph_jobs(status);

CREATE INDEX idx_graphs_project_id ON graphs(project_id);
CREATE INDEX idx_graphs_job_id ON graphs(job_id);

CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
