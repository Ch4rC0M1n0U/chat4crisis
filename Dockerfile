# Multi-stage build
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* .npmrc* ./ 2>/dev/null || true
RUN npm install --frozen-lockfile || npm install

FROM node:20-alpine AS builder
WORKDIR /app
ENV DATABASE_URL="file:./dev.db"
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npx prisma migrate deploy || npx prisma db push
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL="file:./dev.db"
# Copy sqlite db (will be empty initially)
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/server.js ./server.js

EXPOSE 3000
CMD ["node", "server.js"]
