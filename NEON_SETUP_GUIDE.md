# دليل إعداد قاعدة البيانات على Neon

## الخطوات:

### 1. إنشاء حساب على Neon
- اذهب إلى: https://neon.tech
- سجل حساب جديد (مجاني)
- أنشئ مشروع جديد (Project)

### 2. الحصول على Connection String
- في لوحة تحكم Neon، انقر على "Connection Details"
- انسخ Connection String (يبدو هكذا):
  ```
  postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
  ```

### 3. تشغيل SQL في Neon
- افتح Neon SQL Editor
- انسخ محتوى ملف `database_setup_neon.sql`
- الصقه في SQL Editor
- اضغط Run أو Execute

### 4. تحديث ملف .env
افتح `apps/backend/.env` وحدّث `DATABASE_URL`:

```env
DATABASE_URL="postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"
```

### 5. تشغيل Prisma Migrations
```bash
cd D:\shoopHouse_E
pnpm db:migrate
```

### 6. إضافة البيانات الأولية
```bash
pnpm db:seed
```

## ملاحظات:
- Neon يوفر قاعدة بيانات PostgreSQL مجانية
- Connection String يحتوي على معلومات الاتصال الكاملة
- تأكد من تفعيل SSL (sslmode=require)
- يمكنك استخدام Prisma Studio لعرض البيانات:
  ```bash
  pnpm db:studio
  ```

## استكشاف الأخطاء:
- إذا ظهر خطأ "relation does not exist": تأكد من تشغيل SQL script
- إذا ظهر خطأ اتصال: تحقق من Connection String
- إذا ظهر خطأ SSL: تأكد من إضافة `?sslmode=require`


