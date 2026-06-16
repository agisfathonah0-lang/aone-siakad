import { config } from '../config/index.js';

const PING_INTERVAL = 10 * 60 * 1000;

export function startKeepAlive(): void {
  if (config.env !== 'production') {
    console.log('[KeepAlive] Skipped (non-production)');
    return;
  }

  const baseUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${config.port}`;
  const url = `${baseUrl}${config.apiPrefix}/health`;

  async function ping() {
    try {
      const res = await fetch(url);
      console.log(`[KeepAlive] Pinged → ${res.status}`);
    } catch (err: any) {
      console.warn(`[KeepAlive] Ping failed: ${err.message}`);
    }
  }

  ping();
  setInterval(ping, PING_INTERVAL);
  console.log(`[KeepAlive] Started — pinging every ${PING_INTERVAL / 60000} minutes`);
}
