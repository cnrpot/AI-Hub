# ---- Build stage ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts --legacy-peer-deps

COPY . .
RUN npm run build

# ---- Production stage ----
FROM node:20-alpine

WORKDIR /app

# Install only production dependencies for the standalone server
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts --legacy-peer-deps && npm cache clean --force

# Copy built output from builder
COPY --from=builder /app/dist ./dist

# Copy data directory (will be mounted as volume in production)
COPY --from=builder /app/data ./data

# Copy public assets (if referenced at runtime)
COPY --from=builder /app/public ./public

# Environment defaults
ENV NODE_ENV=production
ENV PORT=4321
ENV HOST=0.0.0.0

EXPOSE 4321

CMD ["node", "./dist/server/entry.mjs"]
