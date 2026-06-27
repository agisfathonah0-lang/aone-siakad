import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import AppLayout from './components/layout/AppLayout';
import LandingPage from './pages/LandingPage';
import CampusLandingPage from './pages/CampusLandingPage';
import CampusPPDBPage from './pages/CampusPPDBPage';
import FeaturePage from './pages/public/FeaturePage';
import TestimoniPage from './pages/public/TestimoniPage';
import HargaPage from './pages/public/HargaPage';
import { features } from './pages/public/FeaturePage';
import LoginPage from './pages/auth/LoginPage';
import VendorLoginPage from './pages/auth/VendorLoginPage';
import RegistrasiInstitusiPage from './pages/auth/RegistrasiInstitusiPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProdiPage from './pages/akademik/ProdiPage';
import UsersPage from './pages/akademik/UsersPage';
import CampusSettingsPage from './pages/akademik/CampusSettingsPage';
import TranscriptPage from './pages/akademik/TranscriptPage';
import LaporanPage from './pages/akademik/LaporanPage';
import PerwalianPage from './pages/akademik/PerwalianPage';
import LandingSettingsPage from './pages/akademik/LandingSettingsPage';
import KalenderPage from './pages/akademik/KalenderPage';
import NotifikasiPage from './pages/akademik/NotifikasiPage';
import ChatKelasPage from './pages/chat/ChatKelasPage';
import BeritaPage from './pages/akademik/BeritaPage';
import PengumumanPage from './pages/akademik/PengumumanPage';
import MahasiswaPage from './pages/akademik/MahasiswaPage';
import MahasiswaDetailPage from './pages/akademik/MahasiswaDetailPage';
import DosenPage from './pages/akademik/DosenPage';
import EdomPage from './pages/akademik/EdomPage';
import MatakuliahPage from './pages/akademik/MatakuliahPage';
import JadwalPage from './pages/akademik/JadwalPage';
import KRSPage from './pages/akademik/KRSPage';
import AbsensiPage from './pages/akademik/AbsensiPage';
import NilaiPage from './pages/akademik/NilaiPage';
import KHSPage from './pages/akademik/KHSPage';
import CetakPDFPage from './pages/akademik/CetakPDFPage';
import KurikulumPage from './pages/akademik/KurikulumPage';
import RPSPage from './pages/akademik/RPSPage';
import BAPPage from './pages/akademik/BAPPage';
import AbsensiDosenPage from './pages/akademik/AbsensiDosenPage';
import BeasiswaPage from './pages/akademik/BeasiswaPage';
import SuratPage from './pages/akademik/SuratPage';
import SeminarPage from './pages/akademik/SeminarPage';
import SidangPage from './pages/akademik/SidangPage';
import KKNPage from './pages/akademik/KKNPage';
import PKLPage from './pages/akademik/PKLPage';
import AkreditasiPage from './pages/akademik/AkreditasiPage';
import PerpustakaanPage from './pages/akademik/PerpustakaanPage';
import LMSPage from './pages/akademik/LMSPage';
import AIPage from './pages/ai/AIPage';
import TagihanPage from './pages/keuangan/TagihanPage';
import TagihanMahasiswaPage from './pages/keuangan/TagihanMahasiswaPage';
import PembayaranPage from './pages/keuangan/PembayaranPage';
import RiwayatPembayaranPage from './pages/keuangan/RiwayatPembayaranPage';
import CMSPage from './pages/cms/CMSPage';
import PPDBPage from './pages/ppdb/PPDBPage';
import PPDBConfigPage from './pages/ppdb/PPDBConfigPage';
import OJSPage from './pages/ojs/OJSPage';
import PDDIKTIPage from './pages/pddikti/PDDIKTIPage';
import AlumniPage from './pages/alumni/AlumniPage';
import VendorDashboardPage from './pages/vendor/VendorDashboardPage';
import TenantsPage from './pages/vendor/TenantsPage';
import TicketsPage from './pages/vendor/TicketsPage';
import FirewallPage from './pages/vendor/FirewallPage';
import CctvPage from './pages/vendor/CctvPage';
import CampusCctvPage from './pages/dashboard/CctvPage';
import SettingsPage from './pages/vendor/SettingsPage';
import VendorPlansPage from './pages/vendor/VendorPlansPage';
import VendorMonitorPage from './pages/vendor/VendorMonitorPage';
import VendorAuditPage from './pages/vendor/VendorAuditPage';
import LandingPagesPage from './pages/vendor/LandingPagesPage';
import VendorLandingBuilder from './pages/vendor/VendorLandingBuilder';
import VendorUsersPage from './pages/vendor/VendorUsersPage';
import TenantDetailPage from './pages/vendor/TenantDetailPage';
import { Loader2 } from 'lucide-react';
import { canAccess, canAccessAny } from './utils/roles';
import type { Role } from './types';
import { get } from './api/client';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}><Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--primary)' }} /></div>;
  if (!user) {
    if (location.pathname.startsWith('/vendor')) {
      return <Navigate to="/vendor/login" replace />;
    }
    if (location.pathname.startsWith('/kampus/')) {
      const slug = location.pathname.split('/')[2];
      return <Navigate to={`/login?tenant=${slug}`} replace />;
    }
    const slug = localStorage.getItem('aone_tenant_slug');
    const to = slug ? `/login?tenant=${slug}` : '/login';
    return <Navigate to={to} replace />;
  }
  return <>{children}</>;
}

function RoleGuard({ children, roles }: { children: React.ReactNode; roles: Role[] }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}><div className="w-5 h-5 rounded-full animate-spin" style={{ border: '2px solid var(--muted)', borderTopColor: 'var(--primary)' }} /></div>;
  if (!user) {
    const slug = location.pathname.split('/')[2] || localStorage.getItem('aone_tenant_slug');
    if (slug) return <Navigate to={`/kampus/${slug}/dashboard`} replace />;
    return <Navigate to="/login" replace />;
  }
  const userRoles: Role[] = user.roles?.length ? user.roles : [user.role];
  if (!canAccessAny(userRoles, roles)) {
    console.warn('[RoleGuard] Access denied:', { roles: userRoles, required: roles, path: location.pathname });
    const slug = location.pathname.split('/')[2] || localStorage.getItem('aone_tenant_slug');
    if (slug) return <Navigate to={`/kampus/${slug}/dashboard`} replace />;
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function TenantLandingRouter() {
  const hostname = window.location.hostname;
  const isDev = hostname.includes('localhost') || hostname.includes('127.0.0.1');

  const [resolved, setResolved] = useState<'loading' | 'found' | 'none'>('loading');
  const [slug, setSlug] = useState<string>('');

  useEffect(() => {
    if (isDev) {
      setResolved('none');
      return;
    }

    get<{ tenant: { slug: string } | null }>(`/public/resolve-host?host=${encodeURIComponent(hostname)}`)
      .then(r => {
        if (r.tenant) {
          setSlug(r.tenant.slug);
          setResolved('found');
        } else {
          setResolved('none');
        }
      })
      .catch(() => {
        const parts = hostname.split('.');
        if (parts.length >= 3 && parts[0] !== 'www') {
          setSlug(parts[0]);
          setResolved('found');
        } else {
          setResolved('none');
        }
      });
  }, [hostname, isDev]);

  if (isDev) return <LandingPage />;
  if (resolved === 'loading') return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-emerald-500" /></div>;
  if (resolved === 'found') return <Navigate to={`/kampus/${slug}`} replace />;
  return <LandingPage />;
}

function TagihanRouter() {
  const { user } = useAuth();
  if (user?.role === 'mahasiswa') return <TagihanMahasiswaPage />;
  return <TagihanPage />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<TenantLandingRouter />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/vendor/login" element={<VendorLoginPage />} />
      <Route path="/register" element={<RegistrasiInstitusiPage />} />
      <Route path="/testimoni" element={<TestimoniPage />} />
      <Route path="/harga" element={<HargaPage />} />
      {features.map(f => <Route key={f.slug} path={`/fitur/${f.slug}`} element={<FeaturePage slug={f.slug} />} />)}

      <Route path="/kampus/:slug">
        <Route index element={<CampusLandingPage />} />
        <Route path="ppdb/daftar" element={<CampusPPDBPage />} />
        <Route element={<AuthGuard><AppLayout /></AuthGuard>}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="prodi" element={<RoleGuard roles={['super_admin','rektor','admin','dekan','akademik','kaprodi']}><ProdiPage /></RoleGuard>} />
          <Route path="users" element={<RoleGuard roles={['super_admin','rektor','admin','dekan']}><UsersPage /></RoleGuard>} />
          <Route path="pengaturan" element={<RoleGuard roles={['super_admin','rektor','admin','dekan','akademik','kaprodi','keuangan']}><CampusSettingsPage /></RoleGuard>} />
          <Route path="transkrip" element={<RoleGuard roles={['super_admin','admin','akademik','dosen','mahasiswa','alumni']}><TranscriptPage /></RoleGuard>} />
          <Route path="laporan" element={<RoleGuard roles={['super_admin','rektor','admin','dekan','akademik','kaprodi','keuangan']}><LaporanPage /></RoleGuard>} />
          <Route path="perwalian" element={<RoleGuard roles={['super_admin','rektor','admin','dekan','akademik','kaprodi','dosen','mahasiswa']}><PerwalianPage /></RoleGuard>} />
          <Route path="landing-page" element={<RoleGuard roles={['super_admin','rektor','admin','dekan','akademik','kaprodi']}><LandingSettingsPage /></RoleGuard>} />
          <Route path="kalender" element={<RoleGuard roles={['super_admin','rektor','admin','dekan','akademik','kaprodi','dosen','mahasiswa']}><KalenderPage /></RoleGuard>} />
          <Route path="notifikasi" element={<RoleGuard roles={['super_admin','rektor','admin','dekan','akademik','kaprodi','dosen','mahasiswa']}><NotifikasiPage /></RoleGuard>} />
          <Route path="chat-kelas" element={<RoleGuard roles={['super_admin','rektor','admin','dekan','akademik','kaprodi','dosen','mahasiswa']}><ChatKelasPage /></RoleGuard>} />
          <Route path="cctv" element={<RoleGuard roles={['super_admin','rektor','admin','dekan','akademik','kaprodi']}><CampusCctvPage /></RoleGuard>} />
          <Route path="berita" element={<RoleGuard roles={['super_admin','rektor','admin','dekan','akademik','kaprodi','humas']}><BeritaPage /></RoleGuard>} />
          <Route path="pengumuman" element={<RoleGuard roles={['super_admin','rektor','admin','dekan','akademik','kaprodi','humas']}><PengumumanPage /></RoleGuard>} />
          <Route path="mahasiswa" element={<RoleGuard roles={['super_admin','admin','akademik','dosen']}><MahasiswaPage /></RoleGuard>} />
          <Route path="mahasiswa/:nim" element={<RoleGuard roles={['super_admin','admin','akademik','dosen']}><MahasiswaDetailPage /></RoleGuard>} />
          <Route path="dosen" element={<RoleGuard roles={['super_admin','rektor','admin','dekan','akademik','kaprodi']}><DosenPage /></RoleGuard>} />
          <Route path="edom" element={<RoleGuard roles={['super_admin','rektor','admin','dekan','akademik','kaprodi','dosen','mahasiswa']}><EdomPage /></RoleGuard>} />
          <Route path="mata-kuliah" element={<RoleGuard roles={['super_admin','rektor','admin','dekan','akademik','kaprodi']}><MatakuliahPage /></RoleGuard>} />
          <Route path="jadwal" element={<RoleGuard roles={['super_admin','admin','akademik','dosen']}><JadwalPage /></RoleGuard>} />
          <Route path="krs" element={<RoleGuard roles={['super_admin','rektor','admin','dekan','akademik','kaprodi','dosen','mahasiswa']}><KRSPage /></RoleGuard>} />
          <Route path="cetak-pdf" element={<RoleGuard roles={['super_admin','rektor','admin','dekan','akademik','kaprodi','dosen','mahasiswa']}><CetakPDFPage /></RoleGuard>} />
          <Route path="absensi" element={<RoleGuard roles={['super_admin','admin','akademik','dosen']}><AbsensiPage /></RoleGuard>} />
          <Route path="nilai" element={<RoleGuard roles={['super_admin','admin','akademik','dosen']}><NilaiPage /></RoleGuard>} />
          <Route path="khs" element={<RoleGuard roles={['super_admin','rektor','admin','dekan','akademik','kaprodi','dosen','mahasiswa']}><KHSPage /></RoleGuard>} />
          <Route path="kurikulum" element={<RoleGuard roles={['super_admin','rektor','admin','dekan','akademik','kaprodi']}><KurikulumPage /></RoleGuard>} />
          <Route path="rps" element={<RoleGuard roles={['super_admin','admin','akademik','dosen']}><RPSPage /></RoleGuard>} />
          <Route path="bap" element={<RoleGuard roles={['super_admin','admin','akademik','dosen']}><BAPPage /></RoleGuard>} />
          <Route path="absensi-dosen" element={<RoleGuard roles={['super_admin','admin','akademik','kaprodi','dosen']}><AbsensiDosenPage /></RoleGuard>} />
          <Route path="surat" element={<RoleGuard roles={['super_admin','rektor','admin','dekan','akademik','kaprodi','mahasiswa']}><SuratPage /></RoleGuard>} />
          <Route path="sidang" element={<RoleGuard roles={['super_admin','admin','akademik','kaprodi','dosen']}><SidangPage /></RoleGuard>} />
          <Route path="kkn" element={<RoleGuard roles={['super_admin','admin','akademik','kaprodi','dosen']}><KKNPage /></RoleGuard>} />
          <Route path="pkl" element={<RoleGuard roles={['super_admin','admin','akademik','kaprodi','dosen','mahasiswa']}><PKLPage /></RoleGuard>} />
          <Route path="seminar" element={<RoleGuard roles={['super_admin','admin','akademik','kaprodi','dosen']}><SeminarPage /></RoleGuard>} />
          <Route path="beasiswa" element={<RoleGuard roles={['super_admin','rektor','admin','dekan','akademik','kaprodi','mahasiswa']}><BeasiswaPage /></RoleGuard>} />
          <Route path="akreditasi" element={<RoleGuard roles={['super_admin','rektor','admin','dekan','akademik','kaprodi']}><AkreditasiPage /></RoleGuard>} />
          <Route path="perpustakaan" element={<RoleGuard roles={['super_admin','rektor','admin','dekan','akademik','kaprodi','pustakawan','dosen','mahasiswa']}><PerpustakaanPage /></RoleGuard>} />
          <Route path="integrasi-lms" element={<RoleGuard roles={['super_admin','rektor','admin','dekan','akademik','kaprodi']}><LMSPage /></RoleGuard>} />
          <Route path="ai" element={<RoleGuard roles={['super_admin','rektor','admin','dekan','akademik','kaprodi','dosen','mahasiswa','alumni']}><AIPage /></RoleGuard>} />
          <Route path="tagihan" element={<RoleGuard roles={['super_admin','rektor','admin','dekan','akademik','kaprodi','keuangan','mahasiswa']}><TagihanRouter /></RoleGuard>} />
          <Route path="pembayaran" element={<RoleGuard roles={['super_admin','rektor','admin','dekan','akademik','kaprodi','keuangan']}><PembayaranPage /></RoleGuard>} />
          <Route path="riwayat-pembayaran" element={<RoleGuard roles={['mahasiswa']}><RiwayatPembayaranPage /></RoleGuard>} />
          <Route path="cms" element={<RoleGuard roles={['super_admin','rektor','admin','dekan','akademik','kaprodi']}><CMSPage /></RoleGuard>} />
          <Route path="ppdb" element={<RoleGuard roles={['super_admin','rektor','admin','dekan','akademik','kaprodi']}><PPDBPage /></RoleGuard>} />
          <Route path="ppdb/config" element={<RoleGuard roles={['super_admin','admin']}><PPDBConfigPage /></RoleGuard>} />
          <Route path="ojs" element={<RoleGuard roles={['super_admin','rektor','admin','dekan','akademik','kaprodi']}><OJSPage /></RoleGuard>} />
          <Route path="pddikti" element={<RoleGuard roles={['super_admin','rektor','admin','dekan','akademik','kaprodi']}><PDDIKTIPage /></RoleGuard>} />
          <Route path="alumni" element={<RoleGuard roles={['super_admin','rektor','admin','dekan','akademik','kaprodi','alumni']}><AlumniPage /></RoleGuard>} />
        </Route>
      </Route>

      <Route element={<AuthGuard><AppLayout /></AuthGuard>}>
        <Route path="vendor" element={<VendorDashboardPage />} />
        <Route path="vendor/tenants" element={<TenantsPage />} />
        <Route path="vendor/tickets" element={<TicketsPage />} />
        <Route path="vendor/firewall" element={<FirewallPage />} />
        <Route path="vendor/cctv" element={<CctvPage />} />
        <Route path="vendor/settings" element={<SettingsPage />} />
        <Route path="vendor/plans" element={<VendorPlansPage />} />
        <Route path="vendor/monitor" element={<VendorMonitorPage />} />
        <Route path="vendor/audit" element={<VendorAuditPage />} />
        <Route path="vendor/landing-pages" element={<LandingPagesPage />} />
        <Route path="vendor/landing-builder" element={<VendorLandingBuilder />} />
        <Route path="vendor/users" element={<VendorUsersPage />} />
        <Route path="vendor/tenants/:id" element={<TenantDetailPage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </AuthProvider>
  );
}
