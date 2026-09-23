import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * Best-seller computation.
 *
 * Counts sold quantity per product across ALL order items:
 *   - cart orders  → o.items[] (each item has quantity, sku, title, price)
 *   - single orders → product_sku / product_title (+1 each)
 *
 * Matching is by SKU when present, falling back to title.
 * "Total sales" sums price × quantity (numeric part of the price string).
 */

export type BestSellerRow = {
  rank: number;
  sku: string;
  title: string;
  brand: string;
  category: string;
  quantity: number;
  total: number;
};

const CATEGORY_LABEL: Record<string, string> = {
  rubber_mats: "Гумени патосници",
  fabric_mats: "Платнени патосници",
  auto_accessories: "Авто додатоци",
};

export function categoryLabel(category: string): string {
  return CATEGORY_LABEL[category] || category || "—";
}

/** Parse the numeric part of a price string like "2.490 ден" → 2490. */
function parsePrice(price: string): number {
  if (!price) return 0;
  return parseInt(String(price).replace(/\./g, "").replace(/[^\d]/g, ""), 10) || 0;
}

type OrderLike = {
  created_at?: string | null;
  items?: Array<{ sku?: string; title?: string; price?: string; quantity?: number }> | null;
  product_sku?: string | null;
  product_title?: string | null;
  product_price?: string | null;
};

/** Aggregate sold quantity + total revenue per product key. */
function aggregate(orders: OrderLike[]) {
  const counts = new Map<string, { quantity: number; total: number }>();

  const add = (key: string, quantity: number, price: number) => {
    const k = (key || "").trim();
    if (!k) return;
    const prev = counts.get(k) || { quantity: 0, total: 0 };
    prev.quantity += quantity;
    prev.total += price * quantity;
    counts.set(k, prev);
  };

  for (const o of orders) {
    if (Array.isArray(o.items) && o.items.length > 0) {
      for (const it of o.items) {
        const qty = it.quantity || 1;
        add((it.sku || it.title || "").trim(), qty, parsePrice(it.price || ""));
      }
    } else {
      add((o.product_sku || o.product_title || "").trim(), 1, parsePrice(o.product_price || ""));
    }
  }

  return counts;
}

/**
 * Compute the best-seller list.
 * @param from ISO date (YYYY-MM-DD) inclusive, or null for "all time"
 * @param to   ISO date (YYYY-MM-DD) inclusive, or null
 */
export async function computeBestSellers(
  from: string | null,
  to: string | null,
  q: string | null = null
): Promise<BestSellerRow[]> {
  const client = supabaseAdmin();

  let query = client
    .from("orders")
    .select("created_at, items, product_sku, product_title, product_price");

  // Inclusive date range: from >= from-day, to < (to-day + 1) so the end day is fully included.
  if (from) query = query.gte("created_at", from);
  if (to) {
    const d = new Date(`${to}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + 1);
    query = query.lt("created_at", d.toISOString().slice(0, 10));
  }

  const { data: orders, error } = await query;
  if (error) throw new Error(error.message);

  const counts = aggregate((orders || []) as OrderLike[]);
  if (counts.size === 0) return [];

  // Fetch product details (light columns only)
  const { data: products, error: prodErr } = await client
    .from("products")
    .select("title, brand, sku, category");

  if (prodErr) throw new Error(prodErr.message);

  const bySku = new Map<string, any>();
  const byTitle = new Map<string, any>();
  for (const p of products || []) {
    if (p.sku) bySku.set(String(p.sku).trim(), p);
    if (p.title) byTitle.set(String(p.title).trim(), p);
  }

  const rows: BestSellerRow[] = [];
  for (const [key, val] of counts.entries()) {
    const product = bySku.get(key) || byTitle.get(key) || null;
    rows.push({
      rank: 0,
      sku: product?.sku || key,
      title: product?.title || key,
      brand: product?.brand || "—",
      category: product?.category || "—",
      quantity: val.quantity,
      total: val.total,
    });
  }

  // Highest sold → lowest
  rows.sort((a, b) => b.quantity - a.quantity || b.total - a.total);
  rows.forEach((r, i) => (r.rank = i + 1));

  // Optional text filter (SKU primary; title/brand also match for convenience).
  if (q && q.trim()) {
    const needle = q.trim().toLowerCase();
    const filtered = rows.filter(
      (r) =>
        (r.sku || "").toLowerCase().includes(needle) ||
        (r.title || "").toLowerCase().includes(needle) ||
        (r.brand || "").toLowerCase().includes(needle)
    );
    // Re-rank within the filtered result so the export shows 1..n
    filtered.forEach((r, i) => (r.rank = i + 1));
    return filtered;
  }

  return rows;
}
