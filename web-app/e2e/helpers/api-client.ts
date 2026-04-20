import { APIRequestContext, APIResponse } from '@playwright/test';
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

  private buildUrl(path: string): string {
    // Normalize: if path starts with /api and API_BASE_URL ends with /api, strip /api from path
    if (API_BASE_URL.endsWith('/api') && path.startsWith('/api/')) {
      return `${API_BASE_URL}${path.substring(4)}`;
    }
    return `${API_BASE_URL}${path}`;
  }

  private async parseJson<T>(response: APIResponse): Promise<T> {
    try {
      return (await response.json()) as T;
    } catch {
      return null as unknown as T;
    }
  }

  async get<T>(path: string): Promise<{ status: number; data: T }> {
    const response = await this.request.get(this.buildUrl(path), {
      headers: this.getHeaders(),
    });

    const data = await this.parseJson<T>(response);
    return { status: response.status(), data };
  }

  async post<T>(path: string, body: Record<string, unknown>): Promise<{ status: number; data: T }> {
    const response = await this.request.post(this.buildUrl(path), {
      headers: this.getHeaders(),
      data: body,
    });

    const data = await this.parseJson<T>(response);
    return { status: response.status(), data };
  }

  async put<T>(path: string, body: Record<string, unknown>): Promise<{ status: number; data: T }> {
    const response = await this.request.put(this.buildUrl(path), {
      headers: this.getHeaders(),
      data: body,
    });

    const data = await this.parseJson<T>(response);
    return { status: response.status(), data };
  }

  async delete<T>(path: string): Promise<{ status: number; data: T }> {
    const response = await this.request.delete(this.buildUrl(path), {
      headers: this.getHeaders(),
    });

    const data = await this.parseJson<T>(response);
    return { status: response.status(), data };
  }

  async login(username: string, password: string): Promise<string> {
    const response = await this.post<{ token: string }>('/auth/login', { username, password });

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

  async validateToken(token: string): Promise<{ status: number; data: Record<string, unknown> }> {
    return this.request
      .get(`${API_BASE_URL}/auth/validate`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(async (response) => ({
        status: response.status(),
        data: await this.parseJson<Record<string, unknown>>(response),
      }));
  }
}
