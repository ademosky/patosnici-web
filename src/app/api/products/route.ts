import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { normalizeSearchWords, matchesAllWords } from "@/lib/search";

export async function GET(req: NextRequest) {
  const q     = req.nextUrl.searchParams.get("q")     || "";
  const brand = req.nextUrl.searchParams.get("brand") || "";

  // Split the query into words so "mercedes c" matches
  // "MERCEDES (W204) C-KLASSE" (each word is matched independently).
  const words = normalizeSearchWords(q);

  let query = supabase
    .from("products")
    .select("id, slug, title, brand, car_model, model, year, price, image, sku")
    .order("created_at", { ascending: true });

  if (brand) {
    query = query.eq("brand", brand);
  }

  // Broad OR match on ANY word (Supabase) — we narrow to ALL words in JS below.
  if (words.length > 0) {
    query = query.or(
      words
        .map((w) =>
          `title.ilike.%${w}%,model.ilike.%${w}%,car_model.ilike.%${w}%,brand.ilike.%${w}%,sku.ilike.%${w}%`
        )
        .join(",")
    );
  }

  const limitParam = parseInt(req.nextUrl.searchParams.get("limit") || "20");
  // Fetch a larger candidate set, then narrow — ensures multi-word results
  // aren't lost before the JS AND-filter.
  const { data, error } = await query.limit(Math.max(limitParam, 100));

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // JS AND-filter: every search word must appear in at least one field.
  // Normalizes hyphens/parens so "C-KLASSE" matches "c klasse", etc.
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
