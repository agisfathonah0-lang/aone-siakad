import { z } from 'zod';

export const mahasiswaCreateSchema = z.object({
  nim: z.string().min(1, 'NIM wajib diisi').max(30),
  nama: z.string().min(1, 'Nama wajib diisi').max(200),
  email: z.string().email('Email tidak valid').max(200),
  password: z.string().min(6, 'Password minimal 6 karakter').max(100),
  program_studi_id: z.string().uuid('Program studi tidak valid'),
  angkatan: z.number().int('Angkatan harus angka').positive(),
  tempat_lahir: z.string().optional().nullable(),
  tanggal_lahir: z.string().optional().nullable(),
  jenis_kelamin: z.enum(['L', 'P']).optional().nullable(),
  alamat: z.string().optional().nullable(),
  no_hp: z.string().optional().nullable(),
});

export const mahasiswaUpdateSchema = z.object({
  nama: z.string().min(1).max(200).optional(),
  tempat_lahir: z.string().optional().nullable(),
  tanggal_lahir: z.string().optional().nullable(),
  jenis_kelamin: z.enum(['L', 'P']).optional().nullable(),
  alamat: z.string().optional().nullable(),
  no_hp: z.string().optional().nullable(),
  program_studi_id: z.string().uuid().optional().nullable(),
  angkatan: z.number().int().positive().optional(),
  semester: z.number().int().min(1).max(14).optional(),
  status: z.enum(['aktif', 'cuti', 'lulus', 'drop_out']).optional(),
  ukt_golongan: z.string().optional().nullable(),
  ukt_nominal: z.number().int().min(0).optional(),
});

export const dosenCreateSchema = z.object({
  nidn: z.string().min(1, 'NIDN wajib diisi').max(30),
  nama: z.string().min(1, 'Nama wajib diisi').max(200),
  email: z.string().email('Email tidak valid').max(200),
  password: z.string().min(6, 'Password minimal 6 karakter').max(100),
  program_studi_id: z.string().uuid().optional().nullable(),
  is_dosen_wali: z.boolean().optional().default(false),
  nik: z.string().optional().nullable(),
  tempat_lahir: z.string().optional().nullable(),
  tanggal_lahir: z.string().optional().nullable(),
  jenis_kelamin: z.enum(['L', 'P']).optional().nullable(),
  alamat: z.string().optional().nullable(),
  no_hp: z.string().optional().nullable(),
});

export const dosenUpdateSchema = z.object({
  nama: z.string().min(1).max(200).optional(),
  program_studi_id: z.string().uuid().optional().nullable(),
  is_dosen_wali: z.boolean().optional(),
  nik: z.string().optional().nullable(),
  tempat_lahir: z.string().optional().nullable(),
  tanggal_lahir: z.string().optional().nullable(),
  jenis_kelamin: z.enum(['L', 'P']).optional().nullable(),
  alamat: z.string().optional().nullable(),
  no_hp: z.string().optional().nullable(),
});

export const mataKuliahCreateSchema = z.object({
  kode: z.string().min(1, 'Kode wajib diisi').max(20),
  nama: z.string().min(1, 'Nama wajib diisi').max(200),
  sks: z.number().int('SKS harus angka').min(1).max(24),
  semester: z.number().int('Semester harus angka').min(1).max(14),
  program_studi_id: z.string().uuid().optional().nullable(),
  is_active: z.boolean().optional().default(true),
});

export const mataKuliahUpdateSchema = z.object({
  kode: z.string().min(1).max(20).optional(),
  nama: z.string().min(1).max(200).optional(),
  sks: z.number().int().min(1).max(24).optional(),
  semester: z.number().int().min(1).max(14).optional(),
  program_studi_id: z.string().uuid().optional().nullable(),
  is_active: z.boolean().optional(),
});

export const prodiCreateSchema = z.object({
  kode: z.string().min(1, 'Kode wajib diisi').max(20),
  nama: z.string().min(1, 'Nama wajib diisi').max(200),
  jenjang: z.enum(['D3', 'S1', 'S2', 'S3', 'Profesi', 'Spesialis']),
  fakultas: z.string().optional().nullable(),
  akreditasi: z.enum(['Unggul', 'Baik Sekali', 'Baik']).optional().nullable(),
});

export const prodiUpdateSchema = z.object({
  kode: z.string().min(1).max(20).optional(),
  nama: z.string().min(1).max(200).optional(),
  jenjang: z.enum(['D3', 'S1', 'S2', 'S3', 'Profesi', 'Spesialis']).optional(),
  fakultas: z.string().optional().nullable(),
  akreditasi: z.enum(['Unggul', 'Baik Sekali', 'Baik']).optional().nullable(),
});

export const jadwalCreateSchema = z.object({
  mata_kuliah_id: z.string().uuid('Mata kuliah tidak valid'),
  dosen_id: z.string().uuid('Dosen tidak valid'),
  hari: z.enum(['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu']),
  jam_mulai: z.string().regex(/^\d{2}:\d{2}$/, 'Format jam HH:MM'),
  jam_selesai: z.string().regex(/^\d{2}:\d{2}$/, 'Format jam HH:MM'),
  ruangan: z.string().max(50).optional().nullable(),
  kelas: z.string().max(10).optional().default('A'),
  kuota: z.number().int().min(1).max(200).optional().default(40),
  tahun_akademik: z.string().max(20),
  semester: z.enum(['Ganjil', 'Genap', 'Pendek']),
});

export const kurikulumCreateSchema = z.object({
  kode: z.string().min(1, 'Kode wajib diisi').max(20),
  nama: z.string().min(1, 'Nama wajib diisi').max(200),
  program_studi_id: z.string().uuid('Program studi tidak valid'),
  tahun_mulai: z.number().int().positive(),
  tahun_selesai: z.number().int().positive().optional().nullable(),
  total_sks: z.number().int().min(0).optional().default(0),
  is_active: z.boolean().optional().default(true),
});

export const userCreateSchema = z.object({
  email: z.string().email('Email tidak valid').max(200),
  password: z.string().min(6, 'Password minimal 6 karakter').max(100),
  nama: z.string().min(1, 'Nama wajib diisi').max(200),
  role: z.enum(['admin', 'akademik', 'keuangan', 'dosen', 'mahasiswa']),
  nidn: z.string().optional().nullable(),
  nim: z.string().optional().nullable(),
  no_hp: z.string().optional().nullable(),
});
