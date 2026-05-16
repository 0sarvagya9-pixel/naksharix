# Naksharix Production Build Setup

## Required runtime

- Node.js 22 LTS
- npm 10+
- PostgreSQL 16+
- Redis 7+

## Build commands

```bash
npm install
npm run db:generate
npm run verify
npm run db:deploy
npm run start:standalone
```

## Required production environment variables

Set these in your host, Vercel, Railway, or `.env` file:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/naksharix?schema=public"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/naksharix?schema=public"
NEXTAUTH_SECRET="replace-with-a-random-32-plus-character-secret"
JWT_SECRET="replace-with-a-random-32-plus-character-secret"
NEXT_PUBLIC_APP_URL="https://naksharix.com"
NEXT_PUBLIC_APP_NAME="Naksharix"
GEMINI_API_KEY=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
RAZORPAY_KEY_ID=""
RAZORPAY_SECRET=""
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
REDIS_URL="redis://HOST:6379"
```

## Health check

Use:

```text
GET /api/health
```
