import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(120),
  locale: z.enum(["en", "hi", "hinglish"]).default("en"),
  role: z.enum(["USER", "ASTROLOGER", "CONSULTANT"]).default("USER")
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(120),
  roleIntent: z.enum(["USER", "ASTROLOGER"]).default("USER")
});

export const otpSchema = z.object({
  destination: z.string().min(5),
  purpose: z.enum(["EMAIL_VERIFY", "PHONE_VERIFY", "PASSWORD_RESET"]),
  code: z.string().length(6)
});
