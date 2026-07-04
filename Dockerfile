# ---- Build stage ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build

# ---- Production stage ----
FROM node:20-alpine

WORKDIR /app

# Copy node_modules from builder (ensures all runtime deps are present)
COPY --from=builder /app/node_modules ./node_modules

# Copy built output from builder
COPY --from=builder /app/dist ./dist

# Copy data directory (will be mounted as volume in production)
COPY --from=builder /app/data ./data

# Copy public assets (if referenced at runtime)
COPY --from=builder /app/public ./public

# Copy package.json (needed for Node.js ESM resolution)
COPY --from=builder /app/package.json ./package.json

# Environment defaults
ENV NODE_ENV=production
ENV PORT=4321
ENV HOST=0.0.0.0

EXPOSE 4321

CMD ["node", "./dist/server/entry.mjs"]
