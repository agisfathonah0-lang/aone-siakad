import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { Bell, Search, Menu } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';

function initialAvatar(nama?: string) {
  if (!nama) return '?';
  return nama.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();
}

const pageTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  mahasiswa: 'Data Mahasiswa', dosen: 'Data Dosen', prodi: 'Program Studi',
  users: 'Users', 'mata-kuliah': 'Mata Kuliah', jadwal: 'Jadwal', krs: 'KRS',
  nilai: 'Nilai', khs: 'KHS', absensi: 'Absensi', kurikulum: 'Kurikulum',
  rps: 'RPS', bap: 'BAP', 'absensi-dosen': 'Absensi Dosen', 'cetak-pdf': 'Cetak PDF',
  transkrip: 'Transkrip', pkl: 'PKL', sidang: 'Sidang', kkn: 'KKN', seminar: 'Seminar',
  perwalian: 'Perwalian', edom: 'EDOM', beasiswa: 'Beasiswa',
  tagihan: 'Tagihan', pembayaran: 'Pembayaran', 'riwayat-pembayaran': 'Riwayat Pembayaran',
  surat: 'Surat', perpustakaan: 'Perpustakaan', akreditasi: 'Akreditasi',
  berita: 'Berita', kalender: 'Kalender', notifikasi: 'Notifikasi', cctv: 'CCTV',
  cms: 'CMS Landing', ppdb: 'PPDB', ojs: 'OJS', pddikti: 'PDDIKTI',
  alumni: 'Alumni', 'integrasi-lms': 'Integrasi LMS', 'landing-page': 'Landing Page',
  ai: 'AI Chatbot', laporan: 'Laporan', pengaturan: 'Pengaturan',
};

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const pathSegment = location.pathname.split('/').pop() || 'dashboard';
  const pageTitle = pageTitles[pathSegment] || 'Dashboard';

  const today = new Date();
  const dateStr = today.toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--background)', fontFamily: 'var(--font-sans)' }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 flex flex-col min-h-screen lg:ml-[240px]">
        {/* Sticky Topbar */}
        <header
          className="sticky top-0 z-10 border-b"
          style={{ background: 'var(--background)', borderColor: 'var(--border)', backdropFilter: 'blur(8px)' }}
        >
          <div className="flex items-center justify-between px-8 h-16">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
                style={{ color: 'var(--muted-foreground)' }}
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={16} />
              </button>
              <div>
                <h1 className="text-base font-semibold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
                  {pageTitle}
                </h1>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{dateStr}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative hidden sm:block">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
                <input
                  placeholder="Cari menu atau fitur..."
                  className="pl-8 pr-4 py-2 text-xs rounded-lg border focus:outline-none focus:ring-2 transition-all placeholder:"
                  style={{
                    background: 'var(--card)',
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)',
                    width: 256,
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(37,99,235,0.15)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>

              {/* Notifications */}
              <button
                className="relative w-9 h-9 rounded-lg border flex items-center justify-center transition-colors"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(37,99,235,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                <Bell size={15} style={{ color: 'var(--muted-foreground)' }} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: '#EF4444' }} />
              </button>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Avatar */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 cursor-pointer"
                style={{ background: 'var(--primary)' }}
              >
                {initialAvatar(user?.nama)}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-8" style={{ background: 'var(--background)' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
