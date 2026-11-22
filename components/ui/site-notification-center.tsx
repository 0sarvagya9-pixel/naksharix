"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import {
  SITE_NOTIFICATION_DURATION_MS,
  SITE_NOTIFICATION_EVENT,
  type SiteNotice
} from "@/lib/ui/site-notification";

const appearance = {
  success: { color: "text-[#187245]", border: "border-[#a5d4b5]", bg: "bg-[#eaf8ed]", Icon: CheckCircle2 },
  error: { color: "text-[#a12b46]", border: "border-[#e7b0bc]", bg: "bg-[#fff1f2]", Icon: AlertCircle },
  warning: { color: "text-[#905a22]", border: "border-[#e7ca9a]", bg: "bg-[#fff8e8]", Icon: TriangleAlert },
  info: { color: "text-[#385c91]", border: "border-[#bdd1eb]", bg: "bg-[#eef5ff]", Icon: Info }
} as const;

/** One centered, dismissible 5-second message at a time.
 * Subsequent notices queue (max 3) rather than covering the previous one.
 * This is not an alertdialog: it never blocks navigation or traps keyboard
 * focus. Critical instructions stay visible in their original page as well.
 */
export function SiteNotificationCenter() {
  const [mounted, setMounted] = useState(false);
  const [queue, setQueue] = useState<SiteNotice[]>([]);
  const dismiss = useCallback(() => setQueue(current => current.slice(1)), []);

  useEffect(() => {
    setMounted(true);
    const onNotice = (event: Event) => {
      const detail = (event as CustomEvent<SiteNotice>).detail;
      if (!detail || !["success", "error", "warning", "info"].includes(detail.kind) ||
          typeof detail.title !== "string" || typeof detail.message !== "string") return;
      setQueue(current => {
        const duplicate = current.some(item =>
          item.kind === detail.kind && item.title === detail.title && item.message === detail.message);
        if (duplicate) return current;
        return [...current, detail].slice(0, 3);
      });
    };
    window.addEventListener(SITE_NOTIFICATION_EVENT, onNotice);
    return () => window.removeEventListener(SITE_NOTIFICATION_EVENT, onNotice);
  }, []);

  const active = queue[0];
  useEffect(() => {
    if (!active) return;
    const timeout = window.setTimeout(dismiss, SITE_NOTIFICATION_DURATION_MS);
    return () => window.clearTimeout(timeout);
  }, [active, dismiss]);

  useEffect(() => {
    if (!active) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [active, dismiss]);

  if (!mounted) return null;
  if (!active) return <span hidden data-site-notifications-ready="true" />;
  const look = appearance[active.kind];
  const Icon = look.Icon;

  return createPortal(
    <div
      className="pointer-events-none fixed inset-0 z-[12000] flex items-center justify-center px-4 py-6"
      data-notification-region="center"
    >
      <section
        key={active.id}
        className={`nx-center-notice pointer-events-auto relative w-full max-w-[430px] overflow-hidden rounded-[22px] border ${look.border} bg-white p-5 text-[#402932] shadow-[0_22px_80px_rgba(48,27,35,0.22)] sm:p-6`}
        role={active.kind === "error" ? "alert" : "status"}
        aria-live={active.kind === "error" ? "assertive" : "polite"}
        aria-atomic="true"
        data-notification-kind={active.kind}
        data-notification-duration={SITE_NOTIFICATION_DURATION_MS}
      >
        <div className="flex items-start gap-3 pr-7">
          <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${look.border} ${look.bg} ${look.color}`} aria-hidden="true">
            <Icon size={24} strokeWidth={1.8} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-cinzel text-lg font-bold leading-7">{active.title}</p>
            <p className="mt-1.5 break-words text-sm leading-6 text-[#655159]">{active.message}</p>
            <p className="mt-3 text-xs font-medium text-[#967c83]">Closes automatically in 5 seconds</p>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss notification"
          className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#72545d] hover:bg-[#fff1e5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8e3346]"
        >
          <X size={19} aria-hidden="true" />
        </button>
        <div className="absolute bottom-0 left-0 h-[3px] w-full bg-[#f3e2cd]" aria-hidden="true">
          <div className="nx-center-notice-progress h-full w-full origin-left bg-[#9b7150]" />
        </div>
      </section>
    </div>,
    document.body
  );
}
