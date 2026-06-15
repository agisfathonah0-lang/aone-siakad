<div align="center">
  <h1>AONE SIAKAD</h1>
  <p><strong>Sistem Informasi Akademik Terpadu</strong></p>
  <p>Multi-tenant, Role-based, Modern Web Application</p>
  <br/>
</div>

AONE SIAKAD adalah Sistem Informasi Akademik berbasis web dengan arsitektur multi-tenant yang mendukung isolasi data antar institusi pendidikan. Dibangun menggunakan Express.js, React, TypeScript, dan PostgreSQL.

## Fitur

### Akademik
- **Manajemen Mahasiswa** — Data mahasiswa, status, angkatan
- **Manajemen Dosen** — Data dosen, NIDN, homebase prodi
- **KRS** — Pengisian Kartu Rencana Studi online
- **KHS** — Kartu Hasil Studi per semester
- **Jadwal Kuliah** — Penjadwalan mata kuliah per ruang & waktu
- **Cetak PDF** — Cetak KHS, KRS, Transkrip nilai (A4, pdfkit)

### Kurikulum & Perkuliahan
- **Kurikulum** — Struktur kurikulum per prodi
- **RPS** — Rencana Pembelajaran Semester
- **BAP** — Berita Acara Perkuliahan
- **Absensi Dosen** — Rekap kehadiran dosen mengajar

### Kemahasiswaan
- **Beasiswa** — Pendaftaran, seleksi (approve/reject), pencairan dana
- **Seminar** — Pendaftaran & peserta seminar
- **Sidang** — Jadwal sidang, nilai huruf otomatis (A≥85, A-≥80, ...)
- **PKL** — Pendaftaran PKL, logbook harian, penilaian
- **KKN** — Kelompok KKN, anggota, logbook

### Sistem Penunjang
- **EDOM** — Evaluasi Dosen oleh Mahasiswa (skala 1-5, rekap)
- **Perpustakaan** — Manajemen buku, anggota, peminjaman, denda otomatis (Rp1000/hari)
- **Surat** — Surat masuk/keluar, disposisi, pengajuan, auto-nomor surat
- **Akreditasi BAN-PT** — 9 standar SN-DIKTI, dokumen pendukung
- **OJS Integration** — Open Journal Systems connection, proxy, sync submissions

### Infrastruktur
- **Multi-tenant** — Isolasi schema per institusi
- **Role-based Access** — 13 role (vendor_super_admin s.d. alumni) dengan hierarki
- **Subscription** — Status aktif/kadaluwarsa per tenant, blokir 402
- **Midtrans** — Integrasi pembayaran (production-ready)
- **WebSocket** — Real-time notification per user/tenant
- **PWA** — Manifest + Service Worker, install banner
- **Light/Dark Mode** — Theme toggle dengan persistensi localStorage
- **Landing Pages** — Vendor landing + per-campus landing + PPDB wizard

## Tech Stack

| Layer      | Teknologi |
|------------|-----------|
| Backend    | Express.js, TypeScript, PostgreSQL (node-postgres) |
| Frontend   | React 19, TypeScript, Vite |
| Styling    | Tailwind CSS 4, Jakarta Sans + Inter fonts |
| Auth       | JWT (access + refresh), bcryptjs |
| PDF        | pdfkit |
| Queue      | Bull + Redis |
| Storage    | MinIO (file upload) |
| Email      | Nodemailer |
| Payment    | Midtrans (Core API) |
| Realtime   | ws (WebSocket) |

## Struktur Proyek

```
aone-siakad/
├── backend/
│   ├── src/
│   │   ├── config/           # Environment & DB config
│   │   ├── database/
│   │   │   ├── migrations/   # SQL migrations (011-023 tenant, p001-p006 public)
│   │   │   └── seed/         # Seed data
│   │   ├── middleware/       # campusGuard, requireRole, requireTenantAccess, dll
│   │   ├── modules/          # Per-modul routes & services
│   │   │   ├── akademik/     # Mahasiswa, dosen, KRS, KHS, jadwal, cetak, surat, edom
│   │   │   ├── auth/         # Login, register, refresh token
│   │   │   ├── kurikulum/    # Kurikulum, RPS, BAP
│   │   │   ├── beasiswa/
│   │   │   ├── perpustakaan/
│   │   │   ├── akreditasi/
│   │   │   ├── seminar/
│   │   │   ├── sidang/
│   │   │   ├── pkl/
│   │   │   ├── kkn/
│   │   │   ├── absensi/
│   │   │   ├── ojs/
│   │   │   ├── lms/
│   │   │   └── webhook/      # Midtrans payment notification
│   │   ├── services/         # WebSocket, tenant provisioning, dll
│   │   └── index.ts          # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/              # Axios client, AuthContext
│   │   ├── components/       # UI components (Card, StatCard, PageHeader, ThemeToggle)
│   │   ├── context/          # ThemeContext, AuthContext
│   │   ├── pages/            # All pages (dashboard, akademik, edom, beasiswa, dll)
│   │   │   ├── vendor/       # Vendor panel pages
│   │   │   └── ...           # Campus pages
│   │   ├── utils/            # Roles, helpers
│   │   ├── App.tsx           # Router + layout
│   │   └── main.tsx          # Entry point + PWA register
│   └── package.json
├── Dockerfile                # Multi-stage build (production)
├── render.yaml               # Render deployment config
├── Procfile                  # Render start command
└── docker-compose.yml        # Local dev with PostgreSQL + Redis + MinIO
```

## Persiapan Lingkungan

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Redis (opsional, untuk queue)
- MinIO (opsional, untuk file storage)

### Setup Lokal

1. Clone repo:
   ```bash
   git clone https://github.com/agisfathonah0-lang/aone-siakad.git
   cd aone-siakad
   ```

2. Setup backend:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env dengan konfigurasi database kamu
   npm install
   npm run migrate
   npm run seed
   npm run dev
   ```

3. Setup frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. Buka `http://localhost:3000`

### Docker (alternatif)
```bash
docker-compose up -d
```

## Environment Variables

Backend membutuhkan variable environment berikut (lihat `.env.example`):

| Variable            | Keterangan                    |
|---------------------|-------------------------------|
| `DATABASE_URL`      | PostgreSQL connection string  |
| `JWT_VENDOR_SECRET` | Secret untuk JWT vendor panel |
| `JWT_CAMPUS_SECRET` | Secret untuk JWT campus users |
| `MIDTRANS_*`        | Midtrans production keys      |
| `MINIO_*`           | MinIO file storage config     |
| `SMTP_*`            | Email SMTP config             |
| `REDIS_*`           | Redis queue config            |

## Deployment

Proyek ini siap di-deploy ke **Render**:

1. Buat PostgreSQL di Render
2. Hubungkan repo GitHub ke Render Web Service
3. Set environment variables di dashboard Render
4. Deploy otomatis

Lihat [`render.yaml`](render.yaml) untuk konfigurasi lengkap.

## Role System

| Role               | Level | Akses                      |
|--------------------|-------|----------------------------|
| vendor_super_admin | 100   | Semua tenant, panel vendor |
| super_admin        | 90    | Semua fitur dalam tenant   |
| rektor             | 88    | Manajemen institusi        |
| admin              | 85    | Admin sistem               |
| dekan              | 80    | Manajemen fakultas         |
| akademik           | 75    | Akademik                   |
| kaprodi            | 70    | Program studi              |
| keuangan           | 60    | Keuangan                   |
| pustakawan         | 55    | Perpustakaan               |
| dosen              | 50    | Dosen pengajar             |
| mahasiswa          | 40    | Mahasiswa                  |
| calon_mahasiswa    | 30    | Pendaftar PPDB             |
| alumni             | 20    | Alumni                     |

## Lisensi

Hak cipta © 2026 AONE Campus. All rights reserved.
