import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ConfirmProvider } from './context/ConfirmContext';
import AppLayout from './components/layout/AppLayout';
import { features } from './pages/public/FeaturePage';
import { Loader2 } from 'lucide-react';
import { canAccess, canAccessAny } from './utils/roles';
import type { Role } from './types';
import { get } from './api/client';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const VerifyPage = lazy(() => import('./pages/public/VerifyPage'));
const CampusLandingPage = lazy(() => import('./pages/CampusLandingPage'));
const CampusPPDBPage = lazy(() => import('./pages/CampusPPDBPage'));
const FeaturePage = lazy(() => import('./pages/public/FeaturePage'));
const TestimoniPage = lazy(() => import('./pages/public/TestimoniPage'));
const HargaPage = lazy(() => import('./pages/public/HargaPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const VendorLoginPage = lazy(() => import('./pages/auth/VendorLoginPage'));
const RegistrasiInstitusiPage = lazy(() => import('./pages/auth/RegistrasiInstitusiPage'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const ProdiPage = lazy(() => import('./pages/akademik/ProdiPage'));
const UsersPage = lazy(() => import('./pages/akademik/UsersPage'));
const CampusSettingsPage = lazy(() => import('./pages/akademik/CampusSettingsPage'));
const TranscriptPage = lazy(() => import('./pages/akademik/TranscriptPage'));
const LaporanPage = lazy(() => import('./pages/akademik/LaporanPage'));
const PerwalianPage = lazy(() => import('./pages/akademik/PerwalianPage'));
const LandingSettingsPage = lazy(() => import('./pages/akademik/LandingSettingsPage'));
const KalenderPage = lazy(() => import('./pages/akademik/KalenderPage'));
const NotifikasiPage = lazy(() => import('./pages/akademik/NotifikasiPage'));
const ChatKelasPage = lazy(() => import('./pages/chat/ChatKelasPage'));
const KelasRoomPage = lazy(() => import('./pages/akademik/KelasRoomPage'));
const KelasRoomDetailPage = lazy(() => import('./pages/akademik/KelasRoomDetailPage'));
const BeritaPage = lazy(() => import('./pages/akademik/BeritaPage'));
const PengumumanPage = lazy(() => import('./pages/akademik/PengumumanPage'));
const MahasiswaPage = lazy(() => import('./pages/akademik/MahasiswaPage'));
const MahasiswaDetailPage = lazy(() => import('./pages/akademik/MahasiswaDetailPage'));
const DosenPage = lazy(() => import('./pages/akademik/DosenPage'));
const EdomPage = lazy(() => import('./pages/akademik/EdomPage'));
const MatakuliahPage = lazy(() => import('./pages/akademik/MatakuliahPage'));
const JadwalPage = lazy(() => import('./pages/akademik/JadwalPage'));
const KRSPage = lazy(() => import('./pages/akademik/KRSPage'));
const AbsensiPage = lazy(() => import('./pages/akademik/AbsensiPage'));
const NilaiPage = lazy(() => import('./pages/akademik/NilaiPage'));
const KHSPage = lazy(() => import('./pages/akademik/KHSPage'));
const CetakPDFPage = lazy(() => import('./pages/akademik/CetakPDFPage'));
const KurikulumPage = lazy(() => import('./pages/akademik/KurikulumPage'));
const RPSPage = lazy(() => import('./pages/akademik/RPSPage'));
const BAPPage = lazy(() => import('./pages/akademik/BAPPage'));
const AbsensiDosenPage = lazy(() => import('./pages/akademik/AbsensiDosenPage'));
const BeasiswaPage = lazy(() => import('./pages/akademik/BeasiswaPage'));
const SuratPage = lazy(() => import('./pages/akademik/SuratPage'));
const SeminarPage = lazy(() => import('./pages/akademik/SeminarPage'));
const SidangPage = lazy(() => import('./pages/akademik/SidangPage'));
const KKNPage = lazy(() => import('./pages/akademik/KKNPage'));
const PKLPage = lazy(() => import('./pages/akademik/PKLPage'));
const AkreditasiPage = lazy(() => import('./pages/akademik/AkreditasiPage'));
const PerpustakaanPage = lazy(() => import('./pages/akademik/PerpustakaanPage'));
const LMSPage = lazy(() => import('./pages/akademik/LMSPage'));
const AIPage = lazy(() => import('./pages/ai/AIPage'));
const TagihanPage = lazy(() => import('./pages/keuangan/TagihanPage'));
const TagihanMahasiswaPage = lazy(() => import('./pages/keuangan/TagihanMahasiswaPage'));
const PembayaranPage = lazy(() => import('./pages/keuangan/PembayaranPage'));
const RiwayatPembayaranPage = lazy(() => import('./pages/keuangan/RiwayatPembayaranPage'));
const CMSPage = lazy(() => import('./pages/cms/CMSPage'));
const PPDBPage = lazy(() => import('./pages/ppdb/PPDBPage'));
const PPDBConfigPage = lazy(() => import('./pages/ppdb/PPDBConfigPage'));
const OJSPage = lazy(() => import('./pages/ojs/OJSPage'));
const PDDIKTIPage = lazy(() => import('./pages/pddikti/PDDIKTIPage'));
const AlumniPage = lazy(() => import('./pages/alumni/AlumniPage'));
const VendorDashboardPage = lazy(() => import('./pages/vendor/VendorDashboardPage'));
const TenantsPage = lazy(() => import('./pages/vendor/TenantsPage'));
const TicketsPage = lazy(() => import('./pages/vendor/TicketsPage'));
const FirewallPage = lazy(() => import('./pages/vendor/FirewallPage'));
const CctvPage = lazy(() => import('./pages/vendor/CctvPage'));
const CampusCctvPage = lazy(() => import('./pages/dashboard/CctvPage'));
const ProfilPage = lazy(() => import('./pages/akademik/ProfilPage'));
const SettingsPage = lazy(() => import('./pages/vendor/SettingsPage'));
const VendorPlansPage = lazy(() => import('./pages/vendor/VendorPlansPage'));
const VendorMonitorPage = lazy(() => import('./pages/vendor/VendorMonitorPage'));
const VendorAuditPage = lazy(() => import('./pages/vendor/VendorAuditPage'));
const LandingPagesPage = lazy(() => import('./pages/vendor/LandingPagesPage'));
const VendorLandingBuilder = lazy(() => import('./pages/vendor/VendorLandingBuilder'));
const VendorUsersPage = lazy(() => import('./pages/vendor/VendorUsersPage'));
const TenantDetailPage = lazy(() => import('./pages/vendor/TenantDetailPage'));

function PageLoader() {
  return <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}><Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--primary)' }} /></div>;
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <PageLoader />;
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
  if (loading) return <PageLoader />;
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

  if (isDev) return <Suspense fallback={<PageLoader />}><LandingPage /></Suspense>;
  if (resolved === 'loading') return <PageLoader />;
  if (resolved === 'found') return <Navigate to={`/kampus/${slug}`} replace />;
  return <Suspense fallback={<PageLoader />}><LandingPage /></Suspense>;
}

function TagihanRouter() {
  const { user } = useAuth();
  if (user?.role === 'mahasiswa') return <Suspense fallback={<PageLoader />}><TagihanMahasiswaPage /></Suspense>;
  return <Suspense fallback={<PageLoader />}><TagihanPage /></Suspense>;
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
        <Route path="/verify/:kode" element={<VerifyPage />} />

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
            <Route path="kelas-room" element={<RoleGuard roles={['super_admin','rektor','admin','dekan','akademik','kaprodi','dosen','mahasiswa']}><KelasRoomPage /></RoleGuard>} />
            <Route path="kelas-room/:id" element={<RoleGuard roles={['super_admin','rektor','admin','dekan','akademik','kaprodi','dosen','mahasiswa']}><KelasRoomDetailPage /></RoleGuard>} />
            <Route path="cctv" element={<RoleGuard roles={['super_admin','rektor','admin','dekan','akademik','kaprodi']}><CampusCctvPage /></RoleGuard>} />
            <Route path="berita" element={<RoleGuard roles={['super_admin','rektor','admin','dekan','akademik','kaprodi','humas']}><BeritaPage /></RoleGuard>} />
            <Route path="pengumuman" element={<RoleGuard roles={['super_admin','rektor','admin','dekan','akademik','kaprodi','humas']}><PengumumanPage /></RoleGuard>} />
            <Route path="profil" element={<ProfilPage />} />
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
        <ConfirmProvider>
          <AppRoutes />
        </ConfirmProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
