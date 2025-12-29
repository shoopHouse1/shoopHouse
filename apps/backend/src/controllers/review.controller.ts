import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

export async function createReview(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { productId, rating, comment } = req.body;

  // Check if user has purchased this product
  const hasPurchased = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: {
        buyerId: req.user.userId,
        status: { in: ['PAID', 'DELIVERED'] },
      },
    },
  });

  if (!hasPurchased) {
    res.status(403).json({ error: 'You must purchase this product before reviewing' });
    return;
  }

  // Check if review already exists
  const existing = await prisma.review.findUnique({
    where: {
      productId_buyerId: {
        productId,
        buyerId: req.user.userId,
      },
    },
  });

  if (existing) {
    res.status(400).json({ error: 'Review already exists' });
    return;
  }

  const review = await prisma.review.create({
    data: {
      productId,
      buyerId: req.user.userId,
      rating: parseInt(rating),
      comment,
    },
    include: {
      buyer: {
        select: { name: true },
      },
    },
  });

  res.status(201).json({ review });
}

export async function getReviews(req: AuthRequest, res: Response): Promise<void> {
  const { productId } = req.query;

  if (!productId) {
    res.status(400).json({ error: 'productId is required' });
    return;
  }

  const reviews = await prisma.review.findMany({
    where: { productId: productId as string },
    include: {
      buyer: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ data: reviews });
}


