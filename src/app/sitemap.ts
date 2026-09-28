import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import { marketAlternates, SITE_URL } from "@/lib/market-server";

export const revalidate = 3600; // rebuild hourly — products change rarely

/** Every storefront shares the same content — three URLs, one product set. */
const MARKET_PREFIXES = ["", "/ks", "/al"] as const;

/**
 * Next.js App Router sitemap — served at /sitemap.xml
 *
 * Includes:
 *  - Static pages for all three markets (/, /ks, /al)
 *  - Every product page from Supabase, per market
 *
 * Note: there are no dedicated /brands/[brand] routes — brand filtering is
 * UI state on /products, so no brand URLs are added.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Only the fields the sitemap needs — no description/image blobs.
  const { data: products } = await supabase
    .from("products")
    .select("slug, created_at")
    .order("created_at", { ascending: true });

  const now = new Date();

  // ── Static pages ──────────────────────────────────────────────────
  const staticPaths = [
    { path: "", priority: 1.0, changeFrequency: "weekly" as const },
    { path: "/products", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/create-own", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/auto-accessories", priority: 0.7, changeFrequency: "weekly" as const },
    { path: "/contact", priority: 0.5, changeFrequency: "monthly" as const },
  ];

  const staticPages: MetadataRoute.Sitemap = [];
  for (const prefix of MARKET_PREFIXES) {
    for (const p of staticPaths) {
      staticPages.push({
        url: `${SITE_URL}${prefix}${p.path}`,
        lastModified: now,
        changeFrequency: p.changeFrequency,
        priority: p.priority,
        alternates: { languages: marketAlternates(p.path) },
      });
    }
  }

  // ── Product pages, per market ─────────────────────────────────────
  const productPages: MetadataRoute.Sitemap = [];
  for (const p of products ?? []) {
    const path = `/products/${p.slug}`;
    for (const prefix of MARKET_PREFIXES) {
      productPages.push({
        url: `${SITE_URL}${prefix}${path}`,
        lastModified: p.created_at ? new Date(p.created_at) : now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
        alternates: { languages: marketAlternates(path) },
      });
    }
  }

  return [...staticPages, ...productPages];
}
