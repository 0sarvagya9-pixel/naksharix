import { NextRequest } from "next/server";
import { z } from "zod";
import { handleApiError, ok } from "@/lib/api";
import { checkRateLimit } from "@/lib/rate-limit";

const querySchema = z.string().trim().min(2).max(120);

type NominatimPlace = {
  display_name?: string;
  lat?: string;
  lon?: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
};

const fallbackPlaces = [
  { displayName: "Delhi, India", city: "Delhi", state: "Delhi", country: "India", latitude: 28.6139, longitude: 77.209, timezone: "Asia/Kolkata" },
  { displayName: "Mumbai, Maharashtra, India", city: "Mumbai", state: "Maharashtra", country: "India", latitude: 19.076, longitude: 72.8777, timezone: "Asia/Kolkata" },
  { displayName: "Jaipur, Rajasthan, India", city: "Jaipur", state: "Rajasthan", country: "India", latitude: 26.9124, longitude: 75.7873, timezone: "Asia/Kolkata" },
  { displayName: "London, United Kingdom", city: "London", state: "England", country: "United Kingdom", latitude: 51.5072, longitude: -0.1276, timezone: "Europe/London" },
  { displayName: "New York, United States", city: "New York", state: "New York", country: "United States", latitude: 40.7128, longitude: -74.006, timezone: "America/New_York" }
];

export async function GET(request: NextRequest) {
  try {
    const limitResponse = await checkRateLimit({ request, key: "location-search", limit: 80, windowSeconds: 60 * 10 });
    if (limitResponse) return limitResponse;
    const parsed = querySchema.safeParse(request.nextUrl.searchParams.get("q") ?? "");
    if (!parsed.success) return ok({ suggestions: [] });

    const query = parsed.data;
    const local = fallbackPlaces.filter((place) => place.displayName.toLowerCase().includes(query.toLowerCase()));
    const remote = await searchNominatim(query);
    const suggestions = dedupeLocations([...local, ...remote]).slice(0, 6);
    return ok({ suggestions });
  } catch (error) {
    return handleApiError(error);
  }
}

async function searchNominatim(query: string) {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "6");
  url.searchParams.set("q", query);

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "Naksharix/1.0 location autocomplete"
    },
    next: { revalidate: 60 * 60 * 24 }
  });

  if (!response.ok) return [];

  const places = await response.json() as NominatimPlace[];
  return places.flatMap((place) => {
    const normalized = normalizePlace(place);
    return normalized ? [normalized] : [];
  });
}

function normalizePlace(place: NominatimPlace) {
  const latitude = round(Number(place.lat));
  const longitude = round(Number(place.lon));
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !place.display_name) return null;
  const address = place.address ?? {};
  const country = address.country ?? "";
  return {
    displayName: place.display_name,
    city: address.city ?? address.town ?? address.village ?? address.municipality ?? "",
    state: address.state ?? "",
    country,
    latitude,
    longitude,
    timezone: inferTimezone(address.country_code, longitude)
  };
}

function dedupeLocations<T extends { displayName: string; latitude: number; longitude: number }>(places: T[]) {
  const seen = new Set<string>();
  return places.filter((place) => {
    const key = `${place.displayName.toLowerCase()}|${place.latitude}|${place.longitude}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function inferTimezone(countryCode: string | undefined, longitude: number) {
  const code = countryCode?.toLowerCase();
  if (code === "in") return "Asia/Kolkata";
  if (code === "gb") return "Europe/London";
  if (code === "us") {
    if (longitude <= -115) return "America/Los_Angeles";
    if (longitude <= -100) return "America/Denver";
    if (longitude <= -85) return "America/Chicago";
    return "America/New_York";
  }
  const offset = Math.max(-12, Math.min(14, Math.round(longitude / 15)));
  return offset === 0 ? "UTC" : `Etc/GMT${offset > 0 ? "-" : "+"}${Math.abs(offset)}`;
}

function round(value: number) {
  return Number(value.toFixed(6));
}
