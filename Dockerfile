# ==============================================================================
# 3Talaba Campus — Production Standalone Dockerfile (Minimal, Xavfsiz, Tezkor)
# ==============================================================================
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat openssl

# 1-Bosqich: Paketlarni o'rnatish
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN npm ci

# 2-Bosqich: Production Build (Standalone rejimida)
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV DOCKER_BUILD=1
RUN npx prisma generate --schema=prisma/schema.postgresql.prisma
RUN npm run build

# 3-Bosqich: Minimal Production Runtime (Non-root foydalanuvchi bilan)
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Tashqi tarmoqqa chiqmasligi uchun faqat konteyner ichki interfeysida tinglaydi
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
