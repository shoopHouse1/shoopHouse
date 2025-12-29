import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import {
  validateDownloadToken,
  recordDownload,
  getDownloadUrl,
} from '../services/download.service';

export async function getDownloads(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const orders = await prisma.order.findMany({
    where: {
      buyerId: req.user.userId,
      status: { in: ['PAID', 'DELIVERED'] },
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              titleEn: true,
              titleAr: true,
              images: { take: 1 },
            },
          },
          downloadTokens: {
            select: {
              id: true,
              token: true,
              expiresAt: true,
              remainingDownloads: true,
              createdAt: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const downloads = orders.flatMap((order: any) =>
    order.items.flatMap((item: any) =>
      item.downloadTokens.map((token: any) => ({
        orderId: order.id,
        orderNumber: order.orderNumber,
        product: item.product,
        token: token.token,
        expiresAt: token.expiresAt,
        remainingDownloads: token.remainingDownloads,
        createdAt: token.createdAt,
      }))
    )
  );

  res.json({ data: downloads });
}

export async function downloadFile(req: AuthRequest, res: Response): Promise<void> {
  const { token } = req.params;

  const validation = await validateDownloadToken(token);
  if (!validation) {
    res.status(404).json({ error: 'Invalid or expired download token' });
    return;
  }

  const downloadUrl = await getDownloadUrl(validation.storageKey);

  // Record download
  await recordDownload(
    token,
    req.user?.userId,
    req.ip,
    req.get('user-agent')
  );

  res.json({ downloadUrl });
}


