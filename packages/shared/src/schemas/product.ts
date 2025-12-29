import { z } from 'zod';
import { ProductStatus } from '../types';

const emptyToUndefined = (value: unknown) => {
  if (typeof value === 'string' && value.trim() === '') {
    return undefined;
  }
  return value;
};

export const createProductSchema = z.object({
  titleEn: z.string().min(1, 'English title is required'),
  titleAr: z.preprocess(
    emptyToUndefined,
    z.string().min(1, 'Arabic title is required').optional()
  ),
  descriptionEn: z.string().optional(),
  descriptionAr: z.preprocess(emptyToUndefined, z.string().optional()),
  price: z.union([z.number().positive('Price must be positive'), z.string()]).transform((val) => {
    const num = typeof val === 'number' ? val : parseFloat(val);
    if (isNaN(num) || num <= 0) {
      throw new Error('Price must be a positive number');
    }
    return num;
  }),
  categoryId: z.string().uuid('Category ID must be a valid UUID'),
  status: z.nativeEnum(ProductStatus).default(ProductStatus.DRAFT),
});

export const updateProductSchema = z.object({
  titleEn: z.string().min(1).optional(),
  titleAr: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  descriptionEn: z.string().optional(),
  descriptionAr: z.preprocess(emptyToUndefined, z.string().optional()),
  price: z.union([z.number().positive('Price must be positive'), z.string()]).transform((val) => {
    const num = typeof val === 'number' ? val : parseFloat(val);
    if (isNaN(num) || num <= 0) {
      throw new Error('Price must be a positive number');
    }
    return num;
  }).optional(),
  categoryId: z.string().uuid('Category ID must be a valid UUID').optional(),
  status: z.nativeEnum(ProductStatus).optional(),
});

export const productQuerySchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  tags: z.string().optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  sortBy: z.enum(['price', 'createdAt', 'title']).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});


