import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { ProductStatus } from '@shoophouse/shared';
import { logAudit } from '../services/audit.service';

export async function getProducts(req: AuthRequest, res: Response): Promise<void> {
  const {
    search,
    categoryId,
    minPrice,
    maxPrice,
    tags,
    status,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 20,
  } = req.query;

  const where: any = {
    status: status || ProductStatus.PUBLISHED,
  };

  if (search) {
    where.OR = [
      { titleEn: { contains: search as string, mode: 'insensitive' } },
      { titleAr: { contains: search as string, mode: 'insensitive' } },
      { descriptionEn: { contains: search as string, mode: 'insensitive' } },
      { descriptionAr: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  if (categoryId) where.categoryId = categoryId;
  if (minPrice) where.price = { ...where.price, gte: parseFloat(minPrice as string) };
  if (maxPrice) where.price = { ...where.price, lte: parseFloat(maxPrice as string) };
  if (tags) {
    const tagArray = (tags as string).split(',');
    where.tags = { hasSome: tagArray };
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        seller: {
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        },
        category: true,
        images: { orderBy: { order: 'asc' }, take: 1 },
        reviews: {
          select: {
            rating: true,
          },
        },
        _count: {
          select: { reviews: true },
        },
      },
      orderBy: { [sortBy as string]: sortOrder },
      skip,
      take: Number(limit),
    }),
    prisma.product.count({ where }),
  ]);

  const productsWithAvgRating = products.map((product) => {
    const avgRating =
      product.reviews.length > 0
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
        : 0;
    return {
      ...product,
      avgRating,
      reviewCount: product._count.reviews,
      reviews: undefined,
      _count: undefined,
    };
  });

  res.json({
    data: productsWithAvgRating,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
}

export async function getProductBySlug(req: AuthRequest, res: Response): Promise<void> {
  const { slug } = req.params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      seller: {
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      },
      category: true,
      images: { orderBy: { order: 'asc' } },
      reviews: {
        include: {
          buyer: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: { reviews: true },
      },
    },
  });

  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0;

  res.json({
    ...product,
    avgRating,
    reviewCount: product._count.reviews,
    _count: undefined,
  });
}

export async function getCategories(req: AuthRequest, res: Response): Promise<void> {
  const categories = await prisma.category.findMany({
    orderBy: { nameEn: 'asc' },
  });

  res.json({ data: categories });
}


