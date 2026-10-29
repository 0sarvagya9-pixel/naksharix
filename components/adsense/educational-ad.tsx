import { getAdSensePlacement, type AdPlacement } from "@/lib/adsense";
import { EducationalAdClient } from "@/components/adsense/educational-ad-client";

/** No ads on checkout, private accounts, birth input forms or unreviewed drafts. */
export function EducationalAd({ placement }: { placement: AdPlacement }) {
  const config = getAdSensePlacement(placement);
  if (!config) return null;
  return <EducationalAdClient clientId={config.client} slotId={config.slot} />;
}
