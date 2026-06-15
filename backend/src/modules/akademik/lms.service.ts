import { query } from '../../config/database.js';

interface LmsConfig {
  id: string; platform: string; base_url: string;
  api_token: string; sync_mahasiswa: boolean;
  sync_nilai: boolean; sync_jadwal: boolean;
  is_active: boolean;
}

export async function getLmsConfig(schema: string): Promise<LmsConfig | null> {
  const { rows } = await query(`SELECT * FROM ${schema}.lms_config LIMIT 1`, []);
  return rows[0] || null;
}

export async function moodleFetch(
  baseUrl: string,
  token: string,
  wsfunction: string,
  params: Record<string, any> = {}
): Promise<{ ok: boolean; data?: any; error?: string }> {
  const url = baseUrl.replace(/\/+$/, '') + '/webservice/rest/server.php';
  const body = new URLSearchParams({
    wstoken: token,
    wsfunction,
    moodlewsrestformat: 'json',
  });
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) {
      if (Array.isArray(v)) {
        v.forEach((item, i) => {
          for (const [ik, iv] of Object.entries(item)) {
            body.append(`${k}[${i}][${ik}]`, String(iv));
          }
        });
      } else {
        body.append(k, String(v));
      }
    }
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, { method: 'POST', body, signal: controller.signal });
    const text = await res.text();
    if (!text) return { ok: false, error: 'Respon kosong dari Moodle' };
    const json = JSON.parse(text);
    if (json.errorcode) return { ok: false, error: json.message || json.errorcode };
    return { ok: true, data: json };
  } catch (err: any) {
    return { ok: false, error: err.message || 'Gagal terhubung ke Moodle' };
  } finally {
    clearTimeout(timer);
  }
}

export async function testConnection(cfg: LmsConfig): Promise<{ ok: boolean; message: string; siteinfo?: any }> {
  const result = await moodleFetch(cfg.base_url, cfg.api_token, 'core_webservice_get_site_info');
  if (result.ok) {
    return {
      ok: true,
      message: `Terhubung ke ${result.data.sitename || 'Moodle'} (v${result.data.version || '?'})`,
      siteinfo: result.data,
    };
  }
  return { ok: false, message: result.error || 'Gagal terhubung' };
}

export async function syncMahasiswa(schema: string, cfg: LmsConfig): Promise<{ synced: number; errors: string[] }> {
  const { rows: mahasiswa } = await query(
    `SELECT m.nim, m.nama, m.email, m.telp, u.email as user_email
     FROM ${schema}.mahasiswa m LEFT JOIN ${schema}.users u ON u.id = m.user_id
     WHERE m.is_active = true`,
    []
  );

  let synced = 0;
  const errors: string[] = [];

  for (const m of mahasiswa) {
    const email = m.email || m.user_email;
    if (!email) { errors.push(`${m.nama}: tidak punya email`); continue; }

    const searchResult = await moodleFetch(cfg.base_url, cfg.api_token, 'core_user_get_users_by_field', {
      field: 'email', values: [email],
    });

    if (!searchResult.ok) {
      errors.push(`${m.nama}: ${searchResult.error}`);
      continue;
    }

    if (Array.isArray(searchResult.data) && searchResult.data.length > 0) {
      const existing = searchResult.data[0];
      const upd: Record<string, any> = {};
      if (existing.firstname !== m.nama) upd.firstname = m.nama;
      if (existing.email !== email) upd.email = email;
      if (existing.idnumber !== m.nim) upd.idnumber = m.nim;

      if (Object.keys(upd).length > 0) {
        const updResult = await moodleFetch(cfg.base_url, cfg.api_token, 'core_user_update_users', {
          users: [{ id: existing.id, ...upd }],
        });
        if (!updResult.ok) errors.push(`${m.nama}: gagal update - ${updResult.error}`);
        else synced++;
      } else {
        synced++;
      }
    } else {
      const createResult = await moodleFetch(cfg.base_url, cfg.api_token, 'core_user_create_users', {
        users: [{
          username: m.nim || email,
          password: m.nim || 'Password123!',
          firstname: m.nama,
          lastname: '',
          email,
          idnumber: m.nim || '',
        }],
      });
      if (!createResult.ok) errors.push(`${m.nama}: gagal create - ${createResult.error}`);
      else synced++;
    }
  }

  await query(
    `INSERT INTO ${schema}.lms_sync_log (entity_type, action, status, records_count, error_message)
     VALUES ($1, $2, $3, $4, $5)`,
    ['mahasiswa', 'sync', errors.length === 0 ? 'success' : 'partial', synced, errors.slice(0, 5).join('; ')]
  );

  return { synced, errors };
}

export async function syncNilai(schema: string, cfg: LmsConfig): Promise<{ synced: number; errors: string[] }> {
  const coursesResult = await moodleFetch(cfg.base_url, cfg.api_token, 'core_course_get_courses');
  if (!coursesResult.ok) return { synced: 0, errors: [coursesResult.error || 'Gagal ambil kursus'] };

  const courses = Array.isArray(coursesResult.data) ? coursesResult.data : [];
  let synced = 0;
  const errors: string[] = [];

  for (const course of courses) {
    if (!course.id) continue;
    const gradesResult = await moodleFetch(cfg.base_url, cfg.api_token, 'gradereport_user_get_grades_table', {
      courseid: course.id,
    });
    if (!gradesResult.ok) continue;

    const tables = gradesResult.data?.tables || [];
    for (const table of tables) {
      const items = table.items || table.grades || [];
      if (!Array.isArray(items)) continue;
      for (const item of items) {
        if (!item.userid && !item.id) continue;
        const userId = item.userid || item.id;
        const grade = item.grade?.grade || item.str_grade || '';
        const maxGrade = item.grade?.grademax || item.str_maxgrade || 100;

        await query(
          `INSERT INTO ${schema}.lms_sync_log (entity_type, action, status, records_count, error_message)
           VALUES ($1, $2, $3, $4, $5)`,
          ['nilai', 'sync_detail', 'success', 1, `course=${course.id}&user=${userId}&grade=${grade}`]
        );
        synced++;
      }
    }
  }

  await query(
    `INSERT INTO ${schema}.lms_sync_log (entity_type, action, status, records_count, error_message)
     VALUES ($1, $2, $3, $4, $5)`,
    ['nilai', 'sync', 'success', synced, errors.length > 0 ? errors.slice(0, 3).join('; ') : null]
  );

  return { synced, errors };
}

export async function syncJadwal(schema: string, cfg: LmsConfig): Promise<{ synced: number; errors: string[] }> {
  const result = await moodleFetch(cfg.base_url, cfg.api_token, 'core_course_get_courses');
  if (!result.ok) return { synced: 0, errors: [result.error || 'Gagal ambil kursus'] };

  const courses = Array.isArray(result.data) ? result.data : [];

  await query(
    `INSERT INTO ${schema}.lms_sync_log (entity_type, action, status, records_count, error_message)
     VALUES ($1, $2, $3, $4, $5)`,
    ['jadwal', 'sync', 'success', courses.length, null]
  );

  return { synced: courses.length, errors: [] };
}
