import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
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

function isChildActive(path: string, basePath: string, pathname: string): boolean {
  return pathname === `${basePath}/${path}`;
}

function isAnyChildActive(children: any[], basePath: string, pathname: string): boolean {
  return children?.some((c: any) => {
    if (c.path && isChildActive(c.path, basePath, pathname)) return true;
    if (c.children) return isAnyChildActive(c.children, basePath, pathname);
    return false;
  });
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const role = user?.role || 'mahasiswa';
  const isVendor = role === 'vendor_super_admin';

  const filteredMenus = useMemo(
    () => isVendor ? [] : filterMenusByRole(SIDEBAR_MENUS, user?.role),
    [isVendor, user?.role]
  );
  const slug = location.pathname.split('/')[2] || user?.tenantSlug || '';
  const basePath = `/kampus/${slug}`;

  const [expandedSection, setExpandedSection] = useState<string>(() => {
    const segment = location.pathname.split('/').pop() || 'dashboard';
    const menus = filterMenusByRole(SIDEBAR_MENUS, user?.role);
    const section = menus.find(m => {
      if (m.path === segment) return true;
      return m.children?.some((c: any) => c.path === segment || c.children?.some((s: any) => s.path === segment));
    });
    return section?.label || '';
  });

  const pathSegment = location.pathname.split('/').pop() || 'dashboard';

  // Sync expanded section on navigation  (filteredMenus is memoized, stable reference)
  useEffect(() => {
    const section = filteredMenus.find(m => {
      if (m.path === pathSegment) return true;
      return m.children?.some((c: any) => c.path === pathSegment || c.children?.some((s: any) => s.path === pathSegment));
    });
    if (section && expandedSection !== section.label) {
      setExpandedSection(section.label);
    }
  }, [pathSegment, filteredMenus]);

  const navMenus = isVendor ? vendorItems : filteredMenus;

  const sidebarEl = (
    <aside
      className="flex flex-col h-full"
      style={{ background: 'var(--sidebar)', width: 240, minWidth: 240 }}
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
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 pb-4 space-y-0.5" style={{ scrollbarGutter: 'stable' }}>
        {navMenus.map((item: any) => {
          const Icon = isVendor ? item.icon : (iconMap[item.icon] || LayoutDashboard);
          const hasChildren = !isVendor && item.children?.length > 0;
          const isOpen = expandedSection === item.label;
          const childActive = !isVendor && isAnyChildActive(item.children, basePath, location.pathname);
          const sectionActive = isVendor ? false : (childActive || (!hasChildren && item.path && isChildActive(item.path, basePath, location.pathname)));

          return (
            <div key={item.label}>
              <button type="button"
                onClick={() => {
                  if (isVendor) {
                    navigate(item.path);
                  } else if (hasChildren) {
                    setExpandedSection(isOpen ? '' : item.label);
                  } else if (item.path) {
                    navigate(`${basePath}/${item.path}`);
                    onClose();
                  }
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left transition-colors duration-150"
                style={{
                  color: sectionActive ? 'white' : 'var(--sidebar-foreground)',
                  background: sectionActive ? 'var(--sidebar-primary)' : 'transparent',
                }}
              >
                <Icon size={16} style={{ opacity: sectionActive ? 1 : 0.6 }} />
                <span className="flex-1 text-xs font-medium">{item.label}</span>
                {hasChildren && (
                  <ChevronRight size={12} style={{ opacity: 0.4 }} className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
                )}
                {sectionActive && !hasChildren && (
                  <span className="w-1 h-4 rounded-full" style={{ background: 'var(--sidebar-primary)' }} />
                )}
              </button>

              {/* Children */}
              {hasChildren && (
                <div
                  className="ml-2 border-l overflow-hidden transition-all duration-200"
                  style={{
                    borderColor: 'var(--sidebar-border)',
                    maxHeight: isOpen ? 2000 : 0,
                    opacity: isOpen ? 1 : 0,
                  }}
                >
                  <div className="pt-0.5 pb-0.5 pl-2 space-y-0.5">
                    {item.children.map((child: any) => {
                      if (child.children) {
                        return (
                          <div key={child.label}>
                            <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(148,163,184,0.4)' }}>
                              {child.label}
                            </p>
                            {child.children.map((sub: any) => {
                              const subActive = isChildActive(sub.path, basePath, location.pathname);
                              const SubIcon = iconMap[sub.icon] || LayoutDashboard;
                              return (
                                <Link
                                  key={sub.path}
                                  to={`${basePath}/${sub.path}`}
                                  onClick={onClose}
                                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors duration-150"
                                  style={{
                                    color: subActive ? 'white' : 'var(--sidebar-foreground)',
                                    background: subActive ? 'var(--sidebar-primary)' : 'transparent',
                                    opacity: subActive ? 1 : 0.75,
                                  }}
                                >
                                  <SubIcon size={14} style={{ opacity: subActive ? 1 : 0.6 }} />
                                  <span>{sub.label}</span>
                                </Link>
                              );
                            })}
                          </div>
                        );
                      }
                      const childActive = isChildActive(child.path, basePath, location.pathname);
                      const ChildIcon = iconMap[child.icon] || LayoutDashboard;
                      return (
                        <Link
                          key={child.path}
                          to={`${basePath}/${child.path}`}
                          onClick={onClose}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors duration-150"
                          style={{
                            color: childActive ? 'white' : 'var(--sidebar-foreground)',
                            background: childActive ? 'var(--sidebar-primary)' : 'transparent',
                            opacity: childActive ? 1 : 0.75,
                          }}
                        >
                          <ChildIcon size={14} style={{ opacity: childActive ? 1 : 0.6 }} />
                          <span>{child.label}</span>
                        </Link>
                      );
                    })}
                  </div>
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
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: 'var(--sidebar-foreground)', opacity: 0.5 }}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden backdrop-blur-sm" onClick={onClose} />}

      {/* Mobile sidebar (overlay) */}
      <div
        className={`fixed inset-y-0 left-0 z-30 lg:hidden transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {sidebarEl}
      </div>

      {/* Desktop sidebar (fixed) */}
      <div className="hidden lg:block fixed inset-y-0 left-0 z-30 border-r" style={{ borderColor: 'var(--sidebar-border)' }}>
        {sidebarEl}
      </div>
    </>
  );
}