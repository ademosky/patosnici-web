import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

function checkAuth(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

// Body: { orderedIds: number[] } — array of showcase ids in the desired order
export async function POST(req: NextRequest) {
  if (!checkAuth(req))
    return NextResponse.json({ error: "Неовластен пристап" }, { status: 401 });

  const { orderedIds } = await req.json();
  if (!Array.isArray(orderedIds))
    return NextResponse.json({ error: "orderedIds мора да биде низа" }, { status: 400 });

  const updates = orderedIds.map((id, index) =>
    supabaseAdmin()
      .from("showcase")
      .update({ sort_order: index })
      .eq("id", parseInt(String(id)))
  );

  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  if (failed?.error)
    return NextResponse.json({ error: failed.error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
