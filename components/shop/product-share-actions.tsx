"use client";

import { useState } from "react";
import { Check, Copy, MessageCircle } from "lucide-react";

type Props = { name: string; productUrl: string; kind?: "product" | "report" };

/** No customer contact list, tracker, external script or paid service.
 * A buyer chooses whom to share the direct product URL with. */
export function ProductShareActions({ name, productUrl, kind = "product" }: Props) {
  const [feedback, setFeedback] = useState("");
  const text = kind === "report" ? `Explore ${name} on NAKSHARIX. Check the report contents and current one-time fee before choosing: ${productUrl}` : `See ${name} on NAKSHARIX. Check the current item details and price before ordering: ${productUrl}`;
  const subject = kind === "report" ? "report" : "product";
  const whatsapp = "https://wa.me/?text=" + encodeURIComponent(text);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(productUrl);
      setFeedback(kind === "report" ? "Report link copied." : "Product link copied.");
    } catch {
      setFeedback("Copy was blocked by your browser. You can copy the link from the address bar.");
    }
  }

  return (
    <section className="mt-5 rounded-2xl border border-[#ddc19b] bg-[#fffaf1] p-4" aria-label={`Share this ${subject}`}>
      <h2 className="font-cinzel text-lg font-bold text-[#702d3d]">Share this {subject}</h2>
      <p className="mt-1 text-xs leading-5 text-[#69565a]">
        {kind === "report" ? "Share only the public report information page. Your private details and report results are not included." : "Recommend it to someone who may be interested. They can check the current product details and order themselves."}
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
          {feedback === "Product link copied." || feedback === "Report link copied." ? <Check size={17} aria-hidden="true" /> : <Copy size={17} aria-hidden="true" />}
          Copy {subject} link
        </button>
      </div>
      <p role="status" aria-live="polite" className="mt-2 text-xs text-[#715a61]">{feedback}</p>
    </section>
  );
}
