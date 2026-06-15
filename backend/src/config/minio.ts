import { Client as MinioClient } from 'minio';
import { config } from './index.js';

let minio: MinioClient | null = null;

export function getMinio(): MinioClient {
  if (!minio) {
    minio = new MinioClient({
      endPoint: config.minio.endpoint,
      port: config.minio.port,
      accessKey: config.minio.accessKey,
      secretKey: config.minio.secretKey,
      useSSL: config.minio.useSSL,
    });
  }
  return minio;
}

export async function ensureBuckets(): Promise<void> {
  const client = getMinio();
  const buckets = [config.minio.bucketDocuments, config.minio.bucketAssets];
  for (const bucket of buckets) {
    const exists = await client.bucketExists(bucket);
    if (!exists) {
      await client.makeBucket(bucket);
      console.log('[MinIO] Created bucket:', bucket);
    }
  }
}
