import { NextRequest } from "next/server";
import { ok, handleApiError, validateJson } from "@/lib/api";
import { numerologySchema } from "@/lib/validations/astrology";
import { calculateNumerology } from "@/lib/astrology/engine";

export async function POST(request: NextRequest) {
  try {
    const body = await validateJson(request, numerologySchema);
    return ok({ report: calculateNumerology(body.name, body.dateOfBirth) });
  } catch (error) {
    return handleApiError(error);
  }
}
