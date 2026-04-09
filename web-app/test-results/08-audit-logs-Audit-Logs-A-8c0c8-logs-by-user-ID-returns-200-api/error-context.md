# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 08-audit-logs.spec.ts >> Audit Logs (Admin Only) >> AL-03: Get logs by user ID returns 200
- Location: e2e\scenarios\08-audit-logs.spec.ts:19:7

# Error details

```
Error: Login failed: 401
```

# Test source

```ts
  1   | import { APIRequestContext } from '@playwright/test';
  2   | import { API_BASE_URL } from './test-data';
  3   | 
  4   | /**
  5   |  * Helper class for making API requests in E2E tests
  6   |  */
  7   | export class ApiClient {
  8   |   constructor(private request: APIRequestContext, private token?: string) {}
  9   | 
  10  |   setToken(token: string) {
  11  |     this.token = token;
  12  |   }
  13  | 
  14  |   private getHeaders(contentType = 'application/json') {
  15  |     const headers: Record<string, string> = {
  16  |       'Content-Type': contentType,
  17  |     };
  18  | 
  19  |     if (this.token) {
  20  |       headers['Authorization'] = `Bearer ${this.token}`;
  21  |     }
  22  | 
  23  |     return headers;
  24  |   }
  25  | 
  26  |   async get<T>(path: string): Promise<{ status: number; data: T }> {
  27  |     const response = await this.request.get(`${API_BASE_URL}${path}`, {
  28  |       headers: this.getHeaders(),
  29  |     });
  30  | 
  31  |     const data = await response.json();
  32  |     return { status: response.status(), data };
  33  |   }
  34  | 
  35  |   async post<T>(path: string, body: any): Promise<{ status: number; data: T }> {
  36  |     const response = await this.request.post(`${API_BASE_URL}${path}`, {
  37  |       headers: this.getHeaders(),
  38  |       data: body,
  39  |     });
  40  | 
  41  |     const data = await response.json();
  42  |     return { status: response.status(), data };
  43  |   }
  44  | 
  45  |   async put<T>(path: string, body: any): Promise<{ status: number; data: T }> {
  46  |     const response = await this.request.put(`${API_BASE_URL}${path}`, {
  47  |       headers: this.getHeaders(),
  48  |       data: body,
  49  |     });
  50  | 
  51  |     const data = await response.json();
  52  |     return { status: response.status(), data };
  53  |   }
  54  | 
  55  |   async delete<T>(path: string): Promise<{ status: number; data: T }> {
  56  |     const response = await this.request.delete(`${API_BASE_URL}${path}`, {
  57  |       headers: this.getHeaders(),
  58  |     });
  59  | 
  60  |     let data;
  61  |     try {
  62  |       data = await response.json();
  63  |     } catch {
  64  |       data = null;
  65  |     }
  66  | 
  67  |     return { status: response.status(), data };
  68  |   }
  69  | 
  70  |   async login(username: string, password: string): Promise<string> {
  71  |     const response = await this.post('/auth/login', { username, password });
  72  | 
  73  |     if (response.status !== 200) {
> 74  |       throw new Error(`Login failed: ${response.status}`);
      |             ^ Error: Login failed: 401
  75  |     }
  76  | 
  77  |     const token = response.data.token;
  78  |     this.setToken(token);
  79  |     return token;
  80  |   }
  81  | 
  82  |   async register(username: string, email: string, password: string, displayName?: string) {
  83  |     return this.post('/users/register', {
  84  |       username,
  85  |       email,
  86  |       password,
  87  |       displayName,
  88  |     });
  89  |   }
  90  | 
  91  |   async validateToken(token: string): Promise<{ status: number; data: any }> {
  92  |     return this.request
  93  |       .get(`${API_BASE_URL}/auth/validate`, {
  94  |         headers: {
  95  |           Authorization: `Bearer ${token}`,
  96  |         },
  97  |       })
  98  |       .then(async (response) => ({
  99  |         status: response.status(),
  100 |         data: await response.json(),
  101 |       }));
  102 |   }
  103 | }
  104 | 
```