import "server-only";
import Stripe from "stripe";
import { env } from "@/lib/env";

export const stripe = env.STRIPE_SECRET_KEY
  ? new Stripe(env.STRIPE_SECRET_KEY)
  : null;

export const stripePrices = {
  PREMIUM: process.env.STRIPE_PREMIUM_PRICE_ID,
  VIP: process.env.STRIPE_VIP_PRICE_ID
};
