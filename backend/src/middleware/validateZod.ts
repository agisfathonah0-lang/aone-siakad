import { z, ZodSchema, ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler.js';

export function validateZod<T extends ZodSchema>(schema: T, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const mapped: Record<string, string> = {};
      const zodError = result.error as ZodError;
      zodError.issues.forEach((err) => {
        const path = err.path.join('.');
        mapped[path] = err.message;
      });
      throw new AppError(422, 'Validasi gagal', mapped);
    }
    (req as any)[source] = result.data;
    next();
  };
}
