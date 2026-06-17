import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../ui/ThemeToggle';
import { Menu, Search, Bell, ChevronDown, LogOut, User, Settings, HelpCircle } from 'lucide-react';

const roleColors: Record<string, string> = {
  super_admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  admin: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  rektor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  dekan: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  akademik: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  kaprodi: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  keuangan: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  dosen: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  mahasiswa: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  pustakawan: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
};

const initialAvatar = (nama?: string) => {
  if (!nama) return '?';
  return nama.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();
};

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const roleClass = roleColors[user?.role || ''] || 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300';

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-200">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 lg:px-6 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border-b border-white/20 dark:border-zinc-800/50 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors">
              <Menu size={20} />
            </button>
            <div className="relative hidden sm:block">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                placeholder="Cari fitur, menu..."
                className="w-56 lg:w-72 pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-100/80 dark:bg-zinc-800/80 border border-slate-200/50 dark:border-zinc-700/30 text-slate-600 dark:text-zinc-300 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all">
              <Bell size={17} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-zinc-900" />
            </button>
            <ThemeToggle />
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2.5 pl-2.5 pr-2 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                  {initialAvatar(user?.nama)}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-semibold leading-tight dark:text-white">{user?.nama}</p>
                  <p className="text-[9px] text-slate-400 dark:text-zinc-500 leading-tight capitalize">{user?.role?.replace('_', ' ')}</p>
                </div>
                <ChevronDown size={13} className="text-slate-400 hidden lg:block" />
              </button>
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1.5 w-56 z-20 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-2xl shadow-xl shadow-black/5 border border-slate-200/50 dark:border-zinc-700/50 overflow-hidden">
                    <div className="p-3 border-b border-slate-100 dark:border-zinc-800">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0">
                          {initialAvatar(user?.nama)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold dark:text-white truncate">{user?.nama}</p>
                          <p className="text-[10px] text-slate-400 truncate">{user?.email || ''}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-1.5 space-y-0.5">
                      <button className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-all">
                        <User size={14} /> Profil
                      </button>
                      <button className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-all">
                        <Settings size={14} /> Pengaturan
                      </button>
                      <button className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-all">
                        <HelpCircle size={14} /> Bantuan
                      </button>
                    </div>
                    <div className="p-1.5 border-t border-slate-100 dark:border-zinc-800">
                      <button onClick={logout} className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all">
                        <LogOut size={14} /> Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <div className="max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}