import React from 'react';
import { Sun, Moon, Bell, LogOut, ChevronDown, UserCheck, Shield, BookOpen, CreditCard, Award, GraduationCap, Laptop, Wifi, Database } from 'lucide-react';
import { User, UserRole } from '../types';

interface TopbarProps {
  user: User;
  isDark: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
  onImpersonate: (role: UserRole) => void;
  systemStatus: 'online' | 'syncing' | 'maintenance';
}

export default function Topbar({ user, isDark, onToggleTheme, onLogout, onImpersonate, systemStatus }: TopbarProps) {
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const [showImpersonateMenu, setShowImpersonateMenu] = React.useState(false);

  const roles = [
    { name: 'Super Admin', role: 'SUPER_ADMIN' as UserRole, icon: Shield, bg: 'bg-rose-500' },
    { name: 'Admin Akademik', role: 'AKADEMIK' as UserRole, icon: BookOpen, bg: 'bg-indigo-500' },
    { name: 'Admin Keuangan', role: 'KEUANGAN' as UserRole, icon: CreditCard, bg: 'bg-amber-500' },
    { name: 'Dosen Utama', role: 'DOSEN' as UserRole, icon: Award, bg: 'bg-emerald-500' },
    { name: 'Mahasiswa', role: 'MAHASISWA' as UserRole, icon: GraduationCap, bg: 'bg-purple-500' },
    { name: 'Calon Mhs Baru', role: 'PMB_APPLICANT' as UserRole, icon: Laptop, bg: 'bg-cyan-500' }
  ];

  const currentRoleObj = roles.find(r => r.role === user.role);

  return (
    <header className={`h-16 px-6 border-b shrink-0 flex items-center justify-between font-sans relative z-30 ${isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
      
      {/* Search Bar or Section */}
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-zinc-800 rounded-lg text-xs">
          <span className="font-mono text-slate-400 dark:text-zinc-500">TAHUN AJARAN:</span>
          <span className="font-bold text-emerald-500 dark:text-emerald-400">2025/2026 Ganjil</span>
        </div>

        <div className="hidden lg:flex items-center gap-1.5 text-xs">
          <Wifi className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          <span className="text-slate-500 dark:text-zinc-400">Gateway WA:</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">AKTIF</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        
        {/* Role Emulator / Impersonator Trigger */}
        <div className="relative">
          <button
            onClick={() => {
              setShowImpersonateMenu(!showImpersonateMenu);
              setShowProfileMenu(false);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${isDark ? 'bg-zinc-800/80 border-zinc-700 hover:bg-zinc-800 hover:border-zinc-500' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
          >
            <UserCheck className="w-4 h-4 text-emerald-500" />
            <span className="hidden sm:inline">Ganti Peran Demo</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {showImpersonateMenu && (
            <div className={`absolute right-0 mt-2 w-64 rounded-2xl border shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-150 ${isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
              <div className="px-3 py-2 border-b border-slate-100 dark:border-zinc-800 mb-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pilih Persona Demo</p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">Platform: AONE SIAKAD</p>
              </div>
              <div className="space-y-1">
                {roles.map((roleItem) => {
                  const Icon = roleItem.icon;
                  const isActive = user.role === roleItem.role;
                  return (
                    <button
                      key={roleItem.role}
                      onClick={() => {
                        onImpersonate(roleItem.role);
                        setShowImpersonateMenu(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-left transition ${isActive ? 'bg-emerald-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-zinc-800'}`}
                    >
                      <div className={`p-1.5 rounded-lg ${isActive ? 'bg-white/20 text-white' : `${roleItem.bg} text-white`}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="flex-1">{roleItem.name}</span>
                      {isActive && <div className="w-2 h-2 rounded-full bg-white" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* System Monitoring Widget (Minimal UI badge, not telemetry) */}
        <div className="hidden items-center gap-2 p-1 px-2.5 rounded-full border border-slate-200 dark:border-zinc-800 text-xs text-slate-500 dark:text-zinc-400 bh-white">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[10px]">PDDIKTI SYNC</span>
        </div>

        {/* Theme Switcher */}
        <button
          onClick={onToggleTheme}
          className={`p-2 rounded-xl border transition ${isDark ? 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:text-white' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:text-emerald-600'}`}
          title="Ganti Tema"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notification Bell */}
        <button className={`p-2 rounded-xl border relative transition ${isDark ? 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
        </button>

        {/* Profile Avatar & Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowImpersonateMenu(false);
            }}
            className="flex items-center gap-2 outline-none"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-md ${currentRoleObj?.bg || 'bg-slate-600'}`}>
              {user.name.charAt(0)}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold leading-tight">{user.name}</p>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500">{currentRoleObj?.name}</p>
            </div>
          </button>

          {showProfileMenu && (
            <div className={`absolute right-0 mt-2 w-56 rounded-2xl border shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-150 ${isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
              <div className="px-3 py-2.5 border-b border-slate-100 dark:border-zinc-800 mb-1">
                <p className="text-xs font-bold">{user.name}</p>
                <p className="text-[10px] text-slate-400 dark:text-zinc-500">{user.email}</p>
                {user.nim_nip && (
                  <p className="text-[10px] font-mono text-emerald-500 mt-1">NIP/NIM: {user.nim_nip}</p>
                )}
              </div>
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-500 hover:bg-rose-500/10 dark:hover:bg-rose-500/20 rounded-xl text-left transition"
              >
                <LogOut className="w-4 h-4" />
                Keluar Sesi
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
