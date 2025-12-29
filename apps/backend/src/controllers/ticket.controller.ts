import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { TicketStatus, UserRole } from '@shoophouse/shared';

export async function createTicket(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { subject, message } = req.body;

  const ticket = await prisma.ticket.create({
    data: {
      buyerId: req.user.userId,
      subject,
      messages: {
        create: {
          senderRole: req.user.role,
          senderId: req.user.userId,
          message,
        },
      },
    },
    include: {
      messages: true,
    },
  });

  res.status(201).json({ ticket });
}

export async function getTickets(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const tickets = await prisma.ticket.findMany({
    where: { buyerId: req.user.userId },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
      _count: {
        select: { messages: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ data: tickets });
}

export async function getTicketById(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { id } = req.params;

  const ticket = await prisma.ticket.findFirst({
    where: {
      id,
      buyerId: req.user.userId,
    },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }

  res.json({ ticket });
}

export async function createTicketMessage(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { id } = req.params;
  const { message } = req.body;

  const ticket = await prisma.ticket.findFirst({
    where: {
      id,
      buyerId: req.user.userId,
    },
  });

  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }

  const ticketMessage = await prisma.ticketMessage.create({
    data: {
      ticketId: id,
      senderRole: req.user.role,
      senderId: req.user.userId,
      message,
    },
  });

  res.status(201).json({ message: ticketMessage });
}


