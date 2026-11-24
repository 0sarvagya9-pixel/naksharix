/** Accept only same-origin absolute paths for post-auth navigation. */
export function safeInternalAuthPath(value: string | null | undefined): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\") || /[\u0000-\u001f\u007f]/.test(value) || /%5c/i.test(value)) return null;
  try {
    const url = new URL(value, "https://naksharix.invalid");
    // WHATWG URL dot-segment normalization can turn "/a/..//host" into
    // "//host" even while the parsed origin is still ours. Reject ambiguous
    // normalized paths before handing them to a router or HTTP redirect.
    if (url.origin !== "https://naksharix.invalid" || !url.pathname.startsWith("/") || url.pathname.startsWith("//")) return null;
    // Reject encoded path separators, encoded percent (nested encodings),
    // and encoded ASCII control characters in the path, not in query data.
    if (/%(?:2f|5c|25|0[0-9a-f]|1[0-9a-f]|7f)/i.test(url.pathname)) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}
