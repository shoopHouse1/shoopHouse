FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build shared package
RUN pnpm --filter @shoophouse/shared build

# Build backend
RUN pnpm --filter backend build

EXPOSE 3001

CMD ["pnpm", "--filter", "backend", "start"]


