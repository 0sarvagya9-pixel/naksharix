"use client";

import { siteNotice } from "@/lib/ui/site-notification";

export const csrfCookieName = "naksharix_csrf";
export const csrfHeaderName = "x-csrf-token";

function readCookie(name: string) {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
}

export async function getCsrfToken(signal?: AbortSignal | null) {
  const existing = readCookie(csrfCookieName);
  if (existing) return decodeURIComponent(existing);
  const response = await fetch("/api/csrf", { credentials: "same-origin", signal });
  if (!response.ok) throw new Error("Could not initialize request security.");
  const json = await response.json();
  const token = json.data?.csrfToken;
  if (typeof token !== "string" || !token) throw new Error("Invalid request security response.");
  return token;
}

/**
 * Mutating requests receive one privacy-safe, centrally displayed error.
 * A successful HTTP response is NEVER interpreted as successful payment or
 * completed fulfilment; those require explicit business confirmation in UI.
 */
export async function secureFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const method = (init.method ?? "GET").toUpperCase();
  const isMutation = !["GET", "HEAD", "OPTIONS"].includes(method);
  const headers = new Headers(init.headers);
  const pathname = typeof input === "string" ? input : input instanceof URL ? input.pathname :
    typeof input.url === "string" ? new URL(input.url, "https://www.naksharix.com").pathname : "";
  try {
    if (isMutation) headers.set(csrfHeaderName, await getCsrfToken(init.signal));
    const response = await fetch(input, {
      ...init,
      credentials: init.credentials ?? "same-origin",
      headers
    });
    // Only acknowledge server-persisted business changes. An HTTP 200
    // from a payment *order/verification* endpoint must NOT be shown here
    // as paid, settled, delivered, or a confirmed ceremony.
    if (isMutation && response.ok) {
      const successText: Record<string, string> = {
        "POST /api/commerce/orders": "Order request saved. Confirm the final amount and payment status in My Orders.",
        "POST /api/puja/bookings": "Puja request received. A Pandit and ceremony time must be confirmed; no payment is due yet.",
        "POST /api/consultation-bookings": "Consultation request received. Check your account for acceptance and payment status.",
        "PUT /api/admin/puja-offerings": "Puja offering settings saved. Service launch and Pandit availability are verified separately.",
        "POST /api/admin/puja-partners": "Pandit profile saved for review. This does not confirm availability.",
        "PATCH /api/admin/puja-partners": "Pandit review decision saved. Individual ceremony dates still need confirmation.",
        "PATCH /api/admin/puja-bookings": "Puja status saved. Customer inbox delivery is not guaranteed.",
        "PATCH /api/admin/shop-orders": "Shop order status saved. Payment and actual delivery remain separate checks.",
        "POST /api/admin/fulfilment-notification": "Notification retry recorded. Provider acceptance does not prove inbox delivery.",
        "POST /api/auth/login": "Sign-in accepted. Opening your account.",
        "POST /api/auth/signup": "Registration accepted. Complete any required email verification.",
        "POST /api/report-requests": "Report request recorded. Payment and document delivery are tracked separately.",
        "POST /api/support/tickets": "Support request recorded. You can follow progress in your account.",
        "POST /api/support/tickets/reply": "Support reply saved in the conversation.",
        "POST /api/admin/support/reply": "Support reply saved. Email delivery status is shown on the page.",
        "PATCH /api/admin/support": "Support status saved.",
        "PATCH /api/admin/report-requests": "Report workflow update recorded in the audit history.",
        "POST /api/astrologer/profile": "Astrologer profile saved for review, not yet approved."
      };
      const reportAction = /^\/api\/admin\/report-requests\/[^/]+\/(generate-pdf|deliver)$/.test(pathname);
      const message = successText[method + " " + pathname] ||
        (method === "POST" && reportAction
          ? pathname.endsWith("/generate-pdf")
            ? "Report PDF generation finished. Check saved report details before delivery."
            : "Report delivery action processed. The page confirms provider acceptance separately."
          : undefined);
      if (message) siteNotice.success(message, "Saved successfully");
    }
    if (isMutation && !response.ok) {
      const payment = pathname.includes("/payments/") || pathname.includes("/razorpay/");
      const msg = payment
        ? "We could not complete this payment action. Check payment history before attempting another payment."
        : response.status === 401 || response.status === 403
          ? "Please sign in with the correct account and try again."
          : response.status === 409
            ? "This item changed or a previous request exists. Review the current details before retrying."
            : response.status === 422
              ? "Please review the information in the form and correct any errors."
              : response.status === 429
                ? "Too many attempts. Please try again later."
                : response.status === 503
                  ? "This service is temporarily unavailable. Your request has not been confirmed."
                  : "This action could not be completed. Review the page message and try again.";
      siteNotice.error(msg, payment ? "Payment needs attention" : "Action not completed");
    }
    return response;
  } catch (error) {
    if (isMutation && !(error instanceof Error && error.name === "AbortError")) {
      if (pathname.includes("/payments/") || pathname.includes("/razorpay/")) {
        siteNotice.warning(
          "Payment confirmation could not be checked. Review payment history before retrying; do not pay twice.",
          "Payment status pending");
      } else {
        siteNotice.error(
          "The secure request could not connect. Check your connection and the on-page status before trying again.",
          "Connection problem");
      }
    }
    throw error;
  }
}
