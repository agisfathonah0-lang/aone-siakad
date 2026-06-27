import PDFDocument from 'pdfkit';
import { query } from '../../config/database.js';

const NILAI_BOBOT: Record<string, number> = {
  A: 4, 'A-': 3.7, 'B+': 3.3, B: 3, 'B-': 2.7,
  'C+': 2.3, C: 2, D: 1, E: 0,
};

function s(schemaName: string): string {
  return `"${schemaName}"`;
}

function formatJam(jam: string): string {
  if (!jam) return '-';
  return jam.substring(0, 5);
}

function label(doc: PDFKit.PDFDocument, label: string, value: string) {
  doc.font('Helvetica').fontSize(11);
  doc.text(label, { continued: true });
  doc.text(`: ${value}`);
}

function drawTable(
  doc: PDFKit.PDFDocument,
  headers: string[],
  widths: number[],
  aligns: ('left' | 'center' | 'right')[],
  rows: (string | number | null)[][],
  startY: number,
  opts: { headerSize?: number; rowSize?: number; rowHeight?: number } = {}
): number {
  const headerSize = opts.headerSize ?? 9;
  const rowSize = opts.rowSize ?? 9;
  const rowHeight = opts.rowHeight ?? 18;
  const leftX = doc.page.margins.left;
  const colX: number[] = [];
  let x = leftX;
  for (const w of widths) { colX.push(x); x += w; }
  const rightX = x;
  let y = startY;
  const pad = 3;

  doc.font('Helvetica-Bold').fontSize(headerSize);
  doc.roundedRect(leftX, y, rightX - leftX, rowHeight, 2).fill('#2563eb');
  doc.fill('#ffffff');
  for (let i = 0; i < headers.length; i++) {
    doc.text(headers[i], colX[i] + pad, y + pad, {
      width: widths[i] - pad * 2, align: aligns[i] || 'left',
    });
  }
  y += rowHeight;

  doc.font('Helvetica').fontSize(rowSize).fill('#000000');
  for (let r = 0; r < rows.length; r++) {
    if (y + rowHeight > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
      y = doc.page.margins.top;
    }
    if (r % 2 === 1) {
      doc.rect(leftX, y, rightX - leftX, rowHeight).fill('#f8fafc');
      doc.fill('#000000');
    }
    doc.moveTo(leftX, y).lineTo(rightX, y).stroke('#e2e8f0');
    for (let i = 0; i < widths.length; i++) {
      const val = rows[r][i] !== null && rows[r][i] !== undefined ? String(rows[r][i]) : '-';
      doc.text(val, colX[i] + pad, y + pad, {
        width: widths[i] - pad * 2, align: aligns[i] || 'left',
      });
    }
    y += rowHeight;
  }
  doc.moveTo(leftX, y).lineTo(rightX, y).stroke('#e2e8f0');
  return y;
}

export async function generateKHS(
  schemaName: string,
  mahasiswaId: string,
  semester?: string,
  tahunAkademik?: string
): Promise<Buffer> {
  return new Promise<Buffer>(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const { rows: mhs } = await query(
        `SELECT m.nim, m.nama, p.nama as prodi_nama
         FROM ${s(schemaName)}.mahasiswa m
         JOIN ${s(schemaName)}.program_studi p ON p.id = m.program_studi_id
         WHERE m.id = $1`,
        [mahasiswaId]
      );
      if (mhs.length === 0) throw new Error('Mahasiswa tidak ditemukan');
      const mahasiswa = mhs[0];

      let sql = `SELECT mk.kode, mk.nama as mk_nama, mk.sks,
                        n.nilai_tugas, n.nilai_uts, n.nilai_uas, n.nilai_akhir, n.nilai_huruf,
                        k.semester, k.tahun_akademik
                 FROM ${s(schemaName)}.krs k
                 JOIN ${s(schemaName)}.jadwal_kuliah j ON j.id = k.jadwal_id
                 JOIN ${s(schemaName)}.mata_kuliah mk ON mk.id = j.mata_kuliah_id
                 LEFT JOIN ${s(schemaName)}.nilai n ON n.krs_id = k.id
                 WHERE k.mahasiswa_id = $1 AND k.status = 'disetujui'`;
      const params: unknown[] = [mahasiswaId];

      if (semester && tahunAkademik) {
        params.push(semester, tahunAkademik);
        sql += ` AND k.semester = $2 AND k.tahun_akademik = $3`;
      }

      sql += ` ORDER BY k.tahun_akademik, k.semester, mk.kode`;

      const { rows: courses } = await query(sql, params);

      const oldSemester = semester && tahunAkademik ? `${semester} - ${tahunAkademik}` : '';
      doc.fontSize(18).font('Helvetica-Bold').text('KARTU HASIL STUDI (KHS)', { align: 'center' });
      if (oldSemester) {
        doc.fontSize(12).font('Helvetica').text(`Semester ${oldSemester}`, { align: 'center' });
      }
      doc.moveDown(1);

      label(doc, 'NIM', mahasiswa.nim);
      label(doc, 'Nama', mahasiswa.nama);
      label(doc, 'Program Studi', mahasiswa.prodi_nama);
      doc.moveDown(1);

      const headers = ['No', 'Kode MK', 'Mata Kuliah', 'SKS', 'Tugas', 'UTS', 'UAS', 'NA', 'Nilai'];
      const widths = [25, 55, 170, 30, 38, 38, 38, 38, 38];
      const aligns: ('left' | 'center' | 'right')[] = ['center', 'center', 'left', 'center', 'center', 'center', 'center', 'center', 'center'];

      const tableRows = courses.map((c: any, i: number) => [
        i + 1,
        c.kode,
        c.mk_nama,
        c.sks,
        c.nilai_tugas !== null ? c.nilai_tugas : '-',
        c.nilai_uts !== null ? c.nilai_uts : '-',
        c.nilai_uas !== null ? c.nilai_uas : '-',
        c.nilai_akhir !== null ? c.nilai_akhir : '-',
        c.nilai_huruf || '-',
      ]);

      const tableY = drawTable(doc, headers, widths, aligns, tableRows, doc.y);

      let totalSks = 0;
      let totalBobot = 0;
      for (const c of courses) {
        if (c.nilai_huruf && NILAI_BOBOT[c.nilai_huruf] !== undefined) {
          totalSks += c.sks;
          totalBobot += NILAI_BOBOT[c.nilai_huruf] * c.sks;
        }
      }
      const ipk = totalSks > 0 ? +(totalBobot / totalSks).toFixed(2) : 0;

      doc.moveDown(0.5);
      doc.fontSize(11).font('Helvetica-Bold');
      doc.text(`Total SKS: ${totalSks}`, 50, tableY + 10, { continued: true });
      doc.text(`     IPK: ${ipk}`, { align: 'right' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

export async function generateKRS(
  schemaName: string,
  mahasiswaId: string,
  semester: string,
  tahunAkademik: string
): Promise<Buffer> {
  return new Promise<Buffer>(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const { rows: mhs } = await query(
        `SELECT m.nim, m.nama, p.nama as prodi_nama
         FROM ${s(schemaName)}.mahasiswa m
         JOIN ${s(schemaName)}.program_studi p ON p.id = m.program_studi_id
         WHERE m.id = $1`,
        [mahasiswaId]
      );
      if (mhs.length === 0) throw new Error('Mahasiswa tidak ditemukan');
      const mahasiswa = mhs[0];

      const { rows: jadwal } = await query(
        `SELECT j.hari, j.jam_mulai, j.jam_selesai, j.ruangan,
                mk.kode, mk.nama as mk_nama, mk.sks,
                d.nama as dosen_nama
         FROM ${s(schemaName)}.krs k
         JOIN ${s(schemaName)}.jadwal_kuliah j ON j.id = k.jadwal_id
         JOIN ${s(schemaName)}.mata_kuliah mk ON mk.id = j.mata_kuliah_id
         LEFT JOIN ${s(schemaName)}.dosen d ON d.id = j.dosen_id
         WHERE k.mahasiswa_id = $1 AND k.semester = $2 AND k.tahun_akademik = $3 AND k.status = 'disetujui'
         ORDER BY j.hari, j.jam_mulai`,
        [mahasiswaId, semester, tahunAkademik]
      );

      doc.fontSize(18).font('Helvetica-Bold').text('KARTU RENCANA STUDI (KRS)', { align: 'center' });
      doc.moveDown(1);

      label(doc, 'NIM', mahasiswa.nim);
      label(doc, 'Nama', mahasiswa.nama);
      label(doc, 'Program Studi', mahasiswa.prodi_nama);
      label(doc, 'Semester', semester);
      label(doc, 'Tahun Akademik', tahunAkademik);
      doc.moveDown(1);

      const headers = ['No', 'Hari', 'Jam', 'Kode', 'Mata Kuliah', 'SKS', 'Dosen', 'Ruangan'];
      const widths = [20, 55, 65, 55, 140, 25, 85, 50];
      const aligns: ('left' | 'center' | 'right')[] = ['center', 'center', 'center', 'center', 'left', 'center', 'left', 'center'];

      const tableRows = jadwal.map((j: any, i: number) => [
        i + 1,
        j.hari,
        `${formatJam(j.jam_mulai)} - ${formatJam(j.jam_selesai)}`,
        j.kode,
        j.mk_nama,
        j.sks,
        j.dosen_nama || '-',
        j.ruangan || '-',
      ]);

      drawTable(doc, headers, widths, aligns, tableRows, doc.y);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

export async function generateTranskrip(schemaName: string, mahasiswaId: string): Promise<Buffer> {
  return new Promise<Buffer>(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const { rows: mhs } = await query(
        `SELECT m.nim, m.nama, p.nama as prodi_nama
         FROM ${s(schemaName)}.mahasiswa m
         JOIN ${s(schemaName)}.program_studi p ON p.id = m.program_studi_id
         WHERE m.id = $1`,
        [mahasiswaId]
      );
      if (mhs.length === 0) throw new Error('Mahasiswa tidak ditemukan');
      const mahasiswa = mhs[0];

      const { rows: courses } = await query(
        `SELECT mk.kode, mk.nama as mk_nama, mk.sks,
                n.nilai_tugas, n.nilai_uts, n.nilai_uas, n.nilai_akhir, n.nilai_huruf,
                k.semester, k.tahun_akademik
         FROM ${s(schemaName)}.krs k
         JOIN ${s(schemaName)}.jadwal_kuliah j ON j.id = k.jadwal_id
         JOIN ${s(schemaName)}.mata_kuliah mk ON mk.id = j.mata_kuliah_id
         LEFT JOIN ${s(schemaName)}.nilai n ON n.krs_id = k.id
         WHERE k.mahasiswa_id = $1 AND k.status = 'disetujui'
         ORDER BY k.tahun_akademik, k.semester`,
        [mahasiswaId]
      );

      const groups: Record<string, { label: string; courses: any[] }> = {};
      for (const c of courses) {
        const key = `${c.tahun_akademik}|${c.semester}`;
        if (!groups[key]) {
          groups[key] = {
            label: `Semester ${c.semester} - ${c.tahun_akademik}`,
            courses: [],
          };
        }
        groups[key].courses.push(c);
      }

      doc.fontSize(18).font('Helvetica-Bold').text('TRANSKRIP NILAI', { align: 'center' });
      doc.moveDown(1);

      label(doc, 'NIM', mahasiswa.nim);
      label(doc, 'Nama', mahasiswa.nama);
      label(doc, 'Program Studi', mahasiswa.prodi_nama);
      doc.moveDown(1);

      const headers = ['No', 'Kode MK', 'Mata Kuliah', 'SKS', 'Tugas', 'UTS', 'UAS', 'NA', 'Nilai'];
      const widths = [25, 55, 170, 30, 38, 38, 38, 38, 38];
      const aligns: ('left' | 'center' | 'right')[] = ['center', 'center', 'left', 'center', 'center', 'center', 'center', 'center', 'center'];

      let totalSksAll = 0;
      let totalBobotAll = 0;
      let cumulativeSks = 0;
      let cumulativeBobot = 0;

      for (const key of Object.keys(groups)) {
        const group = groups[key];
        if (doc.y > doc.page.height - doc.page.margins.bottom - 80) {
          doc.addPage();
        }

        doc.fontSize(13).font('Helvetica-Bold').fillColor('#2563eb');
        doc.text(group.label, 50, doc.y);
        doc.fillColor('#000000');
        doc.moveDown(0.3);

        let semesterSks = 0;
        let semesterBobot = 0;

        const tableRows = group.courses.map((c: any, i: number) => {
          if (c.nilai_huruf && NILAI_BOBOT[c.nilai_huruf] !== undefined) {
            semesterSks += c.sks;
            semesterBobot += NILAI_BOBOT[c.nilai_huruf] * c.sks;
          }
          return [
            i + 1,
            c.kode,
            c.mk_nama,
            c.sks,
            c.nilai_tugas !== null ? c.nilai_tugas : '-',
            c.nilai_uts !== null ? c.nilai_uts : '-',
            c.nilai_uas !== null ? c.nilai_uas : '-',
            c.nilai_akhir !== null ? c.nilai_akhir : '-',
            c.nilai_huruf || '-',
          ];
        });

        const tableEndY = drawTable(doc, headers, widths, aligns, tableRows, doc.y);
        cumulativeSks += semesterSks;
        cumulativeBobot += semesterBobot;
        totalSksAll += semesterSks;
        totalBobotAll += semesterBobot;

        const semesterIp = semesterSks > 0 ? +(semesterBobot / semesterSks).toFixed(2) : 0;
        const cumulativeIpk = cumulativeSks > 0 ? +(cumulativeBobot / cumulativeSks).toFixed(2) : 0;

        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica');
        doc.text(`Jumlah SKS: ${semesterSks}     IP Semester: ${semesterIp}     IP Kumulatif: ${cumulativeIpk}`, 50, tableEndY + 10);
        doc.moveDown(1);
      }

      const finalIpk = totalSksAll > 0 ? +(totalBobotAll / totalSksAll).toFixed(2) : 0;

      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text(`Total SKS: ${totalSksAll}     IPK: ${finalIpk}`, { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

export async function generateSuratKeluar(
  schemaName: string,
  suratId: string
): Promise<Buffer> {
  return new Promise<Buffer>(async (resolve, reject) => {
    try {
      const { rows: surat } = await query(
        `SELECT skl.*, sk.nama as kategori_nama, sk.kode as kategori_kode, sk.template, sk.template_file_url
         FROM ${s(schemaName)}.surat_keluar skl
         LEFT JOIN ${s(schemaName)}.surat_kategori sk ON sk.id = skl.kategori_id
         WHERE skl.id = $1`,
        [suratId]
      );
      if (surat.length === 0) throw new Error('Surat tidak ditemukan');

      const { rows: tRows } = await query(
        'SELECT nama_pt, alamat, telepon, email, website, logo_url FROM public.tenants WHERE id = (SELECT tenant_id FROM public.tenants WHERE schema_name = $1)',
        [schemaName]
      );
      const t = tRows[0] || {};

      const d = surat[0].tanggal_surat ? new Date(surat[0].tanggal_surat) : new Date();
      const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
      const days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];

      const vars: Record<string, string> = {
        nomor_surat: surat[0].nomor_surat || '',
        tanggal: d.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
        hari: days[d.getDay()],
        bulan: months[d.getMonth()],
        tahun: String(d.getFullYear()),
        perihal: surat[0].perihal || '',
        tujuan: surat[0].tujuan || '',
        lampiran: surat[0].lampiran || '-',
        pengirim: surat[0].pengirim || '',
        penandatangan: surat[0].penandatangan || '',
        nama_pt: t.nama_pt || '',
        alamat: t.alamat || '',
        telepon: t.telepon || '',
        email: t.email || '',
        website: t.website || '',
      };

      let templateContent = surat[0].template || '';

      // If template file exists, load from file
      if (surat[0].template_file_url) {
        try {
          const https = require('https') as typeof import('https');
          const http = require('http') as typeof import('http');
          const mod = surat[0].template_file_url.startsWith('https') ? https : http;
          const fileBuf = await new Promise<Buffer>((resolve, reject) => {
            mod.get(surat[0].template_file_url, (response: any) => {
              if (response.statusCode !== 200) { reject(new Error('Gagal download template')); return; }
              const chunks: Buffer[] = [];
              response.on('data', (c: Buffer) => chunks.push(c));
              response.on('end', () => resolve(Buffer.concat(chunks)));
            }).on('error', reject);
          });
          const mammoth = require('mammoth');
          const result = await mammoth.convertToHtml({ buffer: fileBuf });
          templateContent = result.value;
        } catch (e) {
          // fallback to text template
        }
      }

      for (const [key, val] of Object.entries(vars)) {
        templateContent = templateContent.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), val || '');
      }

      const doc = new PDFDocument({ margin: 60, size: 'A4' });
      const buffers: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const pageWidth = doc.page.width - 120;

      doc.fontSize(11);

      if (t.logo_url) {
        try {
          doc.image(t.logo_url, doc.page.margins.left, doc.y, { height: 50, align: 'center' });
          doc.moveDown(0.5);
        } catch {}
      }

      doc.font('Helvetica-Bold').fontSize(14);
      doc.text(t.nama_pt || 'KOP SURAT', { align: 'center' });
      doc.font('Helvetica').fontSize(9);
      if (t.alamat) doc.text(t.alamat, { align: 'center' });
      const kontak = [t.telepon ? `Telp: ${t.telepon}` : '', t.email ? `Email: ${t.email}` : '', t.website ? `Web: ${t.website}` : ''].filter(Boolean).join(' | ');
      if (kontak) doc.text(kontak, { align: 'center' });

      doc.moveDown(0.5);
      doc.moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).lineWidth(2).stroke('#000000');
      doc.moveDown(1);

      doc.font('Helvetica').fontSize(10);
      doc.text(`Nomor      : ${surat[0].nomor_surat}`);
      doc.text(`Lampiran   : ${surat[0].lampiran || '-'}`);
      doc.text(`Perihal    : ${surat[0].perihal}`);
      doc.moveDown(1);

      doc.text(d.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }), { align: 'right' });
      doc.moveDown(1);
      doc.text(`Kepada Yth,`);
      doc.font('Helvetica-Bold').text(surat[0].tujuan);
      doc.moveDown(1);
      doc.font('Helvetica');

      if (templateContent) {
        const bodyLines = templateContent.split('\n');
        for (const line of bodyLines) {
          doc.text(line);
        }
      }

      doc.moveDown(3);
      doc.text(`${surat[0].pengirim || 'Pejabat Berwenang'}`, { align: 'right' });
      doc.moveDown(3);
      doc.font('Helvetica-Bold').text(surat[0].penandatangan || '(________________)', { align: 'right' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
