const S3_PUBLIC_URL = import.meta.env.VITE_S3_PUBLIC_URL || 'http://localhost:9000/aone-assets';

export function proxyImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith(S3_PUBLIC_URL)) {
    const key = url.slice(S3_PUBLIC_URL.length + 1);
    return `/api/v1/upload/${key}`;
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return url;
}
