import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { logger } from "@/lib/monitoring/logger";
import { sanitizeInput } from "@/lib/security/sanitize";

export type ApiResult<T> = { data: T } | { error: string; details?: unknown };

export function ok<T>(data: T, init?: ResponseInit) {
  const response = NextResponse.json<ApiResult<T>>({ data }, init);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("X-Content-Type-Options", "nosniff");
  return response;
}

export function fail(message: string, status = 400, details?: unknown) {
  const response = NextResponse.json<ApiResult<never>>({ error: message, details }, { status });
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("X-Content-Type-Options", "nosniff");
  return response;
}

export async function validateJson<TSchema extends z.ZodTypeAny>(request: Request, schema: TSchema): Promise<z.infer<TSchema>> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new ZodError([
      {
        code: "custom",
        path: ["headers", "content-type"],
        message: "Content-Type must be application/json"
      }
    ]);
  }
  const body = sanitizeInput(await request.json());
  return schema.parse(body);
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return fail("Validation failed", 422, error.flatten());
  }
  logger.error("api_error", { name: error instanceof Error ? error.name : "unknown" });
  return fail("We could not complete that request right now. Please try again shortly.", 500);
}
