import { z } from "zod";

export const birthDetailsSchema = z.object({
  name: z.string().min(2).max(80),
  gender: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(7).max(20).optional().or(z.literal("")),
  zodiac: z.string().optional(),
  category: z.string().optional(),
  locale: z.enum(["en", "hi", "hinglish"]).default("en"),
  birthDate: z.coerce.date(),
  birthTime: z.string().regex(/^\d{2}:\d{2}$/),
  birthPlace: z.string().min(2).max(120),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  timezone: z.string().default("Asia/Kolkata")
});

export const horoscopeRequestSchema = z.object({
  zodiac: z.string().min(3).max(20),
  period: z.enum(["daily", "weekly", "monthly", "yearly"]),
  category: z.enum(["general", "love", "career", "finance", "health", "education", "family", "travel"]).default("general"),
  locale: z.enum(["en", "hi", "hinglish"]).default("en"),
  birthDetails: birthDetailsSchema.optional()
});

export const matchMakingSchema = z.object({
  bride: birthDetailsSchema,
  groom: birthDetailsSchema,
  locale: z.enum(["en", "hi", "hinglish"]).default("en")
});

export const numerologySchema = z.object({
  name: z.string().min(2).max(80),
  dateOfBirth: z.coerce.date(),
  locale: z.enum(["en", "hi", "hinglish"]).default("en"),
  mobile: z.string().optional(),
  vehicle: z.string().optional()
});

export const tarotSchema = z.object({
  spread: z.enum(["daily", "three-card", "love", "career", "celtic-cross"]).default("daily"),
  locale: z.enum(["en", "hi", "hinglish"]).default("en"),
  question: z.string().max(240).optional()
});
