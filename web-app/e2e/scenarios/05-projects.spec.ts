import { test, expect } from '../fixtures/auth.fixture';
import { TEST_PROJECTS } from '../helpers/test-data';

test.describe('Project Management', () => {
  test('PR-01: Create project returns 201', async ({ userToken, apiClient }) => {
    apiClient.setToken(userToken);

    // First get a team
    const teamsRes = await apiClient.get('/teams');
    const teamId = teamsRes.data[0]?.id || 1;

    const { status, data } = await apiClient.post('/projects', {
      name: TEST_PROJECTS.core.name,
      description: TEST_PROJECTS.core.description,
      teamId,
    });

    expect(status).toBe(201);
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('name', TEST_PROJECTS.core.name);
  });

  test('PR-02: List user projects returns 200', async ({ userToken, apiClient }) => {
    apiClient.setToken(userToken);
    const { status, data } = await apiClient.get('/projects');

    expect(status).toBe(200);
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('PR-03: Get project by ID returns 200', async ({ userToken, apiClient }) => {
    apiClient.setToken(userToken);
    const listRes = await apiClient.get('/projects');
    const projectId = listRes.data[0]?.id;

    if (projectId) {
      const { status, data } = await apiClient.get(`/projects/${projectId}`);
      expect(status).toBe(200);
      expect(data).toHaveProperty('id', projectId);
    }
  });

  test('PR-04: Update project returns 200', async ({ userToken, apiClient }) => {
    apiClient.setToken(userToken);
    const listRes = await apiClient.get('/projects');
    const projectId = listRes.data[0]?.id;

    if (projectId) {
      const { status, data } = await apiClient.put(`/projects/${projectId}`, {
        name: 'Updated Project Name',
      });
      expect(status).toBe(200);
      expect(data).toHaveProperty('name', 'Updated Project Name');
    }
  });

  test('PR-05: Delete project (soft delete) returns 200', async ({ userToken, apiClient }) => {
    apiClient.setToken(userToken);

    // Create a project to delete
    const teamsRes = await apiClient.get('/teams');
    const teamId = teamsRes.data[0]?.id || 1;

    const createRes = await apiClient.post('/projects', {
      name: `DeleteProject_${Date.now()}`,
      description: 'To be deleted',
      teamId,
    });

    if (createRes.status === 201) {
      const projectId = createRes.data.id;
      const { status, data } = await apiClient.delete(`/projects/${projectId}`);
      expect(status).toBe(200);
      expect(data).toHaveProperty('isArchived', true);
    }
  });

  test('PR-06: Access project without permission returns 403', async ({ userToken, apiClient }) => {
    apiClient.setToken(userToken);
    const { status } = await apiClient.get('/projects/9999');

    expect(status).toBe(403);
  });

  test('PR-07: Sync project returns 200 or 503', async ({ userToken, apiClient }) => {
    apiClient.setToken(userToken);
    const listRes = await apiClient.get('/projects');
    const projectId = listRes.data[0]?.id;

    if (projectId) {
      const { status } = await apiClient.post(`/projects/${projectId}/sync`, {});
      expect([200, 503]).toContain(status);
    }
  });

  test('PR-08: Get project jobs returns 200', async ({ userToken, apiClient }) => {
    apiClient.setToken(userToken);
    const listRes = await apiClient.get('/projects');
    const projectId = listRes.data[0]?.id;

    if (projectId) {
      const { status, data } = await apiClient.get(`/projects/${projectId}/jobs`);
      expect(status).toBe(200);
      expect(Array.isArray(data)).toBeTruthy();
    }
  });
});
