import "server-only";
import { env } from "@/lib/env";
import type { BirthDetails } from "@/lib/astrology/engine";
import { generateFallbackKundli } from "@/lib/astrology/engine";

export async function getSwissEphemerisKundli(details: BirthDetails) {
  // Production deployments can route this to a Python pyswisseph microservice.
  return generateFallbackKundli(details);
}

export async function getAstrologyApiKundli(details: BirthDetails) {
  if (!env.ASTROLOGY_API_KEY) return null;
  const response = await fetch("https://json.astrologyapi.com/v1/planets", {
    method: "POST",
    headers: {
      Authorization: `Basic ${env.ASTROLOGY_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(details),
    next: { revalidate: 3600 }
  });
  if (!response.ok) return null;
  return response.json();
}

export async function getVedAstroPanchang(date: string, location: string) {
  const response = await fetch(`${env.VEDASTRO_API_URL}/Calculate/Panchang/Location/${encodeURIComponent(location)}/Time/${date}`, {
    next: { revalidate: 3600 }
  });
  if (!response.ok) return null;
  return response.json();
}

export async function resolveBestKundli(details: BirthDetails) {
  const providerResult = await getAstrologyApiKundli(details).catch(() => null);
  if (providerResult) return providerResult;
  return getSwissEphemerisKundli(details);
}
