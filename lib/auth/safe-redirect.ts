/** Accept only same-origin absolute paths for post-auth navigation. */
export function safeInternalAuthPath(value: string | null | undefined): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\") || /[\u0000-\u001f\u007f]/.test(value) || /%5c/i.test(value)) return null;
  try {
    const url = new URL(value, "https://naksharix.invalid");
    if (url.origin !== "https://naksharix.invalid" || !url.pathname.startsWith("/")) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}
