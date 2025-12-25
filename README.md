# ShoopHouse - Digital Files Marketplace

A premium, production-ready marketplace platform for selling digital files with WhatsApp-based payment workflow.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Docker & Docker Compose
- PostgreSQL 15+ (or use Docker)

### Setup Steps

1. **Clone and install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up environment variables:**
   ```bash
   # Backend
   cp apps/backend/.env.example apps/backend/.env
   # Edit apps/backend/.env with your values
   
   # Frontend
   cp apps/frontend/.env.example apps/frontend/.env
   # Edit apps/frontend/.env if needed
   ```

3. **Start Docker services (PostgreSQL):**
   ```bash
   docker compose up -d postgres
   ```

4. **Run database migrations:**
   ```bash
   pnpm db:migrate
   ```

5. **Seed the database:**
   ```bash
   pnpm db:seed
   ```

6. **Start development servers:**
   ```bash
   pnpm dev
   ```

   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001/api
   - API Docs: http://localhost:3001/api/docs

### Default Login Credentials

- **Admin**: admin@shoophouse.com / Admin123!
- **Admin Equivalent** (roleId=4): admin-eq@shoophouse.com / Admin123!
- **Seller**: seller@shoophouse.com / Seller123!
- **Buyer**: buyer@shoophouse.com / Buyer123!

## 📁 Project Structure

```
shoophouse/
├── apps/
│   ├── frontend/     # React + Vite + TypeScript
│   └── backend/      # Express + TypeScript + Prisma
├── packages/
│   └── shared/       # Shared types + Zod schemas
├── docker-compose.yml
└── package.json
```

## 🛠️ Available Scripts

- `pnpm dev` - Start all apps in development mode
- `pnpm build` - Build all apps for production
- `pnpm start` - Start all apps in production mode
- `pnpm db:migrate` - Run database migrations
- `pnpm db:seed` - Seed database with demo data
- `pnpm db:studio` - Open Prisma Studio

## 🌐 Neon Database Setup

This project is configured to use Neon as the PostgreSQL database provider. To complete the setup:

1. Update your database credentials in `apps/backend/.env`
2. Update the database credentials in `docker-compose.yml`
3. Run `pnpm db:migrate` to set up the database schema
4. Run `pnpm db:seed` to populate initial data

For detailed instructions, see `NEON_DATABASE_SETUP_INSTRUCTIONS.md`.

## 🌐 Features

- **Multi-role system**: Buyer, Seller, Admin
- **WhatsApp payment workflow**: Manual payment confirmation
- **Cloud database**: Neon PostgreSQL database integration
- **Enhanced role system**: Support for numeric role IDs where roleId=4 grants admin equivalent access
- **Secure digital delivery**: Time-limited download tokens
- **Bilingual support**: English + Arabic (RTL)
- **Premium UI**: Dark/Light theme, smooth animations
- **File storage**: S3-compatible storage integration
- **Admin dashboard**: Complete moderation and management tools

## 📦 Deployment

### VPS Deployment (Ubuntu/Debian)

1. **Install dependencies:**
   ```bash
   curl -fsSL https://get.pnpm.io/install.sh | sh -
   sudo apt-get install docker.io docker-compose
   ```

2. **Clone and setup:**
   ```bash
   git clone <repo>
   cd shoophouse
   pnpm install
   ```

3. **Configure environment:**
   - Set all required env vars in `apps/backend/.env`
   - Configure S3/R2 credentials
   - Set production `DATABASE_URL`

4. **Build and start:**
   ```bash
   pnpm build
   docker compose -f docker-compose.prod.yml up -d
   ```

5. **Run migrations:**
   ```bash
   pnpm db:migrate
   ```

### Render.com / Fly.io

1. Set environment variables in dashboard
2. Build command: `pnpm build`
3. Start command: `pnpm start`
4. Run migrations: `pnpm db:migrate`

## 🔐 Environment Variables

See `.env.example` files in each app directory for required variables.

## 📝 License

Proprietary - All rights reserved


# ShoopHouse
