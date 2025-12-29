import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { ProductStatus } from '@shoophouse/shared';
import { logAudit } from '../services/audit.service';
import { createNotification } from '../services/notification.service';

export async function getSellerProfile(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const profile = await prisma.sellerProfile.findUnique({
    where: { userId: req.user.userId },
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
  });

  if (!profile) {
    res.status(404).json({ error: 'Seller profile not found' });
    return;
  }

  res.json({ profile });
}

export async function updateSellerProfile(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { displayName, bio } = req.body;

  const profile = await prisma.sellerProfile.update({
    where: { userId: req.user.userId },
    data: {
      displayName,
      bio,
    },
  });

  res.json({ profile });
}

export async function getSellerProductById(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { id } = req.params;
  const seller = await prisma.sellerProfile.findUnique({
    where: { userId: req.user.userId },
  });

  if (!seller) {
    res.status(403).json({ error: 'Seller not found' });
    return;
  }

  const product = await prisma.product.findFirst({
    where: { id, sellerId: seller.id },
    include: {
      category: true,
      images: true,
      files: true,
    },
  });

  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  res.json({ product });
}

export async function getSellerProducts(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const seller = await prisma.sellerProfile.findUnique({
    where: { userId: req.user.userId },
  });

  if (!seller) {
    res.status(404).json({ error: 'Seller profile not found' });
    return;
  }

  const products = await prisma.product.findMany({
    where: { sellerId: seller.id },
    include: {
      category: true,
      images: { orderBy: { order: 'asc' }, take: 1 },
      _count: {
        select: { orderItems: true, reviews: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ data: products });
}

export async function createProduct(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const seller = await prisma.sellerProfile.findUnique({
    where: { userId: req.user.userId },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!seller || seller.status !== 'APPROVED') {
    res.status(403).json({ error: 'Seller not approved' });
    return;
  }

  const { titleEn, titleAr, descriptionEn, descriptionAr, price, categoryId, status } = req.body;
  
  // Provide default values for optional Arabic fields if not provided
  const finalTitleAr = titleAr || titleEn; // Use English title as default for Arabic title
  const finalDescriptionAr = descriptionAr || descriptionEn || ''; // Use English description or empty string as default

  // Generate slug
  const baseSlug = titleEn.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  let slug = baseSlug;
  let counter = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  // Create the product first
  const product = await prisma.product.create({
    data: {
      sellerId: seller.id,
      titleEn,
      titleAr: finalTitleAr,
      slug,
      descriptionEn,
      descriptionAr: finalDescriptionAr,
      price: parseFloat(price),
      categoryId,
      tags: [],
      status: status || ProductStatus.PENDING_APPROVAL, // All products created by sellers default to PENDING_APPROVAL
    },
    include: {
      images: true,
    },
  });

  // Handle image uploads if provided
  const images = req.files as Express.Multer.File[] || [];
  
  if (images.length > 0) {
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
    
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      
      // Generate a unique filename
      const fileExtension = image.originalname.split('.').pop();
      const fileName = `product-images/${product.slug}-image-${Date.now()}-${i}.${fileExtension}`;
      
      try {
        // Upload the image buffer to S3
        const uploadParams = {
          Bucket: config.s3.bucket,
          Key: fileName,
          Body: image.buffer,
          ContentType: image.mimetype,
        };
        
        await s3Client.send(new PutObjectCommand(uploadParams));
        
        // Save image record to database
        await prisma.productImage.create({
          data: {
            productId: product.id,
            url: `${config.s3.publicUrl}/${fileName}`,
            order: i,
          },
        });
      } catch (error) {
        console.error('Error uploading image:', error);
        // Continue with other images even if one fails
      }
    }
    
    // Refresh product with images
    const updatedProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        images: true,
      },
    });
    
    res.status(201).json({ product: updatedProduct });
    return;
  }
  
  // Send notification to admins about new product submission
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });
    
    for (const admin of admins) {
      await createNotification({
        userId: admin.id,
        title: 'New Product Submitted',
        message: `A new product "${product.titleEn}" has been submitted for approval by seller ${seller.user.name}.`,
        type: 'PRODUCT_SUBMISSION',
      });
    }
  } catch (error) {
    console.error('Error sending product submission notification:', error);
  }
  
  res.status(201).json({ product });
}

export async function updateProduct(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { id } = req.params;
  const seller = await prisma.sellerProfile.findUnique({
    where: { userId: req.user.userId },
  });

  if (!seller) {
    res.status(403).json({ error: 'Seller not found' });
    return;
  }

  const product = await prisma.product.findFirst({
    where: { id, sellerId: seller.id },
  });

  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  const updateData: any = {};
  if (req.body.titleEn) updateData.titleEn = req.body.titleEn;
  if (req.body.titleAr) updateData.titleAr = req.body.titleAr;
  if (req.body.descriptionEn !== undefined) updateData.descriptionEn = req.body.descriptionEn;
  if (req.body.descriptionAr !== undefined) updateData.descriptionAr = req.body.descriptionAr;
  if (req.body.categoryId) updateData.categoryId = req.body.categoryId;
  if (req.body.price) updateData.price = parseFloat(req.body.price);

  if (req.body.status) updateData.status = req.body.status;
  
  // Ensure Arabic fields are properly set if provided
  if (req.body.titleAr === undefined && updateData.titleEn) {
    // If Arabic title is not provided but English title is being updated, set Arabic title to match English
    updateData.titleAr = updateData.titleEn;
  }
  if (req.body.descriptionAr === undefined && updateData.descriptionEn) {
    // If Arabic description is not provided but English description is being updated, set Arabic description to match English
    updateData.descriptionAr = updateData.descriptionEn;
  }

  const updated = await prisma.product.update({
    where: { id },
    data: updateData,
    include: {
      category: true,
      images: true,
    },
  });

  res.json({ product: updated });
}

export async function deleteProduct(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { id } = req.params;
  const seller = await prisma.sellerProfile.findUnique({
    where: { userId: req.user.userId },
  });

  if (!seller) {
    res.status(403).json({ error: 'Seller not found' });
    return;
  }

  const product = await prisma.product.findFirst({
    where: { id, sellerId: seller.id },
  });

  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  await prisma.product.delete({ where: { id } });

  res.json({ message: 'Product deleted' });
}

export async function submitProduct(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { id } = req.params;
  const seller = await prisma.sellerProfile.findUnique({
    where: { userId: req.user.userId },
  });

  if (!seller) {
    res.status(403).json({ error: 'Seller not found' });
    return;
  }

  const product = await prisma.product.findFirst({
    where: { id, sellerId: seller.id },
  });

  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  const updated = await prisma.product.update({
    where: { id },
    data: { status: ProductStatus.PENDING_APPROVAL },
  });

  res.json({ product: updated });
}

export async function getUploadUrl(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { fileName, mimeType, productId } = req.body;

  const { getSignedUploadUrl } = await import('../lib/s3');
  const { uploadUrl, storageKey } = await getSignedUploadUrl(fileName, mimeType);

  // If productId provided, save file record
  if (productId) {
    const seller = await prisma.sellerProfile.findUnique({
      where: { userId: req.user.userId },
    });

    if (seller) {
      const product = await prisma.product.findFirst({
        where: { id: productId, sellerId: seller.id },
      });

      if (product) {
        await prisma.productFile.create({
          data: {
            productId,
            storageKey,
            fileName,
            fileSize: 0, // Will be updated after upload
            mimeType,
          },
        });
      }
    }
  }

  res.json({ uploadUrl, storageKey });
}


