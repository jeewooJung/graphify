import { test, expect } from '../fixtures/auth.fixture';

test.describe('Audit Logs (Admin Only)', () => {
  test('AL-01: Get all audit logs (ADMIN) returns 200', async ({ adminToken, apiClient }) => {
    apiClient.setToken(adminToken);
    const { status, data } = await apiClient.get('/api/audit-logs');

    expect(status).toBe(200);
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('AL-02: Non-admin access to logs returns 403', async ({ userToken, apiClient }) => {
    apiClient.setToken(userToken);
    const { status } = await apiClient.get('/api/audit-logs');

    expect(status).toBe(403);
  });

  test('AL-03: Get logs by user ID returns 200', async ({ adminToken, apiClient }) => {
    apiClient.setToken(adminToken);
    const { status, data } = await apiClient.get('/api/audit-logs/user/1');

    expect(status).toBe(200);
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('AL-04: Get logs by resource returns 200', async ({ adminToken, apiClient }) => {
    apiClient.setToken(adminToken);
    const { status, data } = await apiClient.get('/api/audit-logs/resource/Project/1');

    expect(status).toBe(200);
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('AL-05: Get logs by action returns 200', async ({ adminToken, apiClient }) => {
    apiClient.setToken(adminToken);
    const { status, data } = await apiClient.get('/api/audit-logs/action/CREATE');

    expect(status).toBe(200);
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('AL-06: Get logs by date range returns 200', async ({ adminToken, apiClient }) => {
    apiClient.setToken(adminToken);
    const startDate = '2026-01-01T00:00:00';
    const endDate = '2026-12-31T23:59:59';

    const { status, data } = await apiClient.get(
      `/api/audit-logs/date-range?startDate=${startDate}&endDate=${endDate}`,
    );

    expect(status).toBe(200);
    expect(Array.isArray(data)).toBeTruthy();
  });
});
