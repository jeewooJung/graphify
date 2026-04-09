import { test, expect } from '@playwright/test';
import { ApiClient } from '../helpers/api-client';
import { API_BASE_URL } from '../helpers/test-data';

test.describe('Public Endpoints', () => {
  let apiClient: ApiClient;

  test.beforeEach(async ({ request }) => {
    apiClient = new ApiClient(request);
  });

  test('P-01: Backend health check returns 200', async () => {
    const { status, data } = await apiClient.get('/health/check');

    expect(status).toBe(200);
    expect(data).toHaveProperty('status', 'UP');
  });

  test('P-02: Health info returns 200 with version', async () => {
    const { status, data } = await apiClient.get('/health/info');

    expect(status).toBe(200);
    expect(data).toHaveProperty('service', 'graphify-backend');
    expect(data).toHaveProperty('version');
  });

  test('P-03: Ollama health check is accessible', async () => {
    const { status } = await apiClient.get('/ollama/health');

    // Should return 200 if Ollama is running, 503 if not
    expect([200, 503]).toContain(status);
  });

  test('P-04: Protected endpoint without auth returns 401', async () => {
    const request = (test as any).request || this.request;
    const response = await (request as any).get(`${API_BASE_URL}/audit-logs`);

    expect(response.status()).toBe(401);
  });
});
