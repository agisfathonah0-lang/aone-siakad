import { pool, query } from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.resolve(__dirname, 'migrations');

async function runMigrations(): Promise<void> {
  console.log('[MIGRATE] Starting...');

  await query(`CREATE TABLE IF NOT EXISTS public.migrations (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    applied_at TIMESTAMPTZ DEFAULT NOW()
  )`);

  const { rows: applied } = await query('SELECT filename FROM public.migrations ORDER BY filename');
  const appliedFiles = new Set(applied.map((r: any) => r.filename));

  const files = fs.readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql') && !f.includes('tenant_template'))
    .sort();

  for (const file of files) {
    if (appliedFiles.has(file)) {
      console.log(`[MIGRATE] Skipping ${file} (already applied)`);
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    console.log(`[MIGRATE] Applying ${file}...`);

    try {
      await query(sql);
      await query('INSERT INTO public.migrations (filename) VALUES ($1)', [file]);
      console.log(`[MIGRATE] ✅ ${file} applied`);
    } catch (err: any) {
      console.error(`[MIGRATE] ❌ ${file} failed:`, err.message);
      process.exit(1);
    }
  }

  console.log('[MIGRATE] Done');
}

async function createMigration(): Promise<void> {
  const name = process.argv[3];
  if (!name) {
    console.error('Usage: npm run migrate:create -- <name>');
    process.exit(1);
  }

  const existing = fs.readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  const lastNum = existing.length > 0
    ? parseInt(existing[existing.length - 1].split('_')[0], 10)
    : 0;

  const nextNum = String(lastNum + 1).padStart(3, '0');
  const filename = `${nextNum}_${name}.sql`;
  const filepath = path.join(migrationsDir, filename);

  fs.writeFileSync(filepath, `-- ${filename}\n`);
  console.log(`[MIGRATE] Created: ${filename}`);
}

async function main(): Promise<void> {
  const cmd = process.argv[2];

  if (cmd === '--create') {
    await createMigration();
  } else {
    await runMigrations();
  }

  await pool.end();
}

main().catch((err) => {
  console.error('[MIGRATE] Fatal:', err);
  process.exit(1);
});
