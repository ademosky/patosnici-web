export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";

const DATA_FILE = join(process.cwd(), "src/app/data/products.json");

function checkAuth(req: NextRequest) {
  const pw = req.headers.get("x-admin-password");
  return pw === process.env.ADMIN_PASSWORD;
}

// GET — врати ги сите производи
export async function GET() {
  const data = await readFile(DATA_FILE, "utf-8");
  return NextResponse.json(JSON.parse(data));
}

// POST — додај нов производ
export async function POST(req: NextRequest) {
  if (!checkAuth(req))
    return NextResponse.json({ error: "Неовластен пристап" }, { status: 401 });

  const body = await req.json();
  const products = JSON.parse(await readFile(DATA_FILE, "utf-8"));

  const slug = body.title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");

    const newProduct = {
  id: products.length > 0 ? Math.max(...products.map((p: any) => p.id)) + 1 : 1,
  slug,
  title: body.title,
  brand: body.brand,
  model: body.model,
  year: body.year,
  price: body.price,
  image: body.image || "/products/golf5.jpg",
  images: [],
  description: body.description || "",
  sku: body.sku || "",   // ← НОВО
};

  products.push(newProduct);
  await writeFile(DATA_FILE, JSON.stringify(products, null, 2), "utf-8");

  return NextResponse.json(newProduct, { status: 201 });
}