import { ApiResponse, PaginatedResponse } from '@/types';

// Type definitions for fetch API
type HeadersInit = Headers | string[][] | Record<string, string>;
type BodyInit = Blob | FormData | URLSearchParams | string;
type FetchRequestInit = {
  method?: string;
  headers?: HeadersInit;
  body?: BodyInit | null;
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

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
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(
    endpoint: string,
    options: FetchRequestInit = {},
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const config: FetchRequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data.message || 'An error occurred',
          response.status,
          data.code,
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Network error occurred', 0, 'NETWORK_ERROR');
    }
  }

  // Generic CRUD operations
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Paginated requests
  async getPaginated<T>(
    endpoint: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<ApiResponse<PaginatedResponse<T>>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    return this.get<PaginatedResponse<T>>(`${endpoint}?${params}`);
  }

  // Set authentication token
  setAuthToken(token: string) {
    this.defaultHeaders = {
      ...this.defaultHeaders,
      Authorization: `Bearer ${token}`,
    };
  }

  // Remove authentication token
  clearAuthToken() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { Authorization, ...headers } = this.defaultHeaders as Record<
      string,
      string
    >;
    this.defaultHeaders = headers;
  }
}

// Create singleton instance
export const apiService = new ApiService();

// Export the class for testing
export { ApiError, ApiService };
