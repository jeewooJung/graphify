# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 03-users.spec.ts >> User Management >> U-09: Invalid registration data returns 400
- Location: e2e\scenarios\03-users.spec.ts:85:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 400
Received: 401
```

# Test source

```ts
  1  | import { test, expect } from '../fixtures/auth.fixture';
  2  | import { TEST_USERS } from '../helpers/test-data';
  3  | 
  4  | test.describe('User Management', () => {
  5  |   test('U-01: Get current user profile returns 200', async ({ userToken, apiClient }) => {
  6  |     apiClient.setToken(userToken);
  7  |     const { status, data } = await apiClient.get('/users/me');
  8  | 
  9  |     expect(status).toBe(200);
  10 |     expect(data).toHaveProperty('id');
  11 |     expect(data).toHaveProperty('username');
  12 |   });
  13 | 
  14 |   test('U-02: Get user by ID (self) returns 200', async ({ userToken, apiClient }) => {
  15 |     apiClient.setToken(userToken);
  16 |     const meResponse = await apiClient.get('/users/me');
  17 |     const userId = meResponse.data.id;
  18 | 
  19 |     const { status, data } = await apiClient.get(`/users/${userId}`);
  20 |     expect(status).toBe(200);
  21 |     expect(data).toHaveProperty('id', userId);
  22 |   });
  23 | 
  24 |   test('U-03: Get other user returns 403', async ({ userToken, apiClient }) => {
  25 |     apiClient.setToken(userToken);
  26 |     const { status } = await apiClient.get('/users/9999');
  27 | 
  28 |     expect(status).toBe(403);
  29 |   });
  30 | 
  31 |   test('U-04: List all users (ADMIN only) returns 200', async ({ adminToken, apiClient }) => {
  32 |     apiClient.setToken(adminToken);
  33 |     const { status, data } = await apiClient.get('/users/');
  34 | 
  35 |     expect(status).toBe(200);
  36 |     expect(Array.isArray(data)).toBeTruthy();
  37 |   });
  38 | 
  39 |   test('U-05: List all users (non-admin) returns 403', async ({ userToken, apiClient }) => {
  40 |     apiClient.setToken(userToken);
  41 |     const { status } = await apiClient.get('/users/');
  42 | 
  43 |     expect(status).toBe(403);
  44 |   });
  45 | 
  46 |   test('U-06: Update user info returns 200', async ({ userToken, apiClient }) => {
  47 |     apiClient.setToken(userToken);
  48 |     const { data: userData } = await apiClient.get('/users/me');
  49 | 
  50 |     const { status, data } = await apiClient.put(`/users/${userData.id}`, {
  51 |       displayName: 'Updated Name',
  52 |     });
  53 | 
  54 |     expect(status).toBe(200);
  55 |     expect(data).toHaveProperty('displayName', 'Updated Name');
  56 |   });
  57 | 
  58 |   test('U-07: Delete user (ADMIN only) returns 200', async ({ adminToken, apiClient }) => {
  59 |     apiClient.setToken(adminToken);
  60 | 
  61 |     // First create a user to delete
  62 |     const newUser = {
  63 |       username: `deleteuser_${Date.now()}@test.com`,
  64 |       email: `deleteuser_${Date.now()}@test.com`,
  65 |       password: 'Delete1234!',
  66 |     };
  67 |     const createRes = await apiClient.register(newUser.username, newUser.email, newUser.password);
  68 |     const userId = createRes.data.id;
  69 | 
  70 |     // Delete user
  71 |     const { status } = await apiClient.delete(`/users/${userId}`);
  72 |     expect(status).toBe(200);
  73 |   });
  74 | 
  75 |   test('U-08: Duplicate email registration returns 400', async ({ apiClient }) => {
  76 |     const { status } = await apiClient.register(
  77 |       TEST_USERS.user1.username,
  78 |       TEST_USERS.user1.email,
  79 |       'DifferentPass123!',
  80 |     );
  81 | 
  82 |     expect(status).toBe(400);
  83 |   });
  84 | 
  85 |   test('U-09: Invalid registration data returns 400', async ({ apiClient }) => {
  86 |     const { status } = await apiClient.register('ab', 'invalid-email', 'short');
  87 | 
> 88 |     expect(status).toBe(400);
     |                    ^ Error: expect(received).toBe(expected) // Object.is equality
  89 |   });
  90 | });
  91 | 
```