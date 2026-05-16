import { cookies } from "next/headers";
import { ok } from "@/lib/api";

const csrfCookieName = "naksharix_csrf";

function createCsrfToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function GET() {
  const cookieStore = await cookies();
  const existing = cookieStore.get(csrfCookieName)?.value;
  const csrfToken = existing ?? createCsrfToken();
  cookieStore.set(csrfCookieName, csrfToken, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24
  });
  return ok({ csrfToken });
}



