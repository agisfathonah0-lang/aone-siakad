export type UserRole = 'SUPER_ADMIN' | 'AKADEMIK' | 'KEUANGAN' | 'DOSEN' | 'MAHASISWA' | 'PMB_APPLICANT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  nim_nip?: string;
  prodi?: string;
}

export type ModuleType =
  | 'SUPER_ADMIN'
  | 'AKADEMIK'
  | 'LAYANAN_MAHASISWA'
  | 'LAYANAN_DOSEN'
  | 'PMB'
  | 'KEUANGAN'
  | 'PDDIKTI'
  | 'LMS'
  | 'OJS'
  | 'AKREDITASI'
  | 'ALUMNI'
  | 'SETTINGS'
  | 'CCTV';

export interface Campus {
  id: string;
  name: string;
  code: string;
  status: 'Aktif' | 'Nonaktif';
  package: string;
  expiresAt: string;
  students: number;
  lecturers: number;
  programs: number;
  location: string;
}

export interface Student {
  id: string;
  nim: string;
  name: string;
  email: string;
  prodi: string;
  fakultas: string;
  semester: number;
  ipk: number;
  ips: number[];
  status: 'Aktif' | 'Cuti' | 'Lulus' | 'Non-Aktif';
  phone: string;
  address: string;
  academicHistory: {
    semester: number;
    sks: number;
    ips: number;
    status: string;
  }[];
}

export interface Lecturer {
  id: string;
  nip: string;
  nidn: string;
  name: string;
  email: string;
  prodi: string;
  fakultas: string;
  status: 'Aktif' | 'Sabbatical' | 'Pensiun';
  teachingLoads: {
    course: string;
    class: string;
    sks: number;
    students: number;
  }[];
}

export interface Course {
  id: string;
  code: string;
  name: string;
  sks: number;
  semester: number;
  type: 'Wajib' | 'Pilihan';
  description: string;
}

export interface Schedule {
  id: string;
  day: string;
  time: string;
  course: string;
  lecturer: string;
  room: string;
  class: string;
}

export interface PMBApplicant {
  id: string;
  applicantNumber: string;
  name: string;
  email: string;
  phone: string;
  selectionPath: string; // e.g. Mandiri, Beasiswa
  firstChoice: string;
  secondChoice: string;
  status: 'Registrasi' | 'Verifikasi Email' | 'Biodata' | 'Dokumen' | 'Pembayaran' | 'Tes Masuk' | 'Wawancara' | 'Lolos' | 'Ditolak' | 'Daftar Ulang';
  pembayaranStatus: 'Lunas' | 'Belum Bayar' | 'Pending';
  score?: number;
  wawancaraNote?: string;
}

export interface Invoice {
  id: string;
  nim: string;
  studentName: string;
  prodi: string;
  amount: number;
  type: 'UKT' | 'Uang Pangkal' | 'SKS' | 'Kemahasiswaan';
  status: 'Lunas' | 'Belum Bayar' | 'Dicicil' | 'Terlambat';
  dueDate: string;
  payments: {
    date: string;
    amount: number;
    method: string;
    receiptUrl?: string;
  }[];
}

export interface SyncLog {
  id: string;
  timestamp: string;
  type: 'Mahasiswa' | 'Dosen' | 'KRS' | 'Nilai';
  recordsSynced: number;
  recordsFailed: number;
  status: 'Sukses' | 'Gagal' | 'Peringatan';
}

export interface LMSCourse {
  id: string;
  code: string;
  name: string;
  lecturer: string;
  syllabus: string;
  materials: {
    id: string;
    title: string;
    type: 'pdf' | 'video' | 'link';
    url: string;
    postedAt: string;
  }[];
  assignments: {
    id: string;
    title: string;
    dueDate: string;
    maxPoints: number;
    instructions: string;
    submitted?: boolean;
    submissionDate?: string;
    grade?: number;
  }[];
  quizzes: {
    id: string;
    title: string;
    questionsCount: number;
    duration: number; // minutes
    taken?: boolean;
    score?: number;
  }[];
  discussions: {
    id: string;
    title: string;
    author: string;
    content: string;
    replies: number;
    postedAt: string;
  }[];
}

export interface OJSJournal {
  id: string;
  title: string;
  author: string;
  journalCategory: string;
  status: 'Terbit' | 'Dalam Reviewer' | 'Ditolak';
  issue: string;
  publishedAt: string;
  impactFactor: number;
}

export interface AlumniSurvey {
  id: string;
  name: string;
  gradYear: number;
  company: string;
  position: string;
  monthlySalary: number; // in IDR
  timeToGetJob: number; // months
  relevance: 'Sangat Sesuai' | 'Sesuai' | 'Cukup' | 'Kurang' | 'Tidak Sesuai';
}
