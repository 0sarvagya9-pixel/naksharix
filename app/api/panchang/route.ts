import { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api";
import { getPanchang } from "@/lib/astrology/engine";

export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.searchParams;
    const date = search.get("date") ? new Date(search.get("date")!) : new Date();
    const lat = Number(search.get("lat") ?? 28.6139);
    const lng = Number(search.get("lng") ?? 77.209);
    return ok({ panchang: getPanchang(date, lat, lng) });
  } catch (error) {
    return handleApiError(error);
  }
}
