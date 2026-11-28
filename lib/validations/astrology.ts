import { z } from "zod";
import {isNumerologyBirthDate, isNumerologyMobile, isNumerologyVehicle} from "@/lib/numerology/input";
import {isFullRomanNumerologyName} from "@/lib/numerology/name";

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
  year: z.number().int().min(1900).max(2100).optional(),
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
  name: z.string().trim().min(2).max(80).refine(isFullRomanNumerologyName, "Enter the complete name spelling using A–Z letters."),
  dateOfBirth: z.string().refine(isNumerologyBirthDate, "Enter a valid date of birth in YYYY-MM-DD format."),
  locale: z.enum(["en", "hi", "hinglish"]).default("en"),
  mobile: z.string().refine(value => !value.trim() || isNumerologyMobile(value), "Enter a valid mobile number.").optional(),
  vehicle: z.string().refine(value => !value.trim() || isNumerologyVehicle(value), "Enter a valid vehicle number.").optional()
});

export const tarotSchema = z.object({
  spread: z.enum(["daily", "three-card", "love", "career", "celtic-cross"]).default("daily"),
  locale: z.enum(["en", "hi", "hinglish"]).default("en"),
  question: z.string().max(240).optional()
});
