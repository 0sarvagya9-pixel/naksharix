FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json ./
RUN npm install --ignore-scripts

FROM node:22-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_STANDALONE=true
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/naksharix?schema=public"
ENV JWT_SECRET="naksharix-docker-build-secret-32-characters"
ENV NEXT_PUBLIC_APP_URL="https://naksharix.com"
ENV NEXT_PUBLIC_APP_NAME="Naksharix"
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_STANDALONE=true
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/deploy/docker-entrypoint.sh ./docker-entrypoint.sh
USER root
RUN chmod +x ./docker-entrypoint.sh
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["./docker-entrypoint.sh"]

