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
  themeColor: "#FFF8EA",
  width: "device-width",
  initialScale: 1
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const initialLocale = normalizeLocale(cookieStore.get("naksharix-language")?.value);
  const htmlLang = initialLocale === "hi" ? "hi" : initialLocale === "hinglish" ? "hi-Latn" : "en";

  return (
    <html lang={htmlLang} suppressHydrationWarning>
      <body className={cn("naksh-page-bg font-sans", cinzel.variable, cinzelDecorative.variable, poppins.variable, inter.variable)}>
        <LanguageProvider initialLocale={initialLocale}>
          <MainNav />
          {children}
          <Footer />
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
