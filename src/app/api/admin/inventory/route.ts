import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function auth(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

// GET — list all inventory items
export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Неовластен" }, { status: 401 });

  const { data, error } = await supabase
    .from("inventory")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST — add new inventory item
export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Неовластен" }, { status: 401 });

  const { sku, name, quantity } = await req.json();
  if (!sku || !name) return NextResponse.json({ error: "SKU и Ime се задолжителни" }, { status: 400 });

  const { data, error } = await supabase
    .from("inventory")
    .insert({ sku: sku.trim(), name: name.trim(), quantity: parseInt(quantity) || 1 })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
