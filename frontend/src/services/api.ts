import { PaginatedResponse } from '@/types';

// Base API URL (from .env or fallback)
const API_BASE_URL =
  import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiService {
  private baseURL: string;
  private defaultHeaders: HeadersInit;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL.replace(/\/+$/, ''); // remove trailing slashes
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private buildUrl(port: number, path: string): string {
    const cleanPath = path.replace(/^\/+/, '');
    return `${this.baseURL}:${port}/${cleanPath}`;
  }
  /**
   * Generic request method
   */
  private async request<T>(
    port: number,
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T & { httpStatus: number }> {
    const url = this.buildUrl(port, endpoint);

    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...(options.headers || {}),
      },
    };

    const response = await fetch(url, config);

    // Safely parse JSON without using "any"
    let data: unknown;
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      const message =
        typeof data === 'object' && data !== null && 'message' in data
          ? String((data as { message?: string }).message)
          : 'An error occurred';
      const code =
        typeof data === 'object' && data !== null && 'code' in data
          ? String((data as { code?: string }).code)
          : undefined;

      throw new ApiError(message, response.status, code);
    }

    // Ensure the result matches expected type
    return { ...(data as T), httpStatus: response.status };
  }

  /**
   * Standard CRUD methods
   */
  async get<T>(port: number, endpoint: string): Promise<T & { httpStatus: number }> {
    return this.request<T>(port, endpoint, { method: 'GET' });
  }

  async post<T>(
    port: number,
    endpoint: string,
    data?: unknown,
  ): Promise<T & { httpStatus: number }> {
    return this.request<T>(port, endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(
    port: number,
    endpoint: string,
    data?: unknown,
  ): Promise<T & { httpStatus: number }> {
    return this.request<T>(port, endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(port: number, endpoint: string): Promise<T & { httpStatus: number }> {
    return this.request<T>(port, endpoint, { method: 'DELETE' });
  }

  /**
   * Paginated GET
   */
  async getPaginated<T>(
    port: number,
    endpoint: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponse<T> & { httpStatus: number }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    return this.get<PaginatedResponse<T>>(port, `${endpoint}?${params.toString()}`);
  }

  /**
   * Auth token management
   */
  setAuthToken(token: string) {
    this.defaultHeaders = {
      ...this.defaultHeaders,
      Authorization: `Bearer ${token}`,
    };
  }

  clearAuthToken() {
    const { _Authorization, ...headers } = this.defaultHeaders as Record<string, string>;
    this.defaultHeaders = headers;
  }
}

export const apiService = new ApiService();
export { ApiError, ApiService };
