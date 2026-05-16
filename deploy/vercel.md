# Vercel Deployment Config

## Project settings

- Framework preset: Next.js
- Install command: `npm install`
- Build command: `prisma generate && next build`
- Output directory: `.next`

## Environment variables

Add all required values from `.env.example` in Vercel Project Settings -> Environment Variables.

Minimum required:

```bash
DATABASE_URL
DIRECT_URL
NEXTAUTH_SECRET
JWT_SECRET
NEXT_PUBLIC_APP_URL=https://naksharix.com
NEXT_PUBLIC_APP_NAME=Naksharix
GEMINI_API_KEY
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
RAZORPAY_KEY_ID
RAZORPAY_SECRET
REDIS_URL
```

## Database migrations

Run migrations separately when `DATABASE_URL` is configured and before routing production traffic:

```bash
prisma migrate deploy
```

For hosted Postgres providers, use connection pooling for `DATABASE_URL` and direct connection for `DIRECT_URL`.

