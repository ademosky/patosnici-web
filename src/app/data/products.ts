import { supabase } from "@/lib/supabase";

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
};
export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) { console.error("getProducts error:", error); return []; }
  return data as Product[];
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