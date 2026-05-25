import { NextRequest } from "next/server";
import { z } from "zod";
import { fail, handleApiError, ok } from "@/lib/api";
import { calculatePremiumPanchang } from "@/lib/astrology/premium-engine/panchang";

const querySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  timezone: z.string().regex(/^[+-]\d{2}:\d{2}$/),
  place: z.string().min(2).max(120).optional()
});

export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsed = querySchema.safeParse(params);
    if (!parsed.success) {
      return fail("Valid date, latitude, longitude, and timezone are required for Panchang calculation.", 422, parsed.error.flatten());
    }

    const panchang = calculatePremiumPanchang(parsed.data);
    if (panchang.metadata.missingFields.length) {
      return fail("Panchang calculation is incomplete for the selected location/date.", 422, {
        missingFields: panchang.metadata.missingFields
      });
    }

    return ok({ panchang });
  } catch (error) {
    return handleApiError(error);
  }
}
