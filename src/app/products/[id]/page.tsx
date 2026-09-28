import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Header from "../../components/Header";
import OrderForm from "../../components/OrderForm";
import ImageCarousel from "../../components/ImageCarousel";
import { getProductBySlug, getRecommendedAccessories } from "../../data/products";
import {
  Market,
  MARKET_CURRENCY,
  MARKET_PREFIX,
  getEurValue,
  getAllValue,
} from "@/lib/pricing";
import { CheckCircle, ArrowLeft, Tag } from "lucide-react";
import AddToCartButton from "../../components/AddToCartButton";
import ProductDescription from "../../components/ProductDescription";
import ProductViewEvent from "../../components/ProductViewEvent";
import PriceDisplay from "../../components/PriceDisplay";
import ProductFeatures from "../../components/ProductFeatures";
import OrderHeader from "../../components/OrderHeader";
import BackLink from "../../components/BackLink";
import OriginalBadge from "../../components/OriginalBadge";
import PaymentNote from "../../components/PaymentNote";
import RecommendedProducts from "../../components/RecommendedProducts";

export const dynamic = "force-dynamic";

const SITE_URL = "https://www.originalpatosnici.com";

// Detect the market — stamped by src/middleware.ts BEFORE the /ks or /al
// rewrite. Reliable header instead of x-invoke-path (Vercel doesn't populate it).
async function readMarketServer(): Promise<Market> {
  try {
    const h = await headers();
    const m = h.get("x-market");
    if (m === "ks" || m === "al" || m === "mk") return m;
    // Fallbacks: legacy Kosovo header, then the original path
    if (h.get("x-ks-locale") === "1") return "ks";
    const path = h.get("x-original-path") || "";
    if (path.startsWith("/al")) return "al";
    if (path.startsWith("/ks")) return "ks";
    return "mk";
  } catch {
    return "mk";
  }
}

type Props = {
  params: Promise<{ id: string }>;
};

// Dynamic OG meta tags per product — enables image preview on Messenger/Facebook/WhatsApp
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductBySlug(id);

  if (!product) {
    return { title: "Производ не е пронајден | Original Patosnici" };
  }

  // ── Title: product | Оригинални гумени патосници | OriginalPatosnici.com
  const title = `${product.title} | Оригинални гумени патосници | OriginalPatosnici.com`;

  // ── Market (mk | ks | al) drives description, canonical and hreflang ──
  const market = await readMarketServer();

  // ── Description: unique per product, market-localised, max 160 chars
  const descriptions: Record<Market, string> = {
    mk: `Купете оригинални гумени патосници за ${product.title}. 100% еко гума без мирис, совршено вклопување, брза достава низ Македонија. Нарачајте онлајн.`,
    ks: `Bleni tapete origjinale gome për ${product.title}. Gome ekologjike pa erë, përshtatje perfekte, dërgesë e shpejtë në Kosovë. Porositni online.`,
    al: `Bleni tapete origjinale gome për ${product.title}. Gome ekologjike pa erë, përshtatje perfekte, dërgesë e shpejtë në Shqipëri. Porositni online.`,
  };
  const descRaw = descriptions[market];
  const description =
    descRaw.length > 160 ? descRaw.slice(0, 157) + "..." : descRaw;

  // ── Canonical URL — always the market's own URL
  const canonicalUrl = `${SITE_URL}${MARKET_PREFIX[market]}/products/${product.slug}`;

  // ── hreflang — tell Google these three URLs are the same product
  const alternatesLanguages = {
    "mk-MK": `${SITE_URL}/products/${product.slug}`,
    "sq-XK": `${SITE_URL}/ks/products/${product.slug}`,
    "sq-AL": `${SITE_URL}/al/products/${product.slug}`,
    "x-default": `${SITE_URL}/products/${product.slug}`,
  };

  const ogLocale: Record<Market, string> = {
    mk: "mk_MK",
    ks: "sq_XK",
    al: "sq_AL",
  };

  // ── OG image — product image if absolute URL, else fallback to logo
  const ogImage = product.image?.startsWith("http")
    ? product.image
    : `${SITE_URL}/images/logo.webp`;

  return {
    title,
    description,

    // Canonical URL tells Google the definitive URL for this page
    alternates: {
      canonical: canonicalUrl,
      languages: alternatesLanguages,
    },

    openGraph: {
      type: "website",
      locale: ogLocale[market],
      url: canonicalUrl,
      siteName: "Original Patosnici",
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${product.title} — Оригинални гумени патосници`,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProductBySlug(id);

  if (!product) notFound();

  // Market prefix for structured data URLs
  const market = await readMarketServer();
  const productUrl = `${SITE_URL}${MARKET_PREFIX[market]}/products/${product.slug}`;

  // Structured-data price must match the currency the visitor actually sees
  const marketCurrency = MARKET_CURRENCY[market];
  const ldPrice =
    marketCurrency === "EUR"
      ? getEurValue(product.price, product.price_eur)
      : marketCurrency === "ALL"
        ? getAllValue(product.price, product.price_eur)
        : parseFloat(product.price.replace(/\./g, "").replace(/[^\d]/g, "")) || 0;

  // Recommended auto-accessories for this product's brand (dynamic).
  const recommended = await getRecommendedAccessories(product.brand);

  return (
    <>
      <Header />

      {/* ── Product JSON-LD — Google Rich Results / Schema.org ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.title,
            image: product.images && product.images.length > 0
              ? product.images
              : product.image
              ? [product.image]
              : [],
            description:
              product.description ||
              `${product.brand} ${product.model} ${product.year} — Оригинален гумен патосник за автомобил. Достава низ цела Македонија.`,
            sku: product.sku || undefined,
            brand: {
              "@type": "Brand",
              name: product.brand,
            },
            offers: {
              "@type": "Offer",
              price:
                parseFloat(
                  product.price.replace(/\./g, "").replace(/[^\d]/g, "")
                ) || 0,
              priceCurrency: "MKD",
              availability:
                product.in_stock === false
                  ? "https://schema.org/OutOfStock"
                  : "https://schema.org/InStock",
              itemCondition: "https://schema.org/NewCondition",
              url: `${SITE_URL}/products/${product.slug}`,
              seller: {
                "@type": "Organization",
                name: "Original Patosnici",
                url: SITE_URL,
              },
            },
            url: productUrl,
          }),
        }}
      />

      {/* Meta Pixel — ViewContent fired once on product page mount */}
      <ProductViewEvent
        productId={product.id}
        productName={product.title}
        productPrice={product.price}
      />
      <main className="min-h-screen bg-[#0b0b0b] pt-20 sm:pt-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">

          <BackLink />

          <div className="grid gap-8 sm:gap-12 lg:grid-cols-2">

            {/* Carousel */}
            <div className="relative">
              <ImageCarousel
                images={product.images && product.images.length > 0 ? product.images : [product.image]}
                alt={product.title}
              />
              {product.category !== "auto_accessories" && <OriginalBadge />}
              {product.in_stock === false && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60">
                  <span className="rounded-2xl border border-zinc-500 bg-zinc-900/95 px-8 py-4 text-xl font-black uppercase tracking-widest text-zinc-300">
                    {ks ? "Nuk ka stok" : "Нема залиха"}
                  </span>
                </div>
              )}
            </div>

            {/* Инфо */}
            <div className="flex flex-col justify-center">
              <p className="text-xs font-bold uppercase tracking-widest text-red-600">
                {product.brand.toUpperCase()} · {product.year}
              </p>

              <h1 className="mt-3 text-2xl sm:text-4xl font-black uppercase leading-tight text-white">
                {product.title}
              </h1>

              {/* Модел + SKU */}
              <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="text-sm text-zinc-400">
                  {product.model} · {product.year}
                </span>
                {product.sku && (
                  <span className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1">
                    <span className="text-xs text-zinc-500">SKU</span>
                    <span className="font-mono text-sm font-bold text-white">
                      {product.sku}
                    </span>
                  </span>
                )}
              </div>

              <ProductDescription description_mk={product.description} description_sq={product.description_sq} />

              <div className="mt-6 sm:mt-8 flex items-end gap-3">
                <PriceDisplay price={product.price} priceEur={product.price_eur} className="text-5xl font-extrabold text-red-600" />
                <PaymentNote />
              </div>

              <ProductFeatures category={product.category} />

              <AddToCartButton product={{
                id: product.id,
                slug: product.slug,
                title: product.title,
                price: product.price,
                image: product.image,
                brand: product.brand,
                sku: product.sku,
                price_eur: product.price_eur,
              }} />
            </div>
          </div>

          {/* Order Form */}
          <div id="naracaj" className="mt-14 sm:mt-20">
            <OrderHeader productTitle={product.title} price={product.price} priceEur={product.price_eur} />
            <div className="mx-auto max-w-2xl">
              <OrderForm
                productTitle={product.title}
                productPrice={product.price}
                productSku={product.sku}
                productId={product.id}
                priceEur={product.price_eur}
              />
            </div>
          </div>

        </div>

        {/* Recommended products */}
        <RecommendedProducts products={recommended} />
      </main>
    </>
  );
}