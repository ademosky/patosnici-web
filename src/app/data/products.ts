import { supabase } from "@/lib/supabase";
import { brands } from "./brands";

export type Product = {
  id: number;
  slug: string;
  title: string;
  brand: string;
  car_model: string;   // ← НОВО (пр. "A3", "Golf", "Seria 3")
  model: string;       // специфичен вариант (пр. "A3 8V")
  year: string;
  price: string;
  image: string;
  images?: string[];
  description: string;
  sku?: string;
  in_stock?: boolean;
  description_sq?: string;
  price_eur?: string;
  category?: string;   // rubber_mats | fabric_mats | auto_accessories
  subcategory?: string | null;  // slug from the subcategories table
  /** When set, this accessory is recommended ONLY on that product's page. */
  related_product_id?: number | null;
};

export type ProductCategory = "rubber_mats" | "fabric_mats" | "auto_accessories";
export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true }).order("created_at", { ascending: true });

  if (error) { console.error("getProducts error:", error); return []; }
  return data as Product[];
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category", category)
    .order("sort_order", { ascending: true }).order("created_at", { ascending: true });

  if (error) { console.error("getProductsByCategory error:", error); return []; }
  return data as Product[];
}

export async function getProductsBySkus(skus: string[]): Promise<Product[]> {
  if (!skus.length) return [];
  // Lightweight: only the fields ProductCard needs (no images/description blobs).
  const { data, error } = await supabase
    .from("products")
    .select("id, slug, title, brand, model, car_model, year, price, image, sku, price_eur, in_stock")
    .in("sku", skus);

  if (error) { console.error("getProductsBySkus error:", error); return []; }

  // Preserve the requested SKU order.
  return skus
    .map((sku) => (data || []).find((p) => p.sku === sku))
    .filter(Boolean) as Product[];
}

/** Normalize a brand string for case-insensitive comparison. */
function norm(str: string): string {
  return (str || "").toLowerCase().replace(/\s+/g, " ").trim();
}

/**
 * Recommend auto-accessories for a product page.
 *
 * Rules, in priority order:
 *
 *  1. The accessory is linked to this EXACT product → pinned to it alone.
 *     This is the precise control: the Fabia II wiper shows on the Fabia II
 *     mats, not on all four Fabia generations.
 *  2. Otherwise, if the accessory names a vehicle model → that model only.
 *  3. Otherwise, a matching brand → that brand's products.
 *  4. Brand "all" (universal) → appears everywhere.
 *
 * Model names are compared loosely (case, spacing) so "Golf 5" and "golf  5"
 * are the same target.
 */
export async function getRecommendedAccessories(
  product: { id?: number; brand: string; car_model?: string | null },
  limit = 4,
): Promise<Product[]> {
  const brandId = product.brand;
  const productModel = norm(product.car_model ?? "");
  const productId = product.id ?? null;

  const { data, error } = await supabase
    .from("products")
    .select("id, slug, title, brand, car_model, related_product_id, year, price, image, sku, price_eur, in_stock")
    .eq("category", "auto_accessories")
    .order("sort_order", { ascending: true }).order("created_at", { ascending: true });

  if (error) { console.error("getRecommendedAccessories error:", error); return []; }

  // Never recommend something that is not available.
  const items = ((data || []) as Product[]).filter((p) => p.in_stock !== false);

  // Resolve brand id (slug like "volkswagen") to display name ("Volkswagen").
  const brandName = brands.find((b) => b.id === brandId)?.name ?? brandId;
  const brandTargets = [norm(brandName), norm(brandId)];
  const sameBrand = (p: Product) => brandTargets.includes(norm(p.brand));

  const linked: Product[] = [];
  const modelMatches: Product[] = [];
  const brandMatches: Product[] = [];
  const universal: Product[] = [];

  for (const p of items) {
    // Rule 1 — explicitly linked to one product. It belongs to that page only.
    if (p.related_product_id != null) {
      if (productId != null && p.related_product_id === productId) linked.push(p);
      continue;
    }

    const accModel = norm(p.car_model ?? "");
    if (accModel) {
      // Rule 2 — bound to a whole model.
      if (productModel && accModel === productModel) modelMatches.push(p);
      continue;
    }

    if (norm(p.brand) === "all") universal.push(p);
    else if (sameBrand(p)) brandMatches.push(p);
  }

  // An exact link outranks anything broader.
  return [...linked, ...modelMatches, ...brandMatches, ...universal].slice(0, limit);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data as Product;
}