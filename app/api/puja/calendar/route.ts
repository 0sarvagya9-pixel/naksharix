import { NextResponse } from "next/server";
import { nextTwoYearsPujaCalendar } from "@/lib/puja/observances";
export const dynamic = "force-dynamic";
// Informational public feed only, no live vendor import or auto-booking.
export async function GET() {
  return NextResponse.json({ data: nextTwoYearsPujaCalendar() }, {
    headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" }
  });
}
