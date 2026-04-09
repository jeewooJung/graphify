# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 01-public.spec.ts >> Public Endpoints >> P-03: Ollama health check is accessible
- Location: e2e\scenarios\01-public.spec.ts:27:7

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected value: 401
Received array: [200, 503]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { ApiClient } from '../helpers/api-client';
  3  | import { API_BASE_URL } from '../helpers/test-data';
  4  | 
  5  | test.describe('Public Endpoints', () => {
  6  |   let apiClient: ApiClient;
  7  | 
  8  |   test.beforeEach(async ({ request }) => {
  9  |     apiClient = new ApiClient(request);
  10 |   });
  11 | 
  12 |   test('P-01: Backend health check returns 200', async () => {
  13 |     const { status, data } = await apiClient.get('/health/check');
  14 | 
  15 |     expect(status).toBe(200);
  16 |     expect(data).toHaveProperty('status', 'UP');
  17 |   });
  18 | 
  19 |   test('P-02: Health info returns 200 with version', async () => {
  20 |     const { status, data } = await apiClient.get('/health/info');
  21 | 
  22 |     expect(status).toBe(200);
  23 |     expect(data).toHaveProperty('service', 'graphify-backend');
  24 |     expect(data).toHaveProperty('version');
  25 |   });
  26 | 
  27 |   test('P-03: Ollama health check is accessible', async () => {
  28 |     const { status } = await apiClient.get('/ollama/health');
  29 | 
  30 |     // Should return 200 if Ollama is running, 503 if not
> 31 |     expect([200, 503]).toContain(status);
     |                        ^ Error: expect(received).toContain(expected) // indexOf
  32 |   });
  33 | 
  34 |   test('P-04: Protected endpoint without auth returns 401', async ({ request }) => {
  35 |     const publicApiClient = new ApiClient(request);
  36 |     const { status } = await publicApiClient.get('/api/audit-logs');
  37 | 
  38 |     expect(status).toBe(401);
  39 |   });
  40 | });
  41 | 
```