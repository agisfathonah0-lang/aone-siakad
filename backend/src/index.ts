import http from 'http';
import app from './app.js';
import { config } from './config/index.js';
import { pool, query } from './config/database.js';
import { getRedis, closeRedis } from './config/redis.js';
import { ensureBuckets } from './config/minio.js';
import { runPublicMigrations } from './database/migrate-public.js';
import { initWebSocket } from './services/websocket.js';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';

async function autoSeed(): Promise<void> {
  const { rows } = await query('SELECT COUNT(*)::int AS cnt FROM public.vendor_users');
  if (rows[0].cnt > 0) return;

  console.log('[Seed] No vendor admin found — auto-seeding defaults...');

  const hash = await bcrypt.hash('admin123', 12);
  await query(
    `INSERT INTO public.vendor_users (id, email, password_hash, nama, role)
     VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING`,
    [uuid(), 'admin@aone-project.com', hash, 'Super Admin', 'super_admin']
  );
  console.log('[Seed] Vendor admin: admin@aone-project.com / admin123');
}

async function bootstrap(): Promise<void> {
  try {
    await pool.connect();
    console.log('[DB] Connected to PostgreSQL');
    await runPublicMigrations();
    await autoSeed();

    try {
      const redis = getRedis();
      await redis.ping();
      console.log('[Redis] Connected');
    } catch {
      console.warn('[Redis] Not available — running without Redis');
    }

    try {
      await ensureBuckets();
      console.log('[MinIO] Buckets ready');
    } catch {
      console.warn('[MinIO] Not available — running without MinIO');
    }

    const server = http.createServer(app);
    initWebSocket(server);

    server.listen(config.port, () => {
      console.log(`[Server] AONE SIAKAD API v2 running on port ${config.port}`);
      console.log(`[Server] Environment: ${config.env}`);
    });
  } catch (err) {
    console.error('[Bootstrap] Failed:', err);
    process.exit(1);
  }
}

process.on('SIGTERM', async () => {
  console.log('[Server] SIGTERM received, shutting down...');
  await pool.end();
  await closeRedis();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[Server] SIGINT received, shutting down...');
  await pool.end();
  await closeRedis();
  process.exit(0);
});

bootstrap();
