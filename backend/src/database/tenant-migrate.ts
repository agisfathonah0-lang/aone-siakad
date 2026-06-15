import { query } from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.resolve(__dirname, 'migrations');

export async function runTenantMigrations(schemaName: string): Promise<void> {
  const escapedSchema = schemaName.replace(/[^a-z0-9_]/g, '');

  await query(`CREATE SCHEMA IF NOT EXISTS "${escapedSchema}"`);

  const trackTable = `"${escapedSchema}"."migrations"`;
  await query(`
    CREATE TABLE IF NOT EXISTS ${trackTable} (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL,
      applied_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  const { rows: applied } = await query(`SELECT filename FROM ${trackTable} ORDER BY filename`);
  const appliedFiles = new Set(applied.map((r: any) => r.filename));

  const files = fs.readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql') && !f.startsWith('001_') && !f.startsWith('p'))
    .sort();

  for (const file of files) {
    if (appliedFiles.has(file)) {
      continue;
    }

    let sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    sql = sql.replace(/\{schema\}/g, `"${escapedSchema}"`);

    try {
      await query(sql);
      await query(`INSERT INTO ${trackTable} (filename) VALUES ($1)`, [file]);
      console.log(`[TenantMigrate] ✅ ${schemaName}: ${file}`);
    } catch (err: any) {
      console.error(`[TenantMigrate] ❌ ${schemaName}: ${file} - ${err.message}`);
      throw err;
    }
  }
}
