/**
 * Canonical SEO host, distinct from the application's operational base URL.
 * Vercel's verified domain settings redirect naksharix.com to www.naksharix.com.
 * Do not change OAuth, webhooks, billing or API base URL configuration.
 */
export function canonicalSeoOrigin(configuredUrl: string): string {
  const url = new URL(configuredUrl);
  if (url.hostname.toLowerCase() === "naksharix.com") {
    url.hostname = "www.naksharix.com";
  }
  return url.origin;
}
