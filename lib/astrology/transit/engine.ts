import type { TransitEngineStatus, TransitFoundationResult, TransitCalculationInput, TransitTimelineEvent, TransitPosition } from "@/lib/astrology/transit/types";
import { calculateInternalChart } from "@/lib/astrology/premium-engine/chart";

const PROVIDER = "naksharix_astronomy_engine_lahiri_internal";

export function getTransitEngineStatus(): TransitEngineStatus {
  return {
    status: "blocked_until_verified_fixtures",
    verified: false,
    publicPredictionEnabled: false,
    reason: "Transit/gochar positions and internally refined event times are calculated, but trusted external ingress/station fixtures are still required before public prediction activation.",
    requiredBeforeActivation: [
      "Trusted ingress and retrograde fixtures for Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, and Ketu.",
      "External tolerance comparison for internally refined event timestamps.",
      "Natal chart overlay interpretation rules for personalized transit results.",
      "Non-personalized educational content boundaries for any public transit page.",
      "Sitemap/robots review before route promotion."
    ]
  };
}

export function createBlockedTransitFoundationResult(input: TransitCalculationInput | null = null): TransitFoundationResult {
  return {
    input,
    positions: [],
    ingressWindows: [],
    metadata: {
      provider: "naksharix_transit_foundation",
      verificationLevel: "blocked_until_provider_ready",
      publicPredictionEnabled: false,
      limitations: [
        "No public transit prediction is enabled.",
        "No unverified transit dates are promoted as factual predictions.",
        "Exact transit validation requires trusted external ephemeris fixtures."
      ]
    }
  };
}

function chartAt(input: TransitCalculationInput, date: string, time: string, timezone = input.timezone) {
  return calculateInternalChart({
    date,
    time,
    timezone,
    latitude: input.latitude ?? input.natalChart?.latitude ?? 0,
    longitude: input.longitude ?? input.natalChart?.longitude ?? 0,
    birthPlace: input.place ?? "Transit reference",
    ayanamsa: input.ayanamsa
  });
}

function toTransitPositions(chart: ReturnType<typeof calculateInternalChart>): TransitPosition[] {
  return chart.planets.map((planet) => ({
    planet: planet.planet,
    sign: planet.sign,
    degree: planet.degree,
    absoluteLongitude: planet.absoluteLongitude ?? null,
    retrograde: planet.retrograde ?? null,
    verified: true
  }));
}

export function calculateInternalTransitSnapshot(input: TransitCalculationInput): TransitFoundationResult {
  const chart = chartAt(input, input.date, "12:00");

  return {
    input,
    positions: toTransitPositions(chart),
    ingressWindows: [],
    timeline: [],
    natalOverlay: {
      enabled: false,
      reason: "Natal overlay is not active until verified birth chart fixtures and transit interpretation rules are available."
    },
    metadata: {
      provider: PROVIDER,
      verificationLevel: "provider_verified",
      publicPredictionEnabled: false,
      limitations: [
        "Transit positions are provider-regression-tested for fixed dates.",
        "Daily provider scan is available for broad event windows.",
        "Minute-refined internal event search is available but requires external fixture validation before public factual claims.",
        "No personalized transit prediction should be activated from this internal snapshot alone."
      ]
    }
  };
}

export function calculateUpcomingTransitTimeline(input: TransitCalculationInput, days = 45): TransitTimelineEvent[] {
  const normalizedDays = Math.max(1, Math.min(days, 180));
  const events: TransitTimelineEvent[] = [];
  let previous = calculateInternalTransitSnapshot(input);

  for (let offset = 1; offset <= normalizedDays; offset += 1) {
    const date = addDays(input.date, offset);
    const current = calculateInternalTransitSnapshot({ ...input, date });

    for (const currentPosition of current.positions) {
      const previousPosition = previous.positions.find((position) => position.planet === currentPosition.planet);
      if (!previousPosition) continue;

      if (previousPosition.sign !== currentPosition.sign) {
        events.push({
          planet: currentPosition.planet,
          eventType: "sign_ingress",
          date,
          from: previousPosition.sign,
          to: currentPosition.sign,
          degree: currentPosition.degree,
          source: PROVIDER,
          verificationLevel: "provider_verified",
          precision: "daily_provider_scan",
          externalValidationRequired: true,
          note: "Detected by comparing daily provider snapshots; use the refined internal search for a narrower timestamp, then validate externally before publication."
        });
      }

      if (typeof previousPosition.retrograde === "boolean" && typeof currentPosition.retrograde === "boolean" && previousPosition.retrograde !== currentPosition.retrograde) {
        events.push({
          planet: currentPosition.planet,
          eventType: currentPosition.retrograde ? "station_retrograde" : "station_direct",
          date,
          from: previousPosition.retrograde,
          to: currentPosition.retrograde,
          degree: currentPosition.degree,
          source: PROVIDER,
          verificationLevel: "provider_verified",
          precision: "daily_provider_scan",
          externalValidationRequired: true,
          note: "Detected by provider retrograde flag changes between daily snapshots; external fixtures remain required before publication."
        });
      }
    }

    previous = current;
  }

  return events;
}

function positionsAtUtc(input: TransitCalculationInput, instant: Date) {
  const iso = instant.toISOString();
  const chart = chartAt(input, iso.slice(0, 10), iso.slice(11, 19), "0");
  return toTransitPositions(chart);
}

function stateChanged(eventType: TransitTimelineEvent["eventType"], before: TransitPosition, after: TransitPosition) {
  if (eventType === "sign_ingress") return before.sign !== after.sign;
  return typeof before.retrograde === "boolean" && typeof after.retrograde === "boolean" && before.retrograde !== after.retrograde;
}

function findPosition(positions: TransitPosition[], planet: TransitTimelineEvent["planet"]) {
  return positions.find((position) => position.planet === planet);
}

function refineTransitionTime(
  input: TransitCalculationInput,
  planet: TransitTimelineEvent["planet"],
  eventType: TransitTimelineEvent["eventType"],
  left: Date,
  right: Date
) {
  let low = new Date(left);
  let high = new Date(right);
  let lowPosition = findPosition(positionsAtUtc(input, low), planet);
  let highPosition = findPosition(positionsAtUtc(input, high), planet);
  if (!lowPosition || !highPosition || !stateChanged(eventType, lowPosition, highPosition)) return null;

  for (let iteration = 0; iteration < 24 && high.getTime() - low.getTime() > 60_000; iteration += 1) {
    const mid = new Date(Math.floor((low.getTime() + high.getTime()) / 2));
    const midPosition = findPosition(positionsAtUtc(input, mid), planet);
    if (!midPosition) return null;
    if (stateChanged(eventType, lowPosition, midPosition)) {
      high = mid;
      highPosition = midPosition;
    } else {
      low = mid;
      lowPosition = midPosition;
    }
  }

  return { occurredAt: high.toISOString(), before: lowPosition, after: highPosition };
}

export function calculateRefinedTransitTimeline(input: TransitCalculationInput, days = 45): TransitTimelineEvent[] {
  const normalizedDays = Math.max(1, Math.min(days, 180));
  const events: TransitTimelineEvent[] = [];
  let left = new Date(`${input.date}T00:00:00.000Z`);
  let leftPositions = positionsAtUtc(input, left);

  for (let offset = 1; offset <= normalizedDays; offset += 1) {
    const right = new Date(left.getTime() + 86_400_000);
    const rightPositions = positionsAtUtc(input, right);

    for (const after of rightPositions) {
      const before = findPosition(leftPositions, after.planet);
      if (!before) continue;

      const candidates: TransitTimelineEvent["eventType"][] = [];
      if (before.sign !== after.sign) candidates.push("sign_ingress");
      if (typeof before.retrograde === "boolean" && typeof after.retrograde === "boolean" && before.retrograde !== after.retrograde) {
        candidates.push(after.retrograde ? "station_retrograde" : "station_direct");
      }

      for (const eventType of candidates) {
        const refined = refineTransitionTime(input, after.planet, eventType, left, right);
        if (!refined) continue;
        const refinedAfter = refined.after;
        events.push({
          planet: after.planet,
          eventType,
          date: refined.occurredAt.slice(0, 10),
          occurredAt: refined.occurredAt,
          from: eventType === "sign_ingress" ? refined.before.sign : refined.before.retrograde,
          to: eventType === "sign_ingress" ? refinedAfter.sign : refinedAfter.retrograde,
          degree: refinedAfter.degree,
          source: PROVIDER,
          verificationLevel: "needs_external_validation",
          precision: "minute_internal_search",
          externalValidationRequired: true,
          note: "Internally refined to an approximately one-minute bracket using repeated provider calculations. External ephemeris fixtures are required before public factual use."
        });
      }
    }

    left = right;
    leftPositions = rightPositions;
  }

  return events;
}

function addDays(dateText: string, days: number) {
  const date = new Date(`${dateText}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
