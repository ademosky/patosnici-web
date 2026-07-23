import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function checkAuth(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

// GET — list orders with optional date filter
export async function GET(req: NextRequest) {
  if (!checkAuth(req))
    return NextResponse.json({ error: "Неовластен пристап" }, { status: 401 });

  const month = req.nextUrl.searchParams.get("month"); // "2026-07"
  const status = req.nextUrl.searchParams.get("status"); // "new"|"in_process"|"sent"

  let query = supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (month) {
    const start = `${month}-01`;
    const [y, m] = month.split("-").map(Number);
    const nextMonth = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
    query = query.gte("created_at", start).lt("created_at", `${nextMonth}-01`);
  }

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST — create a manual order (from admin panel)
export async function POST(req: NextRequest) {
  if (!checkAuth(req))
    return NextResponse.json({ error: "Неовластен пристап" }, { status: 401 });

  const body = await req.json();
  const { name, surname, address, city, phone, email,
          product_title, product_price, product_sku, note, source } = body;

  if (!name || !surname || !phone)
    return NextResponse.json({ error: "Ime, Prezime и Telefon се задолжителни" }, { status: 400 });

  const { data, error } = await supabase
    .from("orders")
    .insert({
      name, surname, address, city, phone,
      email: email || null,
      items: null,
      product_title: product_title || null,
      product_price: product_price || null,
      product_sku: product_sku || null,
      note: note || null,
      source: source || "manual",
      status: "new",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
