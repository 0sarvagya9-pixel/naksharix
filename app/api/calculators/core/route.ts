import { NextRequest } from "next/server";
import { z } from "zod";
import { ok, handleApiError, validateJson } from "@/lib/api";
import { calculateCoreAstrology, calculateNumerology } from "@/lib/astrology/engine";

const schema = z.object({
  name: z.string().min(2).max(80),
  birthDate: z.coerce.date(),
  birthTime: z.string().regex(/^\d{2}:\d{2}$/),
  latitude: z.coerce.number().min(-90).max(90).default(28.6139),
  longitude: z.coerce.number().min(-180).max(180).default(77.209)
});

export async function POST(request: NextRequest) {
  try {
    const body = await validateJson(request, schema);
    return ok({
      calculators: {
        ...calculateCoreAstrology(body),
        numerology: calculateNumerology(body.name, body.birthDate)
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}
