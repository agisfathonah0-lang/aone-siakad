import { query } from '../../config/database.js';
import { AppError } from '../../middleware/errorHandler.js';

const MODEL_INFO: Record<string, { provider: string; inputCost: number; outputCost: number }> = {
  'gpt-4o-mini': { provider: 'openai', inputCost: 0.15, outputCost: 0.60 },
  'gpt-4o': { provider: 'openai', inputCost: 2.50, outputCost: 10.00 },
  'gemini-2.0-flash': { provider: 'gemini', inputCost: 0.10, outputCost: 0.40 },
  'gemini-2.5-flash': { provider: 'gemini', inputCost: 0.15, outputCost: 0.60 },
  'gemini-1.5-flash': { provider: 'gemini', inputCost: 0.075, outputCost: 0.30 },
};

function schema(req: any): string {
  return req.tenant?.schemaName || 'public';
}

async function getAIConfig(): Promise<{
  apiKey: string; model: string; provider: string; dailyLimit: number; monthlyLimit: number;
}> {
  const { rows } = await query(
    `SELECT setting_key, setting_value FROM public.web_settings
     WHERE setting_key IN ('ai_provider','openai_api_key','gemini_api_key','ai_model','ai_daily_limit','ai_monthly_limit')`
  );
  const cfg: Record<string, string> = {};
  rows.forEach((r: any) => { cfg[r.setting_key] = r.setting_value; });

  const provider = cfg['ai_provider'] || 'openai';
  const apiKey = provider === 'gemini'
    ? (cfg['gemini_api_key'] || process.env.GEMINI_API_KEY || '')
    : (cfg['openai_api_key'] || process.env.OPENAI_API_KEY || '');

  if (!apiKey) throw new AppError(503, `AI tidak dikonfigurasi. Atur API key untuk provider "${provider}" di Pengaturan Platform.`);

  return {
    apiKey,
    model: cfg['ai_model'] || (provider === 'gemini' ? 'gemini-2.0-flash' : 'gpt-4o-mini'),
    provider,
    dailyLimit: parseInt(cfg['ai_daily_limit'] || '100', 10),
    monthlyLimit: parseInt(cfg['ai_monthly_limit'] || '2000', 10),
  };
}

async function checkQuota(req: any): Promise<void> {
  const s = schema(req);
  const config = await getAIConfig();
  const { rows: d } = await query(
    `SELECT COALESCE(total_requests, 0) as cnt FROM "${s}".ai_usage WHERE tgl = CURRENT_DATE`
  );
  if (d.length > 0 && parseInt(d[0].cnt, 10) >= config.dailyLimit) {
    throw new AppError(429, `Batas harian AI tercapai (${config.dailyLimit}/hari). Hubungi admin.`);
  }
  const { rows: m } = await query(
    `SELECT COALESCE(SUM(total_requests), 0) as cnt FROM "${s}".ai_usage
     WHERE tgl >= date_trunc('month', CURRENT_DATE)`
  );
  if (m.length > 0 && parseInt(m[0].cnt, 10) >= config.monthlyLimit) {
    throw new AppError(429, `Batas bulanan AI tercapai (${config.monthlyLimit}/bulan). Hubungi admin.`);
  }
}

async function recordUsage(req: any, inputTokens: number, outputTokens: number): Promise<void> {
  const s = schema(req);
  await query(
    `INSERT INTO "${s}".ai_usage (tgl, input_tokens, output_tokens, total_requests)
     VALUES (CURRENT_DATE, $1, $2, 1)
     ON CONFLICT (tgl) DO UPDATE SET
       input_tokens = ai_usage.input_tokens + $1,
       output_tokens = ai_usage.output_tokens + $2,
       total_requests = ai_usage.total_requests + 1`,
    [inputTokens, outputTokens]
  );
}

async function callOpenAI(apiKey: string, model: string, messages: { role: string; content: string }[], maxTokens: number) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature: 0.7 }),
  });
  if (!res.ok) throw new AppError(502, `OpenAI error: ${await res.text()}`);
  const data = await res.json() as any;
  return {
    content: data.choices?.[0]?.message?.content || 'Maaf, tidak ada respons.',
    inputTokens: data.usage?.prompt_tokens || 0,
    outputTokens: data.usage?.completion_tokens || 0,
    model,
  };
}

async function callGemini(apiKey: string, model: string, messages: { role: string; content: string }[], maxTokens: number) {
  const contents = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));
  const systemInstruction = messages.find(m => m.role === 'system')?.content;

  const body: any = {
    contents,
    generationConfig: { maxOutputTokens: maxTokens, temperature: 0.7 },
  };
  if (systemInstruction) body.systemInstruction = { parts: [{ text: systemInstruction }] };

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new AppError(502, `Gemini error: ${await res.text()}`);
  const data = await res.json() as any;
  const content = data.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('') || 'Maaf, tidak ada respons.';
  const usage = data.usageMetadata || {};
  return {
    content,
    inputTokens: usage.promptTokenCount || 0,
    outputTokens: usage.candidatesTokenCount || 0,
    model,
  };
}

async function callAI(messages: { role: string; content: string }[], maxTokens = 1024, req?: any) {
  if (req) await checkQuota(req);
  const config = await getAIConfig();
  const modelInfo = MODEL_INFO[config.model] || MODEL_INFO['gpt-4o-mini'];

  let result: { content: string; inputTokens: number; outputTokens: number; model: string };
  if (modelInfo.provider === 'gemini') {
    result = await callGemini(config.apiKey, config.model, messages, maxTokens);
  } else {
    result = await callOpenAI(config.apiKey, config.model, messages, maxTokens);
  }

  if (req) await recordUsage(req, result.inputTokens, result.outputTokens);
  return result;
}

export async function getUsageStats(req: any) {
  const s = schema(req);
  const config = await getAIConfig();
  const { rows: daily } = await query(
    `SELECT COALESCE(total_requests, 0) as cnt FROM "${s}".ai_usage WHERE tgl = CURRENT_DATE`
  );
  const { rows: monthly } = await query(
    `SELECT COALESCE(SUM(total_requests), 0) as cnt, COALESCE(SUM(input_tokens), 0) as inp, COALESCE(SUM(output_tokens), 0) as out
     FROM "${s}".ai_usage WHERE tgl >= date_trunc('month', CURRENT_DATE)`
  );
  const { rows: history } = await query(
    `SELECT tgl, total_requests, input_tokens, output_tokens FROM "${s}".ai_usage ORDER BY tgl DESC LIMIT 60`
  );
  const dailyNum = daily.length > 0 ? parseInt(daily[0].cnt, 10) : 0;
  const monthlyNum = monthly.length > 0 ? parseInt(monthly[0].cnt, 10) : 0;
  const inpTokens = monthly.length > 0 ? parseInt(monthly[0].inp, 10) : 0;
  const outTokens = monthly.length > 0 ? parseInt(monthly[0].out, 10) : 0;
  const cost = MODEL_INFO[config.model] || MODEL_INFO['gpt-4o-mini'];
  const estCost = ((inpTokens * cost.inputCost) + (outTokens * cost.outputCost)) / 1_000_000;
  return {
    provider: config.provider,
    model: config.model,
    daily: { used: dailyNum, limit: config.dailyLimit },
    monthly: { used: monthlyNum, limit: config.monthlyLimit, inputTokens: inpTokens, outputTokens: outTokens },
    estCostUsd: Math.round(estCost * 10000) / 10000,
    history,
  };
}

export async function chat(req: any, body: { message: string; history?: { role: string; content: string }[] }) {
  const { message, history } = body;
  if (!message?.trim()) throw new AppError(400, 'Pesan tidak boleh kosong');
  const s = schema(req);
  const { rows } = await query(
    `SELECT COUNT(*) as mhs FROM "${s}".mahasiswa UNION ALL
     SELECT COUNT(*) FROM "${s}".dosen UNION ALL
     SELECT COUNT(*) FROM "${s}".mata_kuliah UNION ALL
     SELECT COUNT(*) FROM "${s}".prodi`
  );
  const [mhs, dosen, mk, prodi] = rows.map(r => parseInt(r.mhs, 10));
  const now = new Date().toLocaleDateString('id', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const systemPrompt = `Kamu adalah asisten AI akademik SIAKAD yang membantu mahasiswa, dosen, dan staff kampus.
Hari ini: ${now}
Data kampus saat ini: ${mhs} mahasiswa, ${dosen} dosen, ${mk} mata kuliah, ${prodi} program studi.
Kamu bisa menjawab pertanyaan seputar akademik, jadwal kuliah, KRS, KHS, peraturan akademik, dan informasi kampus.
Jawab dengan ramah, singkat, dan informatif dalam Bahasa Indonesia.`;

  const chatHistory: any[] = history && history.length > 0 ? history.slice(-10) : [];
  if (chatHistory.length === 0 || chatHistory[0]?.role !== 'system') {
    chatHistory.unshift({ role: 'system', content: systemPrompt });
  }
  chatHistory.push({ role: 'user', content: message });

  const { content: reply, inputTokens, outputTokens, model } = await callAI(chatHistory, 1024, req);
  const { rows: ins } = await query(
    `INSERT INTO "${s}".ai_chat_history (user_id, pesan, respons, input_tokens, output_tokens, model)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [req.user?.id || 'anonymous', message, reply, inputTokens, outputTokens, model]
  );
  return { reply, historyId: ins[0]?.id, inputTokens, outputTokens };
}

export async function getHistory(req: any) {
  const s = schema(req);
  const { rows } = await query(
    `SELECT id, pesan, respons, input_tokens, output_tokens, created_at FROM "${s}".ai_chat_history
     WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
    [req.user?.id || 'anonymous']
  );
  return rows.reverse();
}

export async function clearHistory(req: any) {
  const s = schema(req);
  await query(`DELETE FROM "${s}".ai_chat_history WHERE user_id = $1`, [req.user?.id || 'anonymous']);
  return true;
}

export async function generateRPS(req: any, body: {
  mata_kuliah: string; prodi: string; sks: number; semester: number;
  capaian_pembelajaran?: string; deskripsi?: string;
}) {
  const { mata_kuliah, prodi, sks, semester, capaian_pembelajaran, deskripsi } = body;
  if (!mata_kuliah || !prodi || !sks) throw new AppError(400, 'Mata kuliah, prodi, dan SKS wajib diisi');

  const prompt = `Buat Rencana Pembelajaran Semester (RPS) untuk:
Mata Kuliah: ${mata_kuliah}
Program Studi: ${prodi}
SKS: ${sks}
Semester: ${semester}
${capaian_pembelajaran ? `Capaian Pembelajaran: ${capaian_pembelajaran}` : ''}
${deskripsi ? `Deskripsi: ${deskripsi}` : ''}

Format RPS yang dihasilkan harus mencakup:
1. Identitas mata kuliah (nama, prodi, sks, semester)
2. Capaian pembelajaran (sikap, pengetahuan, keterampilan)
3. Pertemuan ke-1 sampai ke-16 dengan rincian: materi, metode pembelajaran, waktu, indikator penilaian
4. Daftar referensi (minimal 3)
5. Komponen penilaian dan bobot

Gunakan format JSON yang rapi dengan struktur berikut:
{
  "identitas": { "mata_kuliah": "", "prodi": "", "sks": 0, "semester": 0 },
  "capaian_pembelajaran": { "sikap": [], "pengetahuan": [], "keterampilan": [] },
  "pertemuan": [ { "pertemuan_ke": 1, "materi": "", "metode": "", "waktu": "", "indikator": "" } ],
  "referensi": [],
  "penilaian": { "komponen": [], "bobot": [] }
}`;

  const { content: reply, inputTokens, outputTokens } = await callAI([
    { role: 'system', content: 'Kamu adalah asisten akademik yang ahli dalam menyusun RPS perguruan tinggi Indonesia. Selalu gunakan Bahasa Indonesia.' },
    { role: 'user', content: prompt },
  ], 2048, req);

  const s = schema(req);
  await query(
    `INSERT INTO "${s}".ai_rps_history (mata_kuliah, prodi, sks, semester, capaian_pembelajaran, deskripsi, hasil, input_tokens, output_tokens, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [mata_kuliah, prodi, sks, semester, capaian_pembelajaran || null, deskripsi || null, reply, inputTokens, outputTokens, req.user?.id || 'anonymous']
  );
  return { rps: reply, inputTokens, outputTokens };
}

export async function getRPSHistory(req: any) {
  const s = schema(req);
  const { rows } = await query(
    `SELECT id, mata_kuliah, prodi, sks, semester, input_tokens, output_tokens, created_at FROM "${s}".ai_rps_history
     ORDER BY created_at DESC LIMIT 20`
  );
  return rows;
}

export async function checkPlagiarism(req: any, body: { text: string; title?: string }) {
  const { text, title } = body;
  if (!text?.trim()) throw new AppError(400, 'Teks tidak boleh kosong');

  const prompt = `Analisis teks berikut untuk kemungkinan plagiarisme atau kecurangan akademik.
${title ? `Judul: ${title}` : ''}

Teks:
"""
${text.substring(0, 3000)}
"""

Berikan analisis dalam format JSON:
{
  "skor_plagiarisme": 0-100,
  "indikasi": "rendah/sedang/tinggi",
  "analisis": "Penjelasan singkat tentang hasil analisis",
  "saran": "Saran perbaikan jika diperlukan"
}

Perhatikan: teks pendek (< 100 kata) mungkin memiliki false positive yang lebih tinggi.`;

  const { content: reply, inputTokens, outputTokens } = await callAI([
    { role: 'system', content: 'Kamu adalah asisten deteksi plagiarisme untuk lingkungan akademik Indonesia. Analisis dengan hati-hati dan obyektif.' },
    { role: 'user', content: prompt },
  ], 1024, req);

  let parsed: any;
  try {
    const jsonMatch = reply.match(/\{[\s\S]*\}/);
    parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { skor_plagiarisme: 0, indikasi: 'error', analisis: reply, saran: '' };
  } catch {
    parsed = { skor_plagiarisme: 0, indikasi: 'error', analisis: reply, saran: '' };
  }
  return { ...parsed, inputTokens, outputTokens };
}

export async function earlyWarning(req: any) {
  const s = schema(req);
  const { rows: mhs } = await query(
    `SELECT id, nim, nama, program_studi_id, angkatan, semester, status, ipk,
            (SELECT COUNT(*) FROM "${s}".absensi a WHERE a.mahasiswa_id = m.id AND a.status = 'alpha') as alpha,
            (SELECT ROUND(AVG(n.nilai_akhir), 2) FROM "${s}".nilai n WHERE n.mahasiswa_id = m.id) as avg_nilai,
            (SELECT COUNT(*)::int - COUNT(*) FILTER (WHERE n.nilai_akhir IS NOT NULL) FROM "${s}".nilai n WHERE n.mahasiswa_id = m.id) as nilai_kosong
     FROM "${s}".mahasiswa m WHERE m.status = 'aktif' ORDER BY m.semester DESC LIMIT 500`
  );
  const { rows: prodi } = await query(`SELECT id, nama FROM "${s}".prodi`);
  const prodiMap = Object.fromEntries(prodi.map((p: any) => [p.id, p.nama]));

  const scored = mhs.map((m: any) => {
    const ipk = parseFloat(m.ipk) || 0;
    const alpha = parseInt(m.alpha, 10) || 0;
    const avgNilai = parseFloat(m.avg_nilai) || 0;
    const nilaiKosong = parseInt(m.nilai_kosong, 10) || 0;
    const semester = parseInt(m.semester, 10) || 1;

    // Risk scoring: IPK rendah + alpha tinggi + nilai kosong
    let riskScore = 0;
    if (ipk < 2.0) riskScore += 40;
    else if (ipk < 2.5) riskScore += 25;
    else if (ipk < 3.0) riskScore += 10;

    if (alpha > 10) riskScore += 30;
    else if (alpha > 5) riskScore += 20;
    else if (alpha > 3) riskScore += 10;

    if (avgNilai < 60) riskScore += 20;
    else if (avgNilai < 70) riskScore += 10;

    if (nilaiKosong > 3) riskScore += 15;
    else if (nilaiKosong > 1) riskScore += 8;

    if (semester > 6 && ipk < 2.5) riskScore += 10;

    const level = riskScore >= 60 ? 'tinggi' : riskScore >= 35 ? 'sedang' : 'rendah';
    return {
      id: m.id, nim: m.nim, nama: m.nama, prodi: prodiMap[m.program_studi_id] || '',
      angkatan: m.angkatan, semester, ipk, alpha, avgNilai, riskScore, level,
    };
  });

  const tinggi = scored.filter(s => s.level === 'tinggi');
  const sedang = scored.filter(s => s.level === 'sedang');
  const rendah = scored.filter(s => s.level === 'rendah');

  return {
    total_dianalisis: scored.length,
    risiko_tinggi: tinggi.length,
    risiko_sedang: sedang.length,
    risiko_rendah: rendah.length,
    mahasiswa: scored.sort((a, b) => b.riskScore - a.riskScore).slice(0, 50),
  };
}

export async function academicAdvisor(req: any, body: { tipe?: 'mk' | 'karir' | 'semua' }) {
  const s = schema(req);
  const userId = req.user?.id;
  if (!userId) throw new AppError(401, 'Belum login');

  // Get student data
  const { rows: mhs } = await query(
    `SELECT m.id, m.nim, m.nama, m.program_studi_id, m.angkatan, m.semester, m.ipk,
            p.nama as prodi_nama, p.jenjang
     FROM "${s}".mahasiswa m JOIN "${s}".prodi p ON p.id = m.program_studi_id
     WHERE m.user_id = $1 LIMIT 1`, [userId]
  );
  if (mhs.length === 0) throw new AppError(404, 'Data mahasiswa tidak ditemukan');

  const student = mhs[0];
  const tipe = body?.tipe || 'semua';

  // Get course history
  const { rows: nilai } = await query(
    `SELECT mk.kode, mk.nama as mk_nama, mk.sks, n.nilai_akhir, n.nilai_huruf, n.semester, n.tahun_akademik
     FROM "${s}".nilai n JOIN "${s}".mata_kuliah mk ON mk.id = n.mata_kuliah_id
     WHERE n.mahasiswa_id = $1 ORDER BY n.created_at DESC LIMIT 40`,
    [student.id]
  );

  // Get available courses for next semester
  const nextSem = Math.min(parseInt(student.semester, 10) + 1, 14);
  const { rows: availableMk } = await query(
    `SELECT mk.id, mk.kode, mk.nama, mk.sks, mk.semester,
            (SELECT COUNT(*) FROM "${s}".kurikulum k WHERE k.mata_kuliah_id = mk.id AND k.semester = $2) as kur_semester
     FROM "${s}".mata_kuliah mk
     WHERE mk.semester <= $2 AND mk.is_active = true
     ORDER BY mk.semester, mk.nama LIMIT 60`,
    [student.id, nextSem]
  );

  const prompt = `Sebagai AI Academic Advisor untuk perguruan tinggi Indonesia, berikan rekomendasi personalized untuk mahasiswa berikut:

**Data Mahasiswa:**
- Nama: ${student.nama}
- NIM: ${student.nim}
- Program Studi: ${student.prodi_nama} (${student.jenjang})
- Semester Saat Ini: ${student.semester}
- IPK: ${student.ipk}
- Angkatan: ${student.angkatan}

**Riwayat Nilai (${nilai.length} mata kuliah):**
${JSON.stringify(nilai.map(n => ({ mk: n.mk_nama, sks: n.sks, nilai: n.nilai_huruf || n.nilai_akhir, sem: n.semester })), null, 2)}

**Mata Kuliah Tersedia untuk Semester ${nextSem}:**
${JSON.stringify(availableMk.map(m => ({ kode: m.kode, nama: m.nama, sks: m.sks, semester_kur: m.kur_semester })), null, 2)}

${tipe === 'mk' || tipe === 'semua' ? `
Beri rekomendasi mata kuliah yang HARUS diambil semester depan dengan format JSON:
{
  "rekomendasi_mk": [
    { "kode": "", "nama": "", "sks": 0, "alasan": "singkat", "prioritas": "wajib/rekomendasi/opsional" }
  ],
  "total_sks": 0,
  "catatan_akademik": "Saran khusus untuk mahasiswa ini"
}` : ''}
${tipe === 'karir' || tipe === 'semua' ? `
Beri rekomendasi jalur karir dengan format JSON:
{
  "jalur_karir": [
    { "bidang": "", "level": "pemula/menengah/lanjut", "mk_pendukung": ["MK1", "MK2"], "prospek": "deskripsi prospek karir" }
  ],
  "skill_gap": ["skill yang perlu ditingkatkan"],
  "rekomendasi_sertifikasi": ["sertifikasi 1", "sertifikasi 2"],
  "ringkasan": "Kesimpulan singkat"
}` : ''}`;

  const { content: reply, inputTokens, outputTokens } = await callAI([
    { role: 'system', content: 'Kamu adalah AI Academic Advisor untuk SIAKAD. Beri rekomendasi yang personal, akurat, dan sesuai kurikulum Indonesia. Gunakan Bahasa Indonesia.' },
    { role: 'user', content: prompt },
  ], 2048, req);

  let parsed: any;
  try {
    const jsonMatch = reply.match(/\{[\s\S]*\}/g);
    if (jsonMatch) {
      parsed = jsonMatch.map((j: string) => {
        try { return JSON.parse(j); } catch { return null; }
      }).filter(Boolean).reduce((acc: any, cur: any) => ({ ...acc, ...cur }), {});
    }
  } catch { parsed = { rekomendasi_mk: [], catatan_akademik: reply }; }

  return { ...parsed, mahasiswa: student.nama, nim: student.nim, prodi: student.prodi_nama, semester: student.semester, ipk: student.ipk, inputTokens, outputTokens };
}

export async function analyzeMahasiswa(req: any, body: { tipe: 'performa' | 'risiko' | 'rekomendasi'; prodi_id?: string }) {
  const s = schema(req);
  const { tipe, prodi_id } = body;

  const prodiFilter = prodi_id ? `WHERE program_studi_id = '${prodi_id}'` : '';
  const { rows: mhs } = await query(
    `SELECT id, nim, nama, program_studi_id, angkatan, semester, status, ipk FROM "${s}".mahasiswa ${prodiFilter} LIMIT 200`
  );
  const { rows: prodi } = await query(`SELECT id, nama FROM "${s}".prodi`);
  const prodiMap = Object.fromEntries(prodi.map((p: any) => [p.id, p.nama]));

  const dataSummary = mhs.map((m: any) => ({
    nama: m.nama, nim: m.nim, prodi: prodiMap[m.program_studi_id] || '', angkatan: m.angkatan,
    semester: m.semester, status: m.status, ipk: m.ipk,
  }));

  const prompt = `Sebagai asisten analisis akademik, lakukan analisis ${tipe} mahasiswa berikut:

Data Mahasiswa (${dataSummary.length} mahasiswa):
${JSON.stringify(dataSummary, null, 2)}

Beri analisis dalam format JSON:
{
  "ringkasan": "Temuan utama dari analisis",
  "detail": ${tipe === 'performa' ? `[{ "nim": "", "nama": "", "catatan": "" }]` : tipe === 'risiko' ? `[{ "nim": "", "nama": "", "tingkat_risiko": "rendah/sedang/tinggi", "indikator": "" }]` : `[{ "nim": "", "nama": "", "rekomendasi": "" }]`},
  "saran_akademik": ["saran 1", "saran 2"]
}`;

  const { content: reply, inputTokens, outputTokens } = await callAI([
    { role: 'system', content: `Kamu adalah asisten analisis data akademik perguruan tinggi. Analisis data ${tipe} mahasiswa secara profesional. Gunakan Bahasa Indonesia.` },
    { role: 'user', content: prompt },
  ], 2048, req);

  let parsed: any;
  try {
    const jsonMatch = reply.match(/\{[\s\S]*\}/);
    parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { ringkasan: reply, detail: [], saran_akademik: [] };
  } catch {
    parsed = { ringkasan: reply, detail: [], saran_akademik: [] };
  }
  return { ...parsed, inputTokens, outputTokens };
}

export async function autoGrade(req: any, body: { soal: string; jawaban: string; rubrik?: string; max_nilai?: number }) {
  const { soal, jawaban, rubrik, max_nilai } = body;
  if (!soal?.trim() || !jawaban?.trim()) throw new AppError(400, 'Soal dan jawaban wajib diisi');

  const prompt = `Anda adalah asisten koreksi otomatis untuk perguruan tinggi Indonesia.

**Soal:**
${soal}

**Jawaban Mahasiswa:**
${jawaban}

${rubrik ? `**Rubrik Penilaian:**\n${rubrik}` : ''}
${max_nilai ? `**Nilai Maksimal:** ${max_nilai}` : ''}

Beri penilaian dalam format JSON:
{
  "skor": <0-${max_nilai || 100}>,
  "persentase": <0-100>,
  "feedback": "Umpan balik detail untuk mahasiswa",
  "kekuatan": ["Kekuatan jawaban 1", "Kekuatan jawaban 2"],
  "kelemahan": ["Kelemahan 1", "Kelemahan 2"],
  "saran_perbaikan": "Saran konkret untuk meningkatkan jawaban"
}

Bersikap objektif, adil, dan konstruktif. Gunakan Bahasa Indonesia.`;

  const { content: reply, inputTokens, outputTokens } = await callAI([
    { role: 'system', content: 'Kamu adalah asisten koreksi otomatis yang objektif dan konstruktif untuk perguruan tinggi Indonesia.' },
    { role: 'user', content: prompt },
  ], 1024, req);

  let parsed: any;
  try {
    const jsonMatch = reply.match(/\{[\s\S]*\}/);
    parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { skor: 0, persentase: 0, feedback: reply };
  } catch {
    parsed = { skor: 0, persentase: 0, feedback: reply };
  }
  return { ...parsed, inputTokens, outputTokens };
}

export async function optimizeSchedule(req: any, body: { prodi_id?: string; semester?: number; tahun_akademik?: string; preferensi?: string }) {
  const s = schema(req);
  const { prodi_id, semester, tahun_akademik, preferensi } = body;

  let mkFilter = 'WHERE mk.is_active = true';
  const params: any[] = [];
  if (prodi_id) { params.push(prodi_id); mkFilter += ` AND mk.prodi_id = $${params.length}`; }
  if (semester) { params.push(semester); mkFilter += ` AND mk.semester = $${params.length}`; }

  const { rows: courses } = await query(
    `SELECT mk.id, mk.kode, mk.nama, mk.sks, mk.semester, mk.prodi_id,
            p.nama as prodi_nama
     FROM "${s}".mata_kuliah mk JOIN "${s}".prodi p ON p.id = mk.prodi_id
     ${mkFilter} ORDER BY mk.semester, mk.nama LIMIT 80`,
    params
  );

  const { rows: lecturers } = await query(
    `SELECT d.id, d.nidn, d.nama, d.program_studi_id FROM "${s}".dosen d WHERE d.is_active = true LIMIT 50`
  );

  const { rows: rooms } = await query(
    `SELECT r.* FROM "${s}".ruangan r WHERE r.is_active = true LIMIT 30`
  );

  const timeSlots = [
    '07:30-09:10', '09:20-11:00', '11:10-12:50',
    '13:00-14:40', '14:50-16:30', '16:40-18:20',
  ];
  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  const prompt = `Anda adalah AI penjadwalan perkuliahan untuk perguruan tinggi Indonesia. Buat jadwal perkuliahan yang OPTIMAL dengan mempertimbangkan:

**Constraints:**
1. Tidak boleh bentrok: dosen, ruangan, dan kelas di waktu yang sama
2. Dosen hanya bisa mengajar 1 kelas di satu waktu
3. Ruangan hanya bisa dipakai 1 kelas di satu waktu
4. Satu kelompok mahasiswa hanya bisa punya 1 kelas di satu waktu
5. Total SKS per hari per kelas tidak boleh > 8 SKS
6. Prioritas: jadwal pagi lebih baik dari siang/sore
${preferensi ? `\n**Preferensi Tambahan:**\n${preferensi}` : ''}

**Mata Kuliah (${courses.length} MK):**
${JSON.stringify(courses.map(c => ({ kode: c.kode, nama: c.nama, sks: c.sks, semester: c.semester, prodi: c.prodi_nama })), null, 2)}

**Dosen (${lecturers.length} orang):**
${JSON.stringify(lecturers.map(l => ({ nidn: l.nidn, nama: l.nama })), null, 2)}

**Ruangan (${rooms.length} ruang):**
${JSON.stringify(rooms.map(r => ({ kode: r.kode, nama: r.nama, kapasitas: r.kapasitas })), null, 2)}

**Slot Waktu (6 slot/hari × 6 hari = 36 slot):**
${JSON.stringify({ hari: days, jam: timeSlots })}

Buat jadwal dalam format JSON:
{
  "jadwal": [
    {
      "hari": "Senin",
      "jam": "07:30-09:10",
      "mk_kode": "",
      "mk_nama": "",
      "sks": 0,
      "dosen": "",
      "ruangan": "",
      "prodi": ""
    }
  ],
  "statistik": {
    "total_kelas": 0,
    "total_sks": 0,
    "pagi_persen": 0,
    "sore_persen": 0,
    "pemanfaatan_ruang": 0
  },
  "catatan": "Saran atau catatan tentang jadwal"
}

Usahakan sebanyak mungkin mata kuliah terjadwal. Prioritaskan jadwal pagi (slot 1-3).`;

  const { content: reply, inputTokens, outputTokens } = await callAI([
    { role: 'system', content: 'Kamu adalah AI penjadwalan perkuliahan. Buat jadwal optimal yang memenuhi semua constraint. Gunakan Bahasa Indonesia.' },
    { role: 'user', content: prompt },
  ], 3072, req);

  let parsed: any;
  try {
    const jsonMatch = reply.match(/\{[\s\S]*\}/);
    parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { jadwal: [], catatan: reply };
  } catch {
    parsed = { jadwal: [], catatan: reply };
  }
  return {
    ...parsed,
    inputTokens,
    outputTokens,
    metadata: {
      total_mk: courses.length,
      total_dosen: lecturers.length,
      total_ruangan: rooms.length,
      hari: days,
      slot_waktu: timeSlots,
    },
  };
}

export async function akreditasiAssistant(req: any, body: { tipe: string; program_studi?: string; kode_prodi?: string; jenjang?: string; detail?: string }) {
  const { tipe, program_studi, kode_prodi, jenjang, detail } = body;

  const docTypes: Record<string, { label: string; desc: string }> = {
    'led': { label: 'Laporan Evaluasi Diri (LED)', desc: 'Dokumen evaluasi diri program studi untuk akreditasi BAN-PT' },
    'borang': { label: 'Borang Akreditasi', desc: 'Formulir isian akreditasi program studi BAN-PT' },
    'standar1': { label: 'Standar 1 - Visi, Misi, Tujuan', desc: 'Dokumen standar 1 akreditasi BAN-PT' },
    'standar2': { label: 'Standar 2 - Tata Pamong', desc: 'Dokumen standar 2 akreditasi BAN-PT' },
    'standar3': { label: 'Standar 3 - Mahasiswa', desc: 'Dokumen standar 3 akreditasi BAN-PT' },
    'standar4': { label: 'Standar 4 - Sumber Daya Manusia', desc: 'Dokumen standar 4 akreditasi BAN-PT' },
    'standar5': { label: 'Standar 5 - Kurikulum', desc: 'Dokumen standar 5 akreditasi BAN-PT' },
    'standar6': { label: 'Standar 6 - Pembelajaran', desc: 'Dokumen standar 6 akreditasi BAN-PT' },
    'standar7': { label: 'Standar 7 - Penelitian', desc: 'Dokumen standar 7 akreditasi BAN-PT' },
    'standar8': { label: 'Standar 8 - Pengabdian', desc: 'Dokumen standar 8 akreditasi BAN-PT' },
    'standar9': { label: 'Standar 9 - Luaran', desc: 'Dokumen standar 9 akreditasi BAN-PT' },
  };

  const docInfo = docTypes[tipe] || docTypes['led'];
  const prodiStr = program_studi || 'Program Studi yang diusulkan';
  const jenjangStr = jenjang || 'S1';

  const prompt = `Anda adalah asisten akreditasi perguruan tinggi Indonesia yang ahli dalam menyusun dokumen BAN-PT / LAM-PT.

**Jenis Dokumen:** ${docInfo.label}
**Deskripsi:** ${docInfo.desc}
**Program Studi:** ${prodiStr} (${kode_prodi || '-'}) - Jenjang ${jenjangStr}
${detail ? `\n**Informasi Tambahan:**\n${detail}` : ''}

Buat dokumen akreditasi yang lengkap, profesional, dan sesuai standar BAN-PT / LAM-PT terbaru.

Format JSON:
{
  "judul": "Judul dokumen",
  "program_studi": "${prodiStr}",
  "jenjang": "${jenjangStr}",
  "pendahuluan": "Pendahuluan / latar belakang dokumen",
  "isi": [
    {
      "sub_bab": "Nama sub bab",
      "konten": "Konten lengkap sub bab dalam format paragraf"
    }
  ],
  "kesimpulan": "Kesimpulan dan rekomendasi",
  "saran_pengisian": ["Saran 1 untuk melengkapi dokumen", "Saran 2 untuk melengkapi dokumen"],
  "referensi": ["Referensi 1", "Referensi 2"]
}

Gunakan Bahasa Indonesia formal dan akademik. Tulis konten yang siap pakai untuk dokumen akreditasi.`;

  const { content: reply, inputTokens, outputTokens } = await callAI([
    { role: 'system', content: 'Kamu adalah asisten akreditasi perguruan tinggi Indonesia. Ahli dalam menyusun dokumen BAN-PT, LAM-PT, dan standar akreditasi nasional. Gunakan Bahasa Indonesia formal dan akademik.' },
    { role: 'user', content: prompt },
  ], 3072, req);

  let parsed: any;
  try {
    const jsonMatch = reply.match(/\{[\s\S]*\}/);
    parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { judul: docInfo.label, isi: [{ sub_bab: 'Konten', konten: reply }], saran_pengisian: [] };
  } catch {
    parsed = { judul: docInfo.label, isi: [{ sub_bab: 'Konten', konten: reply }], saran_pengisian: [] };
  }
  return { ...parsed, tipe, inputTokens, outputTokens };
}

export async function smartKRS(req: any, body: { semester?: number; preferensi?: string }) {
  const s = schema(req);
  const userId = req.user?.id;
  if (!userId) throw new AppError(401, 'Belum login');

  const { rows: mhs } = await query(
    `SELECT m.id, m.nim, m.nama, m.program_studi_id, m.angkatan, m.semester, m.ipk,
            p.nama as prodi_nama, p.jenjang
     FROM "${s}".mahasiswa m JOIN "${s}".prodi p ON p.id = m.program_studi_id
     WHERE m.user_id = $1 LIMIT 1`, [userId]
  );
  if (mhs.length === 0) throw new AppError(404, 'Data mahasiswa tidak ditemukan');
  const student = mhs[0];
  const currentSem = body?.semester || parseInt(student.semester, 10) || 1;

  // SKS limit based on IPK
  const ipk = parseFloat(student.ipk) || 0;
  let maxSks = 24;
  if (ipk >= 3.5) maxSks = 24;
  else if (ipk >= 3.0) maxSks = 22;
  else if (ipk >= 2.5) maxSks = 20;
  else if (ipk >= 2.0) maxSks = 18;
  else maxSks = 16;

  // Get kurikulum for this prodi
  const { rows: kurikulum } = await query(
    `SELECT id, kode, nama, total_sks FROM "${s}".kurikulum
     WHERE program_studi_id = $1 AND is_active = true
     ORDER BY tahun_mulai DESC LIMIT 1`, [student.program_studi_id]
  );

  // Get MK from kurikulum
  const { rows: kurMk } = await query(
    `SELECT km.mata_kuliah_id, km.semester as kur_semester, km.wajib,
            mk.kode, mk.nama, mk.sks, mk.jenis
     FROM "${s}".kurikulum_matakuliah km
     JOIN "${s}".mata_kuliah mk ON mk.id = km.mata_kuliah_id
     WHERE km.kurikulum_id = $1 AND mk.is_active = true
     ORDER BY km.semester, mk.nama`, [kurikulum.length > 0 ? kurikulum[0].id : null]
  );

  // Get already taken courses
  const { rows: takenMk } = await query(
    `SELECT DISTINCT n.mata_kuliah_id, n.nilai_akhir, n.nilai_huruf
     FROM "${s}".nilai n WHERE n.mahasiswa_id = $1 AND n.nilai_akhir IS NOT NULL`, [student.id]
  );
  const takenSet = new Set(takenMk.map((t: any) => t.mata_kuliah_id));

  // Get KRS history for this semester
  const { rows: existingKrs } = await query(
    `SELECT k.id, j.mata_kuliah_id, j.hari, j.jam_mulai, j.jam_selesai
     FROM "${s}".krs k
     JOIN "${s}".jadwal_kuliah j ON j.id = k.jadwal_id
     WHERE k.mahasiswa_id = $1 AND k.status != 'dibatalkan' AND k.semester = $2`, [student.id, currentSem]
  );

  const totalSksKurikulum = kurikulum.length > 0 ? parseInt(kurikulum[0].total_sks, 10) || 0 : 0;
  const sksTaken = takenMk.reduce((sum: number, t: any) => sum + (parseInt((kurMk.find((k: any) => k.mata_kuliah_id === t.mata_kuliah_id)?.sks) || '0', 10) || 0), 0);
  const sksRemaining = Math.max(0, totalSksKurikulum - sksTaken);

  // Categorize MK
  const availableMk = kurMk.filter((mk: any) => !takenSet.has(mk.mata_kuliah_id));
  const mkThisSem = availableMk.filter((mk: any) => parseInt(mk.kur_semester, 10) === currentSem);
  const mkPrevSem = availableMk.filter((mk: any) => parseInt(mk.kur_semester, 10) < currentSem);
  const mkNextSem = availableMk.filter((mk: any) => parseInt(mk.kur_semester, 10) > currentSem);

  const prompt = `Sebagai AI Smart KRS Advisor untuk perguruan tinggi Indonesia, buat rekomendasi KRS yang optimal:

**Data Mahasiswa:**
- Nama: ${student.nama}
- NIM: ${student.nim}
- Prodi: ${student.prodi_nama} (${student.jenjang})
- Semester Saat Ini: ${currentSem}
- IPK: ${student.ipk}
- SKS Maksimal yang Diizinkan: ${maxSks} SKS (berdasarkan IPK)
- Total SKS Kurikulum: ${totalSksKurikulum} SKS
- SKS Sudah Diambil: ${sksTaken} SKS
- SKS Tersisa: ${sksRemaining} SKS

**Mata Kuliah WAJIB semester ${currentSem} yang belum diambil (${mkThisSem.filter(m => m.wajib).length} MK):**
${JSON.stringify(mkThisSem.filter(m => m.wajib).map(m => ({ kode: m.kode, nama: m.nama, sks: m.sks })), null, 2)}

**Mata Kuliah PILIHAN semester ${currentSem} (${mkThisSem.filter(m => !m.wajib).length} MK):**
${JSON.stringify(mkThisSem.filter(m => !m.wajib).map(m => ({ kode: m.kode, nama: m.nama, sks: m.sks })), null, 2)}

**Mata Kuliah dari semester sebelumnya yang belum lulus (${mkPrevSem.length} MK):**
${JSON.stringify(mkPrevSem.map(m => ({ kode: m.kode, nama: m.nama, sks: m.sks, wajib: m.wajib, semester_kurikulum: m.kur_semester })), null, 2)}

${body?.preferensi ? `\n**Preferensi Mahasiswa:**\n${body.preferensi}` : ''}

Buat rekomendasi dalam format JSON:
{
  "rekomendasi_krs": [
    {
      "kode": "",
      "nama": "",
      "sks": 0,
      "semester_kurikulum": 0,
      "prioritas": "wajib/rekomendasi/opsional",
      "alasan": "Alasan direkomendasikan",
      "kategori": "semester_ini/semester_lalu/semester_depan"
    }
  ],
  "total_sks_rekomendasi": 0,
  "sks_maksimal": ${maxSks},
  "sks_terpakai": ${sksTaken},
  "sks_tersisa_kurikulum": ${sksRemaining},
  "daya_tampung": ${maxSks - sksTaken},
  "catatan": [
    "Catatan penting 1",
    "Catatan penting 2"
  ],
  "strategi": "Strategi pengambilan KRS yang disarankan"
}

Pertimbangkan:
1. Prioritaskan MK wajib semester ini yang belum diambil
2. Prioritaskan MK dari semester sebelumnya yang belum lulus (terutama yang wajib)
3. Jangan melebihi ${maxSks} SKS total
4. Perhatikan prasyarat mata kuliah
5. Beri rekomendasi yang realistis dan achievable
6. Gunakan Bahasa Indonesia`;

  const { content: reply, inputTokens, outputTokens } = await callAI([
    { role: 'system', content: 'Kamu adalah AI Smart KRS Advisor untuk SIAKAD. Beri rekomendasi KRS yang optimal, personal, dan sesuai aturan akademik Indonesia.' },
    { role: 'user', content: prompt },
  ], 2048, req);

  let parsed: any;
  try {
    const jsonMatch = reply.match(/\{[\s\S]*\}/);
    parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { rekomendasi_krs: [], catatan: ['Gagal memproses rekomendasi'] };
  } catch {
    parsed = { rekomendasi_krs: [], catatan: ['Gagal memproses rekomendasi'] };
  }
  return {
    ...parsed,
    mahasiswa: student.nama,
    nim: student.nim,
    prodi: student.prodi_nama,
    semester: currentSem,
    ipk: student.ipk,
    inputTokens,
    outputTokens,
  };
}
