import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

/**
 * GET /api/best-sellers
 * Returns the top 4 best-selling products based on completed (sent) orders.
 * Counts each product's occurrences across single-product orders and cart
 * items (by SKU when present, falling back to title), then joins to products.
 */
export async function GET() {
  const { data: orders, error } = await supabase
    .from("orders")
    .select("product_sku, product_title, items")
    .eq("status", "sent");

  if (error) return NextResponse.json({ error: error.message, code: error.code, hint: error.hint }, { status: 500 });

  // Count sales per product key (sku preferred, title fallback)
  const counts = new Map<string, number>();
  for (const o of orders || []) {
    if (Array.isArray(o.items) && o.items.length > 0) {
      for (const it of o.items) {
        const key = (it.sku || it.title || "").trim();
        if (key) counts.set(key, (counts.get(key) || 0) + (it.quantity || 1));
      }
    } else {
      const key = (o.product_sku || o.product_title || "").trim();
      if (key) counts.set(key, (counts.get(key) || 0) + 1);
    }
  }

  // Sort descending, take top 4
  const topKeys = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([k]) => k);

  if (topKeys.length === 0) return NextResponse.json([]);

  // Fetch all products (small table) and join + preserve popularity order
  const { data: products, error: prodErr } = await supabase
    .from("products")
    .select("*");

  if (prodErr) return NextResponse.json({ error: prodErr.message, code: prodErr.code }, { status: 500 });

  const ordered = topKeys
    .map((key) =>
      (products || []).find(
        (p) =>
          (p.sku && p.sku.trim() === key) ||
          (p.title && p.title.trim() === key)
      )
    )
    .filter(Boolean);

  return NextResponse.json(ordered);
  } catch (e: any) {
    return NextResponse.json({ fatal: String(e?.message || e) }, { status: 500 });
  }
}
