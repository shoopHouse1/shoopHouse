import { Router } from 'express';
import multer from 'multer';
import {
  getSellerProfile,
  updateSellerProfile,
  getSellerProducts,
  getSellerProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  submitProduct,
  getUploadUrl,
} from '../controllers/seller.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '@shoophouse/shared';
import { validate } from '../middleware/validate';
import { createProductSchema, updateProductSchema } from '@shoophouse/shared';

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

router.use(authenticate);
router.use(requireRole(UserRole.SELLER));

router.get('/me', getSellerProfile);
router.put('/profile', updateSellerProfile);
router.get('/products', getSellerProducts);
router.post('/products', upload.array('images'), validate(createProductSchema), createProduct);
router.put('/products/:id', upload.array('images'), validate(updateProductSchema), updateProduct);
router.get('/products/:id', getSellerProductById);
router.delete('/products/:id', deleteProduct);
router.post('/products/:id/submit', submitProduct);
router.post('/products/upload', getUploadUrl);

export default router;


