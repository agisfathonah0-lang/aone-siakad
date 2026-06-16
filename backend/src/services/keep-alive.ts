import http from 'http';
import { config } from '../config/index.js';

const PING_INTERVAL = 10 * 60 * 1000; // every 10 minutes

export function startKeepAlive(): void {
  if (config.env !== 'production') {
    console.log('[KeepAlive] Skipped (non-production)');
    return;
  }

  const baseUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${config.port}`;

  function ping() {
    const url = `${baseUrl}${config.apiPrefix}/health`;
    http.get(url, (res) => {
      console.log(`[KeepAlive] Pinged ${url} → ${res.statusCode}`);
    }).on('error', (err) => {
      console.warn(`[KeepAlive] Ping failed: ${err.message}`);
    });
  }

  ping();
  setInterval(ping, PING_INTERVAL);
  console.log(`[KeepAlive] Started — pinging every ${PING_INTERVAL / 60000} minutes`);
}
