import { Response } from 'express';
import { ApiResponse } from '../types/index.js';

export function sendSuccess<T>(res: Response, data: T, message?: string, statusCode = 200): void {
  const body: ApiResponse<T> = { success: true, data };
  if (message) body.message = message;
  res.status(statusCode).json(body);
}

export function sendError(res: Response, message: string, statusCode = 400, errors?: Record<string, string>): void {
  const body: ApiResponse = { success: false, message };
  if (errors) body.errors = errors;
  res.status(statusCode).json(body);
}

export function sendPaginated<T>(
  res: Response,
  rows: T[],
  total: number,
  page: number,
  limit: number
): void {
  const totalPages = Math.ceil(total / limit);
  res.status(200).json({
    success: true,
    data: {
      rows,
      pagination: { total, page, limit, totalPages },
    },
  });
}
