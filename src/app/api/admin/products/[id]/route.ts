import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function checkAuth(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(req))
    return NextResponse.json({ error: "Неовластен пристап" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const { data, error } = await supabase
    .from("products")
    .update({
      title: body.title,
      brand: body.brand,
      model: body.model,
      car_model: body.car_model || "",
      year: body.year,
      price: body.price,
      image: body.image,
      description: body.description,
      sku: body.sku ?? "",
      images: body.images || [],
    })
    .eq("id", parseInt(id))
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(req))
    return NextResponse.json({ error: "Неовластен пристап" }, { status: 401 });

  const { id } = await params;

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", parseInt(id));

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}