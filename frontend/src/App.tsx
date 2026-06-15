import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
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
import BeritaPage from './pages/akademik/BeritaPage';
import MahasiswaPage from './pages/akademik/MahasiswaPage';
import MahasiswaDetailPage from './pages/akademik/MahasiswaDetailPage';
import DosenPage from './pages/akademik/DosenPage';
import EdomPage from './pages/akademik/EdomPage';
import MatakuliahPage from './pages/akademik/MatakuliahPage';
import JadwalPage from './pages/akademik/JadwalPage';
import KRSPage from './pages/akademik/KRSPage';
import AbsensiPage from './pages/akademik/AbsensiPage';
import NilaiPage from './pages/akademik/NilaiPage';
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
import PembayaranPage from './pages/keuangan/PembayaranPage';
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
import { canAccess } from './utils/roles';
import type { Role } from './types';
import { get } from './api/client';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950"><Loader2 className="w-6 h-6 animate-spin text-emerald-500" /></div>;
  if (!user) {
    const to = location.pathname.startsWith('/vendor') ? '/vendor/login' : '/login';
    return <Navigate to={to} replace />;
  }
  return <>{children}</>;
}

function RoleGuard({ children, roles }: { children: React.ReactNode; roles: Role[] }) {
  const { user } = useAuth();
  if (!user || !canAccess(user.role, roles)) {
    return <Navigate to="/dashboard" replace />;
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

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<TenantLandingRouter />} />
      <Route path="/kampus/:slug/ppdb" element={<CampusPPDBPage />} />
      <Route path="/kampus/:slug" element={<CampusLandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/vendor/login" element={<VendorLoginPage />} />
      <Route path="/register" element={<RegistrasiInstitusiPage />} />
      <Route path="/testimoni" element={<TestimoniPage />} />
      <Route path="/harga" element={<HargaPage />} />
      {features.map(f => <Route key={f.slug} path={`/fitur/${f.slug}`} element={<FeaturePage slug={f.slug} />} />)}
      <Route element={<AuthGuard><AppLayout /></AuthGuard>}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="prodi" element={<ProdiPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="pengaturan" element={<CampusSettingsPage />} />
        <Route path="transkrip" element={<TranscriptPage />} />
        <Route path="laporan" element={<LaporanPage />} />
        <Route path="perwalian" element={<PerwalianPage />} />
        <Route path="landing-page" element={<LandingSettingsPage />} />
        <Route path="kalender" element={<KalenderPage />} />
        <Route path="notifikasi" element={<NotifikasiPage />} />
        <Route path="cctv" element={<CampusCctvPage />} />
        <Route path="berita" element={<BeritaPage />} />
        <Route path="mahasiswa" element={<MahasiswaPage />} />
        <Route path="mahasiswa/:nim" element={<MahasiswaDetailPage />} />
        <Route path="dosen" element={<DosenPage />} />
        <Route path="edom" element={<EdomPage />} />
        <Route path="mata-kuliah" element={<MatakuliahPage />} />
        <Route path="jadwal" element={<JadwalPage />} />
        <Route path="krs" element={<KRSPage />} />
        <Route path="cetak-pdf" element={<CetakPDFPage />} />
        <Route path="absensi" element={<AbsensiPage />} />
        <Route path="nilai" element={<NilaiPage />} />
        <Route path="kurikulum" element={<KurikulumPage />} />
        <Route path="rps" element={<RPSPage />} />
        <Route path="bap" element={<BAPPage />} />
        <Route path="absensi-dosen" element={<AbsensiDosenPage />} />
        <Route path="surat" element={<SuratPage />} />
        <Route path="sidang" element={<SidangPage />} />
        <Route path="kkn" element={<KKNPage />} />
        <Route path="pkl" element={<PKLPage />} />
        <Route path="seminar" element={<SeminarPage />} />
        <Route path="beasiswa" element={<BeasiswaPage />} />
        <Route path="akreditasi" element={<AkreditasiPage />} />
        <Route path="perpustakaan" element={<PerpustakaanPage />} />
        <Route path="integrasi-lms" element={<LMSPage />} />
        <Route path="ai" element={<AIPage />} />
        <Route path="tagihan" element={<TagihanPage />} />
        <Route path="pembayaran" element={<PembayaranPage />} />
        <Route path="cms" element={<CMSPage />} />
        <Route path="ppdb" element={<PPDBPage />} />
        <Route path="ppdb/config" element={<PPDBConfigPage />} />
        <Route path="ojs" element={<OJSPage />} />
        <Route path="pddikti" element={<PDDIKTIPage />} />
        <Route path="alumni" element={<AlumniPage />} />
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
      <AppRoutes />
    </AuthProvider>
  );
}
