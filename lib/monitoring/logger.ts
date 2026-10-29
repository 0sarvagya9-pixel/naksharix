import "server-only";
import { safeSentryTransportConfigured } from "@/lib/monitoring/sentry-transport";

type LogLevel = "info" | "warn" | "error";

type SafeLogMetadata = Record<string, string | number | boolean | null | undefined>;

const blockedKeys = /birth|password|secret|token|pdf|bytes|question|concern|payload|signature/i;

function sanitizeMetadata(metadata: SafeLogMetadata = {}) {
  return Object.fromEntries(
    Object.entries(metadata)
      .filter(([key]) => !blockedKeys.test(key))
      .map(([key, value]) => [key, value ?? null])
  );
}

function write(level: LogLevel, message: string, metadata?: SafeLogMetadata) {
  const entry = {
    level,
    message,
    metadata: sanitizeMetadata(metadata),
    at: new Date().toISOString()
  };
  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
}

export const logger = {
  info: (message: string, metadata?: SafeLogMetadata) => write("info", message, metadata),
  warn: (message: string, metadata?: SafeLogMetadata) => write("warn", message, metadata),
  error: (message: string, metadata?: SafeLogMetadata) => write("error", message, metadata)
};

export function getMonitoringReadiness() {
  return {
    provider: "console_safe_logger",
    optionalSentryTransport: safeSentryTransportConfigured() ? "privacy_minimized_envelope" : "not_configured",
    sentryConfigured: Boolean(process.env.SENTRY_DSN),
    sentryTransportConfigured: safeSentryTransportConfigured(),
    safeMetadataOnly: true,
    reason: safeSentryTransportConfigured()
      ? "Privacy-minimized Sentry envelope transport configured; provider receipt and on-call alert delivery are NOT verified."
      : "Safe structured console logging is active. No verified Sentry transport or central paging."
  };
}
