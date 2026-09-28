import type { Metadata } from "next";
import Header from "../components/Header";
import AutoAccessoriesClient from "./AutoAccessoriesClient";
import { getProductsByCategory } from "../data/products";
import { Market } from "@/lib/pricing";
import {
  readMarketServer,
  marketAlternates,
  marketUrl,
  OG_LOCALE,
} from "@/lib/market-server";

const SITE_URL = "https://www.originalpatosnici.com";
const OG_IMAGE = `${SITE_URL}/images/logo.webp`;

const META: Record<Market, { title: string; description: string }> = {
  mk: {
    title: "Авто додатоци",
    description:
      "Квалитетни авто додатоци за твоето возило — организери, држачи и практични решенија. Нарачај онлајн, достава низ цела Македонија.",
  },
  ks: {
    title: "Aksesorë për auto",
    description:
      "Aksesorë cilësorë për automjetin tuaj — organizues, mbajtëse dhe zgjidhje praktike. Porosit online, dërgesë në gjithë Kosovën.",
  },
  al: {
    title: "Aksesorë për auto",
    description:
      "Aksesorë cilësorë për automjetin tuaj — organizues, mbajtëse dhe zgjidhje praktike. Porosit online, dërgesë në gjithë Shqipërinë.",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const market = await readMarketServer();
  const meta = META[market];
  const url = marketUrl(market, "/auto-accessories");

  return {
    title: { absolute: `${meta.title} | Original Patosnici` },
    description: meta.description,
    alternates: {
      canonical: url,
      languages: marketAlternates("/auto-accessories"),
    },
    openGraph: {
      type: "website",
      locale: OG_LOCALE[market],
      url,
      siteName: "Original Patosnici",
      title: meta.title,
      description: meta.description,
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: meta.title }],
    },
    robots: { index: true, follow: true },
  };
}

export const dynamic = "force-dynamic";

export default async function AutoAccessoriesPage() {
  const products = await getProductsByCategory("auto_accessories");
  return (
    <>
      <Header />
      <AutoAccessoriesClient initialProducts={products} />
    </>
  );
}
