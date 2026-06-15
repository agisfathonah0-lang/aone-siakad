import { Router, Request, Response, NextFunction } from 'express';
import os from 'os';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/role.js';
import { sendSuccess } from '../../middleware/response.js';
import { query } from '../../config/database.js';
import { Role } from '../../types/enums.js';

const router = Router();
const startTime = Date.now();

router.get('/', authenticate, requireRole(Role.SUPER_ADMIN), async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const cpus = os.cpus();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    const cpuLoad = cpus.reduce((acc, cpu) => {
      const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
      const idle = cpu.times.idle;
      return acc + ((total - idle) / total) * 100;
    }, 0) / cpus.length;

    const { rows: tenantRows } = await query('SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE is_active) as active FROM public.tenants');
    const { rows: ticketRows } = await query('SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = \'Terbuka\') as open FROM public.tickets');

    const uptime = Math.floor((Date.now() - startTime) / 1000);
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);

    sendSuccess(res, {
      server: {
        hostname: os.hostname(),
        platform: os.platform(),
        arch: os.arch(),
        uptime: `${days}d ${hours}h ${minutes}m`,
        uptimeSeconds: uptime,
        startTime: new Date(startTime).toISOString(),
        nodeVersion: process.version,
      },
      cpu: {
        usage: Math.round(cpuLoad * 10) / 10,
        cores: cpus.length,
        model: cpus[0]?.model || 'N/A',
      },
      memory: {
        total: Math.round(totalMem / 1024 / 1024),
        used: Math.round(usedMem / 1024 / 1024),
        free: Math.round(freeMem / 1024 / 1024),
        usagePercent: Math.round((usedMem / totalMem) * 100),
      },
      tenants: {
        total: parseInt(tenantRows[0]?.total || '0'),
        active: parseInt(tenantRows[0]?.active || '0'),
      },
      tickets: {
        total: parseInt(ticketRows[0]?.total || '0'),
        open: parseInt(ticketRows[0]?.open || '0'),
      },
    });
  } catch (err) { next(err); }
});

export default router;
