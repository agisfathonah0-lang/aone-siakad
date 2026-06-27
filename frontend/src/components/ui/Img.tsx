import { useState, ImgHTMLAttributes } from 'react';

const S3_PUBLIC_URL = import.meta.env.VITE_S3_PUBLIC_URL || 'http://localhost:9000/aone-assets';

function toProxyUrl(src: string): string {
  if (src.startsWith(S3_PUBLIC_URL)) {
    const key = src.slice(S3_PUBLIC_URL.length + 1);
    return `/api/v1/upload/${key}`;
  }
  return src;
}

interface ImgProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
}

export default function Img({ src, fallback = '', className, ...props }: ImgProps) {
  const [failed, setFailed] = useState(false);
  const safeSrc = src || fallback;
  const displaySrc = safeSrc && !failed ? toProxyUrl(safeSrc) : fallback;

  if (!displaySrc) return null;

  return (
    <img
      src={displaySrc}
      className={className}
      onError={() => setFailed(true)}
      {...props}
    />
  );
}
