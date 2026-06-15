import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/role.js';
import { sendSuccess } from '../../middleware/response.js';
import { query } from '../../config/database.js';
import { Role } from '../../types/enums.js';

const router = Router();

router.get(
  '/stats',
  authenticate,
  requireRole(Role.SUPER_ADMIN),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const [{ rows: tenantRows }, { rows: activeTenants }, { rows: vendorUsers }] = await Promise.all([
        query('SELECT COUNT(*) as total FROM public.tenants'),
        query("SELECT COUNT(*) as total FROM public.tenants WHERE is_active = true"),
        query('SELECT COUNT(*) as total FROM public.vendor_users'),
      ]);

      const { rows: recentTenants } = await query('SELECT id, slug, name, nama_pt, paket, is_active, created_at FROM public.tenants ORDER BY created_at DESC LIMIT 5');

      let totalStudents = 0;
      const { rows: allTenants } = await query('SELECT schema_name FROM public.tenants WHERE is_active = true');
      for (const t of allTenants) {
        try {
          const { rows } = await query(`SELECT COUNT(*) as c FROM "${t.schema_name}".mahasiswa`);
          totalStudents += parseInt(rows[0].c);
        } catch { continue; }
      }

      sendSuccess(res, {
        totalTenants: parseInt(tenantRows[0].total),
        activeTenants: parseInt(activeTenants[0].total),
        totalVendorUsers: parseInt(vendorUsers[0].total),
        totalStudents,
        recentTenants,
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/campus-stats',
  authenticate,
  requireRole(Role.SUPER_ADMIN),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const { rows: campuses } = await query('SELECT * FROM public.tenants ORDER BY created_at DESC');
      const result = await Promise.all(campuses.map(async (c: any) => {
        const s = `"${c.schema_name}"`;
        try {
          const [{ rows: mhs }, { rows: dosen }, { rows: users }] = await Promise.all([
            query(`SELECT COUNT(*) as count FROM ${s}.mahasiswa`),
            query(`SELECT COUNT(*) as count FROM ${s}.dosen`),
            query(`SELECT COUNT(*) as count FROM ${s}.users`),
          ]);
          return {
            ...c,
            _studentCount: parseInt(mhs[0].count),
            _lecturerCount: parseInt(dosen[0].count),
            _userCount: parseInt(users[0].count),
          };
        } catch {
          return { ...c, _studentCount: 0, _lecturerCount: 0, _userCount: 0 };
        }
      }));
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/audit-logs',
  authenticate,
  requireRole(Role.SUPER_ADMIN),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const logs: any[] = [];
      const { rows: tenants } = await query('SELECT schema_name, name FROM public.tenants WHERE is_active = true');
      for (const t of tenants) {
        try {
          const { rows } = await query(`SELECT p.*, '${t.name}' as tenant_name FROM "${t.schema_name}".pddikti_sync_runs p ORDER BY p.started_at DESC LIMIT 5`);
          logs.push(...rows);
        } catch { continue; }
      }
      logs.sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
      sendSuccess(res, logs.slice(0, 20));
    } catch (err) {
      next(err);
    }
  }
);

export default router;
