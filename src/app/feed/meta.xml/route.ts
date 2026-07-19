import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // always fetch fresh products from Supabase

const SITE_URL = "https://www.originalpatosnici.com";

// Google Product Taxonomy ID for car floor mats:
// Vehicles & Parts > Vehicle Parts & Accessories > Motor Vehicle Interior Fittings > Motor Vehicle Floor Mats & Cargo Liners
const GOOGLE_CATEGORY = "Vehicles &amp; Parts &gt; Vehicle Parts &amp; Accessories &gt; Motor Vehicle Interior Fittings &gt; Motor Vehicle Floor Mats &amp; Cargo Liners";
const GOOGLE_CATEGORY_ID = "8433";

/** Escape characters that are invalid in XML text content. */
function xml(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Parse price from a Macedonian-formatted string.
 * Examples: "1.500 МКД" → "1500.00 MKD"  |  "1500 ден" → "1500.00 MKD"
 */
function formatPrice(raw: string | null | undefined): string {
  if (!raw) return "0.00 MKD";
  // Remove thousands separators (dots) then strip non-numeric chars except decimal comma
  const numeric = parseFloat(
    raw.replace(/\./g, "").replace(/,/g, ".").replace(/[^\d.]/g, "")
  ) || 0;
  return `${numeric.toFixed(2)} MKD`;
}

export async function GET() {
  // Fetch all products — feed includes both in-stock and out-of-stock
  // (Meta catalog tracks availability per item)
  const { data: products, error } = await supabase
    .from("products")
    .select("id, slug, title, description, brand, model, car_model, year, price, image, in_stock")
    .order("id", { ascending: true });

  if (error || !products) {
    return new NextResponse("Feed generation failed", { status: 500 });
  }

  const items = products
    .map((p) => {
      const availability = p.in_stock === false ? "out of stock" : "in stock";
      const imageUrl = p.image?.startsWith("http") ? p.image : "";
      const productUrl = `${SITE_URL}/products/${p.slug}`;

      // Build a clean description — use stored MK description if available
      const description =
        p.description?.trim() ||
        `${xml(p.brand)} ${xml(p.model)} ${xml(p.year)} — Оригинален гумен патосник. Прецизно пасување, еко гума без мирис. Достава низ цела Македонија.`;

      return `
    <item>
      <g:id>${p.id}</g:id>
      <g:title>${xml(p.title)}</g:title>
      <g:description>${xml(description)}</g:description>
      <g:availability>${availability}</g:availability>
      <g:condition>new</g:condition>
      <g:price>${formatPrice(p.price)}</g:price>
      <g:link>${productUrl}</g:link>
      <g:image_link>${imageUrl}</g:image_link>
      <g:brand>${xml(p.brand)}</g:brand>
      <g:google_product_category>${GOOGLE_CATEGORY_ID}</g:google_product_category>
      <g:product_type>${GOOGLE_CATEGORY}</g:product_type>
    </item>`;
    })
    .join("");

  const xml_feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Original Patosnici — Каталог на производи</title>
    <link>${SITE_URL}</link>
    <description>Оригинални гумени патосници за сите марки возила. Достава низ цела Македонија.</description>
${items}
  </channel>
</rss>`;

  return new NextResponse(xml_feed, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      // Cache 1 hour on CDN; stale-while-revalidate allows serving stale for 24h while refreshing
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
