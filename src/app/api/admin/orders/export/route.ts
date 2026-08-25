import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import * as XLSX from "xlsx";

export const runtime = "nodejs";

function checkAuth(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

const STATUS_LABEL: Record<string, string> = {
  new: "Нова",
  in_process: "Во процес",
  sent: "Испратена",
};

// GET /api/admin/orders/export?month=2026-07
// Exports ALL orders for the month (no status filter) as an .xlsx file.
export async function GET(req: NextRequest) {
  if (!checkAuth(req))
    return NextResponse.json({ error: "Неовластен пристап" }, { status: 401 });

  const month = req.nextUrl.searchParams.get("month") || "";

  let query = supabaseAdmin()
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (month) {
    const [y, m] = month.split("-").map(Number);
    const nextMonth = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
    query = query.gte("created_at", `${month}-01`).lt("created_at", `${nextMonth}-01`);
  }

  const { data: orders, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Flatten each order into a spreadsheet row
  const rows = (orders || []).map((o) => {
    // Build a single products string from items[] or single-product fields
    let products = "";
    if (Array.isArray(o.items) && o.items.length > 0) {
      products = o.items
        .map((it: any) => `${it.quantity || 1}× ${it.title || ""} — ${it.price || ""}${it.sku ? ` (${it.sku})` : ""}`)
        .join("; ");
    } else if (o.product_title) {
      products = `1× ${o.product_title} — ${o.product_price || ""}${o.product_sku ? ` (${o.product_sku})` : ""}`;
    }

    return {
      "ID": o.id,
      "Датум": o.created_at ? new Date(o.created_at).toLocaleString("mk-MK") : "",
      "Статус": STATUS_LABEL[o.status] || o.status,
      "Извор": o.source || "web",
      "Валута": o.currency || "MKD",
      "Ime": o.name || "",
      "Презиме": o.surname || "",
      "Телефон": o.phone || "",
      "Email": o.email || "",
      "Адреса": o.address || "",
      "Град": o.city || "",
      "Производи": products,
      "SKU": o.product_sku || (Array.isArray(o.items) ? o.items.map((i: any) => i.sku || "").filter(Boolean).join("; ") : ""),
      "Напомена": o.note || "",
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Нарачки");

  // Auto-width columns (rough)
  const colWidths = Object.keys(rows[0] || {}).map(() => ({ wch: 18 }));
  ws["!cols"] = colWidths;

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  const filename = `naracki-${month || "site"}.xlsx`;
  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
