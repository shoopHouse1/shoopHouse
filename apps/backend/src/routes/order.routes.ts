import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  getWhatsAppLink,
} from '../controllers/order.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createOrderSchema, orderQuerySchema } from '@shoophouse/shared';

const router = Router();

router.use(authenticate);

router.post('/', validate(createOrderSchema), createOrder);
router.get('/', validate(orderQuerySchema), getOrders);
router.get('/:id', getOrderById);
router.get('/:id/whatsapp-link', getWhatsAppLink);

export default router;


