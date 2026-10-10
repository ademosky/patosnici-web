import { supabase } from "@/lib/supabase";

export type Subcategory = {
  id: number;
  category: string;
  slug: string;
  name: string;
  name_sq: string | null;
  sort_order: number;
  created_at?: string;
};

/**
 * Subcategories for a parent category, in display order.
 *
 * Reads with the public anon key (RLS grants SELECT to everyone). If the table
 * is not reachable for any reason the storefront degrades to "no
 * subcategories" rather than erroring — the product grid always renders.
 */
export async function getSubcategories(category: string): Promise<Subcategory[]> {
  try {
    const { data, error } = await supabase
      .from("subcategories")
      .select("*")
      .eq("category", category)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      console.error("getSubcategories error:", error);
      return [];
    }
    return (data ?? []) as Subcategory[];
  } catch (e) {
    console.error("getSubcategories threw:", e);
    return [];
  }
}

/** Localised label, with a graceful fall back to the Macedonian name. */
export function subcategoryLabel(s: Pick<Subcategory, "name" | "name_sq">, lang: string): string {
  return lang === "sq" && s.name_sq && s.name_sq.trim() ? s.name_sq : s.name;
}
