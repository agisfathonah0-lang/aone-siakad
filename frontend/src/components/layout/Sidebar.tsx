import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, Calendar, ClipboardList, CheckSquare,
  DollarSign, CreditCard, FileText, GraduationCap, Database, BookMarked,
  BarChart3, LogOut, Building2, X, UserCheck, Globe, Settings, Shield,
  Cctv, Ticket, ScrollText, Bell, Palette, Printer, Award, Share2,
  UserCog, ClipboardCheck, Star, Trophy, Wallet, MessageSquare,
  Library, Newspaper, Presentation, Receipt, Ellipsis, DoorOpen,
  BookDashed, ClipboardPenLine, Briefcase, type LucideIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { filterMenusByRole, SIDEBAR_MENUS, type MenuItem } from '../../utils/roles';
import ThemeToggle from '../ui/ThemeToggle';

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard, Users, BookOpen, Calendar, CalendarDays: Calendar,
  ClipboardList, CheckSquare, DollarSign, CreditCard, FileText,
  GraduationCap, Database, BookMarked, BarChart3, Building2, UserCheck,
  Globe, Settings, Shield, ScrollText, Bell, Palette, Printer, Award,
  Share2, UserCog, ClipboardCheck, Star, Trophy, Wallet, MessageSquare,
  Library, Newspaper, Presentation, Receipt, EllipsisHorizontal: Ellipsis,
  DoorOpen, BookTemplate: BookDashed, ClipboardSignature: ClipboardPenLine,
  Briefcase,
};

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const vendorNav: { label: string; icon: LucideIcon; path: string }[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/vendor' },
  { label: 'Manajemen Institusi', icon: Building2, path: '/vendor/tenants' },
  { label: 'Paket & Harga', icon: BarChart3, path: '/vendor/plans' },
  { label: 'Tiket Dukungan', icon: Ticket, path: '/vendor/tickets' },
  { label: 'Pengaturan', icon: Settings, path: '/vendor/settings' },
  { label: 'Firewall', icon: Shield, path: '/vendor/firewall' },
  { label: 'CCTV', icon: Cctv, path: '/vendor/cctv' },
  { label: 'Landing Pages', icon: Globe, path: '/vendor/landing-pages' },
  { label: 'Vendor Users', icon: Users, path: '/vendor/users' },
  { label: 'Audit Log', icon: ScrollText, path: '/vendor/audit' },
  { label: 'Monitor', icon: Database, path: '/vendor/monitor' },
];

function SidebarNavItem({ item, depth, onClose }: { item: MenuItem; depth?: number; onClose: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = iconMap[item.icon];

  if (item.children && item.children.length > 0) {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-between w-full gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/50"
        >
          <div className="flex items-center gap-3">
            {Icon && <Icon size={17} />}
            {item.label}
          </div>
          <svg
            className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {expanded && (
          <div className="ml-2 mt-0.5 space-y-0.5 border-l-2 border-slate-100 dark:border-zinc-700 pl-2">
            {item.children.map((child) => (
              <SidebarNavItem key={child.path || child.label} item={child} depth={(depth || 0) + 1} onClose={onClose} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.path!}
      end={item.path === '/dashboard'}
      onClick={onClose}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
          isActive ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/50'
        }`
      }
    >
      {Icon && <Icon size={17} />}
      {item.label}
    </NavLink>
  );
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const role = user?.role || 'mahasiswa';
  const isVendor = role === 'vendor_super_admin';

  const filteredMenus = isVendor ? [] : filterMenusByRole(SIDEBAR_MENUS, user?.role);

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl transform transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto shadow-lg shadow-black/5 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-5">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="AONE SIAKAD" className="h-7 w-auto" />
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-slate-600 transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>
        <nav className="p-3 space-y-0.5 overflow-y-auto h-[calc(100%-4rem)] no-scrollbar">
          {isVendor ? vendorNav.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/vendor'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/50'
                }`
              }
            >
              <item.icon size={17} />
              {item.label}
            </NavLink>
          )) : filteredMenus.map((item) => (
            <SidebarNavItem key={item.path || item.label} item={item} onClose={onClose} />
          ))}
          <div className="pt-4 mt-4">
            <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 w-full transition-colors">
              <LogOut size={17} /> Logout
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
}
