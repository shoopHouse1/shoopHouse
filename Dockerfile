FROM node:18-bullseye
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files and workspace configuration
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Generate Prisma client
RUN cd apps/backend && pnpm prisma generate

# Build shared package
RUN pnpm --filter @shoophouse/shared build



# Build backend
RUN pnpm --filter backend build

EXPOSE 3001

CMD ["pnpm", "--filter", "backend", "start"]


