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
    const cleanHost = host.split(':')[0];

    if (!cleanHost || cleanHost === 'localhost' || host.includes('localhost')) {
      req.tenant = null;
      return next();
    }

    const domainResult = await query(
      `SELECT id, slug, schema_name, name, paket, custom_domain, subscription_end_date FROM public.tenants WHERE custom_domain = $1 AND is_active = true`,
      [cleanHost]
    );

    if (domainResult.rows.length > 0) {
      req.tenant = mapTenant(domainResult.rows[0]);
      return next();
    }

    const subdomain = cleanHost.split('.')[0];
    if (!subdomain || subdomain === 'www' || subdomain === cleanHost) {
      req.tenant = null;
      return next();
    }

    const slugResult = await query(
      `SELECT id, slug, schema_name, name, paket, custom_domain, subscription_end_date FROM public.tenants WHERE slug = $1 AND is_active = true`,
      [subdomain]
    );

    req.tenant = slugResult.rows.length > 0 ? mapTenant(slugResult.rows[0]) : null;
    next();
  } catch (err) {
    next(err);
  }
}
