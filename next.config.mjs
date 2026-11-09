/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  serverExternalPackages: ["@react-pdf/renderer"],
  ...(process.env.NEXT_STANDALONE === "true" ? { output: "standalone" } : {}),
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb"
    }
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cdn.pixabay.com" },
      { protocol: "https", hostname: "thumb.wikimedia.org" },
      { protocol: "https", hostname: "upload.wikimedia.org" }
    ]
  },
  async redirects() {
    return [
      // Search Console: use actual HTTP 308, not streamed Next.js HTML meta refresh.
      { source: "/hi/daily-horoscope", destination: "/hi/aaj-ka-rashifal", permanent: true },
      { source: "/yearly-horoscope-2026", destination: "/yearly-horoscope", permanent: true },
      { source: "/astrology/astrology", destination: "/astrology", permanent: true },
      { source: "/astrology/horoscope", destination: "/horoscope", permanent: true },
      { source: "/astrology/kundli", destination: "/kundli", permanent: true },
      { source: "/astrology/numerology", destination: "/numerology", permanent: true },
      { source: "/astrology/tarot-reading", destination: "/tarot", permanent: true },
      { source: "/astrology/panchang", destination: "/panchang", permanent: true },
      { source: "/auth/login", destination: "/login", permanent: true },
      { source: "/auth/signup", destination: "/signup", permanent: true },
      { source: "/terms", destination: "/terms-and-conditions", permanent: true },
      { source: "/match-making", destination: "/matchmaking", permanent: true },
      { source: "/talk-to-kundli", destination: "/ai-astrologer", permanent: true },
      { source: "/chatbot", destination: "/ai-astrologer", permanent: true }
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-DNS-Prefetch-Control", value: "off" },
          { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=(self), payment=(self)" }
        ]
      }
    ];
  }
};

export default nextConfig;
