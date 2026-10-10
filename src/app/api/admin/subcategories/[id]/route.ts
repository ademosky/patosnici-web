import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function checkAuth(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

// PATCH — rename, translate or reorder
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!checkAuth(req))
    return NextResponse.json({ error: "Неовластен пристап" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const update: Record<string, unknown> = {};
  if (body.name !== undefined) update.name = String(body.name).trim();
  if (body.name_sq !== undefined)
    update.name_sq = body.name_sq ? String(body.name_sq).trim() : null;
  if (body.sort_order !== undefined) update.sort_order = Number(body.sort_order);

  if (!Object.keys(update).length)
    return NextResponse.json({ error: "Нема што да се смени" }, { status: 400 });

  const { data, error } = await supabaseAdmin()
    .from("subcategories")
    .update(update)
    .eq("id", parseInt(id))
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE — remove the subcategory. Its products are NOT deleted: the tag is
// cleared so they simply fall back into the "Останато" group.
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!checkAuth(req))
    return NextResponse.json({ error: "Неовластен пристап" }, { status: 401 });

  const { id } = await params;

  const { data: row } = await supabaseAdmin()
    .from("subcategories")
    .select("slug")
    .eq("id", parseInt(id))
    .single();

  if (!row) return NextResponse.json({ error: "Не е најдена" }, { status: 404 });

  const { error: clearError } = await supabaseAdmin()
    .from("products")
    .update({ subcategory: null })
    .eq("subcategory", row.slug);

  if (clearError)
    return NextResponse.json({ error: clearError.message }, { status: 500 });

  const { error } = await supabaseAdmin()
    .from("subcategories")
    .delete()
    .eq("id", parseInt(id));

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
