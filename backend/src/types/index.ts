export * from './enums.js';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string>;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  roles?: string[];
  tenantId: string | null;
  type: 'access' | 'refresh';
  vendorUserId?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginatedResult<T> {
  rows: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
