import type { Instrumentation } from "next";

/**
 * Framework request errors are logged without URL query, IP, cookies,
 * payload, birth data, names, message, stack or provider credentials.
 * Console logs can be connected to Vercel drains later; this is not
 * a claim that Sentry/paging is already configured.
 */
export const onRequestError: Instrumentation.onRequestError = async (_error, _request, context) => {
  try {
    const { logger } = await import("@/lib/monitoring/logger");
    const route = String(context.routePath || "unknown").slice(0, 120);
    const safeRoute = /^\/[a-z0-9/[\]_.-]*$/i.test(route) ? route : "redacted";
    const source = String(context.renderSource || "unknown").slice(0, 32);
    const type = String(context.routeType || "unknown").slice(0, 32);
    logger.error("next.request.failure", {
      route: safeRoute, renderSource: source, routeType: type
    });
    const { reportSafeRequestFailure } = await import("@/lib/monitoring/sentry-transport");
    await reportSafeRequestFailure({ route: safeRoute, renderSource: source, routeType: type });
  } catch {
    // Instrumentation must not convert a failed request into a new failure.
  }
};
