"use client";

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

export async function secureFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers);
  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    headers.set(csrfHeaderName, await getCsrfToken(init.signal));
  }
  return fetch(input, {
    ...init,
    credentials: init.credentials ?? "same-origin",
    headers
  });
}
