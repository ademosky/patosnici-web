import type { Metadata } from "next";
import { Barlow_Condensed, DM_Sans } from "next/font/google";
import "./globals.css";
import Footer from "./components/Footer";
import { CartProvider } from "./context/CartContext";
import { LanguageProvider } from "./context/LanguageContext";
import Script from "next/script";
import { headers } from "next/headers";
import FacebookFloat from "./components/FacebookFloat";
import MetaPixel from "@/components/MetaPixel";

const barlowCondensed = Barlow_Condensed({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const SITE_URL = "https://www.originalpatosnici.com";
const OG_IMAGE = `${SITE_URL}/images/logo.webp`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Original Patosnici | Оригинални гумени патосници",
    template: "%s | Original Patosnici",
  },
  description:
    "Оригинални гумени патосници за сите марки возила — VW, BMW, Audi, Mercedes, Škoda и уште 30+ брендови. Достава низ цела Македонија. Плаќање при подигање.",
  keywords:
    "патосници, гумени патосници, автомобилски патосници, VW, BMW, Audi, Mercedes, Škoda, Македонија",
  openGraph: {
    type: "website",
    locale: "mk_MK",
    url: SITE_URL,
    siteName: "Original Patosnici",
    title: "Original Patosnici | Гумени патосници за сите возила",
    description:
      "Оригинални гумени патосници за 30+ брендови. Достава низ цела Македонија. Плаќање при подигање.",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Original Patosnici — Гумени патосници за автомобили",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Original Patosnici | Гумени патосници",
    description: "Оригинални гумени патосници за 30+ брендови. Македонија.",
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/images/favicon.png",
    shortcut: "/images/favicon.png",
    apple: "/images/favicon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  /* The market the middleware stamped on the request, BEFORE the /ks and /al
     rewrites erased the prefix from the path. Reading it here is what lets the
     server render Albanian for Kosovo and Albania instead of always shipping
     Macedonian HTML and fixing it up in the browser. */
  const requestHeaders = await headers();
  const raw = requestHeaders.get("x-market");
  const initialMarket: "mk" | "ks" | "al" =
    raw === "ks" ? "ks" : raw === "al" ? "al" : "mk";

  return (
    <html lang={initialMarket === "mk" ? "mk" : "sq"}>
      <body
        className={`${barlowCondensed.variable} ${dmSans.variable} antialiased`}
      >
        {/* Organization + WebSite structured data.
            Google reads this to build the knowledge panel and to understand the
            store's own name, logo and contact channels — none of which it could
            infer from the page text alone. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": `${SITE_URL}/#organization`,
                  name: "Original Patosnici",
                  url: SITE_URL,
                  logo: `${SITE_URL}/images/logo.webp`,
                  description:
                    "Оригинални гумени патосници за сите марки возила, изработени по мерка.",
                  areaServed: ["MK", "XK", "AL"],
                  contactPoint: {
                    "@type": "ContactPoint",
                    telephone: "+38975799697",
                    contactType: "customer service",
                    availableLanguage: ["mk", "sq"],
                  },
                  sameAs: [
                    "https://www.facebook.com/patosnici",
                    "https://www.instagram.com/patosnici",
                  ],
                },
                {
                  "@type": "WebSite",
                  "@id": `${SITE_URL}/#website`,
                  url: SITE_URL,
                  name: "Original Patosnici",
                  inLanguage: ["mk", "sq"],
                  publisher: { "@id": `${SITE_URL}/#organization` },
                },
              ],
            }),
          }}
        />
        <LanguageProvider initialMarket={initialMarket}>
        <CartProvider>
          {children}
          <Footer />
          <FacebookFloat />
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-MFLNMEQNSK"
            strategy="lazyOnload"
          />
          <Script id="ga-init" strategy="lazyOnload"
            dangerouslySetInnerHTML={{
              __html: "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-MFLNMEQNSK');"
            }}
          />

          {/* Meta Pixel — init + route tracking handled inside MetaPixel Client Component */}
          <MetaPixel />
          {/* noscript fallback */}
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src="https://www.facebook.com/tr?id=1053477223792945&ev=PageView&noscript=1"
              alt=""
            />
          </noscript>
        </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}