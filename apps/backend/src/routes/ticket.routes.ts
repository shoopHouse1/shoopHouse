import { Router } from 'express';
import {
  createTicket,
  getTickets,
  getTicketById,
  createTicketMessage,
} from '../controllers/ticket.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createTicketSchema, createTicketMessageSchema } from '@shoophouse/shared';

const router = Router();

router.use(authenticate);

router.post('/', validate(createTicketSchema), createTicket);
router.get('/', getTickets);
router.get('/:id', getTicketById);
router.post('/:id/messages', validate(createTicketMessageSchema), createTicketMessage);

export default router;


