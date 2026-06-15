import { query } from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.resolve(__dirname, 'migrations');

export async function runPublicMigrations(): Promise<void> {
  await query(`CREATE TABLE IF NOT EXISTS public.migrations (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    applied_at TIMESTAMPTZ DEFAULT NOW()
  )`);

  const { rows: applied } = await query('SELECT filename FROM public.migrations ORDER BY filename');
  const appliedFiles = new Set(applied.map((r: any) => r.filename));

  const files = fs.readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql') && f.startsWith('p'))
    .sort();

  for (const file of files) {
    if (appliedFiles.has(file)) continue;

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');

    try {
      await query(sql);
      await query('INSERT INTO public.migrations (filename) VALUES ($1)', [file]);
      console.log(`[PublicMigrate] ✅ ${file}`);
    } catch (err: any) {
      console.error(`[PublicMigrate] ❌ ${file} - ${err.message}`);
      throw err;
    }
  }
}
