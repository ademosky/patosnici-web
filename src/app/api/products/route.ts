import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { normalizeSearchWords, matchesAllWords } from "@/lib/search";

export async function GET(req: NextRequest) {
  const q     = req.nextUrl.searchParams.get("q")     || "";
  const brand = req.nextUrl.searchParams.get("brand") || "";

  const words = normalizeSearchWords(q);

  let query = supabase
    .from("products")
    .select("id, slug, title, brand, car_model, model, year, price, image, sku")
    .order("created_at", { ascending: true });

  if (brand) {
    query = query.eq("brand", brand);
  }

  const limitParam = parseInt(req.nextUrl.searchParams.get("limit") || "20");

  // Fetch ALL products (table is small, ~570 rows). Filtering entirely in JS
  // avoids Supabase's broad OR-match problem where a short word like "5"
  // matches hundreds of products and pushes the real match past .limit().
  const { data, error } = await query.limit(1000);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Multi-word AND filter: every search word must appear in at least one field.
  let results = data ?? [];
  if (words.length > 0) {
    results = results.filter((p) => {
      const haystack = [p.title, p.model, p.car_model, p.brand, p.sku]
        .filter(Boolean)
        .join(" ");
      return matchesAllWords(haystack, q);
    });
  }

  return NextResponse.json(results.slice(0, limitParam));
}
