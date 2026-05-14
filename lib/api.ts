// InsightaLabs API Client

const API_BASE_URL = 'https://insightalabs-production.up.railway.app';

export interface Profile {
  id: string;
  name: string;
  gender: string;
  gender_probability: number;
  age: number;
  age_group: string;
  country_id: string;
  country_name: string | null;
  country_probability: number;
  created_at: string;
}

export interface ProfilesListResponse {
  status: 'success';
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  links: {
    self: string;
    next: string | null;
    prev: string | null;
  };
  data: Profile[];
}

export interface ProfileResponse {
  status: 'success';
  data: Profile;
  message?: string;
}

export interface User {
  id: string;
  github_id: string;
  username: string;
  email: string;
  avatar_url: string;
  role: string;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
}

interface MeResponse {
  status: 'success';
  user: User;
}

export interface IngestResponse {
  status: 'success';
  total_rows: number;
  inserted: number;
  skipped: number;
  reasons: {
    duplicate_name: number;
    invalid_age: number;
    missing_fields: number;
    invalid_gender: number;
    malformed_row: number;
  };
}

class ApiClient {
  // All requests go out with credentials:include so HttpOnly cookies are sent automatically.
  // No localStorage, no Bearer token needed for the web portal.
  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    needsApiVersion = false
  ): Promise<T> {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (needsApiVersion) {
      headers['x-api-version'] = '1';
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // No-ops — auth is cookie-only, no localStorage needed
  setTokens(_a: string, _b: string) {}
  clearTokens() {}
  getAccessToken() { return null; }

  // ── Auth ──────────────────────────────────────────────────────────────────

  getGitHubAuthUrl() {
    return `${API_BASE_URL}/auth/github`;
  }

  async refreshToken(): Promise<void> {
    await this.request('/auth/refresh', { method: 'POST' });
  }

  async logout(): Promise<void> {
    await this.request('/auth/logout', { method: 'POST' });
  }

  async getMe(): Promise<User> {
    // FIX: /api/users/me requires x-api-version: 1 — was missing before, causing auth to fail
    const response = await this.request<MeResponse>('/api/users/me', {}, true);
    return response.user;
  }

  // ── Profiles (all require x-api-version: 1) ──────────────────────────────

  async getProfiles(params?: {
    page?: number;
    limit?: number;
    gender?: string;
    age_group?: string;
    country_id?: string;
    min_age?: number;
    max_age?: number;
    min_gender_probability?: number;
    min_country_probability?: number;
    sort_by?: 'age' | 'created_at' | 'gender_probability';
    order?: 'asc' | 'desc';
  }): Promise<ProfilesListResponse> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return this.request<ProfilesListResponse>(
      `/api/profiles${query ? `?${query}` : ''}`,
      {},
      true
    );
  }

  async getProfile(id: string): Promise<Profile> {
    const response = await this.request<ProfileResponse>(`/api/profiles/${id}`, {}, true);
    return response.data;
  }

  async searchProfiles(
    q: string,
    params?: { page?: number; limit?: number }
  ): Promise<ProfilesListResponse> {
    const sp = new URLSearchParams({ q });
    if (params?.page !== undefined) sp.append('page', String(params.page));
    if (params?.limit !== undefined) sp.append('limit', String(params.limit));
    return this.request<ProfilesListResponse>(`/api/profiles/search?${sp.toString()}`, {}, true);
  }

  async createProfile(name: string): Promise<Profile> {
    const response = await this.request<ProfileResponse>(
      '/api/profiles',
      { method: 'POST', body: JSON.stringify({ name }) },
      true
    );
    return response.data;
  }

  async deleteProfile(id: string): Promise<void> {
    await this.request(`/api/profiles/${id}`, { method: 'DELETE' }, true);
  }

  // ── Ingestion (admin only) ────────────────────────────────────────────────

  async ingestCSV(file: File): Promise<IngestResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.request<IngestResponse>(
      '/api/ingest',
      { method: 'POST', body: formData },
      true
    );
  }
}

export const api = new ApiClient();

export const fetcher = <T>(endpoint: string): Promise<T> => {
  return api.request<T>(endpoint, {}, true);
};