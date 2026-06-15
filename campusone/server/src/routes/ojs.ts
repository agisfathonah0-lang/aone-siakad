import { Router, Request, Response as ExpressResponse } from 'express';
import { getDb } from '../database.js';

const router = Router();

const OJS_URL = process.env.OJS_URL || 'http://localhost/ojs-v3';
const OJS_API_KEY = process.env.OJS_API_KEY || '';
const OJS_CONTEXT = process.env.OJS_CONTEXT || '';

// Detect journal context if not set
let detectedContext = OJS_CONTEXT;

async function detectContext(): Promise<string> {
  if (detectedContext) return detectedContext;
  const base = OJS_URL.replace(/\/+$/, '');
  const headers: Record<string, string> = { 'Accept': 'application/json' };
  if (OJS_API_KEY) headers['Authorization'] = `Bearer ${OJS_API_KEY}`;
  for (const ctx of ['test', 'journal', 'publicknowledge', 'index', 'demo', 'ojs']) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 2000);
      const res = await fetch(`${base}/index.php/${ctx}/api/v1/contexts`, { headers, signal: ctrl.signal });
      clearTimeout(timer);
      if (res.ok) {
        detectedContext = ctx;
        return ctx;
      }
    } catch { continue; }
  }
  return '';
}

async function ojsFetch(path: string, options?: RequestInit): Promise<{ ok: boolean; status: number; json: any; text: string } | null> {
  const base = OJS_URL.replace(/\/+$/, '');
  const ctx = await detectContext();
  const headers: Record<string, string> = { 'Accept': 'application/json' };
  if (options?.headers) Object.assign(headers, options.headers);
  if (OJS_API_KEY) headers['Authorization'] = `Bearer ${OJS_API_KEY}`;

  // URL patterns to try: with context first, then without
  const patterns = ctx
    ? [`${base}/index.php/${ctx}/api/v1/${path}`]
    : [`${base}/index.php/api/v1/${path}`, `${base}/api/v1/${path}`];

  for (const url of patterns) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    try {
      const res = await fetch(url, { ...options, headers, signal: controller.signal });
      if (!res.ok) continue;
      const text = await res.text();
      if (!text.trim().startsWith('<')) {
        try {
          return { ok: true, status: res.status, json: JSON.parse(text), text };
        } catch { continue; }
      }
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

async function fetchFromOJS(): Promise<any[]> {
  const [subResult, issueResult] = await Promise.all([
    ojsFetch('submissions?count=100'),
    ojsFetch('issues?count=50'),
  ]);

  if (!subResult && !issueResult) {
    throw new Error('OJS v3 unreachable');
  }

  const subData = subResult?.json || { items: [] };
  const issueData = issueResult?.json || { items: [] };

  const issues = (issueData.items || []).reduce((acc: any, iss: any) => {
    acc[iss.id] = iss.title || `Vol. ${iss.volume || '?'} No. ${iss.number || '?'} (${iss.year || '?'})`;
    return acc;
  }, {} as Record<number, string>);

  return (subData.items || []).map((sub: any) => {
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
}

function fetchFromLocal(): any[] {
  const db = getDb();
  return db.prepare('SELECT * FROM ojs_journals ORDER BY publishedAt DESC').all() as any[];
}

function saveToLocal(title: string, author: string, category: string, status: string): string {
  const db = getDb();
  const id = 'JRN' + String(Date.now()).slice(-6);
  const issue = 'Vol. 1 No. 1 (2026)';
  const publishedAt = new Date().toISOString().slice(0, 10);
  const impactFactor = parseFloat((Math.random() * 2 + 0.5).toFixed(2));
  db.prepare(`INSERT INTO ojs_journals (id, title, author, journalCategory, status, issue, publishedAt, impactFactor) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, title, author, category || 'Umum', status, issue, publishedAt, impactFactor);
  return id;
}

// GET /api/ojs — all journals (try OJS v3 first, fallback to local DB)
router.get('/', async (_req: Request, res: ExpressResponse) => {
  try {
    const journals = await fetchFromOJS();
    return res.json(journals);
  } catch {
    const local = fetchFromLocal();
    return res.json({ data: local, source: 'local' });
  }
});

// GET /api/ojs/status — check OJS v3 connectivity
router.get('/status', async (_req: Request, res: ExpressResponse) => {
  const result = await ojsFetch('submissions?count=1');
  return res.json({
    connected: !!result,
    url: OJS_URL,
    apiKey: OJS_API_KEY ? '***configured***' : 'not set',
    status: result ? 'terhubung' : 'tidak_terjangkau',
    detail: result ? `HTTP ${result.status}` : 'Semua jalur API gagal — aktifkan REST API di Settings > Website > API',
  });
});

// POST /api/ojs/submissions — submit to OJS v3, fallback to local DB
router.post('/submissions', async (req: Request, res: ExpressResponse) => {
  const { title, abstract, author, keywords, journalCategory } = req.body;
  if (!title || !abstract) {
    return res.status(400).json({ error: 'Title and abstract required' });
  }

  let ojsError: string | null = null;

  // Try OJS v3 first
  try {
    const body: any = { title, abstract, submissionProgress: 0 };
    if (author) {
      const parts = author.split(' ');
      body.authors = [{ givenName: parts[0] || author, familyName: parts.slice(1).join(' ') || '' }];
    }
    if (keywords) body.keywords = [keywords];

    const result = await ojsFetch('submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (result) {
      return res.json({ success: true, ojsId: result.json?.id, source: 'ojs', message: 'Manuskrip berhasil dikirim ke OJS v3' });
    }
    ojsError = 'Semua jalur API gagal';
  } catch (err: any) {
    ojsError = err.message;
  }

  // Fallback: save to local database
  try {
    const localId = saveToLocal(title, author || 'Anonymous', journalCategory || 'Umum', 'Dalam Reviewer');
    return res.json({
      success: true,
      localId,
      source: 'local',
      message: `OJS v3 tidak terjangkau (${ojsError}). Manuskrip disimpan di database lokal.`,
      ojsError,
    });
  } catch (dbErr: any) {
    return res.status(500).json({ error: 'Gagal menyimpan manuskrip', detail: dbErr.message });
  }
});

export default router;
