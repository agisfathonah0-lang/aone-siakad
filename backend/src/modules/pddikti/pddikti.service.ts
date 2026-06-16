import { query as dbQuery } from '../../config/database.js';
import { AppError } from '../../middleware/errorHandler.js';

interface PddiktiConfig {
  feeder_url: string;
  username: string;
  password: string;
  database_name: string;
  is_active: boolean;
}

interface SyncResult {
  synced: number;
  failed: number;
  errors: any[];
}

export async function getConfig(schema: string): Promise<PddiktiConfig | null> {
  const { rows } = await dbQuery(
    `SELECT feeder_url, username, password, database_name, is_active FROM ${schema}.pddikti_config LIMIT 1`
  );
  return rows.length > 0 ? rows[0] : null;
}

export async function getToken(cfg: PddiktiConfig): Promise<string> {
  const url = `${cfg.feeder_url.replace(/\/+$/, '')}/getToken`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: cfg.username,
      password: cfg.password,
      database: cfg.database_name,
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Gagal autentikasi: ${res.status} ${res.statusText}`);
  const text = await res.text();
  const data = tryParse(text);
  if (!data) throw new Error('Respons token tidak valid');
  if (typeof data === 'string') return data;
  if (data.token) return data.token;
  if (data.error_code) throw new Error(`Error Feeder: ${data.error_code} - ${data.error_desc || ''}`);
  throw new Error('Format token tidak dikenal');
}

function tryParse(text: string): any {
  try { return JSON.parse(text); } catch { return null; }
}

async function callFeeder(cfg: PddiktiConfig, token: string, act: string, params: Record<string, any> = {}): Promise<any> {
  const url = cfg.feeder_url.replace(/\/+$/, '');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ act, token, ...params }),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  const text = await res.text();
  const data = tryParse(text);
  if (!data) throw new Error('Respons tidak valid');
  if (data.error_code && data.error_code !== '0') {
    throw new Error(`Error Feeder: ${data.error_code} - ${data.error_desc || JSON.stringify(data)}`);
  }
  return data;
}

async function pushToFeeder(
  cfg: PddiktiConfig, token: string, entity: string, records: any[], keyField: string
): Promise<{ synced: number; failed: number; errors: any[] }> {
  let synced = 0;
  let failed = 0;
  const errors: any[] = [];

  for (const record of records) {
    try {
      const existing = await callFeeder(cfg, token, 'GetRecord', {
        name: entity,
        filter: `{ "${keyField}": "${record[keyField] || ''}" }`,
      });
      if (existing && existing.result && existing.result.length > 0) {
        await callFeeder(cfg, token, 'UpdateRecord', {
          name: entity,
          data: JSON.stringify(record),
          id: existing.result[0].id,
        });
      } else {
        await callFeeder(cfg, token, 'InsertRecord', {
          name: entity,
          data: JSON.stringify(record),
        });
      }
      synced++;
    } catch (err: any) {
      failed++;
      errors.push({ record, error: err.message });
    }
  }

  return { synced, failed, errors };
}

export async function syncPddikti(schema: string, entityType: string): Promise<SyncResult> {
  const cfg = await getConfig(schema);
  if (!cfg || !cfg.is_active) throw new AppError(400, 'PDDIKTI Feeder belum dikonfigurasi');
  if (!cfg.feeder_url || !cfg.username || !cfg.password || !cfg.database_name) {
    throw new AppError(400, 'Konfigurasi PDDIKTI tidak lengkap');
  }

  const token = await getToken(cfg);

  let records: any[] = [];
  let entity = '';
  let keyField = '';

  switch (entityType) {
    case 'Mahasiswa':
      entity = 'Mahasiswa';
      keyField = 'nim';
      records = await getMahasiswaData(schema);
      break;
    case 'Dosen':
      entity = 'Dosen';
      keyField = 'nidn';
      records = await getDosenData(schema);
      break;
    case 'KRS':
      entity = 'AktivitasKuliahMahasiswa';
      keyField = 'id';
      records = await getKrsData(schema);
      break;
    case 'Nilai':
      entity = 'Nilai';
      keyField = 'id';
      records = await getNilaiData(schema);
      break;
    default:
      throw new AppError(400, `Tipe entitas ${entityType} tidak didukung`);
  }

  return pushToFeeder(cfg, token, entity, records, keyField);
}

async function getMahasiswaData(schema: string): Promise<any[]> {
  const { rows } = await dbQuery(`
    SELECT
      m.nim,
      m.nama,
      m.tempat_lahir,
      m.tanggal_lahir::text as tanggal_lahir,
      m.jenis_kelamin,
      m.alamat,
      m.no_hp,
      u.email,
      p.kode as prodi_kode,
      p.nama as prodi_nama
    FROM ${schema}.mahasiswa m
    LEFT JOIN ${schema}.users u ON u.id = m.user_id
    LEFT JOIN ${schema}.prodi p ON p.id = m.prodi_id
    WHERE m.status = 'aktif'
  `);
  return rows;
}

async function getDosenData(schema: string): Promise<any[]> {
  const { rows } = await dbQuery(`
    SELECT
      d.nidn,
      d.nama,
      d.tempat_lahir,
      d.tanggal_lahir::text as tanggal_lahir,
      d.jenis_kelamin,
      d.alamat,
      d.no_hp,
      u.email,
      d.nidn as nidn_karyawan
    FROM ${schema}.dosen d
    LEFT JOIN ${schema}.users u ON u.id = d.user_id
    WHERE d.nidn IS NOT NULL
  `);
  return rows;
}

async function getKrsData(schema: string): Promise<any[]> {
  const { rows } = await dbQuery(`
    SELECT
      k.id,
      m.nim as mahasiswa_nim,
      mk.kode as mk_kode,
      jk.semester,
      jk.tahun_akademik,
      jk.hari,
      jk.jam_mulai,
      jk.jam_selesai
    FROM ${schema}.krs k
    JOIN ${schema}.jadwal_kuliah jk ON jk.id = k.jadwal_id
    JOIN ${schema}.mahasiswa m ON m.id = k.mahasiswa_id
    JOIN ${schema}.mata_kuliah mk ON mk.id = jk.mata_kuliah_id
    WHERE k.status = 'disetujui'
  `);
  return rows;
}

async function getNilaiData(schema: string): Promise<any[]> {
  const { rows } = await dbQuery(`
    SELECT
      n.id,
      m.nim as mahasiswa_nim,
      mk.kode as mk_kode,
      n.nilai_akhir,
      n.nilai_huruf,
      jk.semester,
      jk.tahun_akademik,
      mk.sks
    FROM ${schema}.nilai n
    JOIN ${schema}.krs k ON k.id = n.krs_id
    JOIN ${schema}.mahasiswa m ON m.id = k.mahasiswa_id
    JOIN ${schema}.jadwal_kuliah jk ON jk.id = k.jadwal_id
    JOIN ${schema}.mata_kuliah mk ON mk.id = jk.mata_kuliah_id
    WHERE n.nilai_akhir IS NOT NULL
  `);
  return rows;
}
