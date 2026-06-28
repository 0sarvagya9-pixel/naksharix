import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { cookies } from "next/headers";
import { Cinzel, Cinzel_Decorative, Inter, Poppins } from "next/font/google";
import "@/app/globals.css";
import { env } from "@/lib/env";
import { MainNav } from "@/components/main-nav";
import { Footer } from "@/components/footer";
import { PwaRegister } from "@/components/pwa-register";
import { SchemaMarkup } from "@/components/schema-markup";
import { LanguageProvider } from "@/components/language-provider";
import { cn } from "@/lib/utils";
import { seo } from "@/lib/seo";
import { normalizeLocale } from "@/lib/i18n";

const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-cinzel", display: "swap" });
const cinzelDecorative = Cinzel_Decorative({ subsets: ["latin"], weight: ["400", "700", "900"], variable: "--font-cinzel-decorative", display: "swap" });
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-poppins", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  ...seo({
    title: "Naksharix - Unlock Your Cosmic Destiny",
    description: "Naksharix is a premium astrology SaaS platform for Astrology, Horoscope, Kundli, Numerology, Tarot Reading, Panchang, AI guidance, and luxury cosmic reports.",
    path: "/",
    keywords: ["AI Astrology", "Vedic Astrology", "Daily Horoscope", "Kundli Matching"]
  }),
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: {
    default: "Naksharix - Unlock Your Cosmic Destiny",
    template: `%s | ${env.NEXT_PUBLIC_APP_NAME}`
  },
  applicationName: "Naksharix",
  authors: [{ name: "Naksharix" }],
  creator: "Naksharix",
  publisher: "Naksharix",
  manifest: "/manifest.json",
  icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }], apple: "/icons/icon-192.svg" }
};

export const viewport: Viewport = {
  themeColor: "#f7f7f8",
  width: "device-width",
  initialScale: 1
};

import { AppBackgroundScene } from "@/components/background/app-background-scene";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const initialLocale = normalizeLocale(cookieStore.get("naksharix-language")?.value);
  const htmlLang = initialLocale === "hi" ? "hi" : initialLocale === "hinglish" ? "hi-Latn" : "en";

  return (
    <html lang={htmlLang} suppressHydrationWarning>
      <body className={cn("naksh-page-bg font-sans", cinzel.variable, cinzelDecorative.variable, poppins.variable, inter.variable)}>
        <LanguageProvider initialLocale={initialLocale}>
          <AppBackgroundScene />
          <div
            className="relative z-10 w-full max-w-[1420px] mx-auto my-0 sm:my-6 md:my-10 rounded-none sm:rounded-[38px] overflow-hidden flex flex-col min-h-screen sm:min-h-[calc(100vh-80px)]"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.24), rgba(255,255,255,0.10))",
              backdropFilter: "blur(32px) saturate(150%)",
              WebkitBackdropFilter: "blur(32px) saturate(150%)",
              border: "1px solid rgba(255,255,255,0.50)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.55), 0 30px 110px rgba(20,12,8,0.35), 0 0 90px rgba(216,154,43,0.16)"
            }}
          >
            <MainNav />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
        </LanguageProvider>
        <PwaRegister />
        <SchemaMarkup />
        {env.NEXT_PUBLIC_GA_ID ? (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${env.NEXT_PUBLIC_GA_ID}`} strategy="afterInteractive" />
            <Script id="ga" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${env.NEXT_PUBLIC_GA_ID}');`}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}