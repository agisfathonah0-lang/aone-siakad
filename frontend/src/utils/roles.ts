import type { Role } from '../types';

export const ROLE_HIERARCHY: Record<Role, number> = {
  vendor_super_admin: 100,
  super_admin: 90,
  rektor: 88,
  admin: 85,
  dekan: 80,
  akademik: 75,
  kaprodi: 70,
  keuangan: 60,
  pustakawan: 55,
  dosen: 50,
  mahasiswa: 40,
  calon_mahasiswa: 30,
  alumni: 20,
};

export function hasRole(userRole: Role | undefined, requiredRoles: Role[]): boolean {
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
}

export function hasMinRole(userRole: Role | undefined, minRole: Role): boolean {
  if (!userRole) return false;
  return (ROLE_HIERARCHY[userRole] || 0) >= (ROLE_HIERARCHY[minRole] || 0);
}

export function canAccess(userRole: Role | undefined, pageRoles: Role[]): boolean {
  return hasRole(userRole, pageRoles);
}

export interface MenuItem {
  label: string;
  path?: string;
  icon: string;
  roles: Role[];
  children?: MenuItem[];
}

export const SIDEBAR_MENUS: MenuItem[] = [
  {
    label: 'Dashboard',
    path: 'dashboard',
    icon: 'LayoutDashboard',
    roles: ['super_admin', 'rektor', 'admin', 'dekan', 'akademik', 'kaprodi', 'keuangan', 'dosen', 'mahasiswa', 'alumni'],
  },
  {
    label: 'Akademik',
    icon: 'GraduationCap',
    roles: ['super_admin', 'rektor', 'admin', 'dekan', 'akademik', 'kaprodi', 'dosen', 'mahasiswa'],
    children: [
      { label: 'Mahasiswa', path: 'mahasiswa', icon: 'Users', roles: ['super_admin', 'admin', 'akademik', 'dosen'] },
      { label: 'Dosen', path: 'dosen', icon: 'UserCheck', roles: ['super_admin', 'rektor', 'admin', 'dekan', 'akademik', 'kaprodi'] },
      { label: 'Prodi', path: 'prodi', icon: 'Building2', roles: ['super_admin', 'rektor', 'admin', 'dekan', 'akademik', 'kaprodi'] },
      { label: 'Users', path: 'users', icon: 'UserCog', roles: ['super_admin', 'rektor', 'admin', 'dekan'] },
      { label: 'Mata Kuliah', path: 'mata-kuliah', icon: 'BookOpen', roles: ['super_admin', 'rektor', 'admin', 'dekan', 'akademik', 'kaprodi'] },
      { label: 'Jadwal', path: 'jadwal', icon: 'CalendarDays', roles: ['super_admin', 'admin', 'akademik', 'dosen'] },
      { label: 'KRS', path: 'krs', icon: 'ClipboardCheck', roles: ['super_admin', 'rektor', 'admin', 'dekan', 'akademik', 'kaprodi', 'dosen', 'mahasiswa'] },
      { label: 'Nilai', path: 'nilai', icon: 'Award', roles: ['super_admin', 'admin', 'akademik', 'dosen'] },
      { label: 'KHS', path: 'khs', icon: 'ScrollText', roles: ['super_admin', 'rektor', 'admin', 'dekan', 'akademik', 'kaprodi', 'dosen', 'mahasiswa'] },
      { label: 'Absensi', path: 'absensi', icon: 'ClipboardList', roles: ['super_admin', 'admin', 'akademik', 'dosen'] },
      { label: 'Kurikulum', path: 'kurikulum', icon: 'BookTemplate', roles: ['super_admin', 'rektor', 'admin', 'dekan', 'akademik', 'kaprodi'] },
      { label: 'RPS', path: 'rps', icon: 'FileText', roles: ['super_admin', 'admin', 'akademik', 'dosen'] },
      { label: 'BAP', path: 'bap', icon: 'ClipboardSignature', roles: ['super_admin', 'admin', 'akademik', 'dosen'] },
      { label: 'Absensi Dosen', path: 'absensi-dosen', icon: 'ClipboardCheck', roles: ['super_admin', 'admin', 'akademik', 'kaprodi', 'dosen'] },
      { label: 'Cetak PDF', path: 'cetak-pdf', icon: 'Printer', roles: ['super_admin', 'rektor', 'admin', 'dekan', 'akademik', 'kaprodi', 'dosen', 'mahasiswa'] },
      { label: 'Transkrip', path: 'transkrip', icon: 'ScrollText', roles: ['super_admin', 'admin', 'akademik', 'dosen', 'mahasiswa', 'alumni'] },
      { label: 'PKL', path: 'pkl', icon: 'Briefcase', roles: ['super_admin', 'admin', 'akademik', 'kaprodi', 'dosen', 'mahasiswa'] },
      { label: 'Sidang', path: 'sidang', icon: 'GraduationCap', roles: ['super_admin', 'admin', 'akademik', 'kaprodi', 'dosen'] },
      { label: 'KKN', path: 'kkn', icon: 'BookMarked', roles: ['super_admin', 'admin', 'akademik', 'kaprodi', 'dosen'] },
      { label: 'Seminar', path: 'seminar', icon: 'Presentation', roles: ['super_admin', 'admin', 'akademik', 'kaprodi', 'dosen'] },
    ],
  },
  {
    label: 'Perkuliahan',
    icon: 'Presentation',
    roles: ['super_admin', 'rektor', 'admin', 'dekan', 'akademik', 'kaprodi', 'dosen', 'mahasiswa'],
    children: [
      { label: 'Perwalian', path: 'perwalian', icon: 'MessageSquare', roles: ['super_admin', 'rektor', 'admin', 'dekan', 'akademik', 'kaprodi', 'dosen', 'mahasiswa'] },
      { label: 'EDOM', path: 'edom', icon: 'Star', roles: ['super_admin', 'rektor', 'admin', 'dekan', 'akademik', 'kaprodi', 'dosen', 'mahasiswa'] },
      { label: 'Beasiswa', path: 'beasiswa', icon: 'Trophy', roles: ['super_admin', 'rektor', 'admin', 'dekan', 'akademik', 'kaprodi', 'mahasiswa'] },
    ],
  },
  {
    label: 'Keuangan',
    icon: 'Wallet',
    roles: ['super_admin', 'rektor', 'admin', 'dekan', 'akademik', 'kaprodi', 'keuangan', 'mahasiswa'],
    children: [
      { label: 'Tagihan', path: 'tagihan', icon: 'Receipt', roles: ['super_admin', 'rektor', 'admin', 'dekan', 'akademik', 'kaprodi', 'keuangan', 'mahasiswa'] },
      { label: 'Pembayaran', path: 'pembayaran', icon: 'CreditCard', roles: ['super_admin', 'rektor', 'admin', 'dekan', 'akademik', 'kaprodi', 'keuangan'] },
    ],
  },
  {
    label: 'Lainnya',
    icon: 'EllipsisHorizontal',
    roles: ['super_admin', 'rektor', 'admin', 'dekan', 'akademik', 'kaprodi', 'dosen', 'mahasiswa'],
    children: [
      { label: 'Surat', path: 'surat', icon: 'FileText', roles: ['super_admin', 'rektor', 'admin', 'dekan', 'akademik', 'kaprodi', 'mahasiswa'] },
      { label: 'Perpustakaan', path: 'perpustakaan', icon: 'Library', roles: ['super_admin', 'rektor', 'admin', 'dekan', 'akademik', 'kaprodi', 'pustakawan', 'dosen', 'mahasiswa'] },
      { label: 'Akreditasi', path: 'akreditasi', icon: 'Award', roles: ['super_admin', 'rektor', 'admin', 'dekan', 'akademik', 'kaprodi'] },
      { label: 'Berita', path: 'berita', icon: 'Newspaper', roles: ['super_admin', 'rektor', 'admin', 'dekan', 'akademik', 'kaprodi'] },
      { label: 'Kalender', path: 'kalender', icon: 'Calendar', roles: ['super_admin', 'rektor', 'admin', 'dekan', 'akademik', 'kaprodi', 'dosen', 'mahasiswa'] },
      { label: 'Notifikasi', path: 'notifikasi', icon: 'Bell', roles: ['super_admin', 'rektor', 'admin', 'dekan', 'akademik', 'kaprodi', 'dosen', 'mahasiswa'] },
      { label: 'CCTV', path: 'cctv', icon: 'Cctv', roles: ['super_admin', 'rektor', 'admin', 'dekan', 'akademik', 'kaprodi'] },
    ],
  },
  {
    label: 'Integrasi',
    icon: 'Share2',
    roles: ['super_admin', 'rektor', 'admin', 'dekan', 'akademik', 'kaprodi'],
    children: [
      { label: 'CMS', path: 'cms', icon: 'Palette', roles: ['super_admin', 'rektor', 'admin', 'dekan', 'akademik', 'kaprodi'] },
      { label: 'PPDB', icon: 'DoorOpen', roles: ['super_admin', 'rektor', 'admin', 'dekan', 'akademik', 'kaprodi'], children: [
        { label: 'Pendaftar', path: 'ppdb', icon: 'List', roles: ['super_admin', 'rektor', 'admin', 'dekan', 'akademik', 'kaprodi'] },
        { label: 'Form Config', path: 'ppdb/config', icon: 'Settings', roles: ['super_admin', 'admin'] },
      ] },
      { label: 'OJS', path: 'ojs', icon: 'BookOpen', roles: ['super_admin', 'rektor', 'admin', 'dekan', 'akademik', 'kaprodi'] },
      { label: 'PDDIKTI', path: 'pddikti', icon: 'Database', roles: ['super_admin', 'rektor', 'admin', 'dekan', 'akademik', 'kaprodi'] },
      { label: 'Alumni', path: 'alumni', icon: 'Users', roles: ['super_admin', 'rektor', 'admin', 'dekan', 'akademik', 'kaprodi', 'alumni'] },
      { label: 'Integrasi LMS', path: 'integrasi-lms', icon: 'Globe', roles: ['super_admin', 'rektor', 'admin', 'dekan', 'akademik', 'kaprodi'] },
      { label: 'Landing Page', path: 'landing-page', icon: 'Layout', roles: ['super_admin', 'rektor', 'admin', 'dekan', 'akademik', 'kaprodi'] },
    ],
  },
  {
    label: 'Fitur AI',
    icon: 'Sparkles',
    roles: ['super_admin', 'rektor', 'admin', 'dekan', 'akademik', 'kaprodi', 'dosen', 'mahasiswa', 'alumni'],
    children: [
      { label: 'AI Chatbot', path: 'ai', icon: 'Bot', roles: ['super_admin', 'rektor', 'admin', 'dekan', 'akademik', 'kaprodi', 'dosen', 'mahasiswa', 'alumni'] },
      { label: 'Generate RPS', path: 'ai?tab=rps', icon: 'BookOpen', roles: ['super_admin', 'admin', 'akademik'] },
      { label: 'Plagiarism Check', path: 'ai?tab=plagiarism', icon: 'AlertTriangle', roles: ['super_admin', 'admin', 'akademik', 'dosen'] },
      { label: 'Analytics', path: 'ai?tab=analytics', icon: 'BarChart3', roles: ['super_admin', 'admin', 'akademik'] },
    ],
  },
  {
    label: 'Laporan',
    path: 'laporan',
    icon: 'BarChart3',
    roles: ['super_admin', 'rektor', 'admin', 'dekan', 'akademik', 'kaprodi', 'keuangan'],
  },
];

export function filterMenusByRole(menus: MenuItem[], userRole: Role | undefined): MenuItem[] {
  return menus
    .filter(m => canAccess(userRole, m.roles))
    .map(m => ({
      ...m,
      children: m.children ? filterMenusByRole(m.children, userRole) : undefined,
    }));
}
