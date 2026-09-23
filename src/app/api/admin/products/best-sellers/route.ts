import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { computeBestSellers, categoryLabel } from "@/lib/bestSellers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function checkAuth(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

// GET /api/admin/products/best-sellers?from=2026-01-01&to=2026-12-31&format=xlsx
//   from/to omitted  → all-time sales
//   format=json      → JSON list (default)
//   format=xlsx      → downloadable Excel file
export async function GET(req: NextRequest) {
  if (!checkAuth(req))
    return NextResponse.json({ error: "Неовластен пристап" }, { status: 401 });

  const params = req.nextUrl.searchParams;
  const from = params.get("from") || null;
  const to = params.get("to") || null;
  const q = params.get("q") || null;
  const format = params.get("format") || "json";

  let rows;
  try {
    rows = await computeBestSellers(from, to, q);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Грешка" }, { status: 500 });
  }

  if (format !== "xlsx") {
    return NextResponse.json({ rows, count: rows.length });
  }

  // ── Excel export ──
  const sheetRows = rows.map((r) => ({
    "Ранг": r.rank,
    "SKU": r.sku,
    "Назив": r.title,
    "Бренд": r.brand,
    "Категорија": categoryLabel(r.category),
    "Продадена количина": r.quantity,
    "Вкупна продажба (ден)": r.total,
  }));

  const ws = XLSX.utils.json_to_sheet(sheetRows);

  // Column widths — readable, not cramped
  ws["!cols"] = [
    { wch: 6 },   // Ранг
    { wch: 14 },  // SKU
    { wch: 42 },  // Назив
    { wch: 16 },  // Бренд
    { wch: 20 },  // Категорија
    { wch: 20 },  // Продадена количина
    { wch: 24 },  // Вкупна продажба
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Најпродавани");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  const period = from || to ? `${from || "pocetok"}_${to || "sega"}` : "celosna";
  const qSuffix = q ? `-${q.replace(/[^a-z0-9-]/gi, "")}` : "";
  const filename = `najprodavani-${period}${qSuffix}.xlsx`;

  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
