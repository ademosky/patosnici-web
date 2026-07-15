import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const q     = req.nextUrl.searchParams.get("q")     || "";
  const brand = req.nextUrl.searchParams.get("brand") || "";

  let query = supabase
    .from("products")
    .select("id, slug, title, brand, car_model, model, year, price, image")
    .order("created_at", { ascending: true });

  if (brand) {
    query = query.eq("brand", brand);
  }

  if (q) {
    query = query.or(
      `title.ilike.%${q}%,model.ilike.%${q}%,car_model.ilike.%${q}%,brand.ilike.%${q}%`
    );
  }

  const { data, error } = await query.limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
