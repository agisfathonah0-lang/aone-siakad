import http from 'http';
import app from './app.js';
import { config } from './config/index.js';
import { pool } from './config/database.js';
import { getRedis, closeRedis } from './config/redis.js';
import { ensureBuckets } from './config/minio.js';
import { runPublicMigrations } from './database/migrate-public.js';
import { initWebSocket } from './services/websocket.js';

async function bootstrap(): Promise<void> {
  try {
    await pool.connect();
    console.log('[DB] Connected to PostgreSQL');
    await runPublicMigrations();

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
