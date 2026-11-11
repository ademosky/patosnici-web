import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { normalizeSearchWords, productMatchesQuery } from "@/lib/search";
export const dynamic = "force-dynamic";
export const revalidate = 0;


export async function GET(req: NextRequest) {
  const q     = req.nextUrl.searchParams.get("q")     || "";
  const brand = req.nextUrl.searchParams.get("brand") || "";

  const words = normalizeSearchWords(q);

  let query = supabase
    .from("products")
    .select("id, slug, title, brand, car_model, model, year, price, image, sku")
    .eq("hidden", false)
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
    /* productMatchesQuery also understands years: "golf 2010" finds the model
       whose production range covers 2010, which the old field-by-field text
       match could not do because a year range never literally contains it. */
    results = results.filter((p) => productMatchesQuery(p, q));
  }

  return NextResponse.json(results.slice(0, limitParam));
}
