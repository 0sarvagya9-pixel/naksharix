import type { AstrologyBirthInput, AstrologyLanguage, KundliMatchReport, KundliReport, PersonalizedHoroscopeReport } from "@/lib/astrology/types";

export type UserRecord = {
  id: string;
  email?: string;
  role: "USER" | "ASTROLOGER" | "CONSULTANT" | "ADMIN";
  createdAt: string;
};

export type BirthProfileRecord = {
  id: string;
  userId?: string;
  reportHash: string;
  birthDetails: AstrologyBirthInput;
  language: AstrologyLanguage;
  createdAt: string;
};

export type KundliReportRecord = {
  id: string;
  userId?: string;
  reportHash: string;
  birthDetails: AstrologyBirthInput;
  calculationData: KundliReport;
  aiInterpretation: string;
  language: AstrologyLanguage;
  reportType: "FREE_KUNDLI" | "PREMIUM_KUNDLI";
  pdfType?: "FREE" | "PREMIUM";
  pdfUrl?: string;
  createdAt: string;
};

export type KundliMatchReportRecord = {
  id: string;
  userId?: string;
  reportHash: string;
  brideDetails: AstrologyBirthInput;
  groomDetails: AstrologyBirthInput;
  calculationData: KundliMatchReport;
  aiInterpretation: string;
  language: AstrologyLanguage;
  createdAt: string;
};

export type PersonalizedPredictionRecord = {
  id: string;
  userId?: string;
  reportHash: string;
  birthDetails: AstrologyBirthInput;
  calculationData: PersonalizedHoroscopeReport;
  aiInterpretation: string;
  language: AstrologyLanguage;
  reportType: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  createdAt: string;
};

export type PdfReportRecord = {
  id: string;
  userId?: string;
  reportHash: string;
  pdfType: "FREE" | "PREMIUM";
  pdfUrl?: string;
  createdAt: string;
};

export type ApiUsageLogRecord = {
  id: string;
  userId?: string;
  action: string;
  count: number;
  windowStart: string;
  createdAt: string;
};

export type SubscriptionRecord = {
  id: string;
  userId: string;
  plan: "FREE" | "PREMIUM_MONTHLY" | "PREMIUM_YEARLY" | "VIP";
  status: "ACTIVE" | "PAUSED" | "CANCELLED";
  createdAt: string;
};

export type SavedReportRecord = {
  id: string;
  userId: string;
  reportHash: string;
  reportType: string;
  createdAt: string;
};
