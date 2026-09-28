import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import Header from "./components/Header";
import Hero from "./components/Hero";
import BrandSelector from "./components/BrandSelector";
import BestSellers from "./components/BestSellers";
import Features from "./components/Features";
import Reviews from "./components/Reviews";
import TrustBar from "./components/TrustBar";
import { getProductsBySkus } from "./data/products";
import { Market, MARKET_PREFIX } from "@/lib/pricing";
import { readMarketServer } from "@/lib/market-server";

const SITE_URL = "https://www.originalpatosnici.com";
const OG_IMAGE = `${SITE_URL}/images/logo.webp`;

const BEST_SELLER_SKUS = ["444805", "213648", "444894", "212807"];

/**
 * Best sellers are a fixed set of four SKUs. The DB lookup is cached
 * independently of rendering, so making the route dynamic for per-market
 * metadata does NOT add a Supabase round trip to every homepage visit.
 */
const getCachedBestSellers = unstable_cache(
  async () => getProductsBySkus(BEST_SELLER_SKUS),
  ["home-best-sellers"],
  { revalidate: 300, tags: ["products"] }
);

/** Per-market homepage metadata — one storefront, three entry points. */
const HOME_META: Record<
  Market,
  { title: string; description: string; keywords: string; ogLocale: string }
> = {
  mk: {
    title: "Original Patosnici | Оригинални гумени патосници",
    description:
      "Оригинални гумени патосници за сите марки возила — VW, BMW, Audi, Mercedes, Škoda и уште 30+ брендови. Достава низ цела Македонија. Плаќање при подигање.",
    keywords:
      "патосници, гумени патосници, автомобилски патосници, VW, BMW, Audi, Mercedes, Škoda, Македонија",
    ogLocale: "mk_MK",
  },
  ks: {
    title: "Original Patosnici | Tapete origjinale gome për automjetin tuaj",
    description:
      "Tapete origjinale gome për të gjitha markat e automjeteve — VW, BMW, Audi, Mercedes, Škoda e 30+ marka të tjera. Dërgesë në gjithë Kosovën. Pagesë në dorëzim.",
    keywords:
      "tapete, tapete gome, tapete automjeti, VW, BMW, Audi, Mercedes, Škoda, Kosovë",
    ogLocale: "sq_XK",
  },
  al: {
    title: "Original Patosnici | Tapete origjinale gome për automjetin tuaj",
    description:
      "Tapete origjinale gome për të gjitha markat e automjeteve — VW, BMW, Audi, Mercedes, Škoda e 30+ marka të tjera. Dërgesë në gjithë Shqipërinë. Pagesë në dorëzim.",
    keywords:
      "tapete, tapete gome, tapete automjeti, VW, BMW, Audi, Mercedes, Škoda, Shqipëri",
    ogLocale: "sq_AL",
  },
};

// The market is read from a request header (stamped by middleware before the
// /ks and /al rewrites), which makes this route dynamic. Everything visual is
// already a client component bound to the language context, so the server
// render is a thin shell — and the product lookup above stays cached.
export async function generateMetadata(): Promise<Metadata> {
  const market = await readMarketServer();
  const meta = HOME_META[market];
  const url = `${SITE_URL}${MARKET_PREFIX[market]}`;

  return {
    // `absolute` bypasses the layout's "%s | Original Patosnici" template,
    // which would otherwise duplicate the brand name.
    title: { absolute: meta.title },
    description: meta.description,
    keywords: meta.keywords,
    alternates: {
      canonical: url,
      languages: {
        "mk-MK": SITE_URL,
        "sq-XK": `${SITE_URL}/ks`,
        "sq-AL": `${SITE_URL}/al`,
        "x-default": SITE_URL,
      },
    },
    openGraph: {
      type: "website",
      locale: meta.ogLocale,
      url,
      siteName: "Original Patosnici",
      title: meta.title,
      description: meta.description,
      images: [
        {
          url: OG_IMAGE,
          width: 1200,
          height: 630,
          alt: "Original Patosnici — Tapete gome për automjete",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: [OG_IMAGE],
    },
  };
}

export default async function Home() {
  const bestSellers = await getCachedBestSellers();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0b0b0b]">
        <Hero />
        <BrandSelector />
        <Features />
        <BestSellers products={bestSellers} />
        <Reviews />
        <TrustBar />
      </main>
    </>
  );
}
