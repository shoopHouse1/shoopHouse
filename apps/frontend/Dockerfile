FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files and workspace configuration
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build shared package
RUN pnpm --filter @shoophouse/shared build

# Build frontend
RUN pnpm --filter frontend build

EXPOSE 5173

CMD ["pnpm", "--filter", "frontend", "preview"]


