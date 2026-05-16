"use client";

export const csrfCookieName = "naksharix_csrf";
export const csrfHeaderName = "x-csrf-token";

function readCookie(name: string) {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
}

export async function getCsrfToken() {
  const existing = readCookie(csrfCookieName);
  if (existing) return decodeURIComponent(existing);
  const response = await fetch("/api/csrf", { credentials: "same-origin" });
  const json = await response.json();
  return json.data?.csrfToken as string;
}

export async function secureFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers);
  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    headers.set(csrfHeaderName, await getCsrfToken());
  }
  return fetch(input, {
    ...init,
    credentials: init.credentials ?? "same-origin",
    headers
  });
}
