import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

function parseDatabaseUrl(url?: string) {
  if (!url) return null;
  try {
    const u = new URL(url);
    return {
      host: u.hostname,
      port: parseInt(u.port || '5432', 10),
      name: u.pathname.replace(/^\//, ''),
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
    };
  } catch {
    return null;
  }
}

const dbUrl = parseDatabaseUrl(process.env.DATABASE_URL);

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  apiPrefix: process.env.API_PREFIX || '/api/v1',

  db: {
    host: dbUrl?.host || process.env.DB_HOST || 'localhost',
    port: dbUrl?.port || parseInt(process.env.DB_PORT || '5432', 10),
    name: dbUrl?.name || process.env.DB_NAME || 'aone_siakad',
    user: dbUrl?.user || process.env.DB_USER || 'postgres',
    password: dbUrl?.password || process.env.DB_PASSWORD || 'postgres',
    poolMin: parseInt(process.env.DB_POOL_MIN || '2', 10),
    poolMax: parseInt(process.env.DB_POOL_MAX || '10', 10),
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },

  jwt: {
    vendorSecret: process.env.JWT_VENDOR_SECRET || 'default-vendor-secret',
    campusSecret: process.env.JWT_CAMPUS_SECRET || 'default-campus-secret',
    accessExpires: process.env.JWT_ACCESS_EXPIRES || '8h',
    refreshExpires: process.env.JWT_REFRESH_EXPIRES || '30d',
  },

  minio: {
    endpoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000', 10),
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    bucketDocuments: process.env.MINIO_BUCKET_DOCUMENTS || 'aone-documents',
    bucketAssets: process.env.MINIO_BUCKET_ASSETS || 'aone-assets',
    useSSL: process.env.MINIO_USE_SSL === 'true',
  },

  midtrans: {
    serverKey: process.env.MIDTRANS_SERVER_KEY || '',
    clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  },

  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'noreply@aone-project.com',
  },

  pddikti: {
    apiBase: process.env.PDDIKTI_API_BASE || 'https://api.klaster.layanan.id/v1',
    apiKey: process.env.PDDIKTI_API_KEY || '',
  },

  ojs: {
    url: process.env.OJS_URL || 'http://localhost/ojs-v3',
    apiKey: process.env.OJS_API_KEY || '',
    context: process.env.OJS_CONTEXT || '',
    apiTimeout: parseInt(process.env.OJS_API_TIMEOUT || '10000', 10),
  },
} as const;

export type Config = typeof config;
