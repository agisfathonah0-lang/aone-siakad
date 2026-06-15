import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from './errorHandler.js';

export function validate(req: Request, _res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const mapped: Record<string, string> = {};
    errors.array().forEach((err) => {
      if ('path' in err) {
        mapped[err.path as string] = err.msg;
      }
    });
    throw new AppError(422, 'Validasi gagal', mapped);
  }
  next();
}
