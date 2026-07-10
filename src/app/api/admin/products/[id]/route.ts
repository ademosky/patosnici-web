export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";

const DATA_FILE = join(process.cwd(), "src/app/data/products.json");

function checkAuth(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

// PUT — ажурирај производ
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!checkAuth(req))
    return NextResponse.json({ error: "Неовластен пристап" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const products = JSON.parse(await readFile(DATA_FILE, "utf-8"));

  const index = products.findIndex((p: any) => p.id === parseInt(id));
  if (index === -1)
    return NextResponse.json({ error: "Не е пронајден" }, { status: 404 });

  products[index] = {
    ...products[index],
    title: body.title,
    brand: body.brand,
    model: body.model,
    year: body.year,
    price: body.price,
    image: body.image || products[index].image,
    description: body.description,
    sku: body.sku ?? products[index].sku ?? "",  
  };

  await writeFile(DATA_FILE, JSON.stringify(products, null, 2), "utf-8");
  return NextResponse.json(products[index]);
}

// DELETE — избриши производ
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!checkAuth(req))
    return NextResponse.json({ error: "Неовластен пристап" }, { status: 401 });

  const { id } = await params;
  const products = JSON.parse(await readFile(DATA_FILE, "utf-8"));
  const filtered = products.filter((p: any) => p.id !== parseInt(id));

  await writeFile(DATA_FILE, JSON.stringify(filtered, null, 2), "utf-8");
  return NextResponse.json({ success: true });
}