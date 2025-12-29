import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { UserRole, ProductStatus, OrderStatus, SellerStatus, TicketStatus } from '@shoophouse/shared';
import { generateDownloadToken } from '../services/download.service';
import { logAudit } from '../services/audit.service';
import { createNotification } from '../services/notification.service';

export async function getKPIs(req: AuthRequest, res: Response): Promise<void> {
  const [users, sellers, products, orders, revenue] = await Promise.all([
    prisma.user.count(),
    prisma.sellerProfile.count({ where: { status: 'APPROVED' } }),
    prisma.product.count({ where: { status: 'PUBLISHED' } }),
    prisma.order.count({ where: { status: { in: ['PAID', 'DELIVERED'] } } }),
    prisma.order.aggregate({
      where: { status: { in: ['PAID', 'DELIVERED'] } },
      _sum: { total: true },
    }),
  ]);

  res.json({
    kpis: {
      totalUsers: users,
      totalSellers: sellers,
      totalProducts: products,
      totalOrders: orders,
      totalRevenue: revenue._sum.total || 0,
    },
  });
}

export async function getUsers(req: AuthRequest, res: Response): Promise<void> {
  const { page = 1, limit = 20, role } = req.query;

  const where: any = {};
  if (role) where.role = role;

  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        sellerProfile: {
          select: { status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit),
    }),
    prisma.user.count({ where }),
  ]);

  res.json({
    data: users,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
}

export async function updateUserRole(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { id } = req.params;
  const { role } = req.body;

  const user = await prisma.user.update({
    where: { id },
    data: { role },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  await logAudit(req.user.userId, 'UPDATE_USER_ROLE', 'User', id, { role });

  res.json({ user });
}

export async function getSellers(req: AuthRequest, res: Response): Promise<void> {
  const { status } = req.query;

  const where: any = {};
  if (status) where.status = status;

  const sellers = await prisma.sellerProfile.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: { products: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ data: sellers });
}

export async function approveSeller(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { id } = req.params;

  const seller = await prisma.sellerProfile.update({
    where: { id },
    data: { status: SellerStatus.APPROVED },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  await logAudit(req.user.userId, 'APPROVE_SELLER', 'SellerProfile', id);

  res.json({ seller });
}

export async function rejectSeller(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { id } = req.params;

  const seller = await prisma.sellerProfile.update({
    where: { id },
    data: { status: SellerStatus.REJECTED },
  });

  await logAudit(req.user.userId, 'REJECT_SELLER', 'SellerProfile', id);

  res.json({ seller });
}

export async function suspendSeller(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { id } = req.params;

  const seller = await prisma.sellerProfile.update({
    where: { id },
    data: { status: SellerStatus.SUSPENDED },
  });

  await logAudit(req.user.userId, 'SUSPEND_SELLER', 'SellerProfile', id);

  res.json({ seller });
}

export async function getAdminProducts(req: AuthRequest, res: Response): Promise<void> {
  const { status, page = 1, limit = 20 } = req.query;

  const where: any = {};
  if (status) where.status = status;

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
        images: { take: 1 },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit),
    }),
    prisma.product.count({ where }),
  ]);

  res.json({
    data: products,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
}

export async function approveProduct(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { id } = req.params;

  const product = await prisma.product.update({
    where: { id },
    data: { status: ProductStatus.PUBLISHED },
    include: {
      seller: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  // Send notification to seller about product approval
  try {
    if (product.seller && product.seller.user) {
      await createNotification({
        userId: product.seller.user.id,
        title: 'Product Approved',
        message: `Your product "${product.titleEn}" has been approved and is now visible in the store.`,
        type: 'PRODUCT_APPROVAL',
      });
    }
  } catch (error) {
    console.error('Error sending product approval notification:', error);
  }

  await logAudit(req.user.userId, 'APPROVE_PRODUCT', 'Product', id);

  res.json({ product });
}

export async function rejectProduct(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { id } = req.params;

  const product = await prisma.product.update({
    where: { id },
    data: { status: ProductStatus.REJECTED },
    include: {
      seller: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  // Send notification to seller about product rejection
  try {
    if (product.seller && product.seller.user) {
      await createNotification({
        userId: product.seller.user.id,
        title: 'Product Rejected',
        message: `Your product "${product.titleEn}" has been rejected. Please review the requirements and resubmit if needed.`,
        type: 'PRODUCT_REJECTION',
      });
    }
  } catch (error) {
    console.error('Error sending product rejection notification:', error);
  }

  await logAudit(req.user.userId, 'REJECT_PRODUCT', 'Product', id);

  res.json({ product });
}

export async function getAdminOrders(req: AuthRequest, res: Response): Promise<void> {
  const { status, page = 1, limit = 20 } = req.query;

  const where: any = {};
  if (status) where.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        buyer: {
          select: { name: true, email: true },
        },
        items: {
          include: {
            product: {
              select: { titleEn: true, titleAr: true },
            },
          },
        },
        paymentLogs: true,
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

export async function getAdminOrderById(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      buyer: {
        select: { name: true, email: true },
      },
      items: {
        include: {
          product: {
            include: {
              images: { take: 1 },
            },
          },
          downloadTokens: true,
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

export async function markOrderPaid(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { id } = req.params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  // Update order status
  await prisma.order.update({
    where: { id },
    data: { status: OrderStatus.PAID },
  });

  // Update payment log
  await prisma.paymentLog.updateMany({
    where: { orderId: id },
    data: {
      status: 'CONFIRMED',
      adminConfirmedBy: req.user.userId,
      confirmedAt: new Date(),
    },
  });

  // Generate download tokens for each item
  for (const item of order.items) {
    await generateDownloadToken(item.id);
  }

  await logAudit(req.user.userId, 'MARK_ORDER_PAID', 'Order', id);

  res.json({ message: 'Order marked as paid' });
}

export async function regenerateTokens(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { id } = req.params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  // Delete existing tokens
  const itemIds = order.items.map((item: any) => item.id);
  await prisma.downloadToken.deleteMany({
    where: { orderItemId: { in: itemIds } },
  });

  // Generate new tokens
  for (const item of order.items) {
    await generateDownloadToken(item.id);
  }

  await logAudit(req.user.userId, 'REGENERATE_DOWNLOAD_TOKENS', 'Order', id);

  res.json({ message: 'Download tokens regenerated' });
}

export async function getAdminTickets(req: AuthRequest, res: Response): Promise<void> {
  const { status } = req.query;

  const where: any = {};
  if (status) where.status = status;

  const tickets = await prisma.ticket.findMany({
    where,
    include: {
      buyer: {
        select: { name: true, email: true },
      },
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

export async function updateTicketStatus(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { id } = req.params;
  const { status } = req.body;

  const ticket = await prisma.ticket.update({
    where: { id },
    data: { status },
  });

  await logAudit(req.user.userId, 'UPDATE_TICKET_STATUS', 'Ticket', id, { status });

  res.json({ ticket });
}

export async function createTicketMessageAdmin(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { id } = req.params;
  const { message } = req.body;

  const ticket = await prisma.ticket.findUnique({ where: { id } });
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

export async function getAuditLogs(req: AuthRequest, res: Response): Promise<void> {
  const { page = 1, limit = 50, entityType, action } = req.query;

  const where: any = {};
  if (entityType) where.entityType = entityType;
  if (action) where.action = action;

  const skip = (Number(page) - 1) * Number(limit);
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        actor: {
          select: { name: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit),
    }),
    prisma.auditLog.count({ where }),
  ]);

  res.json({
    data: logs,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
}

export async function getSettings(req: AuthRequest, res: Response): Promise<void> {
  const settings = await prisma.setting.findMany();

  const settingsMap: Record<string, any> = {};
  settings.forEach((s: any) => {
    try {
      settingsMap[s.key] = JSON.parse(s.value);
    } catch {
      settingsMap[s.key] = s.value;
    }
  });

  res.json({ settings: settingsMap });
}

export async function updateSettings(req: AuthRequest, res: Response): Promise<void> {
  const { settings } = req.body;

  for (const [key, value] of Object.entries(settings)) {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    await prisma.setting.upsert({
      where: { key },
      update: { value: stringValue },
      create: { key, value: stringValue },
    });
  }

  res.json({ message: 'Settings updated' });
}

export async function addProductImage(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { id: productId } = req.params;
  const images = req.files as Express.Multer.File[] || [];

  if (images.length === 0) {
    res.status(400).json({ error: 'No images provided' });
    return;
  }

  // Verify product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
  const { config } = await import('../config');
  
  // Initialize S3 client
  const s3Client = new S3Client({
    endpoint: config.s3.endpoint,
    region: config.s3.region,
    credentials: {
      accessKeyId: config.s3.accessKeyId,
      secretAccessKey: config.s3.secretAccessKey,
    },
    forcePathStyle: !!config.s3.endpoint, // Required for R2 and some S3-compatible services
  });

  try {
    // Upload each image to S3 and create records
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      
      // Generate a unique filename
      const fileExtension = image.originalname.split('.').pop();
      const fileName = `product-images/${product.slug}-admin-upload-${Date.now()}-${i}.${fileExtension}`;
      
      // Upload the image buffer to S3
      const uploadParams = {
        Bucket: config.s3.bucket,
        Key: fileName,
        Body: image.buffer,
        ContentType: image.mimetype,
      };
      
      await s3Client.send(new PutObjectCommand(uploadParams));
      
      // Find the max order value to determine the new order
      const maxOrderResult = await prisma.productImage.aggregate({
        where: { productId },
        _max: { order: true },
      });
      
      const newOrder = (maxOrderResult._max.order || 0) + 1;
      
      // Create image record in the database
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: `${config.s3.publicUrl}/${fileName}`, // This will be the public URL
          order: newOrder,
        },
      });
    }

    await logAudit(req.user.userId, 'ADD_PRODUCT_IMAGE', 'ProductImage', productId);
    
    res.json({ message: `${images.length} image(s) added successfully` });
  } catch (error) {
    console.error('Error adding product images:', error);
    res.status(500).json({ error: 'Failed to add images' });
  }
}

export async function removeProductImage(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { id: imageId } = req.params;

  // Find the image to get the product ID
  const image = await prisma.productImage.findUnique({
    where: { id: imageId },
    include: {
      product: true,
    },
  });

  if (!image) {
    res.status(404).json({ error: 'Image not found' });
    return;
  }

  try {
    // Delete the image record
    await prisma.productImage.delete({
      where: { id: imageId },
    });

    await logAudit(req.user.userId, 'REMOVE_PRODUCT_IMAGE', 'ProductImage', image.productId);
    
    res.json({ message: 'Image removed successfully' });
  } catch (error) {
    console.error('Error removing product image:', error);
    res.status(500).json({ error: 'Failed to remove image' });
  }
}

export async function updateProductImageOrder(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { id: imageId } = req.params;
  const { order } = req.body;

  // Find the image to verify it exists
  const image = await prisma.productImage.findUnique({
    where: { id: imageId },
  });

  if (!image) {
    res.status(404).json({ error: 'Image not found' });
    return;
  }

  try {
    // Update the image order
    const updatedImage = await prisma.productImage.update({
      where: { id: imageId },
      data: { order: parseInt(order) },
    });

    await logAudit(req.user.userId, 'UPDATE_PRODUCT_IMAGE_ORDER', 'ProductImage', imageId);
    
    res.json({ image: updatedImage });
  } catch (error) {
    console.error('Error updating product image order:', error);
    res.status(500).json({ error: 'Failed to update image order' });
  }
}

export async function downloadProducts(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  // Get all products with related data
  const products = await prisma.product.findMany({
    include: {
      seller: {
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      },
      category: {
        select: { nameEn: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Create CSV content
  const headers = [
    'ID', 'Title (EN)', 'Title (AR)', 'Description (EN)', 'Description (AR)',
    'Price', 'Category', 'Status', 'Tags', 'Seller Name', 'Seller Email',
    'Created At', 'Updated At'
  ];
  
  const csvContent = [
    headers.join(','),
    ...products.map((product: any) => [
      product.id,
      '"' + product.titleEn + '"',
      '"' + product.titleAr + '"',
      '"' + product.descriptionEn + '"',
      '"' + product.descriptionAr + '"',
      product.price,
      product.category?.nameEn || '',
      product.status,
      product.tags.join(';'),
      product.seller?.user?.name || '',
      product.seller?.user?.email || '',
      product.createdAt.toISOString(),
      product.updatedAt.toISOString()
    ].map((field: any) => typeof field === 'string' && field.includes(',') ? '"'+field+'"' : field).join(','))
  ].join('\n');

  // Set response headers for CSV download
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=products.csv');
  
  res.send(csvContent);
}

export async function deleteProduct(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user || req.user.role !== 'ADMIN') {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { id } = req.params;

  try {
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        seller: {
          include: {
            user: true
          }
        }
      }
    });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    // Delete related records first to avoid foreign key constraint issues
    // First delete download tokens (they reference order items)
    await prisma.downloadToken.deleteMany({
      where: { orderItem: { productId: id } },
    });
    
    // Then delete order items that reference the product
    await prisma.orderItem.deleteMany({
      where: { productId: id },
    });
    
    // Delete other related records
    await prisma.review.deleteMany({
      where: { productId: id },
    });
    
    await prisma.productImage.deleteMany({
      where: { productId: id },
    });
    
    await prisma.productFile.deleteMany({
      where: { productId: id },
    });
    
    // Finally delete the product
    await prisma.product.delete({
      where: { id },
    });

    // Log the action
    await logAudit(req.user.userId, 'DELETE_PRODUCT', 'PRODUCT', id, { 
      details: `Deleted product: ${product.titleEn || 'Unknown Product'} by seller ${product.seller?.user?.name || 'Unknown'}` 
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
