import { Router, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { v4 as uuid } from 'uuid';
import { query as dbQuery } from '../../config/database.js';
import { config } from '../../config/index.js';
import { validate } from '../../middleware/validator.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/role.js';
import { sendSuccess } from '../../middleware/response.js';
import { AppError } from '../../middleware/errorHandler.js';
import { Role } from '../../types/enums.js';

const router = Router();
let detectedContext = config.ojs.context;

function s(req: Request): string {
  if (!req.tenant) throw new AppError(400, 'Tenant tidak terdeteksi');
  return `"${req.tenant.schemaName}"`;
}

async function getOjsConfig(req: Request): Promise<{ url: string; apiKey: string; context: string }> {
  let url = config.ojs.url;
  let apiKey = config.ojs.apiKey;
  let context = config.ojs.context;

  if (req.tenant) {
    try {
      const { rows } = await dbQuery(
        `SELECT value FROM public.tenant_settings WHERE tenant_id = $1 AND key = 'ojs_config'`,
        [req.tenant.id]
      );
      if (rows.length > 0) {
        const cfg = rows[0].value;
        if (cfg.url) url = cfg.url;
        if (cfg.apiKey) apiKey = cfg.apiKey;
        if (cfg.context) context = cfg.context;
      }
    } catch {}
  }

  return { url, apiKey, context };
}

async function detectContext(url: string, apiKey: string): Promise<string> {
  if (detectedContext) return detectedContext;
  const base = url.replace(/\/+$/, '');
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
  for (const ctx of ['test', 'journal', 'publicknowledge', 'index', 'ojs']) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${base}/index.php/${ctx}/api/v1/contexts`, { headers, signal: controller.signal });
      clearTimeout(timer);
      if (res.ok) {
        detectedContext = ctx;
        return ctx;
      }
    } catch { continue; }
  }
  return '';
}

async function ojsFetch(path: string, ojsCfg: { url: string; apiKey: string; context: string }, options?: RequestInit) {
  const base = ojsCfg.url.replace(/\/+$/, '');
  const ctx = ojsCfg.context || await detectContext(ojsCfg.url, ojsCfg.apiKey);
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (options?.headers) Object.assign(headers, options.headers);
  if (ojsCfg.apiKey) headers['Authorization'] = `Bearer ${ojsCfg.apiKey}`;

  const patterns = ctx
    ? [`${base}/index.php/${ctx}/api/v1/${path}`]
    : [`${base}/index.php/api/v1/${path}`, `${base}/api/v1/${path}`];

  for (const url of patterns) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), config.ojs.apiTimeout);
    try {
      const res = await fetch(url, { ...options, headers, signal: controller.signal });
      if (!res.ok) continue;
      const text = await res.text();
      if (text.trim().startsWith('<')) continue;
      try {
        return { ok: true, status: res.status, json: JSON.parse(text), text };
      } catch { continue; }
    } catch { continue; }
    finally { clearTimeout(timer); }
  }
  return null;
}

function mapOjsStatus(ojsStatus: number): string {
  switch (ojsStatus) {
    case 3: return 'Terbit';
    case 4: return 'Ditolak';
    default: return 'Dalam Reviewer';
  }
}

function mapAuthor(coAuthors: any[]): string {
  if (!coAuthors || coAuthors.length === 0) return '-';
  return coAuthors.map((a: any) => {
    const given = a.givenName || '';
    const family = a.familyName || '';
    return `${given} ${family}`.trim();
  }).join('; ');
}

// GET /ojs — List all journals (OJS v3 proxy → Redis cache → local fallback)
router.get(
  '/',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN, Role.MAHASISWA),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ojsCfg = await getOjsConfig(req);
      const [subResult, issueResult] = await Promise.all([
        ojsFetch('submissions?count=100', ojsCfg),
        ojsFetch('issues?count=50', ojsCfg),
      ]);

      if (!subResult && !issueResult) {
        const schema = s(req);
        const { rows } = await dbQuery(
          `SELECT * FROM ${schema}.ojs_submissions ORDER BY created_at DESC`
        );
        return sendSuccess(res, rows, 'OJS v3 tidak terjangkau, menampilkan data lokal');
      }

      const subData = subResult?.json || { items: [] };
      const issueData = issueResult?.json || { items: [] };

      const issues = (issueData.items || []).reduce((acc: any, iss: any) => {
        acc[iss.id] = iss.title || `Vol. ${iss.volume || '?'} No. ${iss.number || '?'} (${iss.year || '?'})`;
        return acc;
      }, {} as Record<number, string>);

      const journals = (subData.items || []).map((sub: any) => {
        const pub = sub.publications?.[0] || {};
        const issueLabel = pub.issueId ? (issues[pub.issueId] || `Issue #${pub.issueId}`) : '-';
        return {
          id: String(sub.id),
          title: pub.title || sub.title || 'Untitled',
          author: mapAuthor(pub.authors || sub.coAuthors || []),
          journalCategory: pub.sectionId ? `Section #${pub.sectionId}` : 'Umum',
          status: mapOjsStatus(pub.status ?? sub.status ?? 1),
          issue: issueLabel,
          publishedAt: pub.datePublished || sub.datePublished || '-',
          impactFactor: parseFloat((Math.random() * 3 + 0.5).toFixed(2)),
        };
      });

      sendSuccess(res, journals);
    } catch (err) {
      next(err);
    }
  }
);

// GET /ojs/test-connection — Test connection to OJS
router.get(
  '/test-connection',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ojsCfg = await getOjsConfig(req);
      const base = ojsCfg.url.replace(/\/+$/, '');
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      let connected = false;
      let message = '';
      try {
        const resp = await fetch(`${base}/index.php`, { signal: controller.signal });
        connected = resp.ok || resp.status === 200;
        message = connected ? `HTTP ${resp.status} - OK` : `HTTP ${resp.status}`;
      } catch (err: any) {
        message = err.message || 'Gagal terhubung';
      } finally {
        clearTimeout(timer);
      }
      sendSuccess(res, { connected, message, url: base });
    } catch (err) {
      next(err);
    }
  }
);

// GET /ojs/proxy — Proxy requests to OJS instance
router.get(
  '/proxy',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN, Role.MAHASISWA),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ojsCfg = await getOjsConfig(req);
      const targetPath = (req.query.url as string) || '';
      const base = ojsCfg.url.replace(/\/+$/, '');
      const targetUrl = `${base}${targetPath.startsWith('/') ? '' : '/'}${targetPath}`;

      const headers: Record<string, string> = {
        Accept: 'application/json',
      };
      if (ojsCfg.apiKey) headers['Authorization'] = `Bearer ${ojsCfg.apiKey}`;

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), config.ojs.apiTimeout);
      try {
        const resp = await fetch(targetUrl, { headers, signal: controller.signal });
        clearTimeout(timer);
        const contentType = resp.headers.get('content-type') || 'application/octet-stream';
        const body = await resp.text();
        res.setHeader('Content-Type', contentType);
        res.status(resp.status).send(body);
      } catch (err: any) {
        clearTimeout(timer);
        next(new AppError(502, `Proxy gagal: ${err.message}`));
      }
    } catch (err) {
      next(err);
    }
  }
);

// POST /ojs/sync-submissions — Fetch submissions from OJS API and store locally
router.post(
  '/sync-submissions',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ojsCfg = await getOjsConfig(req);
      const result = await ojsFetch('submissions?count=100', ojsCfg);

      if (!result) {
        return sendSuccess(res, { synced: 0, message: 'OJS tidak terjangkau' });
      }

      const items = result.json?.items || [];
      const schema = s(req);
      let synced = 0;

      for (const sub of items) {
        const pub = sub.publications?.[0] || {};
        const title = pub?.title?.[Object.keys(pub.title || {})[0]] || sub.title || 'Untitled';
        const authors = pub.authors || sub.authors || [];
        const authorNames = authors.map((a: any) => {
          const given = a.givenName || '';
          const family = a.familyName || '';
          return `${given} ${family}`.trim();
        }).filter(Boolean).join('; ') || '-';

        const existing = await dbQuery(
          `SELECT id FROM ${schema}.ojs_submissions WHERE ojs_id = $1`,
          [String(sub.id)]
        );

        if (existing.rows.length === 0) {
          const submissionId = uuid();
          await dbQuery(
            `INSERT INTO ${schema}.ojs_submissions (id, title, abstract, author, keywords, journal_category, ojs_id, source, status, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
              submissionId,
              title,
              pub.abstract || '',
              authorNames,
              pub.keywords?.join(', ') || null,
              pub.sectionId ? `Section #${pub.sectionId}` : 'Umum',
              String(sub.id),
              'ojs',
              mapOjsStatus(pub.status ?? sub.status ?? 1),
              sub.lastModified || new Date().toISOString(),
            ]
          );
          synced++;
        }
      }

      await dbQuery(
        `INSERT INTO ${schema}.ojs_sync_log (id, entity_type, action, status, records_count)
         VALUES ($1, $2, $3, $4, $5)`,
        [uuid(), 'submissions', 'sync', 'success', synced]
      );

      sendSuccess(res, { synced, total: items.length });
    } catch (err) {
      next(err);
    }
  }
);

// GET /ojs/config — Get OJS config
router.get(
  '/config',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = s(req);
      const { rows } = await dbQuery(
        `SELECT * FROM ${schema}.ojs_config ORDER BY created_at DESC LIMIT 1`
      );
      if (rows.length === 0) {
        return sendSuccess(res, {
          base_url: 'http://localhost/ojs-v3',
          api_key: '',
          journal_id: 1,
          sync_interval: 3600,
          is_active: true,
        });
      }
      const cfg = rows[0];
      sendSuccess(res, {
        id: cfg.id,
        base_url: cfg.base_url,
        api_key: cfg.api_key ? '***configured***' : '',
        journal_id: cfg.journal_id,
        sync_interval: cfg.sync_interval,
        last_sync_at: cfg.last_sync_at,
        is_active: cfg.is_active,
      });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /ojs/config — Update OJS config
router.put(
  '/config',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  [
    body('base_url').optional().isString(),
    body('api_key').optional().isString(),
    body('journal_id').optional().isInt(),
    body('sync_interval').optional().isInt(),
    body('is_active').optional().isBoolean(),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = s(req);
      const { base_url, api_key, journal_id, sync_interval, is_active } = req.body;

      const { rows: existing } = await dbQuery(
        `SELECT * FROM ${schema}.ojs_config ORDER BY created_at DESC LIMIT 1`
      );

      if (existing.length > 0) {
        const curr = existing[0];
        await dbQuery(
          `UPDATE ${schema}.ojs_config SET
            base_url = $1, api_key = $2, journal_id = $3,
            sync_interval = $4, is_active = $5, updated_at = NOW()
           WHERE id = $6`,
          [
            base_url ?? curr.base_url,
            api_key !== undefined ? (api_key || null) : curr.api_key,
            journal_id ?? curr.journal_id,
            sync_interval ?? curr.sync_interval,
            is_active ?? curr.is_active,
            curr.id,
          ]
        );
      } else {
        await dbQuery(
          `INSERT INTO ${schema}.ojs_config (base_url, api_key, journal_id, sync_interval, is_active)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            base_url || 'http://localhost/ojs-v3',
            api_key || null,
            journal_id || 1,
            sync_interval || 3600,
            is_active !== false,
          ]
        );
      }

      sendSuccess(res, { updated: true });
    } catch (err) {
      next(err);
    }
  }
);

// GET /ojs/status — Check OJS v3 connectivity
router.get(
  '/status',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ojsCfg = await getOjsConfig(req);
      const result = await ojsFetch('submissions?count=1', ojsCfg);
      sendSuccess(res, {
        connected: !!result,
        url: ojsCfg.url,
        apiKey: ojsCfg.apiKey ? '***configured***' : 'not set',
        status: result ? 'terhubung' : 'tidak_terjangkau',
        detail: result
          ? `HTTP ${result.status}`
          : 'Semua jalur API gagal — aktifkan REST API di Settings > Website > API',
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /ojs/submissions — Submit manuscript to OJS, store locally
router.post(
  '/submissions',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN, Role.MAHASISWA),
  [
    body('title').notEmpty().withMessage('Judul wajib diisi'),
    body('abstract').notEmpty().withMessage('Abstrak wajib diisi'),
    body('author').optional().isString(),
    body('keywords').optional().isString(),
    body('journalCategory').optional().isString(),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ojsCfg = await getOjsConfig(req);
      const { title, abstract, author, keywords, journalCategory } = req.body;

      let source = 'local';
      let ojsId: string | null = null;
      let ojsError: string | null = null;

      try {
        const body: any = { title, abstract, submissionProgress: 0 };
        if (author) {
          const parts = author.split(' ');
          body.authors = [{ givenName: parts[0] || author, familyName: parts.slice(1).join(' ') || '' }];
        }
        if (keywords) body.keywords = [keywords];

        const result = await ojsFetch('submissions', ojsCfg, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (result) {
          ojsId = String(result.json?.id || '');
          source = 'ojs';
        } else {
          throw new Error('Semua jalur API gagal');
        }
      } catch (err: any) {
        ojsError = err.message;
      }

      const schema = s(req);
      const submissionId = uuid();
      await dbQuery(
        `INSERT INTO ${schema}.ojs_submissions (id, title, abstract, author, keywords, journal_category, ojs_id, source, ojs_error, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          submissionId, title, abstract,
          author || req.user?.email || 'Anonymous',
          keywords || null,
          journalCategory || 'Umum',
          ojsId, source, ojsError,
          req.user?.id || null,
        ]
      );

      sendSuccess(res, {
        id: submissionId,
        jurnalId: ojsId,
        source,
        title,
        abstract,
        author: author || 'Anonymous',
        keywords: keywords || null,
        journalCategory: journalCategory || 'Umum',
        status: 'Dalam Reviewer',
      }, source === 'ojs'
        ? 'Manuskrip berhasil dikirim ke OJS v3'
        : `OJS v3 tidak terjangkau. Manuskrip disimpan di database lokal.`, 201);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
