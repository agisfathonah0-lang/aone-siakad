import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, CreateBucketCommand, ListBucketsCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from './index.js';

let s3: S3Client | null = null;

export function getS3(): S3Client {
  if (!s3) {
    s3 = new S3Client({
      endpoint: config.storage.endpoint,
      region: config.storage.region,
      credentials: {
        accessKeyId: config.storage.accessKey,
        secretAccessKey: config.storage.secretKey,
      },
      forcePathStyle: config.storage.forcePathStyle,
    });
  }
  return s3;
}

export async function uploadFile(
  buffer: Buffer,
  key: string,
  mimeType: string,
): Promise<string> {
  const client = getS3();
  await client.send(
    new PutObjectCommand({
      Bucket: config.storage.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    }),
  );
  return `${config.storage.publicUrl}/${key}`;
}

export async function getFileStream(key: string): Promise<{ stream: import('stream').Readable; contentType: string }> {
  const client = getS3();
  const response = await client.send(
    new GetObjectCommand({
      Bucket: config.storage.bucket,
      Key: key,
    }),
  );
  return {
    stream: response.Body as import('stream').Readable,
    contentType: response.ContentType || 'application/octet-stream',
  };
}

export async function deleteFile(key: string): Promise<void> {
  const client = getS3();
  await client.send(
    new DeleteObjectCommand({
      Bucket: config.storage.bucket,
      Key: key,
    }),
  );
}

export async function getSignedFileUrl(key: string, expiresIn = 3600): Promise<string> {
  const client = getS3();
  return getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: config.storage.bucket, Key: key }),
    { expiresIn },
  );
}

export function extractKeyFromUrl(url: string): string | null {
  const prefix = config.storage.publicUrl;
  if (url.startsWith(prefix)) {
    return url.slice(prefix.length + 1);
  }
  return null;
}

export async function ensureBucket(): Promise<void> {
  const client = getS3();
  try {
    const { Buckets } = await client.send(new ListBucketsCommand({}));
    const exists = Buckets?.some(b => b.Name === config.storage.bucket);
    if (!exists) {
      await client.send(new CreateBucketCommand({ Bucket: config.storage.bucket }));
      console.log(`[Storage] Created bucket: ${config.storage.bucket}`);
    }
  } catch (err: any) {
    if (err.name === 'BucketAlreadyOwnedByYou' || err.name === 'BucketAlreadyExists') return;
    throw err;
  }
}
