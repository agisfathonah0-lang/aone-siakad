import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from '../types';
import { post, setTokens, clearTokens, get } from '../api/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, isVendor?: boolean, tenantSlug?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('aone_access_token');
    if (token) {
      get<User & { tenantSlug?: string }>('/auth/me').then((u) => {
        setUser(u);
        if (u.tenantSlug) {
          localStorage.setItem('aone_tenant_slug', u.tenantSlug);
        }
      }).catch(() => {
        clearTokens();
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string, isVendor = false, tenantSlug?: string) => {
    const endpoint = isVendor ? '/auth/vendor/login' : '/auth/campus/login';
    const body: Record<string, string> = { email, password };
    if (tenantSlug) body.tenantSlug = tenantSlug;
    const res = await post<{ accessToken: string; refreshToken: string; user: User; tenant?: { id: string; slug: string } }>(endpoint, body);
    setTokens(res.accessToken, res.refreshToken);
    setUser(res.user);
    if (res.tenant?.slug) {
      localStorage.setItem('aone_tenant_slug', res.tenant.slug);
    }
  }, []);

  const logout = useCallback(async () => {
    try { await post('/auth/logout', { refreshToken: localStorage.getItem('aone_refresh_token') }); } catch { /* */ }
    const role = user?.role || '';
    const tenantSlug = localStorage.getItem('aone_tenant_slug');
    clearTokens();
    setUser(null);
    if (role.startsWith('vendor_')) {
      window.location.href = '/vendor/login';
    } else if (tenantSlug) {
      window.location.href = `/login?tenant=${tenantSlug}`;
    } else {
      window.location.href = '/login';
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
