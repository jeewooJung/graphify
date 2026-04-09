import { test, expect } from '../fixtures/auth.fixture';
import { TEST_USERS } from '../helpers/test-data';
import { ApiClient } from '../helpers/api-client';

test.describe('Authentication Flow', () => {
  let apiClient: ApiClient;

  test.beforeEach(async ({ request }) => {
    apiClient = new ApiClient(request);
  });

  test('A-01: Register new user returns 201', async () => {
    const newUser = {
      username: `newuser_${Date.now()}@test.com`,
      email: `newuser_${Date.now()}@test.com`,
      password: 'TestPass123!',
      displayName: 'New User',
    };

    const { status, data } = await apiClient.register(
      newUser.username,
      newUser.email,
      newUser.password,
      newUser.displayName,
    );

    expect(status).toBe(201);
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('username', newUser.username);
    expect(data).toHaveProperty('email', newUser.email);
  });

  test('A-02: Valid login returns 200 with token', async () => {
    const { status, data } = await apiClient.post('/auth/login', {
      username: TEST_USERS.user1.username,
      password: TEST_USERS.user1.password,
    });

    expect(status).toBe(200);
    expect(data).toHaveProperty('token');
    expect(data).toHaveProperty('type', 'Bearer');
    expect(data).toHaveProperty('username', TEST_USERS.user1.username);
  });

  test('A-03: Invalid password login returns 401', async () => {
    const { status, data } = await apiClient.post('/auth/login', {
      username: TEST_USERS.user1.username,
      password: 'WrongPassword123!',
    });

    expect(status).toBe(401);
  });

  test('A-04: Non-existent user login returns 401', async () => {
    const { status } = await apiClient.post('/auth/login', {
      username: 'nonexistent@test.com',
      password: TEST_USERS.user1.password,
    });

    expect(status).toBe(401);
  });

  test('A-05: Validate token with valid JWT returns 200', async ({ userToken }) => {
    const { status, data } = await apiClient.validateToken(userToken);

    expect(status).toBe(200);
    expect(data).toHaveProperty('valid', true);
    expect(data).toHaveProperty('userId');
  });

  test('A-06: Invalid token validation returns 401', async () => {
    const { status } = await apiClient.validateToken('invalid.token.here');

    expect(status).toBe(401);
  });

  test('A-07: Logout endpoint returns 200', async ({ userToken }) => {
    apiClient.setToken(userToken);
    const { status, data } = await apiClient.post('/auth/logout', {});

    expect(status).toBe(200);
    expect(data).toHaveProperty('message');
  });
});
