import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse, PaginatedResponse } from '../types';

const TOKEN_KEY = 'aone_access_token';
const REFRESH_KEY = 'aone_refresh_token';

const api: AxiosInstance = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  const slug = localStorage.getItem('aone_tenant_slug');
  if (slug && !config.url?.startsWith('/vendor') && !config.url?.startsWith('/auth/vendor')) {
    config.headers['X-Tenant-Slug'] = slug;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry && !original.url?.includes('/auth/')) {
      original._retry = true;
      const refresh = localStorage.getItem(REFRESH_KEY);
      if (refresh) {
        try {
          const { data } = await axios.post('/api/v1/auth/refresh', { refreshToken: refresh });
          if (data.success) {
            localStorage.setItem(TOKEN_KEY, data.data.accessToken);
            original.headers.Authorization = `Bearer ${data.data.accessToken}`;
            return api(original);
          }
        } catch { /* refresh failed */ }
      }
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_KEY);
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export async function get<T>(url: string): Promise<T> {
  const { data } = await api.get<ApiResponse<T>>(url);
  return data.data as T;
}

export async function getPaginated<T>(url: string): Promise<{ rows: T[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> {
  const { data } = await api.get<PaginatedResponse<T>>(url);
  return data.data;
}

export async function post<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await api.post<ApiResponse<T>>(url, body);
  return data.data as T;
}

export async function put<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await api.put<ApiResponse<T>>(url, body);
  return data.data as T;
}

export async function patch<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await api.patch<ApiResponse<T>>(url, body);
  return data.data as T;
}

export async function del<T = void>(url: string): Promise<T> {
  const { data } = await api.delete<ApiResponse<T>>(url);
  return data.data as T;
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem('aone_tenant_slug');
}

export function setTenantSlug(slug: string) {
  localStorage.setItem('aone_tenant_slug', slug);
}

export default api;
