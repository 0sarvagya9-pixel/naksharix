"use client";

/**
 * Global visual feedback bus. Notifications describe actions that have
 * genuinely completed; they never initiate payment, send messages or change
 * stored records. Persistent validation and payment-history text stays on page.
 */
export const SITE_NOTIFICATION_EVENT = "naksharix:site-notification";
export const SITE_NOTIFICATION_DURATION_MS = 5000 as const;
export type SiteNoticeKind = "success" | "error" | "info" | "warning";
export type SiteNotice = {
  id: string;
  kind: SiteNoticeKind;
  title: string;
  message: string;
  timestamp: number;
};

let sequence = 0;

export function showSiteNotification(
  kind: SiteNoticeKind,
  message: string,
  title?: string
): void {
  if (typeof window === "undefined") return;
  const safeMessage = message.trim().slice(0, 280);
  if (!safeMessage) return;
  sequence += 1;
  const defaults: Record<SiteNoticeKind, string> = {
    success: "Action completed",
    error: "Action needs attention",
    info: "Information",
    warning: "Please review"
  };
  const detail: SiteNotice = {
    id: String(Date.now()) + "-" + sequence,
    kind,
    title: (title?.trim() || defaults[kind]).slice(0, 90),
    message: safeMessage,
    timestamp: Date.now()
  };
  window.dispatchEvent(new CustomEvent<SiteNotice>(SITE_NOTIFICATION_EVENT, { detail }));
}

export const siteNotice = {
  success: (message: string, title?: string) => showSiteNotification("success", message, title),
  error: (message: string, title?: string) => showSiteNotification("error", message, title),
  info: (message: string, title?: string) => showSiteNotification("info", message, title),
  warning: (message: string, title?: string) => showSiteNotification("warning", message, title)
};
