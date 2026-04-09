import { test, expect } from '../fixtures/auth.fixture';
import { TEST_USERS } from '../helpers/test-data';

test.describe('User Management', () => {
  test('U-01: Get current user profile returns 200', async ({ userToken, apiClient }) => {
    apiClient.setToken(userToken);
    const { status, data } = await apiClient.get('/users/me');

    expect(status).toBe(200);
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('username');
  });

  test('U-02: Get user by ID (self) returns 200', async ({ userToken, apiClient }) => {
    apiClient.setToken(userToken);
    const meResponse = await apiClient.get('/users/me');
    const userId = meResponse.data.id;

    const { status, data } = await apiClient.get(`/users/${userId}`);
    expect(status).toBe(200);
    expect(data).toHaveProperty('id', userId);
  });

  test('U-03: Get other user returns 403', async ({ userToken, apiClient }) => {
    apiClient.setToken(userToken);
    const { status } = await apiClient.get('/users/9999');

    expect(status).toBe(403);
  });

  test('U-04: List all users (ADMIN only) returns 200', async ({ adminToken, apiClient }) => {
    apiClient.setToken(adminToken);
    const { status, data } = await apiClient.get('/users/');

    expect(status).toBe(200);
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('U-05: List all users (non-admin) returns 403', async ({ userToken, apiClient }) => {
    apiClient.setToken(userToken);
    const { status } = await apiClient.get('/users/');

    expect(status).toBe(403);
  });

  test('U-06: Update user info returns 200', async ({ userToken, apiClient }) => {
    apiClient.setToken(userToken);
    const { data: userData } = await apiClient.get('/users/me');

    const { status, data } = await apiClient.put(`/users/${userData.id}`, {
      displayName: 'Updated Name',
    });

    expect(status).toBe(200);
    expect(data).toHaveProperty('displayName', 'Updated Name');
  });

  test('U-07: Delete user (ADMIN only) returns 200', async ({ adminToken, apiClient }) => {
    apiClient.setToken(adminToken);

    // First create a user to delete
    const newUser = {
      username: `deleteuser_${Date.now()}@test.com`,
      email: `deleteuser_${Date.now()}@test.com`,
      password: 'Delete1234!',
    };
    const createRes = await apiClient.register(newUser.username, newUser.email, newUser.password);
    const userId = createRes.data.id;

    // Delete user
    const { status } = await apiClient.delete(`/users/${userId}`);
    expect(status).toBe(200);
  });

  test('U-08: Duplicate email registration returns 400', async ({ apiClient }) => {
    const { status } = await apiClient.register(
      TEST_USERS.user1.username,
      TEST_USERS.user1.email,
      'DifferentPass123!',
    );

    expect(status).toBe(400);
  });

  test('U-09: Invalid registration data returns 400', async ({ apiClient }) => {
    const { status } = await apiClient.register('ab', 'invalid-email', 'short');

    expect(status).toBe(400);
  });
});
