import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

function checkAuth(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req))
    return NextResponse.json({ error: "Неовластен пристап" }, { status: 401 });

  const { data, error } = await supabaseAdmin()
    .from("showcase")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req))
    return NextResponse.json({ error: "Неовластен пристап" }, { status: 401 });

  const { image, brand, model } = await req.json();
  if (!image || !brand || !model)
    return NextResponse.json({ error: "Слика, Марка и Модел се задолжителни" }, { status: 400 });

  // Determine next sort_order
  const { data: maxData } = await supabaseAdmin()
    .from("showcase")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();

  const nextOrder = (maxData?.sort_order ?? -1) + 1;

  const { data, error } = await supabaseAdmin()
    .from("showcase")
    .insert({
      image: image.trim(),
      brand: brand.trim(),
      model: model.trim(),
      sort_order: nextOrder,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
