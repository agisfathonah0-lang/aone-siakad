import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '..', 'data', 'campusone.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export function seedDatabase(): void {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL,
      password TEXT NOT NULL,
      avatar TEXT,
      nim_nip TEXT,
      prodi TEXT
    );

    CREATE TABLE IF NOT EXISTS campuses (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Aktif',
      package TEXT NOT NULL,
      expiresAt TEXT NOT NULL,
      students INTEGER NOT NULL DEFAULT 0,
      lecturers INTEGER NOT NULL DEFAULT 0,
      programs INTEGER NOT NULL DEFAULT 0,
      location TEXT NOT NULL,
      logo TEXT DEFAULT '',
      subdomain TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS campus_web_settings (
      campus_id TEXT NOT NULL,
      setting_key TEXT NOT NULL,
      setting_value TEXT DEFAULT '',
      updated_at TEXT DEFAULT '',
      PRIMARY KEY (campus_id, setting_key),
      FOREIGN KEY (campus_id) REFERENCES campuses(id)
    );

    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      nim TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      prodi TEXT NOT NULL,
      fakultas TEXT NOT NULL,
      semester INTEGER NOT NULL,
      ipk REAL NOT NULL,
      ips TEXT NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'Aktif',
      phone TEXT,
      address TEXT
    );

    CREATE TABLE IF NOT EXISTS lecturers (
      id TEXT PRIMARY KEY,
      nip TEXT NOT NULL UNIQUE,
      nidn TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      prodi TEXT NOT NULL,
      fakultas TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Aktif',
      teachingLoads TEXT NOT NULL DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      sks INTEGER NOT NULL,
      semester INTEGER NOT NULL,
      type TEXT NOT NULL DEFAULT 'Wajib',
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS schedules (
      id TEXT PRIMARY KEY,
      day TEXT NOT NULL,
      time TEXT NOT NULL,
      course TEXT NOT NULL,
      lecturer TEXT NOT NULL,
      room TEXT NOT NULL,
      class TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS pmb_applicants (
      id TEXT PRIMARY KEY,
      applicantNumber TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      selectionPath TEXT NOT NULL,
      firstChoice TEXT NOT NULL,
      secondChoice TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Registrasi',
      pembayaranStatus TEXT NOT NULL DEFAULT 'Belum Bayar',
      score REAL,
      wawancaraNote TEXT
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      nim TEXT NOT NULL,
      studentName TEXT NOT NULL,
      prodi TEXT NOT NULL,
      amount REAL NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Belum Bayar',
      dueDate TEXT NOT NULL,
      payments TEXT NOT NULL DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS sync_logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      type TEXT NOT NULL,
      recordsSynced INTEGER NOT NULL DEFAULT 0,
      recordsFailed INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS lms_courses (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      lecturer TEXT NOT NULL,
      syllabus TEXT,
      materials TEXT NOT NULL DEFAULT '[]',
      assignments TEXT NOT NULL DEFAULT '[]',
      quizzes TEXT NOT NULL DEFAULT '[]',
      discussions TEXT NOT NULL DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS ojs_journals (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      journalCategory TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Terbit',
      issue TEXT,
      publishedAt TEXT NOT NULL,
      impactFactor REAL NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS alumni_surveys (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      gradYear INTEGER NOT NULL,
      company TEXT,
      position TEXT,
      monthlySalary REAL NOT NULL DEFAULT 0,
      timeToGetJob INTEGER NOT NULL DEFAULT 0,
      relevance TEXT NOT NULL DEFAULT 'Cukup'
    );

    CREATE TABLE IF NOT EXISTS tickets (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      campus TEXT NOT NULL,
      priority TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Terbuka',
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS lecturer_attendance (
      id TEXT PRIMARY KEY,
      lecturerNip TEXT NOT NULL,
      lecturerName TEXT NOT NULL,
      date TEXT NOT NULL,
      checkIn TEXT,
      checkOut TEXT,
      status TEXT NOT NULL DEFAULT 'HADIR',
      note TEXT,
      course TEXT,
      class TEXT,
      UNIQUE(lecturerNip, date)
    );

    CREATE TABLE IF NOT EXISTS web_settings (
      id TEXT PRIMARY KEY,
      setting_key TEXT NOT NULL UNIQUE,
      setting_value TEXT NOT NULL,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS firewall_logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      sourceIp TEXT NOT NULL,
      type TEXT NOT NULL,
      severity TEXT NOT NULL DEFAULT 'MEDIUM',
      path TEXT,
      userAgent TEXT,
      status TEXT NOT NULL DEFAULT 'BLOCKED',
      action TEXT NOT NULL DEFAULT 'BLOCK',
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS blocked_ips (
      id TEXT PRIMARY KEY,
      ip TEXT NOT NULL UNIQUE,
      reason TEXT NOT NULL,
      blockedAt TEXT NOT NULL,
      blockedBy TEXT,
      expiresAt TEXT,
      status TEXT NOT NULL DEFAULT 'ACTIVE'
    );
    CREATE TABLE IF NOT EXISTS cctv_cameras (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      rtsp_url TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'Aktif',
      created_at TEXT NOT NULL
    );
  `);

  // Migrations for existing databases
  try { db.exec('ALTER TABLE campuses ADD COLUMN logo TEXT DEFAULT \'\''); } catch {}
  try { db.exec('ALTER TABLE campuses ADD COLUMN subdomain TEXT DEFAULT \'\''); } catch {}
  try { db.exec('ALTER TABLE web_settings ADD COLUMN updated_at TEXT DEFAULT \'\''); } catch {}
  try { db.exec('CREATE TABLE IF NOT EXISTS campus_web_settings (campus_id TEXT NOT NULL, setting_key TEXT NOT NULL, setting_value TEXT DEFAULT \'\', updated_at TEXT DEFAULT \'\', PRIMARY KEY (campus_id, setting_key), FOREIGN KEY (campus_id) REFERENCES campuses(id))'); } catch {}
  try { db.exec("ALTER TABLE cctv_cameras ADD COLUMN snapshot TEXT DEFAULT ''"); } catch {}
  try { db.exec("ALTER TABLE cctv_cameras ADD COLUMN snapshot_at TEXT DEFAULT ''"); } catch {}
  try { db.exec("ALTER TABLE cctv_cameras ADD COLUMN is_broadcasting INTEGER DEFAULT 0"); } catch {}

  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count > 0) return;

  const insertUser = db.prepare(`INSERT INTO users (id, name, email, role, password, avatar, nim_nip, prodi) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
  const insertCampus = db.prepare(`INSERT INTO campuses (id, name, code, status, package, expiresAt, students, lecturers, programs, location, logo, subdomain) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const insertStudent = db.prepare(`INSERT INTO students VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const insertLecturer = db.prepare(`INSERT INTO lecturers VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const insertCourse = db.prepare(`INSERT INTO courses VALUES (?, ?, ?, ?, ?, ?, ?)`);
  const insertSchedule = db.prepare(`INSERT INTO schedules VALUES (?, ?, ?, ?, ?, ?, ?)`);
  const insertPMB = db.prepare(`INSERT INTO pmb_applicants VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const insertInvoice = db.prepare(`INSERT INTO invoices VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const insertSyncLog = db.prepare(`INSERT INTO sync_logs VALUES (?, ?, ?, ?, ?, ?)`);
  const insertLMSCourse = db.prepare(`INSERT INTO lms_courses VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const insertOJS = db.prepare(`INSERT INTO ojs_journals VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
  const insertAlumni = db.prepare(`INSERT INTO alumni_surveys VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
  const insertTicket = db.prepare(`INSERT INTO tickets VALUES (?, ?, ?, ?, ?, ?, ?)`);
  const insertAttendance = db.prepare(`INSERT INTO lecturer_attendance (id, lecturerNip, lecturerName, date, checkIn, checkOut, status, note, course, class) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const insertWebSetting = db.prepare(`INSERT INTO web_settings (id, setting_key, setting_value, updated_at) VALUES (?, ?, ?, ?)`);
  const insertFirewallLog = db.prepare(`INSERT INTO firewall_logs (id, timestamp, sourceIp, type, severity, path, userAgent, status, action, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const insertBlockedIp = db.prepare(`INSERT INTO blocked_ips (id, ip, reason, blockedAt, blockedBy, expiresAt, status) VALUES (?, ?, ?, ?, ?, ?, ?)`);
  const insertCctvCamera = db.prepare(`INSERT INTO cctv_cameras (id, name, location, rtsp_url, status, created_at) VALUES (?, ?, ?, ?, ?, ?)`);

  const transaction = db.transaction(() => {
    insertUser.run('user-super', 'Super Admin', 'super_admin@aone-project.id', 'SUPER_ADMIN', 'admin123', null, null, null);
    insertUser.run('user-akademik', 'Admin Akademik', 'akademik@aone-project.id', 'AKADEMIK', 'admin123', null, null, null);
    insertUser.run('user-keuangan', 'Admin Keuangan', 'keuangan@aone-project.id', 'KEUANGAN', 'admin123', null, null, null);
    insertUser.run('user-dosen', 'Dr. Rina Kartika, M.T.', 'dosen@aone-project.id', 'DOSEN', 'admin123', null, 'NIDN 0415128902', 'Teknik Informatika');
    insertUser.run('user-mahasiswa', 'Ahmad Fauzi', 'mahasiswa@aone-project.id', 'MAHASISWA', 'admin123', null, '20220801001', 'Sistem Informasi');
    insertUser.run('user-pmb', 'Bayu Nugroho', 'pmb@aone-project.id', 'PMB_APPLICANT', 'admin123', null, null, 'Teknik Informatika');

    const campuses = [
      ['UND-JKT', 'Universitas Nusantara Digital - Jakarta', 'UND01', 'Aktif', 'Enterprise Platinum', '2028-12-31', 12450, 450, 18, 'Jakarta Selatan', '', 'und-jkt'],
      ['UND-YOG', 'Universitas Nusantara Digital - Yogyakarta', 'UND02', 'Aktif', 'Enterprise Gold', '2027-08-15', 6200, 210, 12, 'Sleman, DIY', '', 'und-yog'],
      ['UND-SUB', 'Universitas Nusantara Digital - Surabaya', 'UND03', 'Aktif', 'SaaS Pro', '2026-11-20', 4800, 160, 9, 'Surabaya, Jawa Timur', '', 'und-sub'],
      ['UND-MED', 'Universitas Nusantara Digital - Medan', 'UND04', 'Aktif', 'SaaS Standard', '2026-06-30', 3100, 110, 6, 'Medan, Sumatera Utara', '', 'und-med'],
      ['UND-BDG', 'Universitas Nusantara Digital - Bandung', 'UND05', 'Nonaktif', 'SaaS Trial', '2026-05-15', 850, 35, 4, 'Bandung, Jawa Barat', '', 'und-bdg'],
    ];
    campuses.forEach(c => insertCampus.run(...c));

    // Seed per-campus web settings
    const insertCampusWeb = db.prepare(`INSERT OR IGNORE INTO campus_web_settings (campus_id, setting_key, setting_value, updated_at) VALUES (?, ?, ?, ?)`);
    const campusSettings = [
      ['UND-JKT', 'institution_name', 'Universitas Nusantara Digital - Jakarta', new Date().toISOString()],
      ['UND-JKT', 'hero_title', 'Kampus Digital Nomor 1 di Jakarta Pusat', new Date().toISOString()],
      ['UND-JKT', 'hero_subtitle', 'Bergabunglah dengan 12.000+ mahasiswa aktif. Akreditasi UNGGUL, fasilitas modern, dan kurikulum berbasis industri 4.0.', new Date().toISOString()],
      ['UND-JKT', 'ppdb_banner_title', 'PPDB 2026/2027 — Early Bird Diskon 50% UKT!', new Date().toISOString()],
      ['UND-JKT', 'ppdb_banner_subtitle', 'Hingga 31 Agustus 2026. Daftar sekarang dan dapatkan potongan UKT hingga Rp 3.750.000/semester.', new Date().toISOString()],
      ['UND-JKT', 'footer_text', 'Kampus Unggul Berbasis Teknologi Digital — UND Jakarta. Terakreditasi BAN-PT UNGGUL.', new Date().toISOString()],
      ['UND-JKT', 'primary_color', '#059669', new Date().toISOString()],
      ['UND-JKT', 'brochure_title', 'Brosur PPDB 2026/2027', new Date().toISOString()],
      ['UND-JKT', 'brochure_desc', 'Dapatkan brosur digital lengkap dengan informasi program studi, biaya UKT, dan jalur beasiswa.', new Date().toISOString()],
      ['UND-JKT', 'program_count', '18 Program Studi', new Date().toISOString()],
      ['UND-JKT', 'accreditation', 'Akreditasi UNGGUL', new Date().toISOString()],
      ['UND-YOG', 'institution_name', 'Universitas Nusantara Digital - Yogyakarta', new Date().toISOString()],
      ['UND-YOG', 'hero_title', 'Pendidikan Bermutu dari Kota Pelajar', new Date().toISOString()],
      ['UND-YOG', 'hero_subtitle', 'Belajar di kota dengan atmosfer akademik terbaik. 6.200+ mahasiswa telah memilih UND Yogyakarta.', new Date().toISOString()],
      ['UND-YOG', 'ppdb_banner_title', 'PMB 2026/2027 — Beasiswa 100% UKT untuk 10 Pendaftar Terbaik!', new Date().toISOString()],
      ['UND-YOG', 'ppdb_banner_subtitle', 'Jalur beasiswa penuh rektor untuk mahasiswa berprestasi. SEGERA daftar, kuota terbatas!', new Date().toISOString()],
      ['UND-YOG', 'footer_text', 'UND Yogyakarta — Mencetak Generasi Berkarakter & Berdaya Saing Global.', new Date().toISOString()],
      ['UND-YOG', 'primary_color', '#7c3aed', new Date().toISOString()],
      ['UND-YOG', 'accreditation', 'Akreditasi A', new Date().toISOString()],
      ['UND-SUB', 'institution_name', 'Universitas Nusantara Digital - Surabaya', new Date().toISOString()],
      ['UND-SUB', 'hero_title', 'Ayo Kuliah di Kota Pahlawan!', new Date().toISOString()],
      ['UND-SUB', 'hero_subtitle', 'Kampus digital modern di pusat kota Surabaya. 4.800+ mahasiswa, 9 program studi unggulan.', new Date().toISOString()],
      ['UND-SUB', 'ppdb_banner_title', 'PMB 2026 — Diskon UKT 30% untuk Pendaftar Awal', new Date().toISOString()],
      ['UND-SUB', 'primary_color', '#2563eb', new Date().toISOString()],
      ['UND-SUB', 'accreditation', 'Akreditasi B', new Date().toISOString()],
      ['UND-MED', 'institution_name', 'Universitas Nusantara Digital - Medan', new Date().toISOString()],
      ['UND-MED', 'hero_title', 'Pusat Pendidikan Digital di Sumatera Utara', new Date().toISOString()],
      ['UND-MED', 'hero_subtitle', 'Kampus digital terkemuka di Medan dengan 3.100+ mahasiswa dan 6 program studi.', new Date().toISOString()],
      ['UND-MED', 'ppdb_banner_title', 'PMB 2026 — Gratis Biaya Pendaftaran!', new Date().toISOString()],
      ['UND-MED', 'primary_color', '#dc2626', new Date().toISOString()],
      ['UND-MED', 'accreditation', 'Akreditasi B', new Date().toISOString()],
      ['UND-BDG', 'institution_name', 'Universitas Nusantara Digital - Bandung', new Date().toISOString()],
      ['UND-BDG', 'hero_title', 'Kampus Kreatif Digital di Bandung', new Date().toISOString()],
      ['UND-BDG', 'hero_subtitle', 'Bergabung dengan ekosistem kreatif digital Bandung. 4 program studi dengan kurikulum industri kreatif.', new Date().toISOString()],
      ['UND-BDG', 'ppdb_banner_title', 'PMB 2026 — Kembali Dibuka! Pendaftaran Gelombang 2', new Date().toISOString()],
      ['UND-BDG', 'primary_color', '#d97706', new Date().toISOString()],
      ['UND-BDG', 'accreditation', 'Akreditasi B', new Date().toISOString()],
    ];
    campusSettings.forEach(s => insertCampusWeb.run(...s));

    const students = [
      ['S001', '20220801001', 'Ahmad Fauzi', 'ahmad.fauzi@student.aone-project.id', 'Sistem Informasi', 'Fakultas Sains & Teknologi', 4, 3.82, '[3.75,3.80,3.90,3.82]', 'Aktif', '081234567890', 'Jl. Raya Kebayoran No. 12, Jakarta'],
      ['S002', '20220801002', 'Muhammad Rizki', 'muhammad.rizki@student.aone-project.id', 'Teknik Informatika', 'Fakultas Sains & Teknologi', 4, 3.65, '[3.50,3.70,3.72,3.68]', 'Aktif', '081298765432', 'Jl. Kemang Timur No. 45, Jakarta'],
      ['S003', '20230501015', 'Siti Rahmawati', 'siti.rahmawati@student.aone-project.id', 'Ekonomi Syariah', 'Fakultas Ekonomi & Bisnis Islam', 2, 3.95, '[3.90,4.00]', 'Aktif', '082145678901', 'Jl. Margonda Raya No. 100, Depok'],
      ['S004', '20210202022', 'Nur Aisyah', 'nur.aisyah@student.aone-project.id', 'Pendidikan Guru Madrasah Ibtidaiyah', 'Fakultas Ilmu Tarbiyah & Keguruan', 6, 3.55, '[3.40,3.50,3.60,3.55,3.70,3.55]', 'Aktif', '085311223344', 'Jl. Ciputat Raya No. 88, Tangerang Selatan'],
      ['S005', '20210103009', 'Dedi Saputra', 'dedi.saputra@student.aone-project.id', 'Hukum Keluarga Islam', 'Fakultas Syariah', 6, 3.48, '[3.30,3.45,3.52,3.40,3.61,3.54]', 'Cuti', '087855667788', 'Jl. Tebet Barat Dalam No. 15, Jakarta'],
    ];
    students.forEach(s => insertStudent.run(...s));

    const lecturers = [
      ['L001', '197805122004121001', '0412057801', 'Dr. Ahmad Syukri, M.Ag.', 'ahmad.syukri@aone-project.id', 'Hukum Keluarga Islam', 'Fakultas Syariah', 'Aktif', JSON.stringify([{ course: 'Fiqh Munakahat II', class: 'HKI-A', sks: 3, students: 38 }, { course: 'Ushul Fiqh Dasar', class: 'HKI-C', sks: 2, students: 42 }, { course: 'Metodologi Penelitian Hukum Kel.', class: 'HKI-B', sks: 3, students: 35 }])],
      ['L002', '198210202008102002', '0420108202', 'Dr. Nurhayati, M.Pd.', 'nurhayati@aone-project.id', 'Pendidikan Guru Madrasah Ibtidaiyah', 'Fakultas Ilmu Tarbiyah & Keguruan', 'Aktif', JSON.stringify([{ course: 'Perkembangan Peserta Didik', class: 'PGMI-A', sks: 3, students: 40 }, { course: 'Desain Evaluasi Pembelajaran SD/MI', class: 'PGMI-B', sks: 3, students: 38 }, { course: 'Strategi Pembelajaran Inovatif', class: 'PGMI-C', sks: 2, students: 41 }])],
      ['L003', '198504032012011003', '0303048501', 'Dr. Muhammad Fadli, M.E.I.', 'm.fadli@aone-project.id', 'Ekonomi Syariah', 'Fakultas Ekonomi & Bisnis Islam', 'Aktif', JSON.stringify([{ course: 'Mikroekonomi Syariah', class: 'ES-B', sks: 3, students: 45 }, { course: 'Manajemen Keuangan Syariah', class: 'ES-A', sks: 3, students: 44 }, { course: 'Fiqh Muamalah Kontemporer', class: 'ES-D', sks: 3, students: 40 }])],
      ['L004', '198912152015042004', '0415128902', 'Dr. Rina Kartika, M.T.', 'rina.kartika@aone-project.id', 'Teknik Informatika', 'Fakultas Sains & Teknologi', 'Aktif', JSON.stringify([{ course: 'Kecerdasan Buatan', class: 'IF-A', sks: 3, students: 44 }, { course: 'Pemrograman Web Enterprise', class: 'IF-B', sks: 3, students: 42 }, { course: 'Analisis & Desain Algoritma', class: 'IF-C', sks: 3, students: 39 }])],
    ];
    lecturers.forEach(l => insertLecturer.run(...l));

    const courses = [
      ['MK001', 'INF1201', 'Algoritma & Pemrograman', 3, 1, 'Wajib', 'Konseptual pemformatan kode dasar, control flow, dan manipulasi array.'],
      ['MK002', 'INF2402', 'Database Sistem & NoSQL', 3, 3, 'Wajib', 'Pemodelan relasional dan non-relasional serta implementasi real-time query.'],
      ['MK003', 'INF3210', 'Kecerdasan Buatan l', 3, 5, 'Wajib', 'Pengenalan Machine Learning, neural network sederhana, dan LLM integration.'],
      ['MK004', 'SYS2203', 'Analisis Desain Sistem', 3, 3, 'Wajib', 'SDLC, pembuatan mockups UI, perancangan diagram UML dan use cases.'],
      ['MK005', 'SYS4101', 'Arsitektur Enterprise SaaS', 3, 7, 'Pilihan', 'Studi kasus ERP kampus, arsitektur multi-tenant, optimasi load.'],
      ['MK006', 'HUK2104', 'Fiqh Munakahat II', 3, 3, 'Wajib', 'Pembahasan mendalam tentang pernikahan dan hukum keluarga dalam Islam.'],
      ['MK007', 'EKO3202', 'Mikroekonomi Syariah', 3, 5, 'Wajib', 'Teori konsumsi, produksi, dan pasar dalam sudut pandang ekonomi Islam.'],
      ['MK008', 'FIT2211', 'Perkembangan Peserta Didik', 3, 2, 'Wajib', 'Analisis psikologis pertumbuhan anak usia MI/SD.'],
    ];
    courses.forEach(c => insertCourse.run(...c));

    const schedules = [
      ['SC001', 'Senin', '08:00 - 10:30', 'Kecerdasan Buatan', 'Dr. Rina Kartika, M.T.', 'Lab Komputasi A', 'IF-A'],
      ['SC002', 'Senin', '13:00 - 15:30', 'Mikroekonomi Syariah', 'Dr. Muhammad Fadli, M.E.I.', 'R. Seminar FEBI', 'ES-B'],
      ['SC003', 'Selasa', '09:30 - 12:00', 'Perkembangan Peserta Didik', 'Dr. Nurhayati, M.Pd.', 'AULA FITK Lt. 3', 'PGMI-A'],
      ['SC004', 'Rabu', '10:00 - 12:30', 'Fiqh Munakahat II', 'Dr. Ahmad Syukri, M.Ag.', 'Ruang Peradilan Semu', 'HKI-A'],
      ['SC005', 'Kamis', '13:00 - 15:30', 'Pemrograman Web Enterprise', 'Dr. Rina Kartika, M.T.', 'Lab Rekayasa Perangkat Lunak', 'IF-B'],
    ];
    schedules.forEach(s => insertSchedule.run(...s));

    const pmbApplicants = [
      ['PMB-2026-001', 'PMB260001', 'Bayu Nugroho', 'bayu.nugroho@gmail.com', '081211112222', 'Jalur Mandiri', 'Teknik Informatika', 'Sistem Informasi', 'Tes Masuk', 'Lunas', 85, null],
      ['PMB-2026-002', 'PMB260002', 'Cynthia Lestari', 'cynthia.lestari@yahoo.com', '085377778888', 'Jalur Beasiswa Berprestasi', 'Ekonomi Syariah', 'Sistem Informasi', 'Lolos', 'Lunas', 94, 'Sangat direkomendasikan untuk beasiswa penuh.'],
      ['PMB-2026-003', 'PMB260003', 'Eko Sulistyo', 'eko.sulis@gmail.com', '087833334444', 'Jalur Reguler', 'Teknik Informatika', 'Hukum Keluarga Islam', 'Biodata', 'Belum Bayar', null, null],
      ['PMB-2026-004', 'PMB260004', 'Fitri Handayani', 'fitri.handa@gmail.com', '081399990000', 'Jalur Reguler', 'Pendidikan Guru Madrasah Ibtidaiyah', 'Hukum Keluarga Islam', 'Daftar Ulang', 'Lunas', 78, null],
    ];
    pmbApplicants.forEach(p => insertPMB.run(...p));

    const invoices = [
      ['INV-2026-001', '20220801001', 'Ahmad Fauzi', 'Sistem Informasi', 7500000, 'UKT', 'Lunas', '2026-07-31', JSON.stringify([{ date: '2026-05-10', amount: 7500000, method: 'Virtual Account Mandiri' }])],
      ['INV-2026-002', '20220801002', 'Muhammad Rizki', 'Teknik Informatika', 7500000, 'UKT', 'Dicicil', '2026-07-31', JSON.stringify([{ date: '2026-05-12', amount: 3750000, method: 'Virtual Account BNI' }])],
      ['INV-2026-003', '20230501015', 'Siti Rahmawati', 'Ekonomi Syariah', 5500000, 'UKT', 'Lunas', '2026-07-31', JSON.stringify([{ date: '2026-05-11', amount: 5500000, method: 'Beasiswa Undangan' }])],
      ['INV-2026-004', '20210202022', 'Nur Aisyah', 'Pendidikan Guru Madrasah Ibtidaiyah', 5000000, 'UKT', 'Belum Bayar', '2026-07-31', '[]'],
      ['INV-2026-005', '20210103009', 'Dedi Saputra', 'Hukum Keluarga Islam', 5000000, 'UKT', 'Terlambat', '2026-04-30', '[]'],
    ];
    invoices.forEach(i => insertInvoice.run(...i));

    const syncLogs = [
      ['LOG001', '2026-06-02 10:00:15', 'Mahasiswa', 340, 2, 'Peringatan'],
      ['LOG002', '2026-06-02 09:15:00', 'Dosen', 120, 0, 'Sukses'],
      ['LOG003', '2026-06-01 23:30:45', 'KRS', 1850, 12, 'Peringatan'],
      ['LOG004', '2026-06-01 18:00:22', 'Nilai', 4320, 0, 'Sukses'],
      ['LOG005', '2026-05-31 10:11:43', 'Mahasiswa', 0, 15, 'Gagal'],
    ];
    syncLogs.forEach(s => insertSyncLog.run(...s));

    const lmsCourses = [
      ['LMS001', 'INF3210', 'Kecerdasan Buatan (Artificial Intelligence)', 'Dr. Rina Kartika, M.T.', 'Mata kuliah ini membahas dasar Machine Learning, agen cerdas, logika fuzzy, heuristic search, dan model bahasa besar NLP.', JSON.stringify([{ id: 'MAT001', title: 'Pertemuan 1 - Pengantar AI dan Agen Cerdas', type: 'pdf', url: '#', postedAt: '2026-05-10' }, { id: 'MAT002', title: 'Pertemuan 2 - Uninformed & Informed Search', type: 'pdf', url: '#', postedAt: '2026-05-17' }]), JSON.stringify([{ id: 'ASM001', title: 'Tugas 1 - Implementasi Heuristic di Tic-Tac-Toe', dueDate: '2026-06-10', maxPoints: 100, instructions: 'Kumpulkan kode link repository GitHub.', submitted: true, submissionDate: '2026-05-30', grade: 92 }]), JSON.stringify([]), JSON.stringify([])],
      ['LMS002', 'INF2402', 'Database Sistem & NoSQL', 'Dr. Rina Kartika, M.T.', 'Pemodelan data, normalisasi index, optimasi query, query JSON MongoDB, dan implementasi cache Redis.', JSON.stringify([{ id: 'MAT004', title: 'Pengantar Relational DB vs NoSQL Document', type: 'pdf', url: '#', postedAt: '2026-05-08' }]), JSON.stringify([]), JSON.stringify([]), JSON.stringify([])],
    ];
    lmsCourses.forEach(l => insertLMSCourse.run(...l));

    const ojsJournals = [
      ['J001', 'Analisis Algoritma Optimasi Penjadwalan Kuliah Berbasis Heuristic Genetika', 'Dr. Ahmad Syukri, M.Ag.', 'Jurnal Komputer Nasional (JKN)', 'Terbit', 'Vol. 10 No. 2 (2026)', '2026-05-12', 2.45],
      ['J002', 'Pengaruh Kebijakan Spin-Off Unit Usaha Syariah terhadap Profitabilitas Perbankan', 'Lia Anggraini, S.E.', 'Jurnal Syariah & Pranata Sosial', 'Terbit', 'Vol. 8 No. 1 (2026)', '2026-04-18', 1.85],
      ['J003', 'Analisis Efektivitas Pelatihan Metode Pembelajaran Aktif Madrasah Ibtidaiyah', 'Dr. Nurhayati, M.Pd.', 'Jurnal Keguruan & Pendidikan', 'Dalam Reviewer', 'Vol. 12 No. 3 (2026)', '2026-05-28', 1.20],
    ];
    ojsJournals.forEach(j => insertOJS.run(...j));

    const alumni = [
      ['A001', 'Rian Hidayat', 2024, 'GoTo Group', 'Software Engineer', 12000000, 2, 'Sangat Sesuai'],
      ['A002', 'Lia Anggraini', 2024, 'Bank Syariah Indonesia (BSI)', 'Sharia Financial Analyst', 9500000, 3, 'Sangat Sesuai'],
      ['A003', 'Zainal Abidin', 2023, 'Kementerian Agama RI', 'Staf Administrasi KUA', 6200000, 5, 'Sesuai'],
      ['A004', 'Maria Ulfa', 2024, 'Ruangguru', 'Content Developer SD/MI', 7500000, 1, 'Sangat Sesuai'],
      ['A005', 'Yusuf Habibi', 2023, 'Startup Lokal', 'UI/UX Designer', 6000000, 8, 'Cukup'],
    ];
    alumni.forEach(a => insertAlumni.run(...a));

    const tickets = [
      ['TK001', 'Error Sinkronisasi Nilai PDDIKTI', 'UND Jakarta', 'Tinggi', 'PDDIKTI', 'Terbuka', '2026-06-02'],
      ['TK002', 'Penambahan Kuota Bandwidth Server LMS', 'UND Yogyakarta', 'Sedang', 'Infrastruktur', 'Dalam Proses', '2026-06-01'],
      ['TK003', 'Pertanyaan Formulir Tracer Study Kurikulum', 'UND Surabaya', 'Rendah', 'Modul Alumni', 'Selesai', '2026-05-28'],
    ];
    tickets.forEach(t => insertTicket.run(...t));

    const attendanceSeeds = [
      ['ATT001', '198912152015042004', 'Dr. Rina Kartika, M.T.', '2026-06-02', '07:45', '15:30', 'HADIR', 'Mengajar Kecerdasan Buatan dan Web Enterprise', 'Kecerdasan Buatan', 'IF-A'],
      ['ATT002', '198912152015042004', 'Dr. Rina Kartika, M.T.', '2026-06-03', '07:50', '15:15', 'HADIR', 'Mengajar Database NoSQL', 'Database Sistem & NoSQL', 'IF-B'],
      ['ATT003', '198912152015042004', 'Dr. Rina Kartika, M.T.', '2026-06-04', '08:00', '15:30', 'HADIR', 'Masuk mengajar sesuai jadwal', 'Pemrograman Web Enterprise', 'IF-B'],
      ['ATT005', '197805122004121001', 'Dr. Ahmad Syukri, M.Ag.', '2026-06-02', '09:15', '14:45', 'HADIR', 'Mengajar Fiqh Munakahat II', 'Fiqh Munakahat II', 'HKI-A'],
      ['ATT006', '197805122004121001', 'Dr. Ahmad Syukri, M.Ag.', '2026-06-03', null, null, 'IZIN', 'Mengikuti seminar nasional di Kemenag', null, null],
      ['ATT007', '198210202008102002', 'Dr. Nurhayati, M.Pd.', '2026-06-02', '07:30', '12:00', 'HADIR', 'Mengajar Perkembangan Peserta Didik', 'Perkembangan Peserta Didik', 'PGMI-A'],
      ['ATT008', '198504032012011003', 'Dr. Muhammad Fadli, M.E.I.', '2026-06-02', null, null, 'SAKIT', 'Sakit dan izin tidak masuk', null, null],
    ];
    attendanceSeeds.forEach(a => insertAttendance.run(...a));

    const defaultSettings = [
      ['WS001', 'company_name', 'AONE Project'],
      ['WS002', 'platform_name', 'AONE SIAKAD'],
      ['WS003', 'hero_title', 'Transformasi Digital Kampus Anda Dimulai dari Sini'],
      ['WS004', 'hero_subtitle', 'Platform SIAKAD all-in-one dengan integrasi PDDIKTI, akreditasi 9 standar, dan multi-tenant untuk universitas swasta dan negeri di seluruh Indonesia.'],
      ['WS005', 'hero_badge', 'SaaS Terdaftar di PDDIKTI & Kemenristek RI'],
      ['WS006', 'promo_title', 'Nikmati Bonus Spesial Akhir Tahun'],
      ['WS007', 'promo_desc', 'Setiap kampus yang mendaftar sebelum 31 Desember 2026 mendapatkan GRATIS biaya implementasi senilai Rp 25 juta, plus 3 bulan masa percobaan Enterprise tanpa biaya.'],
      ['WS008', 'promo_bonus_1', 'Gratis Migrasi Data PDDIKTI'],
      ['WS009', 'promo_bonus_2', 'Dedicated Account Manager 24/7'],
      ['WS010', 'promo_bonus_3', 'Full SSO & Integration Package'],
      ['WS011', 'about_title', 'Mengapa AONE SIAKAD?'],
      ['WS012', 'about_desc', 'Kami adalah mitra digital terpercaya bagi lebih dari 50+ universitas di Indonesia. Dengan pengalaman 10+ tahun di bidang educational technology, AONE Project hadir untuk menyederhanakan kompleksitas administrasi akademik melalui satu platform terpadu.'],
      ['WS013', 'feature_1_title', 'Multi-Tenant Arsitektur'],
      ['WS013a', 'feature_1_desc', 'Setiap kampus mendapat environment terisolasi dengan database dan konfigurasi sendiri.'],
      ['WS014', 'feature_2_title', 'Sinkronasi PDDIKTI Real-time'],
      ['WS014a', 'feature_2_desc', 'Laporan otomatis ke PDDIKTI tanpa perlu repot. Cukup satu klik, semua data terkirim.'],
      ['WS015', 'feature_3_title', 'Akreditasi 9 Standar BAN-PT'],
      ['WS015a', 'feature_3_desc', 'Dashboard khusus untuk memonitor dan memenuhi 9 standar akreditasi dengan rekomendasi otomatis.'],
      ['WS016', 'feature_4_title', 'Manajemen Keuangan Terpadu'],
      ['WS016a', 'feature_4_desc', 'Multi payment gateway, virtual account, beasiswa, cicilan UKT, dan pelaporan keuangan real-time.'],
      ['WS017', 'cta_title', 'Siap Bertransformasi?'],
      ['WS018', 'cta_desc', 'Bergabunglah dengan 50+ universitas yang telah mempercayakan sistem akademiknya kepada AONE SIAKAD. Konsultasi gratis tanpa biaya.'],
      ['WS019', 'stats_campus', '50+'],
      ['WS020', 'stats_campus_label', 'Kampus Mitra Aktif'],
      ['WS021', 'stats_students', '250.000+'],
      ['WS022', 'stats_students_label', 'Mahasiswa Terdaftar'],
      ['WS023', 'stats_uptime', '99.99%'],
      ['WS024', 'stats_uptime_label', 'Service Uptime'],
      ['WS025', 'stats_years', '10+'],
      ['WS026', 'stats_years_label', 'Tahun Pengalaman'],
      ['WS027', 'footer_text', '© 2026 AONE Project. All rights reserved. Platform SIAKAD all-in-one untuk universitas Indonesia.'],
      ['WS028', 'primary_color', '#059669'],
    ];
    defaultSettings.forEach(s => insertWebSetting.run(...s, new Date().toISOString()));

    const attackLogs = [
      ['FL001', '2026-06-04 08:12:33', '203.0.113.45', 'BRUTE_FORCE', 'CRITICAL', '/api/auth/login', 'Mozilla/5.0', 'BLOCKED', 'BLOCK', 'Brute force 156 attempts within 2 minutes'],
      ['FL002', '2026-06-04 09:45:12', '198.51.100.22', 'SQL_INJECTION', 'HIGH', '/api/students', 'sqlmap/1.8', 'BLOCKED', 'BLOCK', 'SQL injection pattern detected in query params'],
      ['FL003', '2026-06-04 10:30:55', '192.0.2.88', 'XSS', 'MEDIUM', '/api/pmb', 'Mozilla/5.0', 'MITIGATED', 'CHALLENGE', 'XSS payload in form input - sanitized'],
      ['FL004', '2026-06-04 11:15:08', '203.0.113.120', 'DDoS', 'CRITICAL', '/api/health', '', 'MITIGATED', 'RATE_LIMIT', 'Rate limit triggered - 5000 req/min from single IP'],
      ['FL005', '2026-06-04 12:00:00', '198.51.100.67', 'BRUTE_FORCE', 'HIGH', '/api/auth/login', 'PostmanRuntime/7.36', 'BLOCKED', 'BLOCK', 'Credential stuffing detected with common passwords'],
      ['FL006', '2026-06-04 13:22:17', '185.220.101.34', 'MALICIOUS', 'MEDIUM', '/api/invoices', 'curl/8.4', 'BLOCKED', 'BLOCK', 'Known malicious IP from threat intelligence'],
      ['FL007', '2026-06-04 14:05:44', '203.0.113.200', 'XSS', 'LOW', '/api/alumni', 'Mozilla/5.0', 'MONITORED', 'LOG', 'Suspicious script tag in alumni survey response'],
      ['FL008', '2026-06-04 14:30:22', '198.51.100.90', 'SQL_INJECTION', 'HIGH', '/api/courses', 'Go-http-client/2.0', 'BLOCKED', 'BLOCK', 'UNION-based SQL injection attempt'],
      ['FL009', '2026-06-04 15:00:00', '192.0.2.150', 'BRUTE_FORCE', 'CRITICAL', '/api/auth/login', 'Python-requests/2.31', 'BLOCKED', 'BLOCK', 'Distributed brute force from botnet node'],
      ['FL010', '2026-06-04 15:45:33', '185.220.102.12', 'MALICIOUS', 'LOW', '/api/lecturers', 'Wget/1.21', 'MONITORED', 'LOG', 'Directory traversal attempt detected'],
      ['FL011', '2026-06-03 22:10:00', '203.0.113.77', 'DDoS', 'CRITICAL', '/api/attendance', '', 'MITIGATED', 'RATE_LIMIT', 'Layer 7 DDoS mitigated by WAF rules'],
      ['FL012', '2026-06-03 18:30:15', '198.51.100.55', 'SQL_INJECTION', 'HIGH', '/api/students', 'Mozilla/5.0', 'BLOCKED', 'BLOCK', 'Blind SQL injection via time-based technique'],
    ];
    attackLogs.forEach(l => insertFirewallLog.run(...l));

    const blockedIps = [
      ['BIP001', '203.0.113.45', 'Brute force attack - 156 attempts in 2 menit', '2026-06-04 08:15:00', 'System (WAF)', '2026-07-04', 'ACTIVE'],
      ['BIP002', '185.220.101.34', 'Known malicious IP - threat intelligence match', '2026-06-04 13:30:00', 'Admin (Otomatis)', null, 'ACTIVE'],
      ['BIP003', '198.51.100.22', 'SQL injection attack detected', '2026-06-03 09:50:00', 'System (IDS)', '2026-06-18', 'ACTIVE'],
    ];
    blockedIps.forEach(b => insertBlockedIp.run(...b));

    const cameras = [
      ['CAM-001', 'Gerbang Utama', 'Pintu Masuk Kampus - Depan', '', 'Aktif', '2026-01-01'],
      ['CAM-002', 'Lab Informatika', 'Lantai 3 Gedung A - Lab Komputer', '', 'Aktif', '2026-01-01'],
      ['CAM-003', 'Parkir Barat', 'Area Parkir Dosen & Tamu', '', 'Aktif', '2026-01-01'],
      ['CAM-004', 'Aula Serbaguna', 'Gedung Rektorat Lantai 2', '', 'Nonaktif', '2026-01-01'],
    ];
    cameras.forEach(c => insertCctvCamera.run(...c));
  });

  transaction();
}
