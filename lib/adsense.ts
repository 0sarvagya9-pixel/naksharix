import { env } from "@/lib/env";

export const ADSENSE_CLIENT = "ca-pub-7848529669366564" as const;
export type AdPlacement = "kundli-guide" | "kundli-learning";
const slotPattern = /^[0-9]{6,20}$/;

/** Site approval, certified CMP and launch each require explicit evidence. */
export function adsenseServingReady(): boolean {
  return env.ADSENSE_SITE_APPROVED === "true"
    && env.ADSENSE_CMP_VERIFIED === "true"
    && env.ADSENSE_ENABLE_SERVING === "true";
}

/** Server-side gate; never load the client script for an incomplete release. */
export function getAdSensePlacement(placement: AdPlacement): { client: string; slot: string } | null {
  if (!adsenseServingReady()) return null;
  const slot = placement === "kundli-guide" ? env.ADSENSE_SLOT_KUNDLI_GUIDE : env.ADSENSE_SLOT_KUNDLI_LEARNING;
  if (!slot || !slotPattern.test(slot)) return null;
  return { client: ADSENSE_CLIENT, slot };
}
