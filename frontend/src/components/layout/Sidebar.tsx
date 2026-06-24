import { useState, useEffect } from 'react';
import { NavLink, useLocation, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, GraduationCap, Presentation, Wallet, Ellipsis, Share2, Sparkles,
  BarChart3, Settings, LogOut, X, Users, Plus, type LucideIcon,
  UserCheck, Building2, UserCog, BookOpen, CalendarDays, ClipboardCheck, Award,
  ScrollText, ClipboardList, BookTemplate, FileText, ClipboardSignature, Printer,
  Briefcase, BookMarked, MessageSquare, Star, Trophy, Receipt, CreditCard,
  ReceiptText, Library, Newspaper, Calendar, Bell, Palette, DoorOpen, List,
  Globe, Layout, Bot, AlertTriangle, Database, Cctv,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { filterMenusByRole, SIDEBAR_MENUS, type MenuItem } from '../../utils/roles';
import ThemeToggle from '../ui/ThemeToggle';

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard, GraduationCap, Presentation, Wallet, EllipsisHorizontal: Ellipsis,
  Share2, Sparkles, BarChart3, Settings, Users,
  UserCheck, Building2, UserCog, BookOpen, CalendarDays, ClipboardCheck, Award,
  ScrollText, ClipboardList, BookTemplate, FileText, ClipboardSignature,
  Printer, Briefcase, BookMarked, MessageSquare, Star, Trophy, Receipt, CreditCard,
  ReceiptText, Library, Newspaper, Calendar, Bell, Cctv, Palette,
  DoorOpen, List, Globe, Layout, Bot, AlertTriangle, Database,
};

const sectionColors: Record<string, string> = {
  Dashboard: 'bg-blue-500',
  Akademik: 'bg-emerald-500',
  Perkuliahan: 'bg-violet-500',
  Keuangan: 'bg-orange-500',
  Lainnya: 'bg-cyan-500',
  Integrasi: 'bg-rose-500',
  'Fitur AI': 'bg-indigo-500',
  Laporan: 'bg-amber-500',
  Pengaturan: 'bg-slate-500',
};

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const vendorNav: { label: string; icon: LucideIcon; path: string }[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/vendor' },
  { label: 'Institusi', icon: Users, path: '/vendor/tenants' },
  { label: 'Paket', icon: BarChart3, path: '/vendor/plans' },
  { label: 'Pengaturan', icon: Settings, path: '/vendor/settings' },
];

function initialAvatar(nama?: string) {
  if (!nama) return '?';
  return nama.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const role = user?.role || 'mahasiswa';
  const isVendor = role === 'vendor_super_admin';

  const filteredMenus = isVendor ? [] : filterMenusByRole(SIDEBAR_MENUS, user?.role);
  const slug = location.pathname.split('/')[2] || user?.tenantSlug || '';
  const basePath = `/kampus/${slug}`;
  const [activeSection, setActiveSection] = useState(0);
  const [activeSectionId, setActiveSectionId] = useState('Dashboard');

  // Determine active section from current path
  useEffect(() => {
    const path = location.pathname.split('/').pop() || 'dashboard';
    const idx = filteredMenus.findIndex(m => {
      if (m.path === path) return true;
      return m.children?.some(c => c.path === path);
    });
    if (idx >= 0) {
      setActiveSection(idx);
      setActiveSectionId(filteredMenus[idx].label);
    }
  }, [location.pathname, filteredMenus]);

  const sectionMenus = filteredMenus;
  const currentSection = sectionMenus[activeSection];

  // Collect all leaf items from current section
  const leafItems = currentSection?.children?.length
    ? currentSection.children
    : currentSection?.path
      ? [{ ...currentSection, _isDirect: true }]
      : [];

  const navContent = isVendor ? vendorNav : sectionMenus;

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={onClose} />}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 flex transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Narrow icon rail */}
        <div className="w-14 bg-[#181d2f] flex flex-col items-center py-4 gap-1 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center mb-3 overflow-hidden ring-1 ring-white/10">
            {user?.logo_url ? (
              <img src={user.logo_url} alt="" className="w-full h-full object-contain p-0.5" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).parentElement!.classList.add('bg-blue-500', 'shadow-lg', 'shadow-blue-500/40'); }} />
            ) : (
              <GraduationCap size={18} className="text-white" />
            )}
          </div>

          {navContent.map((item: any, i: number) => {
            const Icon = isVendor ? item.icon : (iconMap[item.icon] || LayoutDashboard);
            const sectionColor = isVendor ? 'bg-blue-500' : (sectionColors[item.label] || 'bg-slate-500');
            const isActive = isVendor
              ? location.pathname === item.path
              : activeSection === i;
            return (
              <button
                key={item.label}
                onClick={() => {
                  if (isVendor) {
                    window.location.href = item.path;
                  } else {
                    setActiveSection(i);
                    setActiveSectionId(item.label);
                    if (item.path) navigate(`${basePath}/${item.path}`);
                  }
                }}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                  isActive
                    ? `${sectionColor} shadow-lg ${sectionColor.replace('bg-', 'shadow-')}/40 text-white`
                    : 'text-white/35 hover:bg-white/10 hover:text-white/70'
                }`}
                title={item.label}
              >
                <Icon size={17} />
              </button>
            );
          })}

          <div className="flex-1" />
          <button className="w-9 h-9 rounded-xl border-2 border-dashed border-white/15 flex items-center justify-center text-white/25 hover:border-white/35 hover:text-white/50 transition-all">
            <Plus size={15} />
          </button>
        </div>

        {/* Wide text panel */}
        <div className="w-48 bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 flex flex-col">
          {/* Campus */}
          {user?.nama_pt && (
            <div className="px-4 py-3 border-b border-gray-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-[9px] font-bold shrink-0 overflow-hidden">
                  {user.logo_url ? (
                    <img src={user.logo_url} alt="" className="w-full h-full object-contain p-0.5" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    user.nama_pt.charAt(0)
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-300 truncate leading-tight">{user.nama_pt}</p>
                  <p className="text-[9px] text-gray-400 dark:text-zinc-500 truncate leading-tight">{user.tenantSlug || ''}</p>
                </div>
              </div>
            </div>
          )}
          {/* User */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-zinc-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
              {initialAvatar(user?.nama)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold text-gray-800 dark:text-white truncate leading-tight">{user?.nama || 'User'}</p>
              <p className="text-[10px] text-gray-400 dark:text-zinc-500 truncate leading-tight">{user?.role?.replace('_', ' ') || ''}</p>
            </div>
            <button className="lg:hidden text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 shrink-0" onClick={onClose}>
              <X size={14} />
            </button>
          </div>

          {/* Nav groups */}
          <nav className="flex-1 overflow-y-auto py-3 px-2">
            {isVendor ? vendorNav.filter(v => v.path !== location.pathname).map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `w-full text-left px-3 py-2 rounded-lg text-[12px] mb-0.5 transition-all flex items-center gap-2 ${
                    isActive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border-l-4 border-emerald-500 dark:border-emerald-400' : 'text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-800 dark:hover:text-zinc-200'
                  }`
                }
              >
                <item.icon size={13} />
                {item.label}
              </NavLink>
            )) : currentSection && (
              <div key={currentSection.label}>
                <p className="text-[9px] font-bold text-gray-400 dark:text-zinc-500 tracking-widest px-3 mb-1 uppercase">
                  {currentSection.label}
                </p>
                {leafItems.map((item: any) => {
                  const Icon = iconMap[item.icon] || LayoutDashboard;
                  if (item.children?.length) {
                    return (
                      <div key={item.label} className="mb-1">
                        <p className="text-[9px] font-bold text-gray-400 dark:text-zinc-500 tracking-widest px-3 mb-1 uppercase">{item.label}</p>
                        {item.children.map((sub: any) => {
                          const SubIcon = iconMap[sub.icon] || LayoutDashboard;
                          const subPath = sub.path ? `${basePath}/${sub.path}` : '#';
                          const isSubActive = sub.path ? location.pathname === `${basePath}/${sub.path}` : false;
                          return (
                            <Link
                              key={sub.path || sub.label}
                              to={subPath}
                              onClick={onClose}
                              className={`w-full text-left px-3 py-2 rounded-lg text-[12px] mb-0.5 transition-all flex items-center gap-2 ${
                                isSubActive
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border-l-4 border-emerald-500 dark:border-emerald-400'
                                  : 'text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-800 dark:hover:text-zinc-200'
                              }`}
                            >
                              <SubIcon size={13} />
                              {sub.label}
                            </Link>
                          );
                        })}
                      </div>
                    );
                  }
                  const itemPath = item.path ? `${basePath}/${item.path}` : '#';
                  const isActive = item.path ? location.pathname === itemPath : false;
                  return (
                    <Link
                      key={item.path || item.label}
                      to={itemPath}
                      onClick={onClose}
                      className={`w-full text-left px-3 py-2 rounded-lg text-[12px] mb-0.5 transition-all flex items-center gap-2 ${
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border-l-4 border-emerald-500 dark:border-emerald-400'
                          : 'text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-800 dark:hover:text-zinc-200'
                      }`}
                    >
                      <Icon size={13} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </nav>

          {/* Bottom avatars + invite */}
          <div className="px-3 py-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex -space-x-1.5">
              {(['#3b82f6', '#10b981', '#f59e0b'] as const).map((c, i) => (
                <div key={i} className="w-5 h-5 rounded-full border-2 border-white dark:border-zinc-900 flex items-center justify-center text-white text-[7px] font-bold" style={{ background: c }}>
                  {['A', 'S', 'R'][i]}
                </div>
              ))}
              <div className="w-5 h-5 rounded-full border-2 border-white dark:border-zinc-900 bg-gray-200 dark:bg-zinc-700 flex items-center justify-center text-gray-500 dark:text-zinc-400 text-[7px] font-bold">+3</div>
            </div>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <button onClick={logout} className="text-[10px] bg-emerald-500 text-white px-2 py-1 rounded-md font-semibold hover:bg-emerald-600 transition-colors whitespace-nowrap">
                Keluar
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
