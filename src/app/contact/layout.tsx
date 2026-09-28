import type { Metadata } from "next";
import { Market } from "@/lib/pricing";
import {
  readMarketServer,
  marketAlternates,
  marketUrl,
  OG_LOCALE,
  SITE_URL,
} from "@/lib/market-server";

const OG_IMAGE = `${SITE_URL}/images/logo.webp`;

/**
 * /contact/page.tsx is a client component (it owns its form state), so it
 * cannot export metadata itself. This layout supplies the market-aware
 * metadata on its behalf.
 */
const META: Record<Market, { title: string; description: string }> = {
  mk: {
    title: "Контакт",
    description:
      "Имате прашање или сакате да нарачате? Контактирајте не — Original Patosnici, оригинални гумени патосници со достава низ цела Македонија.",
  },
  ks: {
    title: "Kontakt",
    description:
      "Keni një pyetje ose dëshironi të porosisni? Kontaktoni — Original Patosnici, tapete origjinale gome me dërgesë në gjithë Kosovën.",
  },
  al: {
    title: "Kontakt",
    description:
      "Keni një pyetje ose dëshironi të porosisni? Kontaktoni — Original Patosnici, tapete origjinale gome me dërgesë në gjithë Shqipërinë.",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const market = await readMarketServer();
  const meta = META[market];
  const url = marketUrl(market, "/contact");

  return {
    title: { absolute: `${meta.title} | Original Patosnici` },
    description: meta.description,
    alternates: {
      canonical: url,
      languages: marketAlternates("/contact"),
    },
    openGraph: {
      type: "website",
      locale: OG_LOCALE[market],
      url,
      siteName: "Original Patosnici",
      title: meta.title,
      description: meta.description,
      images: [
        { url: OG_IMAGE, width: 1200, height: 630, alt: "Original Patosnici" },
      ],
    },
    robots: { index: true, follow: true },
  };
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
