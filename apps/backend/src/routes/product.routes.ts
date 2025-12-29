import { Router } from 'express';
import { getProducts, getProductBySlug, getCategories } from '../controllers/product.controller';
import { productQuerySchema } from '@shoophouse/shared';
import { validate } from '../middleware/validate';

const router = Router();

router.get('/', validate(productQuerySchema), getProducts);
router.get('/categories', getCategories);
router.get('/:slug', getProductBySlug);

export default router;


