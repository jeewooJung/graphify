# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 02-auth.spec.ts >> Authentication Flow >> A-01: Register new user returns 201
- Location: e2e\scenarios\02-auth.spec.ts:12:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 201
Received: 401
```

# Test source

```ts
  1  | import { test, expect } from '../fixtures/auth.fixture';
  2  | import { TEST_USERS } from '../helpers/test-data';
  3  | import { ApiClient } from '../helpers/api-client';
  4  | 
  5  | test.describe('Authentication Flow', () => {
  6  |   let apiClient: ApiClient;
  7  | 
  8  |   test.beforeEach(async ({ request }) => {
  9  |     apiClient = new ApiClient(request);
  10 |   });
  11 | 
  12 |   test('A-01: Register new user returns 201', async () => {
  13 |     const newUser = {
  14 |       username: `newuser_${Date.now()}@test.com`,
  15 |       email: `newuser_${Date.now()}@test.com`,
  16 |       password: 'TestPass123!',
  17 |       displayName: 'New User',
  18 |     };
  19 | 
  20 |     const { status, data } = await apiClient.register(
  21 |       newUser.username,
  22 |       newUser.email,
  23 |       newUser.password,
  24 |       newUser.displayName,
  25 |     );
  26 | 
> 27 |     expect(status).toBe(201);
     |                    ^ Error: expect(received).toBe(expected) // Object.is equality
  28 |     expect(data).toHaveProperty('id');
  29 |     expect(data).toHaveProperty('username', newUser.username);
  30 |     expect(data).toHaveProperty('email', newUser.email);
  31 |   });
  32 | 
  33 |   test('A-02: Valid login returns 200 with token', async () => {
  34 |     const { status, data } = await apiClient.post('/auth/login', {
  35 |       username: TEST_USERS.user1.username,
  36 |       password: TEST_USERS.user1.password,
  37 |     });
  38 | 
  39 |     expect(status).toBe(200);
  40 |     expect(data).toHaveProperty('token');
  41 |     expect(data).toHaveProperty('type', 'Bearer');
  42 |     expect(data).toHaveProperty('username', TEST_USERS.user1.username);
  43 |   });
  44 | 
  45 |   test('A-03: Invalid password login returns 401', async () => {
  46 |     const { status, data } = await apiClient.post('/auth/login', {
  47 |       username: TEST_USERS.user1.username,
  48 |       password: 'WrongPassword123!',
  49 |     });
  50 | 
  51 |     expect(status).toBe(401);
  52 |   });
  53 | 
  54 |   test('A-04: Non-existent user login returns 401', async () => {
  55 |     const { status } = await apiClient.post('/auth/login', {
  56 |       username: 'nonexistent@test.com',
  57 |       password: TEST_USERS.user1.password,
  58 |     });
  59 | 
  60 |     expect(status).toBe(401);
  61 |   });
  62 | 
  63 |   test('A-05: Validate token with valid JWT returns 200', async ({ userToken }) => {
  64 |     const { status, data } = await apiClient.validateToken(userToken);
  65 | 
  66 |     expect(status).toBe(200);
  67 |     expect(data).toHaveProperty('valid', true);
  68 |     expect(data).toHaveProperty('userId');
  69 |   });
  70 | 
  71 |   test('A-06: Invalid token validation returns 401', async () => {
  72 |     const { status } = await apiClient.validateToken('invalid.token.here');
  73 | 
  74 |     expect(status).toBe(401);
  75 |   });
  76 | 
  77 |   test('A-07: Logout endpoint returns 200', async ({ userToken }) => {
  78 |     apiClient.setToken(userToken);
  79 |     const { status, data } = await apiClient.post('/auth/logout', {});
  80 | 
  81 |     expect(status).toBe(200);
  82 |     expect(data).toHaveProperty('message');
  83 |   });
  84 | });
  85 | 
```