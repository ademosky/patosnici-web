import type { Metadata } from "next";
import { Barlow_Condensed, DM_Sans } from "next/font/google";
import "./globals.css";
import Footer from "./components/Footer";
import { CartProvider } from "./context/CartContext";
import FacebookFloat from "./components/FacebookFloat";

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
        <CartProvider>
          {children}
          <Footer />
          <FacebookFloat />
        </CartProvider>
      </body>
    </html>
  );
}