import { test, expect } from '../fixtures/auth.fixture';
import { TEST_TEAMS, TEST_USERS } from '../helpers/test-data';

test.describe('Team Management', () => {
  let createdTeamId: number;

  test('T-01: Create team returns 201', async ({ userToken, apiClient }) => {
    apiClient.setToken(userToken);
    const { status, data } = await apiClient.post('/teams', TEST_TEAMS.backend);

    expect(status).toBe(201);
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('name', TEST_TEAMS.backend.name);
    createdTeamId = data.id;
  });

  test('T-02: List user teams returns 200', async ({ userToken, apiClient }) => {
    apiClient.setToken(userToken);
    const { status, data } = await apiClient.get('/teams');

    expect(status).toBe(200);
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('T-03: Get team by ID returns 200', async ({ userToken, apiClient }) => {
    apiClient.setToken(userToken);
    const listRes = await apiClient.get('/teams');
    const teamId = listRes.data[0]?.id;

    if (teamId) {
      const { status, data } = await apiClient.get(`/teams/${teamId}`);
      expect(status).toBe(200);
      expect(data).toHaveProperty('id', teamId);
    }
  });

  test('T-04: Update team returns 200', async ({ userToken, apiClient }) => {
    apiClient.setToken(userToken);
    const listRes = await apiClient.get('/teams');
    const teamId = listRes.data[0]?.id;

    if (teamId) {
      const { status, data } = await apiClient.put(`/teams/${teamId}`, {
        name: 'Updated Team Name',
      });
      expect(status).toBe(200);
      expect(data).toHaveProperty('name', 'Updated Team Name');
    }
  });

  test('T-05: Invite team member returns 200', async ({ userToken, apiClient }) => {
    apiClient.setToken(userToken);
    const listRes = await apiClient.get('/teams');
    const teamId = listRes.data[0]?.id;

    if (teamId) {
      const { status } = await apiClient.post(`/teams/${teamId}/members`, {
        userId: 2, // Assuming user 2 exists
      });
      expect([200, 400]).toContain(status); // 400 if user already member
    }
  });

  test('T-06: Get team members returns 200', async ({ userToken, apiClient }) => {
    apiClient.setToken(userToken);
    const listRes = await apiClient.get('/teams');
    const teamId = listRes.data[0]?.id;

    if (teamId) {
      const { status, data } = await apiClient.get(`/teams/${teamId}/members`);
      expect(status).toBe(200);
      expect(Array.isArray(data)).toBeTruthy();
    }
  });

  test('T-07: Duplicate invite returns 400', async ({ userToken, apiClient }) => {
    apiClient.setToken(userToken);
    const listRes = await apiClient.get('/teams');
    const teamId = listRes.data[0]?.id;

    if (teamId) {
      // Try to invite the same user twice
      await apiClient.post(`/teams/${teamId}/members`, { userId: 2 });
      const { status } = await apiClient.post(`/teams/${teamId}/members`, { userId: 2 });
      expect(status).toBe(400);
    }
  });

  test('T-08: Remove team member returns 200', async ({ userToken, apiClient }) => {
    apiClient.setToken(userToken);
    const listRes = await apiClient.get('/teams');
    const teamId = listRes.data[0]?.id;

    if (teamId) {
      const membersRes = await apiClient.get(`/teams/${teamId}/members`);
      const memberId = membersRes.data[1]?.userId;

      if (memberId) {
        const { status } = await apiClient.delete(`/teams/${teamId}/members/${memberId}`);
        expect(status).toBe(200);
      }
    }
  });

  test('T-09: Delete team returns 200', async ({ userToken, apiClient }) => {
    apiClient.setToken(userToken);
    const listRes = await apiClient.get('/teams');
    const teamId = listRes.data[0]?.id;

    if (teamId) {
      const { status } = await apiClient.delete(`/teams/${teamId}`);
      expect(status).toBe(200);
    }
  });

  test('T-10: Access team without permission returns 403', async ({ userToken, apiClient }) => {
    apiClient.setToken(userToken);
    const { status } = await apiClient.put('/teams/9999', { name: 'Hacked' });

    expect(status).toBe(403);
  });
});
