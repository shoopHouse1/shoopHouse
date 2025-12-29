import { z } from 'zod';
import { TicketStatus } from '../types';

export const createTicketSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required'),
});

export const createTicketMessageSchema = z.object({
  message: z.string().min(1, 'Message is required'),
});

export const updateTicketStatusSchema = z.object({
  status: z.nativeEnum(TicketStatus),
});


