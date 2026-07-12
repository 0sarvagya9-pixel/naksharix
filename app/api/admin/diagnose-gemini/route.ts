import { fail, handleApiError, ok } from "@/lib/api";
import { areAiDiagnosticsEnabled } from "@/lib/ai/feature-status";
import { getCurrentUser } from "@/lib/auth/jwt";
import { env } from "@/lib/env";

const geminiModel = "gemini-1.5-flash";
const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent`;

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) return fail("Not found", 404);
    if (!areAiDiagnosticsEnabled()) return fail("Not found", 404);

    const key = env.GEMINI_API_KEY;
    if (!key || key.startsWith("your_")) {
      return ok({ configured: false, responseOk: false, responseStatus: null, errorCategory: "NOT_CONFIGURED" });
    }

    const response = await fetch(`${geminiEndpoint}?key=${encodeURIComponent(key)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: "Respond with one word: OK." }] }]
      }),
      signal: AbortSignal.timeout(10_000)
    });

    let errorCategory = response.ok ? "" : "HTTP_ERROR";
    if (!response.ok) {
      try {
        const responseData = await response.json() as { error?: { status?: string } };
        errorCategory = responseData.error?.status || "HTTP_ERROR";
      } catch {
        errorCategory = "UNPARSEABLE_PROVIDER_ERROR";
      }
    }

    return ok({
      configured: true,
      responseOk: response.ok,
      responseStatus: response.status,
      errorCategory
    });
  } catch (error) {
    return handleApiError(error);
  }
}
