import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../config';
import { randomUUID } from 'crypto';

const s3Client = new S3Client({
  endpoint: config.s3.endpoint,
  region: config.s3.region,
  credentials: {
    accessKeyId: config.s3.accessKeyId,
    secretAccessKey: config.s3.secretAccessKey,
  },
  forcePathStyle: !!config.s3.endpoint, // Required for R2 and some S3-compatible services
});

export async function getSignedUploadUrl(
  fileName: string,
  mimeType: string,
  folder: string = 'products'
): Promise<{ uploadUrl: string; storageKey: string }> {
  const fileExtension = fileName.split('.').pop();
  const storageKey = `${folder}/${randomUUID()}.${fileExtension}`;

  const command = new PutObjectCommand({
    Bucket: config.s3.bucket,
    Key: storageKey,
    ContentType: mimeType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

  return { uploadUrl, storageKey };
}

export async function getSignedDownloadUrl(
  storageKey: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: config.s3.bucket,
    Key: storageKey,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
}

export function getPublicUrl(storageKey: string): string {
  if (config.s3.publicUrl) {
    return `${config.s3.publicUrl}/${storageKey}`;
  }
  // Fallback to signed URL if no public URL configured
  return storageKey;
}


