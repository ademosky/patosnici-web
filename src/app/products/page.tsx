import type { Metadata } from "next";
import { getProductsByCategory } from "../data/products";
import { brands } from "../data/brands";
import ProductsClient from "./ProductsClient";
import { Market } from "@/lib/pricing";
import {
  readMarketServer,
  marketAlternates,
  marketUrl,
  OG_LOCALE,
  SITE_URL,
} from "@/lib/market-server";

export const dynamic = "force-dynamic";

const OG_IMAGE = `${SITE_URL}/images/logo.webp`;

const META: Record<Market, { title: string; description: string }> = {
  mk: {
    title: "Сите патосници",
    description:
      "Каталог на оригинални гумени патосници за сите марки возила — VW, BMW, Audi, Mercedes, Škoda и 30+ брендови. Филтрирај по марка и модел.",
  },
  ks: {
    title: "Të gjitha tapetet",
    description:
      "Katalogu i tapeteve origjinale gome për të gjitha markat — VW, BMW, Audi, Mercedes, Škoda e 30+ marka të tjera. Filtro sipas markës dhe modelit.",
  },
  al: {
    title: "Të gjitha tapetet",
    description:
      "Katalogu i tapeteve origjinale gome për të gjitha markat — VW, BMW, Audi, Mercedes, Škoda e 30+ marka të tjera. Filtro sipas markës dhe modelit.",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const market = await readMarketServer();
  const meta = META[market];
  const url = marketUrl(market, "/products");

  return {
    title: { absolute: `${meta.title} | Original Patosnici` },
    description: meta.description,
    alternates: {
      canonical: url,
      languages: marketAlternates("/products"),
    },
    openGraph: {
      type: "website",
      locale: OG_LOCALE[market],
      url,
      siteName: "Original Patosnici",
      title: meta.title,
      description: meta.description,
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Original Patosnici" }],
    },
  };
}

export default async function ProductsPage() {
  const products = await getProductsByCategory("rubber_mats");
  return <ProductsClient initialProducts={products} brands={brands} />;
}
