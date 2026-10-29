"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";

type AdsWindow = Window & { adsbygoogle?: Record<string, never>[] };

/** Manual ad placement with its own clearly identifiable advertising section. */
export function EducationalAdClient({ clientId, slotId }: { clientId: string; slotId: string }) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const adsWindow = window as AdsWindow;
    try {
      (adsWindow.adsbygoogle = adsWindow.adsbygoogle || []).push({});
    } catch {
      // Ad blockers should never interfere with reading editorial content.
    }
  }, [slotId]);

  return (
    <section aria-label="Advertisement" className="mx-auto my-8 w-full max-w-4xl border-t border-slate-300/20 pt-5">
      <p className="mb-3 text-center text-xs tracking-widest opacity-70">Advertisement</p>
      <Script
        id="naksharix-adsense-loader"
        src={"https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + clientId}
        strategy="afterInteractive"
        crossOrigin="anonymous"
      />
      <ins
        className="adsbygoogle"
        style={{ display: "block", minHeight: "120px" }}
        data-ad-client={clientId}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </section>
  );
}
