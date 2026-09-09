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
 * Recommend auto-accessories for a given product's brand (brand id slug).
 * - Exact brand match first (e.g. rubber "audi" → accessory brand "Audi"/"audi").
 * - Fallback to any other accessories if no same-brand accessory exists.
 */
export async function getRecommendedAccessories(brandId: string, limit = 4): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("id, slug, title, brand, year, price, image, sku, price_eur, in_stock")
    .eq("category", "auto_accessories")
    .order("sort_order", { ascending: true }).order("created_at", { ascending: true });

  if (error) { console.error("getRecommendedAccessories error:", error); return []; }
  const items = (data || []) as Product[];

  // Resolve brand id (slug like "volkswagen") to display name ("Volkswagen").
  const brandName = brands.find((b) => b.id === brandId)?.name ?? brandId;
  const target = norm(brandName);
  // Also compare against the raw id (e.g. accessory stored as "volkswagen" directly).
  const targetAlt = norm(brandId);

  // Universal accessories (brand "all") show everywhere.
  const universal = items.filter((p) => norm(p.brand) === "all");

  // Same-brand accessories only (no arbitrary fallback).
  const sameBrand = items.filter((p) => {
    const n = norm(p.brand);
    return n === target || n === targetAlt;
  });

  return [...sameBrand, ...universal].slice(0, limit);
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