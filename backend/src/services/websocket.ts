import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import type { JwtPayload } from '../types/index.js';

let wss: any = null;

export function initWebSocket(server: HttpServer): void {
  try {
    const { WebSocketServer } = require('ws');
    wss = new WebSocketServer({ server, path: '/ws' });

    wss.on('connection', (ws: any, req: any) => {
      const params = new URL(req.url, 'http://localhost').searchParams;
      const token = params.get('token');
      if (!token) { ws.close(4001, 'Token required'); return; }

      let payload: JwtPayload | null = null;
      for (const secret of [config.jwt.campusSecret, config.jwt.vendorSecret]) {
        try {
          payload = jwt.verify(token, secret) as JwtPayload;
          break;
        } catch { continue; }
      }

      if (!payload) { ws.close(4001, 'Invalid token'); return; }

      ws.userId = payload.sub;
      ws.role = payload.role;
      ws.tenantId = payload.tenantId || null;
    });

    console.log('[WebSocket] Server initialized');
  } catch {
    console.log('[WebSocket] ws package not available, skipping');
  }
}

export function sendToUser(userId: string, event: string, data: any): void {
  if (!wss) return;
  wss.clients.forEach((client: any) => {
    if (client.userId === userId && client.readyState === 1) {
      client.send(JSON.stringify({ event, data }));
    }
  });
}

export function sendToTenant(tenantId: string, event: string, data: any): void {
  if (!wss) return;
  wss.clients.forEach((client: any) => {
    if (client.tenantId === tenantId && client.readyState === 1) {
      client.send(JSON.stringify({ event, data }));
    }
  });
}

export function broadcast(event: string, data: any): void {
  if (!wss) return;
  wss.clients.forEach((client: any) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify({ event, data }));
    }
  });
}
