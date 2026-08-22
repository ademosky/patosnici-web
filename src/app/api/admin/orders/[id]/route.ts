import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function checkAuth(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

// PATCH — update order (status, customer info, products, prices, etc.)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(req))
    return NextResponse.json({ error: "Неовластен пристап" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  // Build update payload from allowed fields (only present keys are updated)
  const update: Record<string, unknown> = {};
  const stringFields = [
    "name", "surname", "address", "city", "phone", "email",
    "note", "status", "source", "currency",
    "product_title", "product_price", "product_sku",
  ];
  for (const f of stringFields) {
    if (body[f] !== undefined) update[f] = body[f];
  }
  if (body.items !== undefined) update["items"] = body.items;

  const { data, error } = await supabase
    .from("orders")
    .update(update)
    .eq("id", parseInt(id))
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE — permanently remove an order
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(req))
    return NextResponse.json({ error: "Неовластен пристап" }, { status: 401 });

  const { id } = await params;

  const { error } = await supabase
    .from("orders")
    .delete()
    .eq("id", parseInt(id));

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
