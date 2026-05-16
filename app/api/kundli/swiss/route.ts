import { NextResponse } from "next/server";
import { z } from "zod";
import { calculateKundli } from "@/lib/astrology/swiss-kundli";

export const runtime = "nodejs";

const schema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  timezoneOffset: z.union([z.string(), z.number()])
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const kundli = calculateKundli(body.date, body.time, body.latitude, body.longitude, body.timezoneOffset);
    return NextResponse.json({ kundli });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to calculate Kundli.";
    const status = message.includes("Swiss Ephemeris native module") || message.includes("swisseph") ? 503 : 400;
    return NextResponse.json(
      {
        error: status === 503
          ? "Swiss Ephemeris calculation engine is not available on this server."
          : message
      },
      { status }
    );
  }
}
