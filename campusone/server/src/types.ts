export type UserRole = 'SUPER_ADMIN' | 'AKADEMIK' | 'KEUANGAN' | 'DOSEN' | 'MAHASISWA' | 'PMB_APPLICANT';

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
  | 'SETTINGS';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password: string;
  avatar?: string;
  nim_nip?: string;
  prodi?: string;
}

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
  ips: string;
  status: 'Aktif' | 'Cuti' | 'Lulus' | 'Non-Aktif';
  phone: string;
  address: string;
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
  teachingLoads: string;
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
  selectionPath: string;
  firstChoice: string;
  secondChoice: string;
  status: string;
  pembayaranStatus: string;
  score?: number;
  wawancaraNote?: string;
}

export interface Invoice {
  id: string;
  nim: string;
  studentName: string;
  prodi: string;
  amount: number;
  type: string;
  status: string;
  dueDate: string;
  payments: string;
}

export interface SyncLog {
  id: string;
  timestamp: string;
  type: string;
  recordsSynced: number;
  recordsFailed: number;
  status: string;
}

export interface LMSCourse {
  id: string;
  code: string;
  name: string;
  lecturer: string;
  syllabus: string;
  materials: string;
  assignments: string;
  quizzes: string;
  discussions: string;
}

export interface OJSJournal {
  id: string;
  title: string;
  author: string;
  journalCategory: string;
  status: string;
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
  monthlySalary: number;
  timeToGetJob: number;
  relevance: string;
}
