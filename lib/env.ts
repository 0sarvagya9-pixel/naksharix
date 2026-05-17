import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url().optional(),
  DIRECT_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(32).optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  JWT_SECRET: z.string().min(32).optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().default("https://naksharix.com"),
  NEXT_PUBLIC_APP_NAME: z.string().default("Naksharix"),
  NEXT_PUBLIC_WHATSAPP_NUMBER: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  REDIS_URL: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  RAZORPAY_KEY_ID: z.string().optional(),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_SECRET: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  ASTROLOGY_PROVIDER: z.enum(["mock", "swiss", "own_engine", "vedic_rishi", "prokerala", "divineapi"]).default("mock"),
  VEDIC_RISHI_USER_ID: z.string().optional(),
  VEDIC_RISHI_API_KEY: z.string().optional(),
  DIVINE_API_KEY: z.string().optional(),
  ASTROLOGY_API_KEY: z.string().optional(),
  PROKERALA_CLIENT_ID: z.string().optional(),
  PROKERALA_CLIENT_SECRET: z.string().optional(),
  VEDASTRO_API_URL: z.string().url().default("https://api.vedastro.org/api"),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  NEXT_PUBLIC_GA_ID: z.string().optional()
});

const parsed = envSchema.parse(process.env);

export const env = {
  ...parsed,
  JWT_SECRET: parsed.JWT_SECRET || parsed.NEXTAUTH_SECRET || "replace-this-development-secret-with-32-characters",
  NEXTAUTH_URL: parsed.NEXTAUTH_URL || parsed.NEXT_PUBLIC_APP_URL,
  RAZORPAY_KEY_SECRET: parsed.RAZORPAY_KEY_SECRET || parsed.RAZORPAY_SECRET,
  NEXT_PUBLIC_RAZORPAY_KEY_ID: parsed.NEXT_PUBLIC_RAZORPAY_KEY_ID || parsed.RAZORPAY_KEY_ID
};

export function validateProductionEnv() {
  const issues: string[] = [];
  if (!env.DATABASE_URL) issues.push("DATABASE_URL is required in production");
  if (!env.JWT_SECRET && !env.NEXTAUTH_SECRET) issues.push("JWT_SECRET or NEXTAUTH_SECRET is required in production");
  if (env.JWT_SECRET.includes("replace-with") || env.JWT_SECRET.includes("development-secret")) issues.push("Production auth secret must not use a placeholder value");
  if (!env.NEXT_PUBLIC_APP_URL.startsWith("https://")) issues.push("NEXT_PUBLIC_APP_URL must use HTTPS in production");
  if (issues.length) throw new Error(`Invalid production environment:\n${issues.join("\n")}`);
}


