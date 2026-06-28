import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { config } from '../config/index.js';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public errors?: Record<string, string>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

let errorIdCounter = 0;
function generateErrorId(): string {
  const ts = Date.now().toString(36).slice(-4);
  const n = (++errorIdCounter % 9999).toString().padStart(4, '0');
  return `E${ts}${n}`;
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
    return;
  }

  const errorId = generateErrorId();
  console.error(`[ERROR ${errorId}]`, err.stack || err.message);
  res.status(500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan internal server',
    error_id: errorId,
  });
}
