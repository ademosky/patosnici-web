import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic"; // always fetch fresh product list

const SITE_URL = "https://www.originalpatosnici.com";

/**
 * Next.js App Router sitemap — served at /sitemap.xml
 *
 * Includes:
 *  - Static pages (homepage, products list, contact)
 *  - Every product page from Supabase (/products/[slug])
 *
 * Note: There are no dedicated /brands/[brand] routes in this project —
 * brand filtering is UI-state only on the /products page, so no brand
 * URLs are added to the sitemap.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all products — only slug and created_at needed for the sitemap
  const { data: products } = await supabase
    .from("products")
    .select("slug, created_at")
    .order("created_at", { ascending: true });

  const now = new Date();

  // ── Static pages ──────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/products`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // ── Product pages ─────────────────────────────────────────────────
  const productPages: MetadataRoute.Sitemap = (products ?? []).map((p) => ({
    url: `${SITE_URL}/products/${p.slug}`,
    lastModified: p.created_at ? new Date(p.created_at) : now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...productPages];
}
