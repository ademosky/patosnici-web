export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join, extname } from "path";
import { existsSync } from "fs";

const UPLOAD_DIR = join(process.cwd(), "public/images/products");

function checkAuth(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

export async function POST(req: NextRequest) {
  try {
    if (!checkAuth(req))
      return NextResponse.json({ error: "Неовластен пристап" }, { status: 401 });

    // Создај фолдер
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    // Парсирај form data
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch (err) {
      console.error("FormData parse error:", err);
      return NextResponse.json({ error: `FormData грешка: ${err}` }, { status: 400 });
    }

    const file = formData.get("file") as File | null;
    console.log("File:", file?.name, "Type:", file?.type, "Size:", file?.size);

    if (!file)
      return NextResponse.json({ error: "Нема фајл во барањето" }, { status: 400 });

    // Провери наставка
    const ext = extname(file.name).toLowerCase();
    console.log("Extension:", ext);

    const allowedExt = [".jpg", ".jpeg", ".png", ".webp"];
    if (!allowedExt.includes(ext))
      return NextResponse.json({ error: `Неподдржан формат: ${ext}` }, { status: 400 });

    // Провери големина
    if (file.size > 5 * 1024 * 1024)
      return NextResponse.json({ error: `Преголем фајл: ${Math.round(file.size/1024)}KB` }, { status: 400 });

    // Генерирај ime
    const nameWithoutExt = (file.name
      .toLowerCase()
      .replace(extname(file.name), "")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .slice(0, 40)) || "slika";

    const filename = `${nameWithoutExt}-${Date.now()}${ext}`;
    const fullPath = join(UPLOAD_DIR, filename);
    console.log("Saving to:", fullPath);

    // Зачувај
    const bytes = await file.arrayBuffer();
    await writeFile(fullPath, Buffer.from(bytes));
    console.log("Saved successfully!");

    return NextResponse.json({
      path: `/images/products/${filename}`,
      filename,
      sizeKB: Math.round(file.size / 1024),
    });

  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: `Серверска грешка: ${err?.message ?? err}` },
      { status: 500 }
    );
  }
}