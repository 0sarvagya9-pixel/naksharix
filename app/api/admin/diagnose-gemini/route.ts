import { NextRequest } from "next/server";
import { fail, handleApiError, ok } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { env } from "@/lib/env";

const geminiModel = "gemini-1.5-flash";
const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent`;

export async function GET(request: NextRequest) {
  try {
    const host = request.headers.get("host") || "";
    const isLocal = host.includes("localhost") || host.includes("127.0.0.1") || host.includes("::1");

    if (!isLocal) {
      const user = await getCurrentUser();
      if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
        return fail("Forbidden", 403);
      }
    }

    const key = env.GEMINI_API_KEY;
    if (!key) {
      return ok({
        isKeyPresent: false,
        status: "Missing GEMINI_API_KEY env variable"
      });
    }

    if (key.startsWith("your_")) {
      return ok({
        isKeyPresent: true,
        isPlaceholder: true,
        status: "Key has placeholder prefix 'your_'"
      });
    }

    // Call Gemini API to test connectivity
    const response = await fetch(`${geminiEndpoint}?key=${encodeURIComponent(key)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: "Respond with one word: OK." }] }]
      })
    });

    const responseOk = response.ok;
    const responseStatus = response.status;
    let dataSummary = "";
    let errorCategory = "";

    try {
      const responseData = await response.json();
      if (responseOk) {
        dataSummary = responseData?.candidates?.[0]?.content?.parts?.[0]?.text || JSON.stringify(responseData);
      } else {
        errorCategory = responseData?.error?.status || responseData?.error?.message || "HTTP_ERROR";
        dataSummary = JSON.stringify(responseData);
      }
    } catch (e) {
      const err = e instanceof Error ? e.message : "unknown error";
      dataSummary = "Failed to parse response body: " + err;
    }

    return ok({
      isKeyPresent: true,
      keyLength: key.length,
      keyPrefix: key.substring(0, 6),
      responseOk,
      responseStatus,
      errorCategory,
      dataSummary
    });
  } catch (error) {
    return handleApiError(error);
  }
}
