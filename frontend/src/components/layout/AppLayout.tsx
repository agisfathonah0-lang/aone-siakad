import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../ui/ThemeToggle';
import { Menu } from 'lucide-react';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-200">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-5 lg:px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <ThemeToggle />
            <span className="text-sm text-slate-400 dark:text-zinc-500">{user?.nama}</span>
            <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
              {user?.role?.replace('_', ' ')}
            </span>
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