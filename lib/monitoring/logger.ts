import "server-only";

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
    provider: process.env.SENTRY_DSN ? "sentry_ready_env_present" : "console_safe_logger",
    sentryConfigured: Boolean(process.env.SENTRY_DSN),
    safeMetadataOnly: true,
    reason: process.env.SENTRY_DSN ? "Sentry DSN is present; adapter can be wired without changing call sites." : "Sentry DSN is missing; structured console logging is active."
  };
}
