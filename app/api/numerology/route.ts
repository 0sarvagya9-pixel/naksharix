import { NextRequest } from "next/server";
import { ok, handleApiError, validateJson } from "@/lib/api";
import { numerologySchema } from "@/lib/validations/astrology";
import { calculateNumerologyReport } from "@/lib/numerology";

export async function POST(request: NextRequest) {
  try {
    const body = await validateJson(request, numerologySchema);
    return ok({ report: calculateNumerologyReport(body) });
  } catch (error) {
    return handleApiError(error);
  }
}
