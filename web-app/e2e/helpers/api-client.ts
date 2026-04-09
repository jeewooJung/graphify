import { APIRequestContext } from '@playwright/test';
import { API_BASE_URL } from './test-data';

/**
 * Helper class for making API requests in E2E tests
 */
export class ApiClient {
  constructor(private request: APIRequestContext, private token?: string) {}

  setToken(token: string) {
    this.token = token;
  }

  private getHeaders(contentType = 'application/json') {
    const headers: Record<string, string> = {
      'Content-Type': contentType,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async get<T>(path: string): Promise<{ status: number; data: T }> {
    const response = await this.request.get(`${API_BASE_URL}${path}`, {
      headers: this.getHeaders(),
    });

    const data = await response.json();
    return { status: response.status(), data };
  }

  async post<T>(path: string, body: any): Promise<{ status: number; data: T }> {
    const response = await this.request.post(`${API_BASE_URL}${path}`, {
      headers: this.getHeaders(),
      data: body,
    });

    const data = await response.json();
    return { status: response.status(), data };
  }

  async put<T>(path: string, body: any): Promise<{ status: number; data: T }> {
    const response = await this.request.put(`${API_BASE_URL}${path}`, {
      headers: this.getHeaders(),
      data: body,
    });

    const data = await response.json();
    return { status: response.status(), data };
  }

  async delete<T>(path: string): Promise<{ status: number; data: T }> {
    const response = await this.request.delete(`${API_BASE_URL}${path}`, {
      headers: this.getHeaders(),
    });

    let data;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    return { status: response.status(), data };
  }

  async login(username: string, password: string): Promise<string> {
    const response = await this.post('/auth/login', { username, password });

    if (response.status !== 200) {
      throw new Error(`Login failed: ${response.status}`);
    }

    const token = response.data.token;
    this.setToken(token);
    return token;
  }

  async register(username: string, email: string, password: string, displayName?: string) {
    return this.post('/users/register', {
      username,
      email,
      password,
      displayName,
    });
  }

  async validateToken(token: string): Promise<{ status: number; data: any }> {
    return this.request
      .get(`${API_BASE_URL}/auth/validate`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(async (response) => ({
        status: response.status(),
        data: await response.json(),
      }));
  }
}
