# Railway Deployment Config

This repo includes:

- `railway.json`
- `nixpacks.toml`

## Railway services

Create:

- Web service from this repository
- PostgreSQL plugin
- Redis plugin

## Environment variables

Set:

```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}
DIRECT_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
NEXTAUTH_SECRET=<32+ character secret>
JWT_SECRET=<same 32+ character secret>
NEXT_PUBLIC_APP_URL=https://naksharix.com
NEXT_PUBLIC_APP_NAME=Naksharix
GEMINI_API_KEY=<Google Gemini API key>
GOOGLE_CLIENT_ID=<Google OAuth client ID>
GOOGLE_CLIENT_SECRET=<Google OAuth client secret>
RAZORPAY_KEY_ID=<Razorpay key ID>
RAZORPAY_SECRET=<Razorpay secret>
STRIPE_SECRET_KEY=<Stripe secret key>
STRIPE_WEBHOOK_SECRET=<Stripe webhook secret>
```

Railway will run:

```bash
prisma migrate deploy && node .next/standalone/server.js
```
