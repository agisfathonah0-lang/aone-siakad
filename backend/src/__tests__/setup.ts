import { beforeAll, afterAll } from 'vitest';
import { pool, query } from '../config/database.js';
import { config } from '../config/index.js';
import { runTenantMigrations } from '../database/tenant-migrate.js';
import { runPublicMigrations } from '../database/migrate-public.js';

process.env.NODE_ENV = 'test';

beforeAll(async () => {
  try {
    await pool.query('SELECT 1');
    console.log('[Test] DB connected');
    await runPublicMigrations();
    await runTenantMigrations('tenant_contoh');
    const { rows } = await query("SELECT id FROM tenant_contoh.program_studi LIMIT 1");
    if (rows.length > 0) {
      (global as any).__PRODI_ID__ = rows[0].id;
    }
  } catch (err: any) {
    console.error('[Test] DB connection failed:', err.message);
  }
});

afterAll(async () => {
  await pool.end();
});
