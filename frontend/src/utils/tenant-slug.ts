export function getTenantSlug(): string | null {
  if (typeof window === 'undefined') return null;

  const host = window.location.hostname;

  const subdomainMatch = host.match(/^([a-z0-9](?:[a-z0-9-]*[a-z0-9])?)\.(?:aone-siakad\.com|localhost)$/);
  if (subdomainMatch && !['www', 'app', 'admin'].includes(subdomainMatch[1])) {
    return subdomainMatch[1];
  }

  const params = new URLSearchParams(window.location.search);
  if (params.get('tenant')) return params.get('tenant');

  const pathMatch = window.location.pathname.match(/^\/kampus\/([^/]+)/);
  if (pathMatch) return pathMatch[1];

  return null;
}

export function isCampusLandingPage(): boolean {
  return getTenantSlug() !== null;
}
