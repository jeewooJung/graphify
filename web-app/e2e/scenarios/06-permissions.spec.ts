import { test, expect } from '../fixtures/auth.fixture';

test.describe('Permission Management (ABAC)', () => {
  test('PM-01: Get project permissions returns 200', async ({ userToken, apiClient }) => {
    apiClient.setToken(userToken);
    const projectsRes = await apiClient.get('/projects');
    const projectId = projectsRes.data[0]?.id;

    if (projectId) {
      const { status, data } = await apiClient.get(`/api/projects/${projectId}/permissions`);
      expect(status).toBe(200);
      expect(Array.isArray(data)).toBeTruthy();
    }
  });

  test('PM-02: Grant permission returns 201', async ({ userToken, apiClient }) => {
    apiClient.setToken(userToken);
    const projectsRes = await apiClient.get('/projects');
    const projectId = projectsRes.data[0]?.id;

    if (projectId) {
      const { status, data } = await apiClient.post(`/api/projects/${projectId}/permissions`, {
        userId: 2,
        role: 'viewer',
      });

      expect([201, 400]).toContain(status); // 400 if already has permission
      if (status === 201) {
        expect(data).toHaveProperty('role', 'viewer');
      }
    }
  });

  test('PM-03: Update permission returns 200', async ({ userToken, apiClient }) => {
    apiClient.setToken(userToken);
    const projectsRes = await apiClient.get('/projects');
    const projectId = projectsRes.data[0]?.id;

    if (projectId) {
      const permsRes = await apiClient.get(`/api/projects/${projectId}/permissions`);
      const permId = permsRes.data[0]?.id;

      if (permId) {
        const { status, data } = await apiClient.put(
          `/api/projects/${projectId}/permissions/${permId}`,
          { role: 'editor' },
        );
        expect(status).toBe(200);
        expect(data).toHaveProperty('role', 'editor');
      }
    }
  });

  test('PM-04: Revoke permission returns 204', async ({ userToken, apiClient }) => {
    apiClient.setToken(userToken);
    const projectsRes = await apiClient.get('/projects');
    const projectId = projectsRes.data[0]?.id;

    if (projectId) {
      const permsRes = await apiClient.get(`/api/projects/${projectId}/permissions`);
      const permId = permsRes.data[1]?.id; // Skip first (owner)

      if (permId) {
        const { status } = await apiClient.delete(
          `/api/projects/${projectId}/permissions/${permId}`,
        );
        expect([200, 204]).toContain(status);
      }
    }
  });

  test('PM-05: Unauthorized user grant returns 403', async ({ userToken, apiClient }) => {
    apiClient.setToken(userToken);
    const { status } = await apiClient.post('/api/projects/9999/permissions', {
      userId: 2,
      role: 'viewer',
    });

    expect(status).toBe(403);
  });

  test('PM-06: Invalid role validation returns 400', async ({ userToken, apiClient }) => {
    apiClient.setToken(userToken);
    const projectsRes = await apiClient.get('/projects');
    const projectId = projectsRes.data[0]?.id;

    if (projectId) {
      const { status } = await apiClient.post(`/api/projects/${projectId}/permissions`, {
        userId: 2,
        role: 'superuser', // Invalid role
      });

      expect(status).toBe(400);
    }
  });
});
