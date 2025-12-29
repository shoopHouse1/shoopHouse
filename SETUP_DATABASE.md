# إعداد قاعدة البيانات - Database Setup

## الطريقة السريعة (Quick Method)

### 1. تثبيت PostgreSQL
قم بتنزيل وتثبيت PostgreSQL من: https://www.postgresql.org/download/windows/

### 2. إنشاء قاعدة البيانات
افتح `psql` أو `pgAdmin` وقم بتنفيذ:

```sql
CREATE DATABASE shoophouse;
CREATE USER shoophouse WITH PASSWORD 'shoophouse_dev';
GRANT ALL PRIVILEGES ON DATABASE shoophouse TO shoophouse;
```

### 3. تشغيل Migrations
```bash
cd D:\shoopHouse_E
pnpm db:migrate
pnpm db:seed
```

## أو استخدام Docker (If Docker Available)

```bash
docker compose up -d postgres
pnpm db:migrate
pnpm db:seed
```

## بعد إعداد قاعدة البيانات

الخوادم ستعمل تلقائياً:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001/api

## بيانات الدخول الافتراضية

- Admin: admin@shoophouse.com / Admin123!
- Admin Equivalent (roleId=4): admin-eq@shoophouse.com / Admin123!
- Seller: seller@shoophouse.com / Seller123!
- Buyer: buyer@shoophouse.com / Buyer123!


