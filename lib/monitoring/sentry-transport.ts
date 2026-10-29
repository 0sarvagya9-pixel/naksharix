import "server-only";
// Web Crypto works in both Node and Edge instrumented builds.

export type SafeRequestFailure = { route: string; renderSource: string; routeType: string };

/**
 * Minimal first-party Sentry envelope transport. We transmit ONLY a static
 * failure type and reviewed Next.js route templates, never the request,
 * error object, stack, user ID, birth data, email, headers or query string.
 * No SDK, replay, profiling, breadcrumbs or session tracking is enabled.
 */
function sentryEndpoint(dsn: string | undefined): { url: string; publicKey: string } | null {
  if (!dsn) return null;
  try {
    const value = new URL(dsn);
    if (value.protocol !== "https:" || !value.username || value.password ||
      value.port || value.search || value.hash ||
      !/(^|\.)sentry\.io$/.test(value.hostname) ||
      !/^\/[0-9]{1,20}\/?$/.test(value.pathname) ||
      !/^[A-Za-z0-9]{16,128}$/.test(value.username)) return null;
    const projectId = value.pathname.replaceAll("/", "");
    return { url: value.origin + "/api/" + projectId + "/envelope/", publicKey: value.username };
  } catch {
    return null;
  }
}

export function safeSentryTransportConfigured(): boolean {
  return Boolean(sentryEndpoint(process.env.SENTRY_DSN));
}

export async function reportSafeRequestFailure(details: SafeRequestFailure): Promise<boolean> {
  const endpoint = sentryEndpoint(process.env.SENTRY_DSN);
  if (!endpoint) return false;
  const route = /^[a-z0-9/[\]_.-]{1,120}$/i.test(details.route) ? details.route : "redacted";
  const renderSource = /^[a-z_]{1,32}$/i.test(details.renderSource) ? details.renderSource : "unknown";
  const routeType = /^[a-z_]{1,32}$/i.test(details.routeType) ? details.routeType : "unknown";
  const eventId = crypto.randomUUID().replaceAll("-", "");
  const event = {
    event_id: eventId,
    timestamp: Date.now() / 1000,
    level: "error",
    platform: "node",
    logger: "naksharix.server",
    exception: { values: [{ type: "NaksharixRequestFailure", value: "Server route failed; diagnostic details intentionally withheld" }] },
    tags: { route, renderSource, routeType },
    extra: { privacy: "no-request-data-collected" }
  };
  const envelope = [
    JSON.stringify({ event_id: eventId, sent_at: new Date().toISOString() }),
    JSON.stringify({ type: "event" }),
    JSON.stringify(event),
    ""
  ].join("\n");
  try {
    const response = await fetch(endpoint.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-sentry-envelope",
        "X-Sentry-Auth": "Sentry sentry_version=7,sentry_client=naksharix-safe/1.0,sentry_key=" + endpoint.publicKey
      },
      body: envelope,
      cache: "no-store",
      signal: AbortSignal.timeout(2000)
    });
    return response.ok;
  } catch {
    // Provider outages must not cause recursive application errors.
    return false;
  }
}
