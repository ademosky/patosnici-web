import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function checkAuth(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

// GET — list orders with optional date filter
export async function GET(req: NextRequest) {
  if (!checkAuth(req))
    return NextResponse.json({ error: "Неовластен пристап" }, { status: 401 });

  const month = req.nextUrl.searchParams.get("month"); // "2026-07"
  const status = req.nextUrl.searchParams.get("status"); // "new"|"in_process"|"sent"

  let query = supabaseAdmin()
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5000);

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

  /* Attach the stock state from the inventory table.
   *
   * Both admins read their orders from here, so resolving it once on the server
   * means neither has to make a second request — and the badge can never
   * disagree between them. An order with no SKU, or a SKU that is not in the
   * inventory at all, simply gets has_stock = false and shows nothing. */
  const { data: inv } = await supabaseAdmin().from("inventory").select("sku, quantity");

  const inStock = new Set<string>();
  for (const row of inv ?? []) {
    const r = row as { sku?: string | null; quantity?: number | null };
    const sku = String(r.sku ?? "").trim();
    if (sku && Number(r.quantity) > 0) inStock.add(sku);
  }

  const enriched = (data ?? []).map((o: any) => {
    const raw: Array<string | null | undefined> =
      o.items && o.items.length > 0
        ? o.items.map((it: any) => it?.sku)
        : [o.product_sku];

    const skus: string[] = [];
    for (const s of raw) {
      const v = String(s ?? "").trim();
      if (v && !skus.includes(v)) skus.push(v);
    }

    const hit = skus.filter((s) => inStock.has(s));
    return {
      ...o,
      order_skus: skus,
      stock_skus: hit,
      has_stock: hit.length > 0,
      full_stock: skus.length > 0 && hit.length === skus.length,
    };
  });

  return NextResponse.json(enriched);
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

  const { data, error } = await supabaseAdmin()
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
