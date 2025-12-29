import { randomBytes } from 'crypto';
import { prisma } from '../lib/prisma';
import { config } from '../config';
import { getSignedDownloadUrl } from '../lib/s3';

export async function generateDownloadToken(orderItemId: string): Promise<string> {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + config.downloads.expiryHours);

  await prisma.downloadToken.create({
    data: {
      orderItemId,
      token,
      expiresAt,
      remainingDownloads: config.downloads.maxAttempts,
    },
  });

  return token;
}

export async function validateDownloadToken(
  token: string
): Promise<{ orderItemId: string; productFileId: string; storageKey: string } | null> {
  const downloadToken = await prisma.downloadToken.findUnique({
    where: { token },
    include: {
      orderItem: {
        include: {
          product: {
            include: {
              files: true,
            },
          },
        },
      },
    },
  });

  if (!downloadToken) return null;
  if (downloadToken.expiresAt < new Date()) return null;
  if (downloadToken.remainingDownloads <= 0) return null;

  const productFile = downloadToken.orderItem.product.files[0];
  if (!productFile) return null;

  return {
    orderItemId: downloadToken.orderItemId,
    productFileId: productFile.id,
    storageKey: productFile.storageKey,
  };
}

export async function recordDownload(
  token: string,
  buyerId?: string,
  ip?: string,
  userAgent?: string
): Promise<void> {
  const downloadToken = await prisma.downloadToken.findUnique({
    where: { token },
  });

  if (!downloadToken) return;

  await prisma.$transaction([
    prisma.downloadEvent.create({
      data: {
        tokenId: downloadToken.id,
        buyerId,
        ip,
        userAgent,
      },
    }),
    prisma.downloadToken.update({
      where: { id: downloadToken.id },
      data: {
        remainingDownloads: {
          decrement: 1,
        },
      },
    }),
  ]);
}

export async function getDownloadUrl(storageKey: string): Promise<string> {
  return getSignedDownloadUrl(storageKey, 3600);
}


