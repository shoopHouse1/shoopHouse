import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { OrderStatus } from '@shoophouse/shared';
import { config } from '../config';
import { generateDownloadToken } from '../services/download.service';
import { logAudit } from '../services/audit.service';

export async function createOrder(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { items } = req.body;

  // Validate products exist and are published
  const productIds = items.map((item: any) => item.productId);
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      status: 'PUBLISHED',
    },
  });

  if (products.length !== productIds.length) {
    res.status(400).json({ error: 'Some products not found or not available' });
    return;
  }

  // Calculate total
  let total = 0;
  const orderItems = items.map((item: any) => {
    const product = products.find((p: any) => p.id === item.productId);
    if (!product) throw new Error('Product not found');
    const price = product.price * item.quantity;
    total += price;
    return {
      productId: product.id,
      priceAtPurchase: product.price,
      quantity: item.quantity,
    };
  });

  // Generate order number
  const orderCount = await prisma.order.count();
  const orderNumber = `SH-${String(orderCount + 1).padStart(6, '0')}`;

  // Create order
  const order = await prisma.order.create({
    data: {
      orderNumber,
      buyerId: req.user.userId,
      status: OrderStatus.PENDING_PAYMENT,
      total,
      items: {
        create: orderItems,
      },
      paymentLogs: {
        create: {
          method: 'WHATSAPP',
          status: 'PENDING',
        },
      },
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              titleEn: true,
              titleAr: true,
            },
          },
        },
      },
    },
  });

  res.status(201).json({ order });
}

export async function getOrders(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { status, page = 1, limit = 20 } = req.query;

  const where: any = { buyerId: req.user.userId };
  if (status) where.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              select: {
                titleEn: true,
                titleAr: true,
                images: { take: 1 },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit),
    }),
    prisma.order.count({ where }),
  ]);

  res.json({
    data: orders,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
}

export async function getOrderById(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { id } = req.params;

  const order = await prisma.order.findFirst({
    where: {
      id,
      buyerId: req.user.userId,
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { take: 1 },
            },
          },
          downloadTokens: {
            select: {
              id: true,
              token: true,
              expiresAt: true,
              remainingDownloads: true,
            },
          },
        },
      },
      paymentLogs: true,
    },
  });

  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  res.json({ order });
}

export async function getWhatsAppLink(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { id } = req.params;

  const order = await prisma.order.findFirst({
    where: {
      id,
      buyerId: req.user.userId,
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              titleEn: true,
              titleAr: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: { name: true, email: true },
  });

  const itemsText = order.items
    .map((item: any) => `- ${item.product.titleEn} (x${item.quantity})`)
    .join('\n');

  const message = encodeURIComponent(
    `Hello! I want to pay for my order:\n\n` +
    `Order Number: ${order.orderNumber}\n` +
    `Items:\n${itemsText}\n` +
    `Total: $${order.total.toFixed(2)}\n\n` +
    `Buyer: ${user?.name} (${user?.email})`
  );

  const whatsappUrl = `https://wa.me/${config.whatsapp.number.replace(/[^0-9]/g, '')}?text=${message}`;

  res.json({ whatsappUrl });
}

