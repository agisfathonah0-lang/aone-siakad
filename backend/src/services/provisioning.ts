import { query } from '../config/database.js';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { runTenantMigrations } from '../database/tenant-migrate.js';

export interface CreateTenantInput {
  slug: string;
  name: string;
  nama_pt: string;
  singkatan?: string;
  alamat?: string;
  telepon?: string;
  email?: string;
  paket?: string;
  adminEmail: string;
  adminPassword: string;
  adminNama: string;
  isActive?: boolean;
  subscriptionEndDate?: string;
}

export async function createTenant(input: CreateTenantInput) {
  const schemaName = `tenant_${input.slug.replace(/[^a-z0-9]/g, '_')}`;
  const tenantId = uuid();

  const client = await import('../config/database.js').then((m) => m.pool.connect());

  try {
    await client.query('BEGIN');

    const existing = await client.query(
      'SELECT id FROM public.tenants WHERE slug = $1',
      [input.slug]
    );
    if (existing.rows.length > 0) {
      throw new Error(`Slug "${input.slug}" sudah digunakan`);
    }

      await client.query(
        `INSERT INTO public.tenants (id, slug, schema_name, name, nama_pt, singkatan, alamat, telepon, email, paket, is_active, subscription_end_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          tenantId, input.slug, schemaName, input.name, input.nama_pt,
          input.singkatan || null, input.alamat || null, input.telepon || null,
          input.email || null, input.paket || 'basic', input.isActive !== false,
          input.subscriptionEndDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        ]
      );

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    client.release();
    throw err;
  }

  client.release();

  try {
    await runTenantMigrations(schemaName);

    const passwordHash = await bcrypt.hash(input.adminPassword, 12);
    const adminId = uuid();

    await query(
      `INSERT INTO "${schemaName}".users (id, email, password_hash, role, nama)
       VALUES ($1, $2, $3, $4, $5)`,
      [adminId, input.adminEmail, passwordHash, 'admin', input.adminNama]
    );

    console.log(`[Provisioning] ✅ Tenant ${input.slug} created with schema ${schemaName}`);
  } catch (err) {
    console.error(`[Provisioning] ❌ Tenant ${input.slug} created but migration failed:`, err);
    throw err;
  }

  return { tenantId, schemaName };
}

export async function deleteTenant(id: string) {
  const { rows } = await query('SELECT id, slug, schema_name FROM public.tenants WHERE id = $1', [id]);
  if (rows.length === 0) throw new Error('Tenant tidak ditemukan');
  const tenant = rows[0];
  const client = await import('../config/database.js').then((m) => m.pool.connect());
  try {
    await client.query('BEGIN');
    await client.query(`DROP SCHEMA IF EXISTS "${tenant.schema_name}" CASCADE`);
    await client.query('DELETE FROM public.tenant_settings WHERE tenant_id = $1', [tenant.id]);
    await client.query('DELETE FROM public.tenants WHERE id = $1', [tenant.id]);
    await client.query('COMMIT');
    console.log(`[Provisioning] ✅ Tenant ${tenant.slug} deleted with schema ${tenant.schema_name}`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
  return { slug: tenant.slug };
}
