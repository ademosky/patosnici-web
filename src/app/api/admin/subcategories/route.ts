import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { uniqueSlug } from "@/lib/slug";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function checkAuth(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

// GET — list subcategories, optionally for one parent category
export async function GET(req: NextRequest) {
  if (!checkAuth(req))
    return NextResponse.json({ error: "Неовластен пристап" }, { status: 401 });

  const category = req.nextUrl.searchParams.get("category");

  let query = supabaseAdmin()
    .from("subcategories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (category) query = query.eq("category", category);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST — create a subcategory
export async function POST(req: NextRequest) {
  if (!checkAuth(req))
    return NextResponse.json({ error: "Неовластен пристап" }, { status: 401 });

  const { name, name_sq, category } = await req.json();
  if (!name || !String(name).trim())
    return NextResponse.json({ error: "Името е задолжително" }, { status: 400 });

  const cat = (category as string) || "auto_accessories";

  // Slugs are unique per parent category, so the same name can exist in two.
  const { data: existing } = await supabaseAdmin()
    .from("subcategories")
    .select("slug, sort_order")
    .eq("category", cat);

  const taken = (existing ?? []).map((r) => r.slug as string);
  const slug = uniqueSlug(String(name), taken);
  const nextOrder = (existing ?? []).reduce(
    (m, r) => Math.max(m, (r.sort_order as number) ?? 0), -1,
  ) + 1;

  const { data, error } = await supabaseAdmin()
    .from("subcategories")
    .insert([{
      category: cat,
      slug,
      name: String(name).trim(),
      name_sq: name_sq ? String(name_sq).trim() : null,
      sort_order: nextOrder,
    }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
