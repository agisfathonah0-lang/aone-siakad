import React from 'react';
import {
  Shield, BookOpen, CreditCard, Award, GraduationCap, Laptop,
  Settings, Server, Activity, Users, Database, LayoutDashboard,
  FileSpreadsheet, ClipboardList, BookOpenCheck, BarChart4,
  Mail, Calendar, MessageSquare, Send, Globe, Key, FileCheck, Map, Sparkles, UserCheck, ShieldAlert, Camera
} from 'lucide-react';
import { User, ModuleType } from '../types';

interface SidebarProps {
  user: User;
  currentModule: ModuleType;
  currentView: string;
  isDark: boolean;
  onNavigate: (module: ModuleType, view: string) => void;
}

export default function Sidebar({ user, currentModule, currentView, isDark, onNavigate }: SidebarProps) {
  
  // Custom navigation rendering matching the current active persona
  const renderSuperAdminMenu = () => {
    return [
      {
        title: 'PLATFORM UTAMA',
        items: [
          { name: 'Dashboard SaaS', icon: LayoutDashboard, view: 'dashboard', module: 'SUPER_ADMIN' as ModuleType },
          { name: 'Daftar Kampus', icon: Globe, view: 'kampus_list', module: 'SUPER_ADMIN' as ModuleType },
          { name: 'Paket Berlangganan', icon: CreditCard, view: 'subscription_plans', module: 'SUPER_ADMIN' as ModuleType },
        ]
      },
      {
        title: 'MONITORING & SUPPORT',
        items: [
          { name: 'System Monitoring', icon: Activity, view: 'system_monitor', module: 'SUPER_ADMIN' as ModuleType },
          { name: 'Audit Log & Aktifitas', icon: Server, view: 'audit_logs', module: 'SUPER_ADMIN' as ModuleType },
          { name: 'Ticket Support', icon: MessageSquare, view: 'support_tickets', module: 'SUPER_ADMIN' as ModuleType },
          { name: 'Firewall & Keamanan', icon: ShieldAlert, view: 'firewall_monitor', module: 'SUPER_ADMIN' as ModuleType },
          { name: 'CCTV Monitoring', icon: Camera, view: 'cctv_dashboard', module: 'CCTV' as ModuleType },
          { name: 'Web Kampus', icon: Globe, view: 'kampus-web', module: 'SUPER_ADMIN' as ModuleType },
        ]
      },
      {
        title: 'KONFIGURASI GLOBAL',
        items: [
          { name: 'SaaS Settings', icon: Settings, view: 'settings_saas', module: 'SETTINGS' as ModuleType },
          { name: 'Kustomisasi Web', icon: Globe, view: 'web_customization', module: 'SUPER_ADMIN' as ModuleType },
        ]
      }
    ];
  };

  const renderAkademikMenu = () => {
    return [
      {
        title: 'OVERVIEW',
        items: [
          { name: 'Dashboard Institusi', icon: LayoutDashboard, view: 'dashboard_campus', module: 'AKADEMIK' as ModuleType },
        ]
      },
      {
        title: 'MODUL AKADEMIK',
        items: [
          { name: 'Daftar Mahasiswa', icon: Users, view: 'mhs_list', module: 'AKADEMIK' as ModuleType },
          { name: 'Daftar Dosen', icon: Award, view: 'dosen_list', module: 'AKADEMIK' as ModuleType },
          { name: 'Mata Kuliah & Kurikulum', icon: BookOpenCheck, view: 'kurikulum_list', module: 'AKADEMIK' as ModuleType },
          { name: 'Jadwal & Kelas Kuliah', icon: FileSpreadsheet, view: 'jadwal_list', module: 'AKADEMIK' as ModuleType },
          { name: 'Kalender Akademik', icon: Calendar, view: 'kalender_akademik', module: 'AKADEMIK' as ModuleType },
        ]
      },
      {
        title: 'SINKRONISASI PDDIKTI',
        items: [
          { name: 'PDDIKTI Portal', icon: Database, view: 'pddikti_dashboard', module: 'PDDIKTI' as ModuleType },
        ]
      },
      {
        title: 'MANAJEMEN BELAJAR & PMB',
        items: [
          { name: 'Dashboard Seleksi PMB', icon: Laptop, view: 'pmb_admin_dashboard', module: 'PMB' as ModuleType },
          { name: 'LMS Administration', icon: BookOpen, view: 'lms_dashboard', module: 'LMS' as ModuleType },
          { name: 'OJS Journal SSO', icon: Globe, view: 'ojs_dashboard', module: 'OJS' as ModuleType },
        ]
      },
      {
        title: 'EKSEKUTIF & OUTCOME',
        items: [
          { name: 'Akreditasi Rektorat', icon: FileCheck, view: 'accreditation_visualizer', module: 'AKREDITASI' as ModuleType },
          { name: 'Survey & Hasil Alumni', icon: GraduationCap, view: 'alumni_dashboard', module: 'ALUMNI' as ModuleType },
          { name: 'CCTV Monitoring', icon: Camera, view: 'cctv_dashboard', module: 'CCTV' as ModuleType },
        ]
      },
      {
        title: 'SISTEM',
        items: [
          { name: 'Pengaturan Sistem', icon: Settings, view: 'settings_campus_branding', module: 'SETTINGS' as ModuleType },
        ]
      }
    ];
  };

  const renderKeuanganMenu = () => {
    return [
      {
        title: 'FINANCIAL CONTROL',
        items: [
          { name: 'Dashboard Keuangan', icon: LayoutDashboard, view: 'keuangan_dashboard', module: 'KEUANGAN' as ModuleType },
          { name: 'Tagihan Mahasiswa', icon: CreditCard, view: 'tagihan_mhs', module: 'KEUANGAN' as ModuleType },
          { name: 'Verifikasi Pembayaran', icon: FileCheck, view: 'verifikasi_pembayaran', module: 'KEUANGAN' as ModuleType },
          { name: 'Cicilan & Beasiswa', icon: ClipboardList, view: 'cicilan_beasiswa', module: 'KEUANGAN' as ModuleType },
          { name: 'Laporan Pendapatan', icon: BarChart4, view: 'laporan_pendapatan', module: 'KEUANGAN' as ModuleType },
          { name: 'Settings Billing', icon: Settings, view: 'settings_keuangan', module: 'SETTINGS' as ModuleType },
        ]
      }
    ];
  };

  const renderDosenMenu = () => {
    return [
      {
        title: 'MENGAJAR',
        items: [
          { name: 'Jadwal & Presensi', icon: Calendar, view: 'dosen_jadwal', module: 'LAYANAN_DOSEN' as ModuleType },
          { name: 'Penilaian (Gradebook)', icon: ClipboardList, view: 'dosen_grades', module: 'LAYANAN_DOSEN' as ModuleType },
          { name: 'Absen Dosen', icon: UserCheck, view: 'dosen_absen', module: 'LAYANAN_DOSEN' as ModuleType },
        ]
      },
      {
        title: 'LEARNING SYSTEMS',
        items: [
          { name: 'LMS Course Builder', icon: BookOpen, view: 'lms_dosen_courses', module: 'LMS' as ModuleType },
        ]
      }
    ];
  };

  const renderMahasiswaMenu = () => {
    return [
      {
        title: 'LOBBY UTAMA',
        items: [
          { name: 'Rencana Studi KRS', icon: ClipboardList, view: 'mhs_krs', module: 'LAYANAN_MAHASISWA' as ModuleType },
          { name: 'Kartu Hasil Studi KHS', icon: Award, view: 'mhs_khs', module: 'LAYANAN_MAHASISWA' as ModuleType },
          { name: 'Transkrip Akademik', icon: FileCheck, view: 'mhs_transkrip', module: 'LAYANAN_MAHASISWA' as ModuleType },
        ]
      },
      {
        title: 'ACADEMIC CLASSROOM',
        items: [
          { name: 'Kelas virtual LMS', icon: BookOpen, view: 'lms_mhs_courses', module: 'LMS' as ModuleType },
        ]
      },
      {
        title: 'ADMINISTRATIVE',
        items: [
          { name: 'Tagihan Kuliah (UKT)', icon: CreditCard, view: 'mhs_tagihan', module: 'KEUANGAN' as ModuleType },
          { name: 'Survey Tracer Alumni', icon: GraduationCap, view: 'mhs_alumni_survey', module: 'ALUMNI' as ModuleType },
        ]
      }
    ];
  };

  const renderPmbApplicantMenu = () => {
    return [
      {
        title: 'ALUR PMB 2026',
        items: [
          { name: 'Langkah Seleksi PMB', icon: Laptop, view: 'pmb_portal_steps', module: 'PMB' as ModuleType },
        ]
      }
    ];
  };

  // Select matching menu map
  let navSections = [];
  if (user.role === 'SUPER_ADMIN') navSections = renderSuperAdminMenu();
  else if (user.role === 'AKADEMIK') navSections = renderAkademikMenu();
  else if (user.role === 'KEUANGAN') navSections = renderKeuanganMenu();
  else if (user.role === 'DOSEN') navSections = renderDosenMenu();
  else if (user.role === 'MAHASISWA') navSections = renderMahasiswaMenu();
  else if (user.role === 'PMB_APPLICANT') navSections = renderPmbApplicantMenu();

  return (
    <aside className={`w-64 border-r shrink-0 flex flex-col font-sans ${isDark ? 'bg-zinc-950 border-zinc-800 text-slate-300' : 'bg-slate-900 border-slate-950 text-slate-200'}`}>
      
      {/* Brand Header */}
      <div className={`h-16 px-6 flex items-center gap-3 border-b ${isDark ? 'border-zinc-800' : 'border-slate-800 bg-slate-950/20'}`}>
        <div className="w-8 h-8 rounded-lg bg-emerald-500 font-bold text-white flex items-center justify-center font-display shadow-md shadow-emerald-500/20">
          C1
        </div>
        <div>
          <h1 className="font-display font-bold tracking-wider text-base text-white">AONE SIAKAD</h1>
          <p className="text-[9px] text-slate-400 font-medium">by AONE PROJECT</p>
        </div>
      </div>

      {/* University Title Badge (if Campus Active context) */}
      {user.role !== 'SUPER_ADMIN' && user.role !== 'PMB_APPLICANT' && (
        <div className={`mx-4 mt-4 p-3.5 rounded-xl border ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-slate-800/40 border-slate-800'}`}>
          <p className="text-[9px] text-zinc-450 dark:text-zinc-550 font-bold uppercase tracking-wider mb-2">Penyewa Aktif:</p>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-emerald-500 to-teal-600 text-[10px] font-bold text-white flex items-center justify-center">U</div>
            <p className="text-xs text-white font-semibold truncate leading-none">UND Jakarta</p>
          </div>
          <div className="pt-2 border-t border-slate-900/20 dark:border-zinc-800/40 flex items-center justify-between">
            <span className="text-[9px] text-amber-500 font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" /> Elite Enterprise
            </span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[8px] font-mono font-extrabold uppercase scale-90 origin-right">SANDBOX</span>
          </div>
        </div>
      )}

      {/* Navigation Links Area */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1.5">
            <h4 className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-zinc-500 uppercase px-3">
              {section.title}
            </h4>
            <div className="space-y-0.5">
              {section.items.map((item, itemIdx) => {
                const Icon = item.icon;
                const isSelected = currentView === item.view && currentModule === item.module;
                return (
                  <button
                    key={itemIdx}
                    onClick={() => onNavigate(item.module, item.view)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-left transition duration-150 ${isSelected ? (isDark ? 'bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500 pl-2.5' : 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10') : (isDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-900' : 'text-slate-300 hover:text-white hover:bg-slate-800/60')}`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400 dark:text-zinc-400'}`} />
                    <span className="truncate">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Branding Version */}
      <div className={`p-4 border-t text-[10px] flex items-center justify-between text-slate-400 dark:text-zinc-500 font-mono ${isDark ? 'border-zinc-800' : 'border-slate-800'}`}>
        <span>v3.4.0 (Enterprise)</span>
        <span className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Gateway Live
        </span>
      </div>

    </aside>
  );
}
