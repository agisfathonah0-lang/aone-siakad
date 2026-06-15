import { Request, Response, NextFunction } from 'express';
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

  console.error('[ERROR]', err.stack || err.message);
  res.status(500).json({
    success: false,
    message: config.env === 'production'
      ? 'Terjadi kesalahan internal server'
      : err.message,
  });
}
