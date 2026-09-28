import type { Metadata } from "next";
import Header from "../components/Header";
import ConfiguratorClient from "./ConfiguratorClient";
import { getProducts } from "../data/products";
import { Market } from "@/lib/pricing";
import {
  readMarketServer,
  marketAlternates,
  marketUrl,
  OG_LOCALE,
} from "@/lib/market-server";

const SITE_URL = "https://www.originalpatosnici.com";
const OG_IMAGE = `${SITE_URL}/images/logo.webp`;

const META: Record<Market, { title: string; description: string; keywords: string }> = {
  mk: {
    title: "Изработи сам — Платнени патосници по твој избор",
    description:
      "Изработи сам платнени патосници по твој избор. Избери возило, боја, раб и лого. Нарачај онлајн. Достава низ цела Македонија.",
    keywords:
      "платнени патосници, изработи сам, патосници по избор, конфигуратор, текстилни патосници, Македонија",
  },
  ks: {
    title: "Krijo vetë — Tapete tekstili sipas dëshirës",
    description:
      "Krijo vetë tapete tekstili sipas dëshirës. Zgjidh automjetin, ngjyrën, bordurën dhe logon. Porosit online. Dërgesë në gjithë Kosovën.",
    keywords:
      "tapete tekstili, krijo vetë, tapete me porosi, konfigurator, tapete për automjete, Kosovë",
  },
  al: {
    title: "Krijo vetë — Tapete tekstili sipas dëshirës",
    description:
      "Krijo vetë tapete tekstili sipas dëshirës. Zgjidh automjetin, ngjyrën, bordurën dhe logon. Porosit online. Dërgesë në gjithë Shqipërinë.",
    keywords:
      "tapete tekstili, krijo vetë, tapete me porosi, konfigurator, tapete për automjete, Shqipëri",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const market = await readMarketServer();
  const meta = META[market];
  const url = marketUrl(market, "/create-own");

  return {
    title: { absolute: `${meta.title} | Original Patosnici` },
    description: meta.description,
    keywords: meta.keywords,
    alternates: {
      canonical: url,
      languages: marketAlternates("/create-own"),
    },
    openGraph: {
      type: "website",
      locale: OG_LOCALE[market],
      url,
      siteName: "Original Patosnici",
      title: meta.title,
      description: meta.description,
      images: [
        { url: OG_IMAGE, width: 1200, height: 630, alt: "Original Patosnici — Tapete me porosi" },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: [OG_IMAGE],
    },
    robots: { index: true, follow: true },
  };
}

export const dynamic = "force-dynamic";

export default async function IzrabotiSamPage() {
  const products = await getProducts();

  // Build unique vehicle list from Supabase product catalog
  // Each product has: brand (brandId), car_model (model name), model (variant)
  const vehicles = products
    .filter((p) => p.brand && p.car_model)
    .map((p) => ({
      brandId: p.brand,
      model: p.car_model as string,
      generation: (p.title || p.model || p.car_model) as string,
    }));

  return (
    <>
      <Header />
      <ConfiguratorClient initialVehicles={vehicles} />
    </>
  );
}
