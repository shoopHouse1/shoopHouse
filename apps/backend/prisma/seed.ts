import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@shoophouse.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@shoophouse.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
      roleId: 1,
    },
  });
  console.log('✅ Created admin user');

  // Create seller user
  const sellerPassword = await bcrypt.hash('Seller123!', 10);
  const sellerUser = await prisma.user.upsert({
    where: { email: 'seller@shoophouse.com' },
    update: {},
    create: {
      name: 'Seller User',
      email: 'seller@shoophouse.com',
      passwordHash: sellerPassword,
      role: 'SELLER',
      roleId: 2,
    },
  });

  const sellerProfile = await prisma.sellerProfile.upsert({
    where: { userId: sellerUser.id },
    update: {},
    create: {
      userId: sellerUser.id,
      displayName: 'Premium Digital Store',
      status: 'APPROVED',
      bio: 'We offer high-quality digital products',
    },
  });

  // Create admin equivalent user (roleId=4)
  const adminEqPassword = await bcrypt.hash('Admin123!', 10);
  const adminEqUser = await prisma.user.upsert({
    where: { email: 'admin-eq@shoophouse.com' },
    update: {},
    create: {
      name: 'Admin Equivalent User',
      email: 'admin-eq@shoophouse.com',
      passwordHash: adminEqPassword,
      role: 'BUYER',
      roleId: 4,
    },
  });
  console.log('✅ Created admin equivalent user (roleId=4)');
  console.log('✅ Created seller user');

  // Create buyer user
  const buyerPassword = await bcrypt.hash('Buyer123!', 10);
  const buyer = await prisma.user.upsert({
    where: { email: 'buyer@shoophouse.com' },
    update: {},
    create: {
      name: 'Buyer User',
      email: 'buyer@shoophouse.com',
      passwordHash: buyerPassword,
      role: 'BUYER',
    },
  });
  console.log('✅ Created buyer user');

  // Create categories
  const category1 = await prisma.category.upsert({
    where: { slug: 'templates' },
    update: {},
    create: {
      nameAr: 'قوالب',
      nameEn: 'Templates',
      slug: 'templates',
    },
  });

  const category2 = await prisma.category.upsert({
    where: { slug: 'graphics' },
    update: {},
    create: {
      nameAr: 'رسوميات',
      nameEn: 'Graphics',
      slug: 'graphics',
    },
  });

  const category3 = await prisma.category.upsert({
    where: { slug: 'documents' },
    update: {},
    create: {
      nameAr: 'مستندات',
      nameEn: 'Documents',
      slug: 'documents',
    },
  });
  console.log('✅ Created categories');

  // Create sample products
  const products = [
    {
      titleAr: 'قالب موقع إلكتروني احترافي',
      titleEn: 'Professional Website Template',
      slug: 'professional-website-template',
      descriptionAr: 'قالب موقع إلكتروني احترافي جاهز للاستخدام',
      descriptionEn: 'Professional website template ready to use',
      price: 29.99,
      categoryId: category1.id,
      tags: ['website', 'template', 'html'],
      status: 'PUBLISHED' as const,
    },
    {
      titleAr: 'مجموعة أيقونات حديثة',
      titleEn: 'Modern Icon Set',
      slug: 'modern-icon-set',
      descriptionAr: 'مجموعة شاملة من الأيقونات الحديثة',
      descriptionEn: 'Comprehensive set of modern icons',
      price: 19.99,
      categoryId: category2.id,
      tags: ['icons', 'graphics', 'ui'],
      status: 'PUBLISHED' as const,
    },
    {
      titleAr: 'دليل التسويق الرقمي',
      titleEn: 'Digital Marketing Guide',
      slug: 'digital-marketing-guide',
      descriptionAr: 'دليل شامل للتسويق الرقمي',
      descriptionEn: 'Comprehensive digital marketing guide',
      price: 39.99,
      categoryId: category3.id,
      tags: ['marketing', 'guide', 'pdf'],
      status: 'PUBLISHED' as const,
    },
    {
      titleAr: 'قوالب PowerPoint احترافية',
      titleEn: 'Professional PowerPoint Templates',
      slug: 'professional-powerpoint-templates',
      descriptionAr: 'مجموعة من قوالب PowerPoint الاحترافية',
      descriptionEn: 'Collection of professional PowerPoint templates',
      price: 24.99,
      categoryId: category1.id,
      tags: ['powerpoint', 'presentation', 'template'],
      status: 'PUBLISHED' as const,
    },
    {
      titleAr: 'صور خلفية عالية الجودة',
      titleEn: 'High Quality Background Images',
      slug: 'high-quality-background-images',
      descriptionAr: 'مجموعة من صور الخلفية عالية الجودة',
      descriptionEn: 'Collection of high quality background images',
      price: 14.99,
      categoryId: category2.id,
      tags: ['background', 'images', 'photos'],
      status: 'PUBLISHED' as const,
    },
    {
      titleAr: 'كتاب إلكتروني عن ريادة الأعمال',
      titleEn: 'Entrepreneurship E-Book',
      slug: 'entrepreneurship-ebook',
      descriptionAr: 'كتاب إلكتروني شامل عن ريادة الأعمال',
      descriptionEn: 'Comprehensive e-book about entrepreneurship',
      price: 34.99,
      categoryId: category3.id,
      tags: ['ebook', 'business', 'entrepreneurship'],
      status: 'PUBLISHED' as const,
    },
    {
      titleAr: 'حساب ChatGPT Pro',
      titleEn: 'ChatGPT Pro Account',
      slug: 'chatgpt-pro-account',
      descriptionAr: 'حساب ChatGPT Pro مع اشتراك شهري كامل - وصول كامل لجميع الميزات المتقدمة',
      descriptionEn: 'ChatGPT Pro account with full monthly subscription - complete access to all advanced features',
      price: 25.00,
      categoryId: category3.id,
      tags: ['chatgpt', 'ai', 'account', 'subscription'],
      status: 'PUBLISHED' as const,
    },
    {
      titleAr: 'حساب Google Premium',
      titleEn: 'Google Premium Account',
      slug: 'google-premium-account',
      descriptionAr: 'حساب Google Premium مع مساحة تخزين غير محدودة - 1 تيرابايت مساحة تخزين ووصول لجميع خدمات Google',
      descriptionEn: 'Google Premium account with unlimited storage - 1TB storage space and access to all Google services',
      price: 30.00,
      categoryId: category3.id,
      tags: ['google', 'account', 'storage', 'premium'],
      status: 'PUBLISHED' as const,
    },
    {
      titleAr: 'حساب Gemini Pro',
      titleEn: 'Gemini Pro Account',
      slug: 'gemini-pro-account',
      descriptionAr: 'حساب Gemini Pro (Google AI) - وصول لجميع ميزات الذكاء الاصطناعي المتقدمة',
      descriptionEn: 'Gemini Pro (Google AI) account - access to all advanced AI features',
      price: 22.00,
      categoryId: category3.id,
      tags: ['gemini', 'ai', 'google', 'account', 'subscription'],
      status: 'PUBLISHED' as const,
    },
    {
      titleAr: 'حساب Midjourney Pro',
      titleEn: 'Midjourney Pro Account',
      slug: 'midjourney-pro-account',
      descriptionAr: 'حساب Midjourney Pro - إنشاء الصور بالذكاء الاصطناعي - وصول لجميع الميزات المتقدمة',
      descriptionEn: 'Midjourney Pro account - AI image generation - access to all advanced features',
      price: 35.00,
      categoryId: category3.id,
      tags: ['midjourney', 'ai', 'image', 'account', 'subscription'],
      status: 'PUBLISHED' as const,
    },
    {
      titleAr: 'حساب Claude Pro (Anthropic)',
      titleEn: 'Claude Pro Account (Anthropic)',
      slug: 'claude-pro-account',
      descriptionAr: 'حساب Claude Pro من Anthropic - نموذج لغوي متقدم للذكاء الاصطناعي',
      descriptionEn: 'Claude Pro account from Anthropic - advanced AI language model',
      price: 28.00,
      categoryId: category3.id,
      tags: ['claude', 'ai', 'anthropic', 'account', 'subscription'],
      status: 'PUBLISHED' as const,
    },
    {
      titleAr: 'حساب Adobe Creative Cloud',
      titleEn: 'Adobe Creative Cloud Account',
      slug: 'adobe-creative-cloud-account',
      descriptionAr: 'اشتراك Adobe Creative Cloud - وصول لجميع تطبيقات Adobe مثل Photoshop وIllustrator',
      descriptionEn: 'Adobe Creative Cloud subscription - access to all Adobe apps like Photoshop and Illustrator',
      price: 60.00,
      categoryId: category3.id,
      tags: ['adobe', 'creative', 'subscription', 'account'],
      status: 'PUBLISHED' as const,
    },
    {
      titleAr: 'حساب Netflix Premium',
      titleEn: 'Netflix Premium Account',
      slug: 'netflix-premium-account',
      descriptionAr: 'حساب Netflix Premium - بث عالي الجودة 4K لعدة أجهزة في وقت واحد',
      descriptionEn: 'Netflix Premium account - high quality 4K streaming for multiple devices simultaneously',
      price: 18.00,
      categoryId: category3.id,
      tags: ['netflix', 'streaming', 'premium', 'account', 'subscription'],
      status: 'PUBLISHED' as const,
    },
    {
      titleAr: 'حساب Microsoft 365',
      titleEn: 'Microsoft 365 Account',
      slug: 'microsoft-365-account',
      descriptionAr: 'اشتراك Microsoft 365 - وصول لتطبيقات Office وOneDrive وOutlook',
      descriptionEn: 'Microsoft 365 subscription - access to Office apps, OneDrive, and Outlook',
      price: 80.00,
      categoryId: category3.id,
      tags: ['microsoft', 'office', '365', 'subscription', 'account'],
      status: 'PUBLISHED' as const,
    },
    {
      titleAr: 'حساب GitHub Pro',
      titleEn: 'GitHub Pro Account',
      slug: 'github-pro-account',
      descriptionAr: 'حساب GitHub Pro - وصول لجميع ميزات المطور المتقدمة والمخازن الخاصة',
      descriptionEn: 'GitHub Pro account - access to all advanced developer features and private repositories',
      price: 7.00,
      categoryId: category3.id,
      tags: ['github', 'developer', 'pro', 'account', 'subscription'],
      status: 'PUBLISHED' as const,
    },
  ];

  for (const productData of products) {
    // Determine appropriate image based on product slug
    let imageUrl = 'https://placehold.co/800x600?text=Product+Image';
    
    if (productData.slug.includes('website')) {
      imageUrl = 'https://placehold.co/800x600?text=Website+Template';
    } else if (productData.slug.includes('icon')) {
      imageUrl = 'https://placehold.co/800x600?text=Icon+Set';
    } else if (productData.slug.includes('marketing')) {
      imageUrl = 'https://placehold.co/800x600?text=Marketing+Guide';
    } else if (productData.slug.includes('powerpoint')) {
      imageUrl = 'https://placehold.co/800x600?text=PowerPoint+Templates';
    } else if (productData.slug.includes('background')) {
      imageUrl = 'https://placehold.co/800x600?text=Background+Images';
    } else if (productData.slug.includes('ebook')) {
      imageUrl = 'https://placehold.co/800x600?text=E-Book';
    } else if (productData.slug.includes('chatgpt')) {
      imageUrl = 'https://placehold.co/800x600?text=ChatGPT+Pro';
    } else if (productData.slug.includes('google')) {
      imageUrl = 'https://placehold.co/800x600?text=Google+Premium';
    } else if (productData.slug.includes('gemini')) {
      imageUrl = 'https://placehold.co/800x600?text=Gemini+Pro';
    } else if (productData.slug.includes('midjourney')) {
      imageUrl = 'https://placehold.co/800x600?text=Midjourney+Pro';
    } else if (productData.slug.includes('claude')) {
      imageUrl = 'https://placehold.co/800x600?text=Claude+Pro';
    } else if (productData.slug.includes('adobe')) {
      imageUrl = 'https://placehold.co/800x600?text=Adobe+Creative+Cloud';
    } else if (productData.slug.includes('netflix')) {
      imageUrl = 'https://placehold.co/800x600?text=Netflix+Premium';
    } else if (productData.slug.includes('microsoft')) {
      imageUrl = 'https://placehold.co/800x600?text=Microsoft+365';
    } else if (productData.slug.includes('github')) {
      imageUrl = 'https://placehold.co/800x600?text=GitHub+Pro';
    }
    
    await prisma.product.upsert({
      where: { slug: productData.slug },
      update: {},
      create: {
        ...productData,
        sellerId: sellerProfile.id,
        images: {
          create: [
            {
              url: imageUrl,
              order: 0,
            },
          ],
        },
      },
    });
  }
  console.log('✅ Created products');

  // Create settings
  await prisma.setting.upsert({
    where: { key: 'whatsappNumber' },
    update: {},
    create: {
      key: 'whatsappNumber',
      value: '+962791433341',
    },
  });

  await prisma.setting.upsert({
    where: { key: 'downloadExpiryHours' },
    update: {},
    create: {
      key: 'downloadExpiryHours',
      value: '24',
    },
  });

  await prisma.setting.upsert({
    where: { key: 'downloadMaxAttempts' },
    update: {},
    create: {
      key: 'downloadMaxAttempts',
      value: '3',
    },
  });
  console.log('✅ Created settings');

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

