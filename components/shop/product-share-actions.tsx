"use client";

import { useState } from "react";
import { Check, Copy, MessageCircle } from "lucide-react";

type Props = { name: string; productUrl: string };

/** No customer contact list, tracker, external script or paid service.
 * A buyer chooses whom to share the direct product URL with. */
export function ProductShareActions({ name, productUrl }: Props) {
  const [feedback, setFeedback] = useState("");
  const text = `See ${name} on NAKSHARIX. Check the current item details and price before ordering: ${productUrl}`;
  const whatsapp = "https://wa.me/?text=" + encodeURIComponent(text);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(productUrl);
      setFeedback("Product link copied.");
    } catch {
      setFeedback("Copy was blocked by your browser. You can copy the link from the address bar.");
    }
  }

  return (
    <section className="mt-5 rounded-2xl border border-[#ddc19b] bg-[#fffaf1] p-4" aria-label="Share this product">
      <h2 className="font-cinzel text-lg font-bold text-[#702d3d]">Share this product</h2>
      <p className="mt-1 text-xs leading-5 text-[#69565a]">
        Recommend it to someone who may be interested. They can check the current product details and order themselves.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share ${name} on WhatsApp`}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#156a45] px-4 py-3 text-sm font-bold text-white hover:bg-[#0c5232]"
        >
          <MessageCircle size={18} aria-hidden="true" /> Share on WhatsApp
        </a>
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#d6b58a] bg-white px-4 py-3 text-sm font-bold text-[#702d3d] hover:bg-[#fff3de]"
        >
          {feedback === "Product link copied." ? <Check size={17} aria-hidden="true" /> : <Copy size={17} aria-hidden="true" />}
          Copy product link
        </button>
      </div>
      <p role="status" aria-live="polite" className="mt-2 text-xs text-[#715a61]">{feedback}</p>
    </section>
  );
}
