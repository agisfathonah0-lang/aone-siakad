import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { Search, Bell, Settings, Menu } from 'lucide-react';

function initialAvatar(nama?: string) {
  if (!nama) return '?';
  return nama.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();
}

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 to-emerald-50/30 dark:from-zinc-950 dark:to-zinc-900">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 px-4 py-2.5 flex items-center gap-3 shrink-0">
          <button className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200" onClick={() => setSidebarOpen(true)}>
            <Menu size={18} />
          </button>

          {/* Search */}
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-zinc-800 rounded-lg px-3 py-1.5 w-full max-w-xs">
              <Search size={13} className="text-gray-400 dark:text-zinc-500 shrink-0" />
              <input type="text" placeholder="Cari item..." className="bg-transparent text-[13px] outline-none text-gray-600 dark:text-zinc-300 placeholder:text-gray-400 dark:placeholder:text-zinc-500 w-full" />
              <span className="bg-gray-200 dark:bg-zinc-700 text-gray-500 dark:text-zinc-400 text-[10px] px-1.5 py-0.5 rounded font-mono hidden sm:block">⌘K</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button className="relative w-8 h-8 flex items-center justify-center text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
              <Settings size={16} />
            </button>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-[10px] font-bold cursor-pointer ml-1 shrink-0">
              {initialAvatar(user?.nama)}
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
