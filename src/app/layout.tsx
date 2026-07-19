import type { Metadata } from "next";
import { Barlow_Condensed, DM_Sans } from "next/font/google";
import "./globals.css";
import Footer from "./components/Footer";
import { CartProvider } from "./context/CartContext";
import { LanguageProvider } from "./context/LanguageContext";
import Script from "next/script";
import FacebookFloat from "./components/FacebookFloat";
import MetaPixel from "@/components/MetaPixel";

const barlowCondensed = Barlow_Condensed({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const SITE_URL = "https://www.originalpatosnici.com";
const OG_IMAGE = `${SITE_URL}/images/logo.png`;

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
    icon: "/images/logo.png",
    shortcut: "/images/logo.png",
    apple: "/images/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mk">
      <body
        className={`${barlowCondensed.variable} ${dmSans.variable} antialiased`}
      >
        <LanguageProvider>
        <CartProvider>
          {children}
          <Footer />
          <FacebookFloat />
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-MFLNMEQNSK"
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive"
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