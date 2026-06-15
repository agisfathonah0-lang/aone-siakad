import React, { useState, useEffect } from 'react';
import { User, ModuleType, UserRole } from './types';
import Auth from './components/Auth';
import Topbar from './components/Topbar';
import Sidebar from './components/Sidebar';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import TenantAcademicModule from './components/TenantAcademicModule';
import StudentModule from './components/StudentModule';
import LecturerModule from './components/LecturerModule';
import PmbModule from './components/PmbModule';
import FinanceModule from './components/FinanceModule';
import PddiktiModule from './components/PddiktiModule';
import LmsModule from './components/LmsModule';
import OjsModule from './components/OjsModule';
import { ToastProvider } from './components/Toast';
import AkredetasiModule from './components/AkredetasiModule';
import AlumniModule from './components/AlumniModule';
import SettingsModule from './components/SettingsModule';
import CctvModule from './components/CctvModule';
import AoneLandingPage from './components/AoneLandingPage';
import CampusLandingPage from './components/CampusLandingPage';
import CampusAuth from './components/CampusAuth';
import CctvBroadcast from './components/CctvBroadcast';
import { PMB_APPLICANTS } from './mockData';
import { Sparkles, ShieldCheck } from 'lucide-react';

export default function App() {
  const params = new URLSearchParams(window.location.search);
  if (params.has('broadcast')) {
    return <CctvBroadcast />;
  }

  const [user, setUser] = useState<User | null>(null);
  const [campusPageId, setCampusPageId] = useState<string | null>(null);
  const [campusContext, setCampusContext] = useState<any>(null);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [currentModule, setCurrentModule] = useState<ModuleType>('SUPER_ADMIN');
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isDark, setIsDark] = useState<boolean>(false);

  // Detect subdomain or ?campus= param for campus landing page
  useEffect(() => {
    const hostname = window.location.hostname;
    const params = new URLSearchParams(window.location.search);
    const campusParam = params.get('campus');
    const match = hostname.match(/^([a-z0-9-]+)\.(localhost|aone-project\.id)$/);
    const detectedSubdomain = match ? match[1] : null;
    const lookup = campusParam || detectedSubdomain;
    if (lookup) {
      import('./api').then(({ api }) => {
        // 1. Try as campus ID directly (handles both numeric and alphanumeric IDs)
        api.getCampus(lookup).then(campus => {
          setCampusPageId(campus.id);
        }).catch(() => {
          // 2. Fall back to subdomain lookup
          api.getCampusBySubdomain(lookup).then(campus => {
            setCampusPageId(campus.id);
          }).catch(() => {});
        });
      });
    }
  }, []);

  // Initialize theme from localStorage on load
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleToggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    
    // Dynamically routing default views based on user role
    const role = loggedInUser.role;
    if (role === 'SUPER_ADMIN') {
      setCurrentModule('SUPER_ADMIN');
      setCurrentView('dashboard');
    } else if (role === 'AKADEMIK') {
      setCurrentModule('AKADEMIK');
      setCurrentView('dashboard_campus');
    } else if (role === 'KEUANGAN') {
      setCurrentModule('KEUANGAN');
      setCurrentView('keuangan_dashboard');
    } else if (role === 'DOSEN') {
      setCurrentModule('LAYANAN_DOSEN');
      setCurrentView('dosen_jadwal');
    } else if (role === 'MAHASISWA') {
      setCurrentModule('LAYANAN_MAHASISWA');
      setCurrentView('mhs_krs');
    } else if (role === 'PMB_APPLICANT') {
      setCurrentModule('PMB');
      setCurrentView('pmb_portal_steps');
    }
  };

  const handleLogout = () => {
    setUser(null);
  };

  // Impersonator / Custom Role Switch trigger callback
  const handleImpersonate = (newRole: UserRole) => {
    if (!user) return;
    
    const roleNameMap: Record<UserRole, string> = {
      SUPER_ADMIN: 'Super Admin Kampus',
      AKADEMIK: 'Administrator Akademik',
      KEUANGAN: 'Administrator Keuangan',
      DOSEN: 'Dosen Wali Utama',
      MAHASISWA: 'Ahmad Fauzi',
      PMB_APPLICANT: 'Bayu Nugroho'
    };

    const updatedUser: User = {
      ...user,
      role: newRole,
      name: roleNameMap[newRole],
      email: `${newRole.toLowerCase()}@aone-project.id`,
      nim_nip: newRole === 'MAHASISWA' ? '20220801001' : newRole === 'DOSEN' ? 'NIDN 0412199001' : undefined
    };

    setUser(updatedUser);

    // Route default matching modules
    if (newRole === 'SUPER_ADMIN') {
      setCurrentModule('SUPER_ADMIN');
      setCurrentView('dashboard');
    } else if (newRole === 'AKADEMIK') {
      setCurrentModule('AKADEMIK');
      setCurrentView('dashboard_campus');
    } else if (newRole === 'KEUANGAN') {
      setCurrentModule('KEUANGAN');
      setCurrentView('keuangan_dashboard');
    } else if (newRole === 'DOSEN') {
      setCurrentModule('LAYANAN_DOSEN');
      setCurrentView('dosen_jadwal');
    } else if (newRole === 'MAHASISWA') {
      setCurrentModule('LAYANAN_MAHASISWA');
      setCurrentView('mhs_krs');
    } else if (newRole === 'PMB_APPLICANT') {
      setCurrentModule('PMB');
      setCurrentView('pmb_portal_steps');
    }
  };

  const handleNavigate = (module: ModuleType, view: string) => {
    setCurrentModule(module);
    setCurrentView(view);
  };

  // If viewing a campus landing page (subdomain or ?campus param)
  if (campusPageId && !user) {
    if (showLoginModal && campusContext) {
      return (
        <CampusAuth
          campus={campusContext}
          isDark={isDark}
          onLoginSuccess={handleLoginSuccess}
          onBack={() => { setShowLoginModal(false); setCampusContext(null); }}
        />
      );
    }
    return (
      <CampusLandingPage
        campusId={campusPageId}
        isDark={isDark}
        onLoginClick={() => {
          import('./api').then(({ api }) => {
            api.getCampus(campusPageId).then(data => {
              setCampusContext(data);
              setShowLoginModal(true);
            }).catch(() => setShowLoginModal(true));
          });
        }}
        onRegisterPmb={(_cid) => {
          setCampusPageId(null);
          setShowLoginModal(true);
          const url = new URL(window.location.href);
          url.searchParams.delete('campus');
          window.history.replaceState({}, '', url.toString());
        }}
        onBackToAone={() => {
          setCampusPageId(null); setCampusContext(null);
          const url = new URL(window.location.href);
          url.searchParams.delete('campus');
          window.history.replaceState({}, '', url.toString());
        }}
      />
    );
  }

  // If user is not logged in, render the landing page or portal login
  if (!user) {
    if (showLoginModal) {
      return (
        <Auth 
          onLoginSuccess={handleLoginSuccess} 
          isDark={isDark} 
          onBackToLanding={() => setShowLoginModal(false)}
        />
      );
    }
    return (
      <AoneLandingPage
        isDark={isDark}
        onLoginClick={() => setShowLoginModal(true)}
        onExploreCampus={(campusId) => {
          if (campusId) {
            setCampusPageId(campusId);
            const url = new URL(window.location.href);
            url.searchParams.set('campus', campusId);
            window.history.pushState({}, '', url.toString());
          }
        }}
      />
    );
  }

  return (
    <ToastProvider>
    <div className={`h-screen w-screen overflow-hidden flex font-sans ${isDark ? 'bg-zinc-950 text-white' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* LEFT SIDEBAR AREA */}
      <Sidebar
        user={user}
        currentModule={currentModule}
        currentView={currentView}
        isDark={isDark}
        onNavigate={handleNavigate}
      />

      {/* RIGHT CONTENT FRAME */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* PREMIUM SANDBOX COMPACT BANNER */}
        <div className={`text-[11px] font-sans px-4 py-2 flex items-center justify-between shadow-sm border-b z-40 relative select-none ${
          isDark 
            ? 'bg-gradient-to-r from-emerald-950/80 via-zinc-900 to-indigo-950/80 text-zinc-100 border-zinc-800' 
            : 'bg-gradient-to-r from-emerald-500 via-indigo-600 to-indigo-700 text-white border-indigo-700'
        }`}>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500 text-[9px] text-white px-2 py-0.5 rounded-full font-extrabold uppercase font-mono animate-pulse tracking-wider shadow-sm">
              ★ Premium Elite Active
            </span>
            <span className="hidden md:inline opacity-90 font-medium">
              Mode Sandbox AONE SIAKAD aktif dengan seluruh modul (SIAKAD, Multi VA Keuangan, Automated PDDIKTI, Akreditasi 9 Standar, LMS, Tracer Study) terbuka penuh pada paket teratas.
            </span>
            <span className="inline md:hidden opacity-90 font-medium">
              Seluruh modul AONE SIAKAD aktif penuh pada paket Elite Enterprise.
            </span>
          </div>
          <div className="flex items-center gap-1 font-mono font-black text-[10px] text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-1" />
            LIVE VERIFIED
          </div>
        </div>

        {/* TOPBAR HEADER MENU */}
        <Topbar
          user={user}
          isDark={isDark}
          onToggleTheme={handleToggleTheme}
          onLogout={handleLogout}
          onImpersonate={handleImpersonate}
          systemStatus="online"
        />

        {/* MAIN BODY SWITCH CONTENT */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          
          {/* 1. SUPER_ADMIN MODULES */}
          {currentModule === 'SUPER_ADMIN' && (
            <SuperAdminDashboard currentView={currentView} isDark={isDark} onNavigate={handleNavigate} />
          )}

          {/* 2. TENANT CAMPUS ACADEMIC MODULES */}
          {currentModule === 'AKADEMIK' && (
            <TenantAcademicModule currentView={currentView} isDark={isDark} />
          )}

          {/* 3. STUDENT PORTAL MODULES */}
          {currentModule === 'LAYANAN_MAHASISWA' && (
            <StudentModule currentView={currentView} isDark={isDark} />
          )}

          {/* 4. DOSEN PORTAL MODULES */}
          {currentModule === 'LAYANAN_DOSEN' && (
            <LecturerModule currentView={currentView} isDark={isDark} />
          )}

          {/* 5. PMB MANAGEMENT PORTAL MODULES */}
          {currentModule === 'PMB' && (
            <PmbModule currentView={currentView} isDark={isDark} user={user} />
          )}

          {/* 6. FINANCIAL PORTAL MODULES */}
          {currentModule === 'KEUANGAN' && (
            <FinanceModule currentView={currentView} isDark={isDark} />
          )}

          {/* 7. PDDIKTI GATEWAY SINKRON MODULES */}
          {currentModule === 'PDDIKTI' && (
            <PddiktiModule currentView={currentView} isDark={isDark} />
          )}

          {/* 8. LEARNING MANAGEMENT COMPLEX MODULES */}
          {currentModule === 'LMS' && (
            <LmsModule currentView={currentView} isDark={isDark} />
          )}

          {/* 9. OJS E-JOURNAL REPOSITORY MODULES */}
          {currentModule === 'OJS' && (
            <OjsModule currentView={currentView} isDark={isDark} />
          )}

          {/* 10. AKREDITASI 9 STANDARS MODULES */}
          {currentModule === 'AKREDITASI' && (
            <AkredetasiModule isDark={isDark} />
          )}

          {/* 11. ALUMNI DIRECTORY MODULES */}
          {currentModule === 'ALUMNI' && (
            <AlumniModule currentView={currentView} isDark={isDark} />
          )}

          {/* 12. UTILITY SETTINGS MODULES */}
          {currentModule === 'SETTINGS' && (
            <SettingsModule isDark={isDark} />
          )}

          {/* 13. CCTV MONITORING MODULES */}
          {currentModule === 'CCTV' && (
            <CctvModule isDark={isDark} />
          )}

        </main>
      </div>

    </div>
    </ToastProvider>
  );
}
