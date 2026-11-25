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
    speedDegreesPerDay: planet.speedDegreesPerDay ?? null,
    motionState: planet.motionState,
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
    const mid = new Date(Math.floor((low.getTime() + high.getTime()) / 2000)*1000);
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

  if(!stateChanged(eventType,lowPosition,highPosition))return null;
  return { occurredAt: high.toISOString(), bracketStartUtc:low.toISOString(),bracketEndUtc:high.toISOString(),bracketSeconds:(high.getTime()-low.getTime())/1000,before: lowPosition, after: highPosition };
}

/** Refined search uses an explicitly UTC day interval. The minute bracket
 * is a numerical search resolution, not a measured one-minute accuracy.
 * Public predictive activation remains locked.
 */
export function calculateRefinedTransitTimeline(input: TransitCalculationInput, days = 45): TransitTimelineEvent[] {
  if(input.ayanamsa!=="lahiri")throw Error("TRANSIT_AYANAMSA_UNQUALIFIED");
  if(!Number.isInteger(days)||days<1||days>180)throw Error("TRANSIT_WINDOW_INVALID");
  if(!/^\d{4}-\d{2}-\d{2}$/.test(input.date))throw Error("TRANSIT_DATE_INVALID");
  const start=new Date(input.date+"T00:00:00.000Z");
  if(!Number.isFinite(start.getTime())||start.toISOString().slice(0,10)!==input.date)throw Error("TRANSIT_DATE_INVALID");
  const events:TransitTimelineEvent[]=[];
  const emit=(planet:TransitTimelineEvent["planet"],eventType:TransitTimelineEvent["eventType"],refined:NonNullable<ReturnType<typeof refineTransitionTime>>)=>{
    const after=refined.after,before=refined.before;
    events.push({planet,eventType,date:refined.occurredAt.slice(0,10),occurredAt:refined.occurredAt,
      bracketStartUtc:refined.bracketStartUtc,bracketEndUtc:refined.bracketEndUtc,bracketSeconds:refined.bracketSeconds,
      from:eventType==="sign_ingress"?before.sign:before.retrograde,
      to:eventType==="sign_ingress"?after.sign:after.retrograde,
      degree:after.degree,source:PROVIDER,verificationLevel:"needs_external_validation",precision:"minute_internal_search",externalValidationRequired:true,
      note:"Six-hour search checkpoints, refined to a one-minute internal bracket. Physical ephemeris errors may be larger; very short unbracketed excursions are not exhaustively qualified."});
  };
  const findIngress=(planet:TransitTimelineEvent["planet"],a:TransitPosition,b:TransitPosition,lo:Date,hi:Date)=>{
    if(a.sign===b.sign)return;
    const r=refineTransitionTime(input,planet,"sign_ingress",lo,hi);
    if(r)emit(planet,"sign_ingress",r);
  };
  let left=start,leftPositions=positionsAtUtc(input,left);
  for(let n=1;n<=days*4;n++){
    const right=new Date(start.getTime()+n*6*3600000),rightPositions=positionsAtUtc(input,right);
    for(const after of rightPositions){
      const before=findPosition(leftPositions,after.planet);
      if(!before)continue;
      const reversed=typeof before.retrograde==="boolean"&&typeof after.retrograde==="boolean"&&before.retrograde!==after.retrograde;
      if(reversed){
        const type=after.retrograde?"station_retrograde":"station_direct";
        const station=refineTransitionTime(input,after.planet,type,left,right);
        if(station){
          emit(after.planet,type,station);
          // A reversal can hide ingress and return within a single scan
          // interval even when the endpoint signs agree. Check both sides.
          const pivot=new Date(station.occurredAt);
          findIngress(after.planet,before,station.after,left,pivot);
          findIngress(after.planet,station.after,after,pivot,right);
          continue;
        }
      }
      findIngress(after.planet,before,after,left,right);
    }
    left=right;leftPositions=rightPositions;
  }
  return events.sort((a,b)=>(a.occurredAt??"").localeCompare(b.occurredAt??"")||a.planet.localeCompare(b.planet)||a.eventType.localeCompare(b.eventType));
}

function addDays(dateText: string, days: number) {
  const date = new Date(`${dateText}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
