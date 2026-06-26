import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  LayoutDashboard, GraduationCap, Presentation, Wallet, Ellipsis, Share2, Sparkles,
  BarChart3, Settings, LogOut, Users, ChevronRight,
  UserCheck, Building2, UserCog, BookOpen, CalendarDays, ClipboardCheck, Award,
  ScrollText, ClipboardList, BookTemplate, FileText, ClipboardSignature, Printer,
  Briefcase, BookMarked, MessageSquare, Star, Trophy, Receipt, CreditCard,
  ReceiptText, Library, Newspaper, Calendar, Bell, Cctv, Palette,
  DoorOpen, List, Globe, Layout, Bot, AlertTriangle, Database, BookMarked as BookMarkedIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { filterMenusByRole, SIDEBAR_MENUS } from '../../utils/roles';
import type { LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard, GraduationCap, Presentation, Wallet, EllipsisHorizontal: Ellipsis,
  Share2, Sparkles, BarChart3, Settings, Users,
  UserCheck, Building2, UserCog, BookOpen, CalendarDays, ClipboardCheck, Award,
  ScrollText, ClipboardList, BookTemplate, FileText, ClipboardSignature,
  Printer, Briefcase, BookMarked, MessageSquare, Star, Trophy, Receipt, CreditCard,
  ReceiptText, Library, Newspaper, Calendar, Bell, Cctv, Palette,
  DoorOpen, List, Globe, Layout, Bot, AlertTriangle, Database,
};

interface SidebarProps { open: boolean; onClose: () => void }

function initialAvatar(nama?: string) {
  if (!nama) return '?';
  return nama.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();
}

const vendorItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/vendor' },
  { label: 'Institusi', icon: Users, path: '/vendor/tenants' },
  { label: 'Paket', icon: BarChart3, path: '/vendor/plans' },
  { label: 'Pengaturan', icon: Settings, path: '/vendor/settings' },
];

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const role = user?.role || 'mahasiswa';
  const isVendor = role === 'vendor_super_admin';

  const filteredMenus = isVendor ? [] : filterMenusByRole(SIDEBAR_MENUS, user?.role);
  const slug = location.pathname.split('/')[2] || user?.tenantSlug || '';
  const basePath = `/kampus/${slug}`;

  const [expandedSection, setExpandedSection] = useState<string>('Dashboard');
  const pathSegment = location.pathname.split('/').pop() || 'dashboard';

  useEffect(() => {
    const section = filteredMenus.find(m => {
      if (m.path === pathSegment) return true;
      return m.children?.some(c => c.path === pathSegment || c.children?.some((s: any) => s.path === pathSegment));
    });
    if (section) setExpandedSection(section.label);
  }, [pathSegment, filteredMenus]);

  const isActive = (path?: string) => path ? location.pathname === `${basePath}/${path}` : false;

  const navMenus = isVendor ? vendorItems : filteredMenus;

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden backdrop-blur-sm" onClick={onClose} />}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 flex flex-col transition-transform duration-300 w-[240px] ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ background: 'var(--sidebar)', borderRight: '1px solid var(--sidebar-border)' }}
      >
        {/* Brand */}
        <div className="px-5 pt-7 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--sidebar-primary)' }}>
              {user?.logo_url ? (
                <img src={user.logo_url} alt="" className="w-full h-full object-contain p-0.5" />
              ) : (
                <BookMarkedIcon size={15} className="text-white" />
              )}
            </div>
            <div>
              <p className="text-white text-sm font-bold leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                {user?.nama_pt || 'SIAKAD'}
              </p>
              <p className="text-[10px] leading-tight truncate" style={{ color: 'var(--sidebar-foreground)', opacity: 0.5 }}>
                {user?.tenantSlug?.toUpperCase() || 'KAMPUS'}
              </p>
            </div>
            <button className="lg:hidden ml-auto text-white/40 hover:text-white/70 transition-colors" onClick={onClose}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Section header */}
        <div className="px-5 mb-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(148,163,184,0.5)' }}>
            {isVendor ? 'Menu Vendor' : 'Menu Utama'}
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-0.5">
          {navMenus.map((item: any) => {
            const Icon = isVendor ? item.icon : (iconMap[item.icon] || LayoutDashboard);
            const hasChildren = !isVendor && item.children?.length > 0;
            const isOpen = expandedSection === item.label;
            const itemsActive = hasChildren && isOpen;

            // Section item (clickable to expand)
            return (
              <div key={item.label}>
                <button
                  onClick={() => {
                    if (isVendor) {
                      window.location.href = item.path;
                    } else if (hasChildren) {
                      setExpandedSection(isOpen ? '' : item.label);
                    } else if (item.path) {
                      window.location.href = `${basePath}/${item.path}`;
                      onClose();
                    }
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left transition-all duration-150 group"
                  style={{
                    color: itemsActive ? 'white' : 'var(--sidebar-foreground)',
                    background: itemsActive ? 'var(--sidebar-primary)' : 'transparent',
                  }}
                  onMouseEnter={e => {
                    if (!itemsActive) e.currentTarget.style.background = 'var(--sidebar-accent)';
                  }}
                  onMouseLeave={e => {
                    if (!itemsActive) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <Icon size={16} style={{ opacity: itemsActive ? 1 : 0.6 }} className="group-hover:opacity-100" />
                  <span className="flex-1 text-xs font-medium">{item.label}</span>
                  {hasChildren && (
                    <ChevronRight
                      size={12}
                      style={{ opacity: 0.4 }}
                      className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
                    />
                  )}
                  {!hasChildren && isActive(item.path) && (
                    <ChevronRight size={12} style={{ opacity: 0.4 }} />
                  )}
                </button>

                {/* Children */}
                {hasChildren && isOpen && (
                  <div className="ml-2 mt-0.5 space-y-0.5 border-l border-white/10 pl-2">
                    {item.children.map((child: any) => {
                      if (child.children) {
                        // Nested (like PPDB > Pendaftar, Form Config)
                        return (
                          <div key={child.label}>
                            <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(148,163,184,0.4)' }}>
                              {child.label}
                            </p>
                            {child.children.map((sub: any) => {
                              const SubIcon = iconMap[sub.icon] || LayoutDashboard;
                              const active = isActive(sub.path);
                              return (
                                <a
                                  key={sub.path}
                                  href={`${basePath}/${sub.path}`}
                                  onClick={onClose}
                                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all duration-150"
                                  style={{
                                    color: active ? 'var(--sidebar-primary-foreground)' : 'var(--sidebar-foreground)',
                                    background: active ? 'var(--sidebar-primary)' : 'transparent',
                                    opacity: active ? 1 : 0.75,
                                  }}
                                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--sidebar-accent)'; }}
                                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                                >
                                  <SubIcon size={13} style={{ opacity: 0.6 }} />
                                  <span>{sub.label}</span>
                                </a>
                              );
                            })}
                          </div>
                        );
                      }
                      const ChildIcon = iconMap[child.icon] || LayoutDashboard;
                      const active = isActive(child.path);
                      return (
                        <a
                          key={child.path}
                          href={`${basePath}/${child.path}`}
                          onClick={onClose}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all duration-150"
                          style={{
                            color: active ? 'var(--sidebar-primary-foreground)' : 'var(--sidebar-foreground)',
                            background: active ? 'var(--sidebar-primary)' : 'transparent',
                            opacity: active ? 1 : 0.75,
                          }}
                          onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--sidebar-accent)'; }}
                          onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                        >
                          <ChildIcon size={13} style={{ opacity: 0.6 }} />
                          <span>{child.label}</span>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom: User profile */}
        <div className="mx-3 mb-3 p-2.5 rounded-xl" style={{ background: 'var(--sidebar-accent)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ background: 'var(--sidebar-primary)' }}>
              {initialAvatar(user?.nama)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{user?.nama || 'User'}</p>
              <p className="text-[10px] truncate capitalize" style={{ color: 'var(--sidebar-foreground)', opacity: 0.6 }}>
                {user?.role?.replace('_', ' ') || ''}
              </p>
            </div>
            <button
              onClick={logout}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
              style={{ color: 'var(--sidebar-foreground)', opacity: 0.5 }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '0.5'; e.currentTarget.style.background = 'transparent'; }}
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
