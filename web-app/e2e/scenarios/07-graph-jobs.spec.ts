import { test, expect } from '../fixtures/auth.fixture';

test.describe('Graph Job Management', () => {
  test('GJ-01: Create job returns 201', async ({ userToken, apiClient }) => {
    apiClient.setToken(userToken);
    const projectsRes = await apiClient.get('/projects');
    const projectId = projectsRes.data[0]?.id;

    if (projectId) {
      const { status, data } = await apiClient.post(`/api/projects/${projectId}/jobs?source=UPLOAD`, {});
      expect(status).toBe(201);
      expect(data).toHaveProperty('status', 'PENDING');
    }
  });

  test('GJ-02: List project jobs returns 200', async ({ userToken, apiClient }) => {
    apiClient.setToken(userToken);
    const projectsRes = await apiClient.get('/projects');
    const projectId = projectsRes.data[0]?.id;

    if (projectId) {
      const { status, data } = await apiClient.get(`/api/projects/${projectId}/jobs`);
      expect(status).toBe(200);
      expect(Array.isArray(data)).toBeTruthy();
    }
  });

  test('GJ-03: Get job details returns 200', async ({ userToken, apiClient }) => {
    apiClient.setToken(userToken);
    const projectsRes = await apiClient.get('/projects');
    const projectId = projectsRes.data[0]?.id;

    if (projectId) {
      const jobsRes = await apiClient.get(`/api/projects/${projectId}/jobs`);
      const jobId = jobsRes.data[0]?.id;

      if (jobId) {
        const { status, data } = await apiClient.get(`/api/jobs/${jobId}`);
        expect(status).toBe(200);
        expect(data).toHaveProperty('id', jobId);
      }
    }
  });

  test('GJ-04: Update job to RUNNING sets startedAt', async ({ userToken, apiClient }) => {
    apiClient.setToken(userToken);
    const projectsRes = await apiClient.get('/projects');
    const projectId = projectsRes.data[0]?.id;

    if (projectId) {
      const createRes = await apiClient.post(`/api/projects/${projectId}/jobs?source=UPLOAD`, {});
      const jobId = createRes.data.id;

      const { status, data } = await apiClient.put(`/api/jobs/${jobId}/status?status=RUNNING`, {});
      expect(status).toBe(200);
      expect(data).toHaveProperty('startedAt');
    }
  });

  test('GJ-05: Update job results returns 200', async ({ userToken, apiClient }) => {
    apiClient.setToken(userToken);
    const projectsRes = await apiClient.get('/projects');
    const projectId = projectsRes.data[0]?.id;

    if (projectId) {
      const createRes = await apiClient.post(`/api/projects/${projectId}/jobs?source=UPLOAD`, {});
      const jobId = createRes.data.id;

      const { status, data } = await apiClient.put(
        `/api/jobs/${jobId}/results?totalNodes=100&totalEdges=200&totalCommunities=5`,
        {},
      );
      expect(status).toBe(200);
      expect(data).toHaveProperty('totalNodes', 100);
    }
  });

  test('GJ-06: Complete job sets completedAt', async ({ userToken, apiClient }) => {
    apiClient.setToken(userToken);
    const projectsRes = await apiClient.get('/projects');
    const projectId = projectsRes.data[0]?.id;

    if (projectId) {
      const createRes = await apiClient.post(`/api/projects/${projectId}/jobs?source=UPLOAD`, {});
      const jobId = createRes.data.id;

      const { status, data } = await apiClient.put(`/api/jobs/${jobId}/status?status=COMPLETED`, {});
      expect(status).toBe(200);
      expect(data).toHaveProperty('completedAt');
    }
  });

  test('GJ-07: Create graph from completed job returns 201', async ({ userToken, apiClient }) => {
    apiClient.setToken(userToken);
    const projectsRes = await apiClient.get('/projects');
    const projectId = projectsRes.data[0]?.id;

    if (projectId) {
      const createRes = await apiClient.post(`/api/projects/${projectId}/jobs?source=UPLOAD`, {});
      const jobId = createRes.data.id;

      await apiClient.put(`/api/jobs/${jobId}/status?status=COMPLETED`, {});

      const { status, data } = await apiClient.post(`/api/jobs/${jobId}/graphs?name=GraphV1`, {});
      expect(status).toBe(201);
      expect(data).toHaveProperty('name', 'GraphV1');
    }
  });

  test('GJ-08: List project graphs returns 200', async ({ userToken, apiClient }) => {
    apiClient.setToken(userToken);
    const projectsRes = await apiClient.get('/projects');
    const projectId = projectsRes.data[0]?.id;

    if (projectId) {
      const { status, data } = await apiClient.get(`/api/projects/${projectId}/graphs`);
      expect(status).toBe(200);
      expect(Array.isArray(data)).toBeTruthy();
    }
  });

  test('GJ-09: Get latest graph returns 200', async ({ userToken, apiClient }) => {
    apiClient.setToken(userToken);
    const projectsRes = await apiClient.get('/projects');
    const projectId = projectsRes.data[0]?.id;

    if (projectId) {
      const { status, data } = await apiClient.get(`/api/projects/${projectId}/graphs/latest`);
      expect([200, 404]).toContain(status);
      if (status === 200) {
        expect(data).toHaveProperty('isLatest', true);
      }
    }
  });

  test('GJ-10: Fail job sets status to FAILED', async ({ userToken, apiClient }) => {
    apiClient.setToken(userToken);
    const projectsRes = await apiClient.get('/projects');
    const projectId = projectsRes.data[0]?.id;

    if (projectId) {
      const createRes = await apiClient.post(`/api/projects/${projectId}/jobs?source=UPLOAD`, {});
      const jobId = createRes.data.id;

      const { status, data } = await apiClient.put(
        `/api/jobs/${jobId}/error?errorMessage=ParseError`,
        {},
      );
      expect(status).toBe(200);
      expect(data).toHaveProperty('status', 'FAILED');
    }
  });

  test('GJ-11: Create graph from pending job returns 400', async ({ userToken, apiClient }) => {
    apiClient.setToken(userToken);
    const projectsRes = await apiClient.get('/projects');
    const projectId = projectsRes.data[0]?.id;

    if (projectId) {
      const createRes = await apiClient.post(`/api/projects/${projectId}/jobs?source=UPLOAD`, {});
      const jobId = createRes.data.id;

      const { status } = await apiClient.post(`/api/jobs/${jobId}/graphs?name=EarlyGraph`, {});
      expect(status).toBe(400);
    }
  });
});
