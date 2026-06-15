import { Campus, Student, Lecturer, Course, Schedule, PMBApplicant, Invoice, SyncLog, LMSCourse, OJSJournal, AlumniSurvey } from './types';

export const CAMPUS_LIST: Campus[] = [
  {
    id: 'UND-JKT',
    name: 'Universitas Nusantara Digital - Jakarta',
    code: 'UND01',
    status: 'Aktif',
    package: 'Enterprise Platinum',
    expiresAt: '2028-12-31',
    students: 12450,
    lecturers: 450,
    programs: 18,
    location: 'Jakarta Selatan',
  },
  {
    id: 'UND-YOG',
    name: 'Universitas Nusantara Digital - Yogyakarta',
    code: 'UND02',
    status: 'Aktif',
    package: 'Enterprise Gold',
    expiresAt: '2027-08-15',
    students: 6200,
    lecturers: 210,
    programs: 12,
    location: 'Sleman, DIY',
  },
  {
    id: 'UND-SUB',
    name: 'Universitas Nusantara Digital - Surabaya',
    code: 'UND03',
    status: 'Aktif',
    package: 'SaaS Pro',
    expiresAt: '2026-11-20',
    students: 4800,
    lecturers: 160,
    programs: 9,
    location: 'Surabaya, Jawa Timur',
  },
  {
    id: 'UND-MED',
    name: 'Universitas Nusantara Digital - Medan',
    code: 'UND04',
    status: 'Aktif',
    package: 'SaaS Standard',
    expiresAt: '2026-06-30',
    students: 3100,
    lecturers: 110,
    programs: 6,
    location: 'Medan, Sumatera Utara',
  },
  {
    id: 'UND-BDG',
    name: 'Universitas Nusantara Digital - Bandung',
    code: 'UND05',
    status: 'Nonaktif',
    package: 'SaaS Trial',
    expiresAt: '2026-05-15',
    students: 850,
    lecturers: 35,
    programs: 4,
    location: 'Bandung, Jawa Barat',
  }
];

export const STUDENT_LIST: Student[] = [
  {
    id: 'S001',
    nim: '20220801001',
    name: 'Ahmad Fauzi',
    email: 'ahmad.fauzi@student.aone-project.id',
    prodi: 'Sistem Informasi',
    fakultas: 'Fakultas Sains & Teknologi',
    semester: 4,
    ipk: 3.82,
    ips: [3.75, 3.80, 3.90, 3.82],
    status: 'Aktif',
    phone: '081234567890',
    address: 'Jl. Raya Kebayoran No. 12, Jakarta',
    academicHistory: [
      { semester: 1, sks: 20, ips: 3.75, status: 'Aktif' },
      { semester: 2, sks: 22, ips: 3.80, status: 'Aktif' },
      { semester: 3, sks: 24, ips: 3.90, status: 'Aktif' },
      { semester: 4, sks: 22, ips: 3.82, status: 'Aktif' },
    ]
  },
  {
    id: 'S002',
    nim: '20220801002',
    name: 'Muhammad Rizki',
    email: 'muhammad.rizki@student.aone-project.id',
    prodi: 'Teknik Informatika',
    fakultas: 'Fakultas Sains & Teknologi',
    semester: 4,
    ipk: 3.65,
    ips: [3.50, 3.70, 3.72, 3.68],
    status: 'Aktif',
    phone: '081298765432',
    address: 'Jl. Kemang Timur No. 45, Jakarta',
    academicHistory: [
      { semester: 1, sks: 20, ips: 3.50, status: 'Aktif' },
      { semester: 2, sks: 22, ips: 3.70, status: 'Aktif' },
      { semester: 3, sks: 24, ips: 3.72, status: 'Aktif' },
      { semester: 4, sks: 22, ips: 3.68, status: 'Aktif' },
    ]
  },
  {
    id: 'S003',
    nim: '20230501015',
    name: 'Siti Rahmawati',
    email: 'siti.rahmawati@student.aone-project.id',
    prodi: 'Ekonomi Syariah',
    fakultas: 'Fakultas Ekonomi & Bisnis Islam',
    semester: 2,
    ipk: 3.95,
    ips: [3.90, 4.00],
    status: 'Aktif',
    phone: '082145678901',
    address: 'Jl. Margonda Raya No. 100, Depok',
    academicHistory: [
      { semester: 1, sks: 18, ips: 3.90, status: 'Aktif' },
      { semester: 2, sks: 20, ips: 4.00, status: 'Aktif' },
    ]
  },
  {
    id: 'S004',
    nim: '20210202022',
    name: 'Nur Aisyah',
    email: 'nur.aisyah@student.aone-project.id',
    prodi: 'Pendidikan Guru Madrasah Ibtidaiyah',
    fakultas: 'Fakultas Ilmu Tarbiyah & Keguruan',
    semester: 6,
    ipk: 3.55,
    ips: [3.40, 3.50, 3.60, 3.55, 3.70, 3.55],
    status: 'Aktif',
    phone: '085311223344',
    address: 'Jl. Ciputat Raya No. 88, Tangerang Selatan',
    academicHistory: [
      { semester: 1, sks: 20, ips: 3.40, status: 'Aktif' },
      { semester: 2, sks: 21, ips: 3.50, status: 'Aktif' },
      { semester: 3, sks: 22, ips: 3.60, status: 'Aktif' },
      { semester: 4, sks: 24, ips: 3.55, status: 'Aktif' },
      { semester: 5, sks: 22, ips: 3.70, status: 'Aktif' },
      { semester: 6, sks: 20, ips: 3.55, status: 'Aktif' },
    ]
  },
  {
    id: 'S005',
    nim: '20210103009',
    name: 'Dedi Saputra',
    email: 'dedi.saputra@student.aone-project.id',
    prodi: 'Hukum Keluarga Islam',
    fakultas: 'Fakultas Syariah',
    semester: 6,
    ipk: 3.48,
    ips: [3.30, 3.45, 3.52, 3.40, 3.61, 3.54],
    status: 'Cuti',
    phone: '087855667788',
    address: 'Jl. Tebet Barat Dalam No. 15, Jakarta',
    academicHistory: [
      { semester: 1, sks: 19, ips: 3.30, status: 'Aktif' },
      { semester: 2, sks: 21, ips: 3.45, status: 'Aktif' },
      { semester: 3, sks: 22, ips: 3.52, status: 'Aktif' },
      { semester: 4, sks: 20, ips: 3.40, status: 'Aktif' },
      { semester: 5, sks: 22, ips: 3.61, status: 'Aktif' },
      { semester: 6, sks: 0, ips: 0.00, status: 'Cuti' },
    ]
  }
];

export const LECTURER_LIST: Lecturer[] = [
  {
    id: 'L001',
    nip: '197805122004121001',
    nidn: '0412057801',
    name: 'Dr. Ahmad Syukri, M.Ag.',
    email: 'ahmad.syukri@aone-project.id',
    prodi: 'Hukum Keluarga Islam',
    fakultas: 'Fakultas Syariah',
    status: 'Aktif',
    teachingLoads: [
      { course: 'Fiqh Munakahat II', class: 'HKI-A', sks: 3, students: 38 },
      { course: 'Ushul Fiqh Dasar', class: 'HKI-C', sks: 2, students: 42 },
      { course: 'Metodologi Penelitian Hukum Kel.', class: 'HKI-B', sks: 3, students: 35 }
    ]
  },
  {
    id: 'L002',
    nip: '198210202008102002',
    nidn: '0420108202',
    name: 'Dr. Nurhayati, M.Pd.',
    email: 'nurhayati@aone-project.id',
    prodi: 'Pendidikan Guru Madrasah Ibtidaiyah',
    fakultas: 'Fakultas Ilmu Tarbiyah & Keguruan',
    status: 'Aktif',
    teachingLoads: [
      { course: 'Perkembangan Peserta Didik', class: 'PGMI-A', sks: 3, students: 40 },
      { course: 'Desain Evaluasi Pembelajaran SD/MI', class: 'PGMI-B', sks: 3, students: 38 },
      { course: 'Strategi Pembelajaran Inovatif', class: 'PGMI-C', sks: 2, students: 41 }
    ]
  },
  {
    id: 'L003',
    nip: '198504032012011003',
    nidn: '0303048501',
    name: 'Dr. Muhammad Fadli, M.E.I.',
    email: 'm.fadli@aone-project.id',
    prodi: 'Ekonomi Syariah',
    fakultas: 'Fakultas Ekonomi & Bisnis Islam',
    status: 'Aktif',
    teachingLoads: [
      { course: 'Mikroekonomi Syariah', class: 'ES-B', sks: 3, students: 45 },
      { course: 'Manajemen Keuangan Syariah', class: 'ES-A', sks: 3, students: 44 },
      { course: 'Fiqh Muamalah Kontemporer', class: 'ES-D', sks: 3, students: 40 }
    ]
  },
  {
    id: 'L004',
    nip: '198912152015042004',
    nidn: '0415128902',
    name: 'Dr. Rina Kartika, M.T.',
    email: 'rina.kartika@aone-project.id',
    prodi: 'Teknik Informatika',
    fakultas: 'Fakultas Sains & Teknologi',
    status: 'Aktif',
    teachingLoads: [
      { course: 'Kecerdasan Buatan', class: 'IF-A', sks: 3, students: 44 },
      { course: 'Pemrograman Web Enterprise', class: 'IF-B', sks: 3, students: 42 },
      { course: 'Analisis & Desain Algoritma', class: 'IF-C', sks: 3, students: 39 }
    ]
  }
];

export const COURSE_LIST: Course[] = [
  { id: 'MK001', code: 'INF1201', name: 'Algoritma & Pemrograman', sks: 3, semester: 1, type: 'Wajib', description: 'Konseptual pemformatan kode dasar, control flow, dan manipulasi array.' },
  { id: 'MK002', code: 'INF2402', name: 'Database Sistem & NoSQL', sks: 3, semester: 3, type: 'Wajib', description: 'Pemodelan relasional dan non-relasional serta implementasi real-time query.' },
  { id: 'MK003', code: 'INF3210', name: 'Kecerdasan Buatan l', sks: 3, semester: 5, type: 'Wajib', description: 'Pengenalan Machine Learning, neural network sederhana, dan LLM integration.' },
  { id: 'MK004', code: 'SYS2203', name: 'Analisis Desain Sistem', sks: 3, semester: 3, type: 'Wajib', description: 'SDLC, pembuatan mockups UI, perancangan diagram UML dan use cases.' },
  { id: 'MK005', code: 'SYS4101', name: 'Arsitektur Enterprise SaaS', sks: 3, semester: 7, type: 'Pilihan', description: 'Studi kasus ERP kampus, arsitektur multi-tenant, optimasi load.' },
  { id: 'MK006', code: 'HUK2104', name: 'Fiqh Munakahat II', sks: 3, semester: 3, type: 'Wajib', description: 'Pembahasan mendalam tentang pernikahan dan hukum keluarga dalam Islam.' },
  { id: 'MK007', code: 'EKO3202', name: 'Mikroekonomi Syariah', sks: 3, semester: 5, type: 'Wajib', description: 'Teori konsumsi, produksi, dan pasar dalam sudut pandang ekonomi Islam.' },
  { id: 'MK008', code: 'FIT2211', name: 'Perkembangan Peserta Didik', sks: 3, semester: 2, type: 'Wajib', description: 'Analisis psikologis pertumbuhan anak usia MI/SD.' }
];

export const SCHEDULE_LIST: Schedule[] = [
  { id: 'SC001', day: 'Senin', time: '08:00 - 10:30', course: 'Kecerdasan Buatan', lecturer: 'Dr. Rina Kartika, M.T.', room: 'Lab Komputasi A', class: 'IF-A' },
  { id: 'SC002', day: 'Senin', time: '13:00 - 15:30', course: 'Mikroekonomi Syariah', lecturer: 'Dr. Muhammad Fadli, M.E.I.', room: 'R. Seminar FEBI', class: 'ES-B' },
  { id: 'SC003', day: 'Selasa', time: '09:30 - 12:00', course: 'Perkembangan Peserta Didik', lecturer: 'Dr. Nurhayati, M.Pd.', room: 'AULA FITK Lt. 3', class: 'PGMI-A' },
  { id: 'SC004', day: 'Rabu', time: '10:00 - 12:30', course: 'Fiqh Munakahat II', lecturer: 'Dr. Ahmad Syukri, M.Ag.', room: 'Ruang Peradilan Semu', class: 'HKI-A' },
  { id: 'SC005', day: 'Kamis', time: '13:00 - 15:30', course: 'Pemrograman Web Enterprise', lecturer: 'Dr. Rina Kartika, M.T.', room: 'Lab Rekayasa Perangkat Lunak', class: 'IF-B' }
];

export const PMB_APPLICANTS: PMBApplicant[] = [
  {
    id: 'PMB-2026-001',
    applicantNumber: 'PMB260001',
    name: 'Bayu Nugroho',
    email: 'bayu.nugroho@gmail.com',
    phone: '081211112222',
    selectionPath: 'Jalur Mandiri',
    firstChoice: 'Teknik Informatika',
    secondChoice: 'Sistem Informasi',
    status: 'Tes Masuk',
    pembayaranStatus: 'Lunas',
    score: 85,
  },
  {
    id: 'PMB-2026-002',
    applicantNumber: 'PMB260002',
    name: 'Cynthia Lestari',
    email: 'cynthia.lestari@yahoo.com',
    phone: '085377778888',
    selectionPath: 'Jalur Beasiswa Berprestasi',
    firstChoice: 'Ekonomi Syariah',
    secondChoice: 'Sistem Informasi',
    status: 'Lolos',
    pembayaranStatus: 'Lunas',
    score: 94,
    wawancaraNote: 'Sangat direkomendasikan untuk beasiswa penuh. Logika dan budi bahasa luar biasa.'
  },
  {
    id: 'PMB-2026-003',
    applicantNumber: 'PMB260003',
    name: 'Eko Sulistyo',
    email: 'eko.sulis@gmail.com',
    phone: '087833334444',
    selectionPath: 'Jalur Reguler',
    firstChoice: 'Teknik Informatika',
    secondChoice: 'Hukum Keluarga Islam',
    status: 'Biodata',
    pembayaranStatus: 'Belum Bayar',
  },
  {
    id: 'PMB-2026-004',
    applicantNumber: 'PMB260004',
    name: 'Fitri Handayani',
    email: 'fitri.handa@gmail.com',
    phone: '081399990000',
    selectionPath: 'Jalur Reguler',
    firstChoice: 'Pendidikan Guru Madrasah Ibtidaiyah',
    secondChoice: 'Hukum Keluarga Islam',
    status: 'Daftar Ulang',
    pembayaranStatus: 'Lunas',
    score: 78,
  }
];

export const INVOICE_LIST: Invoice[] = [
  {
    id: 'INV-2026-001',
    nim: '20220801001',
    studentName: 'Ahmad Fauzi',
    prodi: 'Sistem Informasi',
    amount: 7500000,
    type: 'UKT',
    status: 'Lunas',
    dueDate: '2026-07-31',
    payments: [
      { date: '2026-05-10', amount: 7500000, method: 'Virtual Account Mandiri', receiptUrl: '#' }
    ]
  },
  {
    id: 'INV-2026-002',
    nim: '20220801002',
    studentName: 'Muhammad Rizki',
    prodi: 'Teknik Informatika',
    amount: 7500000,
    type: 'UKT',
    status: 'Dicicil',
    dueDate: '2026-07-31',
    payments: [
      { date: '2026-05-12', amount: 3750000, method: 'Virtual Account BNI', receiptUrl: '#' }
    ]
  },
  {
    id: 'INV-2026-003',
    nim: '20230501015',
    studentName: 'Siti Rahmawati',
    prodi: 'Ekonomi Syariah',
    amount: 5500000,
    type: 'UKT',
    status: 'Lunas',
    dueDate: '2026-07-31',
    payments: [
      { date: '2026-05-11', amount: 5500000, method: 'Beasiswa Undangan', receiptUrl: '#' }
    ]
  },
  {
    id: 'INV-2026-004',
    nim: '20210202022',
    studentName: 'Nur Aisyah',
    prodi: 'Pendidikan Guru Madrasah Ibtidaiyah',
    amount: 5000000,
    type: 'UKT',
    status: 'Belum Bayar',
    dueDate: '2026-07-31',
    payments: []
  },
  {
    id: 'INV-2026-005',
    nim: '20210103009',
    studentName: 'Dedi Saputra',
    prodi: 'Hukum Keluarga Islam',
    amount: 5000000,
    type: 'UKT',
    status: 'Terlambat',
    dueDate: '2026-04-30',
    payments: []
  }
];

export const SYNC_LOGS: SyncLog[] = [
  { id: 'LOG001', timestamp: '2026-06-02 10:00:15', type: 'Mahasiswa', recordsSynced: 340, recordsFailed: 2, status: 'Peringatan' },
  { id: 'LOG002', timestamp: '2026-06-02 09:15:00', type: 'Dosen', recordsSynced: 120, recordsFailed: 0, status: 'Sukses' },
  { id: 'LOG003', timestamp: '2026-06-01 23:30:45', type: 'KRS', recordsSynced: 1850, recordsFailed: 12, status: 'Peringatan' },
  { id: 'LOG004', timestamp: '2026-06-01 18:00:22', type: 'Nilai', recordsSynced: 4320, recordsFailed: 0, status: 'Sukses' },
  { id: 'LOG005', timestamp: '2026-05-31 10:11:43', type: 'Mahasiswa', recordsSynced: 0, recordsFailed: 15, status: 'Gagal' }
];

export const LMS_COURSES: LMSCourse[] = [
  {
    id: 'LMS001',
    code: 'INF3210',
    name: 'Kecerdasan Buatan (Artificial Intelligence)',
    lecturer: 'Dr. Rina Kartika, M.T.',
    syllabus: 'Mata kuliah ini membahas dasar Machine Learning, agen cerdas, logika fuzzy, heuristic search, dan model bahasa besar NLP.',
    materials: [
      { id: 'MAT001', title: 'Pertemuan 1 - Pengantar AI dan Agen Cerdas', type: 'pdf', url: '#', postedAt: '2026-05-10' },
      { id: 'MAT002', title: 'Pertemuan 2 - Uninformed & Informed Search', type: 'pdf', url: '#', postedAt: '2026-05-17' },
      { id: 'MAT003', title: 'Studi Kasus - Integrasi Generative AI di Perusahaan', type: 'video', url: '#', postedAt: '2026-05-24' }
    ],
    assignments: [
      { id: 'ASM001', title: 'Tugas 1 - Implementasi Heuristic di Tic-Tac-Toe', dueDate: '2026-06-10', maxPoints: 100, instructions: 'Silakan kumpulkan kode link repository GitHub dan dokumen PDF hasil analisa performa algoritma Minimax.', submitted: true, submissionDate: '2026-05-30', grade: 92 },
      { id: 'ASM002', title: 'Tugas 2 - Clustering Clustering K-Means Kuantitatif', dueDate: '2026-06-25', maxPoints: 100, instructions: 'Gunakan dataset yang diberikan di forum diskusi untuk melakukan clustering data calon mahasiswa baru.' }
    ],
    quizzes: [
      { id: 'QZ001', title: 'Kuis Tengah Semester - Logika Fuzzy & Tree Search', questionsCount: 20, duration: 30, taken: true, score: 85 },
      { id: 'QZ002', title: 'Kuis Akhir - Neural Networks & LLMs', questionsCount: 15, duration: 25, taken: false }
    ],
    discussions: [
      { id: 'DSC001', title: 'Apakah AGI (Artificial General Intelligence) aman bagi kemanusiaan?', author: 'Ahmad Fauzi', content: 'Mengingat akselerasi development dari OpenAI, Google Gemini, dan Anthropic, apakah regulasi sudah cukup membendung bias algoritmanya?', replies: 12, postedAt: '2026-05-28' },
      { id: 'DSC002', title: 'Tanya Jawab Seputar Tugas Heuristic Minimax', author: 'Dr. Rina Kartika, M.T.', content: 'Thread ini khusus untuk mahasiswa yang mengalami deadlock atau runtime error saat membuat simulasi mini-chess.', replies: 8, postedAt: '2026-05-20' }
    ]
  },
  {
    id: 'LMS002',
    code: 'INF2402',
    name: 'Database Sistem & NoSQL',
    lecturer: 'Dr. Rina Kartika, M.T.',
    syllabus: 'Pemodelan data, normalisasi index, optimasi query, query JSON MongoDB, dan implementasi cache Redis.',
    materials: [
      { id: 'MAT004', title: 'Pengantar Relational DB vs NoSQL Document', type: 'pdf', url: '#', postedAt: '2026-05-08' },
      { id: 'MAT005', title: 'Tutorial Setup MongoDB Atlas', type: 'link', url: '#', postedAt: '2026-05-15' }
    ],
    assignments: [
      { id: 'ASM003', title: 'Tugas Terstruktur - Desain Schema E-Commerce', dueDate: '2026-06-15', maxPoints: 100, instructions: 'Rancanglah Entity Relationship Diagram (ERD) dan bandingkan dengan Document-Based Schema.' }
    ],
    quizzes: [],
    discussions: []
  }
];

export const OJS_JOURNALS: OJSJournal[] = [
  {
    id: 'J001',
    title: 'Analisis Algoritma Optimasi Penjadwalan Kuliah Berbasis Heuristic Genetika',
    author: 'Dr. Ahmad Syukri, M.Ag.',
    journalCategory: 'Jurnal Komputer Nasional (JKN)',
    status: 'Terbit',
    issue: 'Vol. 10 No. 2 (2026)',
    publishedAt: '2026-05-12',
    impactFactor: 2.45
  },
  {
    id: 'J002',
    title: 'Pengaruh Kebijakan Spin-Off Unit Usaha Syariah terhadap Profitabilitas Perbankan',
    author: 'Lia Anggraini, S.E.',
    journalCategory: 'Jurnal Syariah & Pranata Sosial',
    status: 'Terbit',
    issue: 'Vol. 8 No. 1 (2026)',
    publishedAt: '2026-04-18',
    impactFactor: 1.85
  },
  {
    id: 'J003',
    title: 'Analisis Efektivitas Pelatihan Metode Pembelajaran Aktif Madrasah Ibtidaiyah',
    author: 'Dr. Nurhayati, M.Pd.',
    journalCategory: 'Jurnal Keguruan & Pendidikan',
    status: 'Dalam Reviewer',
    issue: 'Vol. 12 No. 3 (2026)',
    publishedAt: '2026-05-28',
    impactFactor: 1.20
  }
];

export const ALUMNI_SURVEYS: AlumniSurvey[] = [
  { id: 'A001', name: 'Rian Hidayat', gradYear: 2024, company: 'GoTo Group', position: 'Software Engineer', monthlySalary: 12000000, timeToGetJob: 2, relevance: 'Sangat Sesuai' },
  { id: 'A002', name: 'Lia Anggraini', gradYear: 2024, company: 'Bank Syariah Indonesia (BSI)', position: 'Sharia Financial Analyst', monthlySalary: 9500000, timeToGetJob: 3, relevance: 'Sangat Sesuai' },
  { id: 'A003', name: 'Zainal Abidin', gradYear: 2023, company: 'Kementerian Agama RI', position: 'Staf Administrasi KUA', monthlySalary: 6200000, timeToGetJob: 5, relevance: 'Sesuai' },
  { id: 'A004', name: 'Maria Ulfa', gradYear: 2024, company: 'Ruangguru', position: 'Content Developer SD/MI', monthlySalary: 7500000, timeToGetJob: 1, relevance: 'Sangat Sesuai' },
  { id: 'A005', name: 'Yusuf Habibi', gradYear: 2023, company: 'Startup Lokal', position: 'UI/UX Designer', monthlySalary: 6000000, timeToGetJob: 8, relevance: 'Cukup' }
];

export const TIKET_LIST = [
  { id: 'TK001', title: 'Error Sinkronisasi Nilai PDDIKTI', campus: 'UND Jakarta', priority: 'Tinggi', category: 'PDDIKTI', status: 'Terbuka', createdAt: '2026-06-02' },
  { id: 'TK002', title: 'Penambahan Kuota Bandwidth Server LMS', campus: 'UND Yogyakarta', priority: 'Sedang', category: 'Infrastruktur', status: 'Dalam Proses', createdAt: '2026-06-01' },
  { id: 'TK003', title: 'Pertanyaan Formulir Tracer Study Kurikulum', campus: 'UND Surabaya', priority: 'Rendah', category: 'Modul Alumni', status: 'Selesai', createdAt: '2026-05-28' }
];

export const AUDIT_LOG_LIST = [
  { id: 'AD001', actor: 'akademik@aone-project.id', action: 'Input Nilai Kelompok Kuliah IF-A', ip: '182.16.24.11', timestamp: '2026-06-02 12:44:10' },
  { id: 'AD002', actor: 'keuangan@aone-project.id', action: 'Verifikasi Cicilan UKT S002', ip: '182.16.24.89', timestamp: '2026-06-02 11:20:00' },
  { id: 'AD003', actor: 'admin@aone-project.id', action: 'Update Konfigurasi SMTP', ip: '103.22.10.4', timestamp: '2026-06-02 10:05:12' },
  { id: 'AD004', actor: 'dosen@aone-project.id', action: 'Upload Bahan Kuliah Kecerdasan Buatan', ip: '110.12.54.3', timestamp: '2026-06-02 09:30:15' },
  { id: 'AD005', actor: 'mahasiswa@aone-project.id', action: 'Simpan Rencana KRS Semester 4', ip: '114.120.43.15', timestamp: '2026-06-02 08:14:22' }
];
