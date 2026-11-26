"use client";

import { siteNotice } from "@/lib/ui/site-notification";
import {currentClientLocale} from "@/lib/i18n-copy";
import {notificationCopy, type NotificationMessage} from "@/lib/ui/notification-copy";

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
export async function secureFetch(input: RequestInfo | URL, options: RequestInit & { silent?: boolean } = {}) {
  const { silent, ...init } = options;
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
    // Background analytics must never produce customer-facing business notifications.
    if (silent) return response;
    const copy = notificationCopy(currentClientLocale());
    // Only acknowledge server-persisted business changes. An HTTP 200
    // from a payment *order/verification* endpoint must NOT be shown here
    // as paid, settled, delivered, or a confirmed ceremony.
    if (isMutation && response.ok) {
      const successText: Record<string, NotificationMessage> = {
        "POST /api/commerce/orders": "order",
        "POST /api/puja/bookings": "puja",
        "POST /api/consultation-bookings": "consultation",
        "PUT /api/admin/puja-offerings": "offering",
        "POST /api/admin/puja-partners": "partner",
        "PATCH /api/admin/puja-partners": "partnerReview",
        "PATCH /api/admin/puja-bookings": "pujaStatus",
        "PATCH /api/admin/shop-orders": "shopStatus",
        "POST /api/admin/fulfilment-notification": "notificationRetry",
        "POST /api/auth/login": "login",
        "POST /api/auth/signup": "signup",
        "POST /api/report-requests": "report",
        "POST /api/support/tickets": "support",
        "POST /api/support/tickets/reply": "supportReply",
        "POST /api/admin/support/reply": "supportAdminReply",
        "PATCH /api/admin/support": "supportStatus",
        "PATCH /api/admin/report-requests": "reportStatus",
        "POST /api/astrologer/profile": "astrologerProfile"
      };
      const reportAction = /^\/api\/admin\/report-requests\/[^/]+\/(generate-pdf|deliver)$/.test(pathname);
      const message = successText[method + " " + pathname] ||
        (method === "POST" && reportAction
          ? pathname.endsWith("/generate-pdf")
            ? "generated"
            : "delivered"
          : undefined);
      if (message) siteNotice.success(copy[message], copy.saved);
    }
    if (isMutation && !response.ok) {
      const payment = pathname.includes("/payments/") || pathname.includes("/razorpay/");
      const verification = pathname.endsWith("/payments/razorpay/verify");
      const auth = pathname.endsWith("/auth/login") || pathname.endsWith("/auth/signup");
      const msg = verification
        ? copy.verificationError
        : payment
          ? copy.paymentError
          : auth
            ? copy.authError
            : response.status === 401 || response.status === 403
              ? copy.unauthorized
              : response.status === 409
                ? copy.conflict
                : response.status === 422
                  ? copy.invalid
                  : response.status === 429
                    ? copy.limited
                    : response.status === 503
                      ? copy.unavailable
                      : copy.error;
      if (verification) siteNotice.warning(msg, copy.paymentPending);
      else siteNotice.error(msg, payment ? copy.paymentAttention : copy.notCompleted);
    }
    return response;
  } catch (error) {
    if (!silent && isMutation && !(error instanceof Error && error.name === "AbortError")) {
      const copy = notificationCopy(currentClientLocale());
      if (pathname.includes("/payments/") || pathname.includes("/razorpay/")) {
        siteNotice.warning(
          copy.paymentConnection,
          copy.paymentPending);
      } else {
        siteNotice.error(
          copy.connection,
          copy.connectionTitle);
      }
    }
    throw error;
  }
}
