import { S3Client } from '@aws-sdk/client-s3';
import { config } from './index.js';

export function getS3Client(): S3Client {
  return new S3Client({
    endpoint: config.storage.endpoint,
    region: config.storage.region,
    credentials: {
      accessKeyId: config.storage.accessKey,
      secretAccessKey: config.storage.secretKey,
    },
    forcePathStyle: config.storage.forcePathStyle,
  });
}
