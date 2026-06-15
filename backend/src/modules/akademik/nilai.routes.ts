import { Router, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { query } from '../../config/database.js';
import { validate } from '../../middleware/validator.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/role.js';
import { sendSuccess } from '../../middleware/response.js';
import { AppError } from '../../middleware/errorHandler.js';
import { Role } from '../../types/enums.js';

const router = Router();

function schema(req: Request): string {
  if (!req.tenant) throw new AppError(400, 'Tenant tidak terdeteksi');
  return `"${req.tenant.schemaName}"`;
}

function hitungNilaiAkhir(tugas: number, uts: number, uas: number, bt: number, bu: number, ba: number): number {
  return +(tugas * bt + uts * bu + uas * ba).toFixed(2);
}

function hitungNilaiHuruf(nilai: number): string {
  if (nilai >= 85) return 'A';
  if (nilai >= 80) return 'A-';
  if (nilai >= 75) return 'B+';
  if (nilai >= 70) return 'B';
  if (nilai >= 65) return 'B-';
  if (nilai >= 60) return 'C+';
  if (nilai >= 55) return 'C';
  if (nilai >= 45) return 'D';
  return 'E';
}

router.get(
  '/',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const jadwalId = req.query.jadwal_id as string;
      const mahasiswaId = req.query.mahasiswa_id as string;

      let sql = `SELECT n.*, m.nim, m.nama as mahasiswa_nama,
                        mk.kode as mk_kode, mk.nama as mk_nama, mk.sks
                 FROM ${s}.nilai n
                 JOIN ${s}.krs k ON k.id = n.krs_id
                 JOIN ${s}.mahasiswa m ON m.id = k.mahasiswa_id
                 JOIN ${s}.jadwal_kuliah j ON j.id = k.jadwal_id
                 JOIN ${s}.mata_kuliah mk ON mk.id = j.mata_kuliah_id`;

      const params: unknown[] = [];
      const conditions: string[] = [];

      if (jadwalId) { conditions.push(`k.jadwal_id = $${params.length + 1}`); params.push(jadwalId); }
      if (mahasiswaId) { conditions.push(`k.mahasiswa_id = $${params.length + 1}`); params.push(mahasiswaId); }

      if (conditions.length > 0) sql += ` WHERE ${conditions.join(' AND ')}`;
      sql += ` ORDER BY m.nim`;

      const { rows } = await query(sql, params);
      sendSuccess(res, rows);
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  '/:krs_id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN),
  [
    body('nilai_tugas').optional().isFloat({ min: 0, max: 100 }),
    body('nilai_uts').optional().isFloat({ min: 0, max: 100 }),
    body('nilai_uas').optional().isFloat({ min: 0, max: 100 }),
    body('bobot_tugas').optional().isFloat({ min: 0, max: 1 }),
    body('bobot_uts').optional().isFloat({ min: 0, max: 1 }),
    body('bobot_uas').optional().isFloat({ min: 0, max: 1 }),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const krsId = req.params.krs_id;

      const { rows: existing } = await query(
        `SELECT * FROM ${s}.nilai WHERE krs_id = $1`,
        [krsId]
      );
      if (existing.length === 0) throw new AppError(404, 'Nilai tidak ditemukan');

      const n = existing[0];
      const nilaiTugas = req.body.nilai_tugas ?? parseFloat(n.nilai_tugas);
      const nilaiUts = req.body.nilai_uts ?? parseFloat(n.nilai_uts);
      const nilaiUas = req.body.nilai_uas ?? parseFloat(n.nilai_uas);
      const bobotTugas = req.body.bobot_tugas ?? parseFloat(n.bobot_tugas);
      const bobotUts = req.body.bobot_uts ?? parseFloat(n.bobot_uts);
      const bobotUas = req.body.bobot_uas ?? parseFloat(n.bobot_uas);

      const nilaiAkhir = hitungNilaiAkhir(nilaiTugas, nilaiUts, nilaiUas, bobotTugas, bobotUts, bobotUas);
      const nilaiHuruf = hitungNilaiHuruf(nilaiAkhir);

      await query(
        `UPDATE ${s}.nilai
         SET nilai_tugas = $1, nilai_uts = $2, nilai_uas = $3,
             nilai_akhir = $4, nilai_huruf = $5,
             bobot_tugas = $6, bobot_uts = $7, bobot_uas = $8,
             updated_at = NOW()
         WHERE krs_id = $9`,
        [nilaiTugas, nilaiUts, nilaiUas, nilaiAkhir, nilaiHuruf, bobotTugas, bobotUts, bobotUas, krsId]
      );

      sendSuccess(res, { nilai_akhir: nilaiAkhir, nilai_huruf: nilaiHuruf }, 'Nilai diperbarui');
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/kalkulasi/:jadwal_id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows: daftarNilai } = await query(
        `SELECT n.id, n.krs_id, n.nilai_tugas, n.nilai_uts, n.nilai_uas,
                n.bobot_tugas, n.bobot_uts, n.bobot_uas
         FROM ${s}.nilai n
         JOIN ${s}.krs k ON k.id = n.krs_id
         WHERE k.jadwal_id = $1 AND k.status = 'disetujui'`,
        [req.params.jadwal_id]
      );

      let updated = 0;
      for (const n of daftarNilai) {
        const nilaiAkhir = hitungNilaiAkhir(
          parseFloat(n.nilai_tugas), parseFloat(n.nilai_uts), parseFloat(n.nilai_uas),
          parseFloat(n.bobot_tugas), parseFloat(n.bobot_uts), parseFloat(n.bobot_uas)
        );
        const nilaiHuruf = hitungNilaiHuruf(nilaiAkhir);

        await query(
          `UPDATE ${s}.nilai SET nilai_akhir = $1, nilai_huruf = $2, updated_at = NOW() WHERE id = $3`,
          [nilaiAkhir, nilaiHuruf, n.id]
        );
        updated++;
      }

      sendSuccess(res, { updated }, `${updated} nilai berhasil dikalkulasi`);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
