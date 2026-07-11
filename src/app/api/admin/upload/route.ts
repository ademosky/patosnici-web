import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { extname } from "path";

function checkAuth(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req))
    return NextResponse.json({ error: "Неовластен пристап" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file)
    return NextResponse.json({ error: "Нема фајл" }, { status: 400 });

  const ext = extname(file.name).toLowerCase();
  const allowed = [".jpg", ".jpeg", ".png", ".webp"];
  if (!allowed.includes(ext))
    return NextResponse.json({ error: "Само JPG, PNG или WebP!" }, { status: 400 });

  if (file.size > 5 * 1024 * 1024)
    return NextResponse.json({ error: "Максимум 5MB!" }, { status: 400 });

  const safeName = file.name
    .toLowerCase()
    .replace(extname(file.name), "")
    .replace(/[^a-z0-9-]/g, "-")
    .slice(0, 40) || "slika";
  const filename = `${safeName}-${Date.now()}${ext}`;

  const bytes = await file.arrayBuffer();

  const { error } = await supabase.storage
    .from("products")
    .upload(filename, bytes, {
      contentType: file.type || "image/webp",
      upsert: false,
    });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const { data } = supabase.storage
    .from("products")
    .getPublicUrl(filename);

  return NextResponse.json({
    path: data.publicUrl,
    filename,
    sizeKB: Math.round(file.size / 1024),
  });
}