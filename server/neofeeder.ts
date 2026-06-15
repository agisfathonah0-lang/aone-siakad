import express from 'express';
import cors from 'cors';
import { getDb } from './src/database.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const tokens = new Map<string, { pt: string; expires: number }>();

function generateToken(): string {
  return 'NF' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 8).toUpperCase();
}

function requireToken(token: string | undefined): { error: string } | null {
  if (!token) return { error: 'Token tidak ditemukan' };
  const session = tokens.get(token);
  if (!session) return { error: 'Token tidak valid' };
  if (Date.now() > session.expires) {
    tokens.delete(token);
    return { error: 'Token sudah expired' };
  }
  return null;
}

function toNeoRows(data: any[]): any[] {
  return data.map((row, i) => ({
    ...row,
    id: row.id || `ROW${String(i + 1).padStart(5, '0')}`,
  }));
}

// ws/live2.php — main Neo Feeder endpoint
app.all('/ws/live2.php', (req, res) => {
  const act = req.query.act || req.body?.act;
  const token = (req.query.token || req.body?.token) as string | undefined;
  const filter = req.query.filter || req.body?.filter || undefined;
  const order = req.query.order || req.body?.order || undefined;
  const limit = parseInt(req.query.limit as string || req.body?.limit || '100');
  const offset = parseInt(req.query.offset as string || req.body?.offset || '0');

  console.log(`[NEO FEEDER] ${req.method} /ws/live2.php act=${act}`);

  const db = getDb();

  switch (act) {
    // === AUTH ===
    case 'GetToken': {
      const username = req.query.username || req.body?.username;
      const password = req.query.password || req.body?.password;
      if (!username || !password) {
        return res.json({ error_code: 1, error_desc: 'Username/password required' });
      }
      const token = generateToken();
      tokens.set(token, { pt: String(username), expires: Date.now() + 3600_000 });
      return res.json({ error_code: 0, data: { token } });
    }

    // === PROFIL PT ===
    case 'GetProfilPT': {
      const err = requireToken(token);
      if (err) return res.json({ error_code: 1, ...err });
      const pt = db.prepare('SELECT * FROM campuses LIMIT 1').get() as any;
      return res.json({
        error_code: 0,
        data: pt ? {
          id_pt: pt.id,
          kode_pt: pt.code,
          nama_pt: pt.name,
          status_pt: pt.status,
          alamat: pt.location,
        } : { id_pt: 'AONE001', kode_pt: 'AONE01', nama_pt: 'AONE Project Demo' },
      });
    }

    // === PRODI ===
    case 'GetProdi': {
      const err = requireToken(token);
      if (err) return res.json({ error_code: 1, ...err });
      const prodis = db.prepare('SELECT DISTINCT prodi FROM students').all() as any[];
      const data = prodis.map((p, i) => ({
        id_prodi: `PRD${String(i + 1).padStart(3, '0')}`,
        kode_prodi: `P${String(i + 1).padStart(3, '0')}`,
        nama_prodi: p.prodi,
        jenjang: 'S1',
      }));
      return res.json({ error_code: 0, data: data.slice(offset, offset + limit) });
    }

    // === MAHASISWA ===
    case 'GetListMahasiswa': {
      const err = requireToken(token);
      if (err) return res.json({ error_code: 1, ...err });
      let query = 'SELECT * FROM students';
      const params: any[] = [];
      if (filter) {
        try {
          const f = JSON.parse(filter as string);
          if (f.prodi) { query += ' WHERE prodi = ?'; params.push(f.prodi); }
        } catch {}
      }
      query += ' ORDER BY name';
      const students = db.prepare(query).all(...params) as any[];
      return res.json({ error_code: 0, data: toNeoRows(students.slice(offset, offset + limit)) });
    }

    case 'GetBiodataMahasiswa': {
      const err = requireToken(token);
      if (err) return res.json({ error_code: 1, ...err });
      const students = db.prepare('SELECT * FROM students').all() as any[];
      return res.json({ error_code: 0, data: toNeoRows(students.slice(offset, offset + limit)) });
    }

    case 'InsertBiodataMahasiswa': {
      const err = requireToken(token);
      if (err) return res.json({ error_code: 1, ...err });
      const data = req.body?.data || req.query?.data;
      if (!data) return res.json({ error_code: 1, error_desc: 'Data required' });
      return res.json({ error_code: 0, data: [{ id: 'ROW' + Date.now().toString().slice(-6) }] });
    }

    case 'UpdateBiodataMahasiswa': {
      const err = requireToken(token);
      if (err) return res.json({ error_code: 1, ...err });
      return res.json({ error_code: 0, data: [{ id: 'ROW' + Date.now().toString().slice(-6) }] });
    }

    // === DOSEN ===
    case 'GetListDosen': {
      const err = requireToken(token);
      if (err) return res.json({ error_code: 1, ...err });
      const lecturers = db.prepare('SELECT * FROM lecturers').all() as any[];
      return res.json({ error_code: 0, data: toNeoRows(lecturers.slice(offset, offset + limit)) });
    }

    case 'GetBiodataDosen': {
      const err = requireToken(token);
      if (err) return res.json({ error_code: 1, ...err });
      const lecturers = db.prepare('SELECT * FROM lecturers').all() as any[];
      return res.json({ error_code: 0, data: toNeoRows(lecturers.slice(offset, offset + limit)) });
    }

    // === MATA KULIAH ===
    case 'GetListMataKuliah': {
      const err = requireToken(token);
      if (err) return res.json({ error_code: 1, ...err });
      const courses = db.prepare('SELECT * FROM courses').all() as any[];
      return res.json({ error_code: 0, data: toNeoRows(courses.slice(offset, offset + limit)) });
    }

    // === KRS / AKTIVITAS KULIAH ===
    case 'GetListAktivitasKuliah': {
      const err = requireToken(token);
      if (err) return res.json({ error_code: 1, ...err });
      const schedules = db.prepare('SELECT * FROM schedules').all() as any[];
      return res.json({ error_code: 0, data: toNeoRows(schedules.slice(offset, offset + limit)) });
    }

    // === NILAI ===
    case 'GetListNilai': {
      const err = requireToken(token);
      if (err) return res.json({ error_code: 1, ...err });
      const courses = db.prepare('SELECT * FROM courses').all() as any[];
      const nilai = courses.map((c: any) => ({
        id_nilai: 'NIL' + c.id,
        id_mk: c.id,
        kode_mk: c.code,
        nama_mk: c.name,
        sks: c.sks,
        nilai_angka: Math.floor(Math.random() * 40) + 60,
        nilai_huruf: ['A','B+','B','C+','C','D'][Math.floor(Math.random() * 6)],
      }));
      return res.json({ error_code: 0, data: nilai.slice(offset, offset + limit) });
    }

    // === DICTIONARY ===
    case 'GetDictionary': {
      const err = requireToken(token);
      if (err) return res.json({ error_code: 1, ...err });
      const fungsi = req.query.fungsi || req.body?.fungsi || '';
      return res.json({
        error_code: 0,
        data: [
          { function_name: fungsi || 'GetListMahasiswa', parameter: ['token', 'filter', 'order', 'limit', 'offset'] },
        ],
      });
    }

    // === COUNT ===
    case 'GetCount': {
      const err = requireToken(token);
      if (err) return res.json({ error_code: 1, ...err });
      const table = (req.query.table || req.body?.table) as string || 'Mahasiswa';
      const count = db.prepare('SELECT COUNT(*) as count FROM students').get() as any;
      return res.json({ error_code: 0, data: [{ count: count?.count || 0 }] });
    }

    default:
      return res.json({ error_code: 1, error_desc: `Unknown action: ${act}` });
  }
});

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Neo Feeder PDDIKTI', version: '3.1.0', port: 3003 });
});

export function startNeoFeeder(port: number = 3003): void {
  app.listen(port, () => {
    console.log(`[NEO FEEDER] Server PDDIKTI berjalan di http://localhost:${port}`);
    console.log(`[NEO FEEDER] Endpoint: http://localhost:${port}/ws/live2.php`);
    console.log(`[NEO FEEDER] Mode: DEMO / SANDBOX (data dari database lokal)`);
  });
}

// Allow running standalone
if (process.argv[1]?.includes('neofeeder')) {
  startNeoFeeder(3003);
}
