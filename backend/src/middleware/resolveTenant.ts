import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database.js';
import { AppError } from './errorHandler.js';

function mapTenant(row: any) {
  const subEnd = row.subscription_end_date ? new Date(row.subscription_end_date) : null;
  return {
    id: row.id,
    slug: row.slug,
    schemaName: row.schema_name,
    name: row.name,
    paket: row.paket,
    customDomain: row.custom_domain,
    subscriptionEndDate: subEnd?.toISOString() || null,
    subscriptionExpired: subEnd ? subEnd < new Date() : false,
  };
}

export async function resolveTenant(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const tenantHeader = req.headers['x-tenant-slug'] as string | undefined;

    if (tenantHeader) {
      const result = await query(
        `SELECT id, slug, schema_name, name, paket, custom_domain, subscription_end_date FROM public.tenants WHERE slug = $1 AND is_active = true`,
        [tenantHeader]
      );
      req.tenant = result.rows.length > 0 ? mapTenant(result.rows[0]) : null;
      return next();
    }

    const host = req.headers.host || '';
    const subdomain = host.split('.')[0];

    if (!subdomain || subdomain === 'localhost' || subdomain === 'www' || host.includes('localhost')) {
      req.tenant = null;
      return next();
    }

    const result = await query(
      `SELECT id, slug, schema_name, name, paket, custom_domain, subscription_end_date FROM public.tenants WHERE slug = $1 AND is_active = true`,
      [subdomain]
    );

    if (result.rows.length === 0) {
      req.tenant = null;
      return next();
    }

    req.tenant = mapTenant(result.rows[0]);
    next();
  } catch (err) {
    next(err);
  }
}
