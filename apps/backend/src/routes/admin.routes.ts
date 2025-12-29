import { Router } from 'express';
import multer from 'multer';
import {
  getKPIs,
  getUsers,
  updateUserRole,
  getSellers,
  approveSeller,
  rejectSeller,
  suspendSeller,
  getAdminProducts,
  approveProduct,
  rejectProduct,
  deleteProduct,
  downloadProducts,
  addProductImage,
  removeProductImage,
  updateProductImageOrder,
  getAdminOrders,
  getAdminOrderById,
  markOrderPaid,
  regenerateTokens,
  getAdminTickets,
  updateTicketStatus,
  createTicketMessageAdmin,
  getAuditLogs,
  getSettings,
  updateSettings,
} from '../controllers/admin.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '@shoophouse/shared';
import { validate } from '../middleware/validate';
import { updateUserRoleSchema, updateTicketStatusSchema } from '@shoophouse/shared';

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

router.use(authenticate);
router.use(requireRole(UserRole.ADMIN));

router.get('/kpis', getKPIs);
router.get('/users', getUsers);
router.patch('/users/:id/role', validate(updateUserRoleSchema), updateUserRole);
router.get('/sellers', getSellers);
router.patch('/sellers/:id/approve', approveSeller);
router.patch('/sellers/:id/reject', rejectSeller);
router.patch('/sellers/:id/suspend', suspendSeller);
router.get('/products', getAdminProducts);
router.get('/products/download', downloadProducts);
router.patch('/products/:id/approve', approveProduct);
router.patch('/products/:id/reject', rejectProduct);
router.delete('/products/:id', deleteProduct);

// Product image management routes
// router.post('/products/:id/images', upload.array('images'), addProductImage);
// router.delete('/products/images/:id', removeProductImage);
// router.put('/products/images/:id/order', updateProductImageOrder);
router.get('/orders', getAdminOrders);
router.get('/orders/:id', getAdminOrderById);
router.patch('/orders/:id/mark-paid', markOrderPaid);
router.post('/orders/:id/regenerate-tokens', regenerateTokens);
router.get('/tickets', getAdminTickets);
router.patch('/tickets/:id/status', validate(updateTicketStatusSchema), updateTicketStatus);
router.post('/tickets/:id/messages', createTicketMessageAdmin);
router.get('/audit', getAuditLogs);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

export default router;


