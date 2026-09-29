/**
 * Domain types + pure helpers for the admin app.
 *
 * These mirror the existing Supabase schema and the shapes the 12 existing
 * /api/admin/* routes already return — the backend is untouched.
 */

export {
  normalizePriceToMkd,
  getEurValue,
  getAllValue,
  formatPrice as formatMarketPrice,
  sumCartTotal,
} from "@/lib/pricing";

import { getEurValue, getAllValue, normalizePriceToMkd } from "@/lib/pricing";

export type Currency = "MKD" | "EUR" | "ALL";
export type OrderStatus = "new" | "in_process" | "sent";
export type Category = "rubber_mats" | "fabric_mats" | "auto_accessories";

export type OrderItem = {
  title: string;
  price: string;
  price_eur?: string | null;
  sku?: string | null;
  quantity: number;
};

export type Order = {
  id: number;
  created_at: string;
  name: string;
  surname: string;
  address: string;
  city: string;
  phone: string;
  email: string | null;
  note?: string | null;
  status: OrderStatus;
  source?: string | null;
  currency?: Currency | null;
  product_title?: string | null;
  product_price?: string | null;
  product_sku?: string | null;
  items?: OrderItem[] | null;
};

export type Product = {
  id: number;
  slug: string;
  title: string;
  brand: string;
  model: string;
  car_model?: string | null;
  year?: string | null;
  price: string;
  price_eur?: string | null;
  image: string;
  images?: string[] | null;
  description?: string | null;
  description_sq?: string | null;
  sku?: string | null;
  in_stock?: boolean | null;
  category?: Category | null;
  sort_order?: number | null;
  created_at?: string | null;
};

export type InvItem = {
  id: number;
  sku: string;
  name: string;
  quantity: number;
  created_at: string;
};

export type ShowcaseItem = {
  id: number;
  image: string;
  brand: string;
  model: string;
  sort_order: number;
};

/* ── money ─────────────────────────────────────────────────────────── */

/** Parse the numeric part of a messy MKD price string ("2.490 ден" → 2490). */
export const toNumber = normalizePriceToMkd;

/**
 * Kosovo EUR and Albania Lekë values.
 *
 * These are the STOREFRONT's own helpers — the same functions /ks and /al use
 * to render prices. Nothing is recomputed here, so an order shows exactly what
 * the customer was charged: 1.590 ден → 34 € (the ladder price), never a raw
 * currency conversion.
 */
export const eurValue = getEurValue;
export const allValue = getAllValue;

/** One unit's price in the currency the order was placed in. */
export function unitValue(
  price: string | null | undefined,
  priceEur: string | null | undefined,
  cur: Currency
): number {
  if (cur === "EUR") return getEurValue(price ?? "", priceEur);
  if (cur === "ALL") return getAllValue(price ?? "", priceEur);
  return normalizePriceToMkd(price);
}

/**
 * Order value in Macedonian denars — the shop's base currency.
 *
 * Every order line stores the MKD base price it was created from, so this is
 * an exact sum of stored values. It never converts from EUR/ALL, which would
 * re-introduce rounding and drift from the configured price ladder.
 */
export function orderTotalMkd(o: Order): number {
  if (o.items && o.items.length > 0) {
    return o.items.reduce(
      (s, it) => s + normalizePriceToMkd(it.price) * (it.quantity || 1),
      0
    );
  }
  return normalizePriceToMkd(o.product_price);
}

export function orderCurrency(o: Order): Currency {
  const c = o.currency;
  return c === "EUR" || c === "ALL" ? c : "MKD";
}

export function money(n: number, cur: Currency, compact = false): string {
  const sym = cur === "EUR" ? "€" : cur === "ALL" ? "Lekë" : "ден";
  if (compact && Math.abs(n) >= 1000) {
    const k = n / 1000;
    return `${k >= 100 ? Math.round(k) : k.toFixed(1).replace(/\.0$/, "")}k ${sym}`;
  }
  return `${n.toLocaleString("mk-MK")} ${sym}`;
}

/** Format a raw price string in its order's currency. */
export function fmtPrice(price: string | null | undefined, cur: Currency, priceEur?: string | null): string {
  if (cur === "MKD") return price ? String(price) : "—";
  return money(unitValue(price, priceEur, cur), cur);
}

/** What a single order is worth — cart items or the single-product fields. */
export function orderTotal(o: Order): number {
  const cur = orderCurrency(o);
  if (o.items && o.items.length > 0) {
    return o.items.reduce((s, it) => s + unitValue(it.price, it.price_eur, cur) * (it.quantity || 1), 0);
  }
  return unitValue(o.product_price, null, cur);
}

/** How many pieces a single order contains. */
export function orderPieces(o: Order): number {
  if (o.items && o.items.length > 0) return o.items.reduce((s, it) => s + (it.quantity || 1), 0);
  return 1;
}

/* ── dates ─────────────────────────────────────────────────────────── */

/** True Skopje-local calendar date — UTC slicing shows the wrong day after 22:00. */
export function skopjeDate(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Skopje", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date(iso));
}

export function skopjeMonth(iso: string): string {
  return skopjeDate(iso).slice(0, 7);
}

export function today(): string {
  return skopjeDate(new Date().toISOString());
}

export function monthKey(d = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Skopje", year: "numeric", month: "2-digit",
  }).format(d);
}

export function prettyDate(iso: string): string {
  return new Date(iso).toLocaleDateString("mk-MK", {
    timeZone: "Europe/Skopje", day: "numeric", month: "short",
  });
}

export function prettyDateTime(iso: string): string {
  return new Date(iso).toLocaleString("mk-MK", {
    timeZone: "Europe/Skopje", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

export function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return "сега";
  if (m < 60) return `${m}м`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}ч`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}д`;
  return prettyDate(iso);
}

/* ── labels ────────────────────────────────────────────────────────── */

export const STATUS_LABEL: Record<OrderStatus, string> = {
  new: "Нова",
  in_process: "Во процес",
  sent: "Испратена",
};

export const STATUS_SHORT: Record<OrderStatus, string> = {
  new: "Нова",
  in_process: "Процес",
  sent: "Пратена",
};

export const CATEGORY_LABEL: Record<Category, string> = {
  rubber_mats: "Гумени патосници",
  fabric_mats: "Платнени патосници",
  auto_accessories: "Авто додатоци",
};

export const CATEGORY_SHORT: Record<Category, string> = {
  rubber_mats: "Гумени",
  fabric_mats: "Платнени",
  auto_accessories: "Додатоци",
};

export const CURRENCY_LABEL: Record<Currency, string> = {
  MKD: "🇲🇰 МКД",
  EUR: "🇽🇰 ЕУР",
  ALL: "🇦🇱 ЛЕК",
};

export function categoryOf(p: Product): Category {
  const c = p.category;
  return c === "fabric_mats" || c === "auto_accessories" ? c : "rubber_mats";
}

/* ── misc ──────────────────────────────────────────────────────────── */

export function slugify(title: string): string {
  return `${title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-")}-${Date.now()}`;
}

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** Group helper that keeps insertion order stable. */
export function groupBy<T, K extends string>(items: T[], key: (t: T) => K): Array<[K, T[]]> {
  const map = new Map<K, T[]>();
  for (const it of items) {
    const k = key(it);
    const arr = map.get(k);
    if (arr) arr.push(it);
    else map.set(k, [it]);
  }
  return [...map.entries()];
}

/** CSV for a client-side download (no server round trip). */
export function toCsv(rows: Array<Record<string, string | number>>): string {
  if (!rows.length) return "";
  const head = Object.keys(rows[0]);
  const esc = (v: string | number) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [head.join(","), ...rows.map((r) => head.map((h) => esc(r[h])).join(","))].join("\n");
}

export function download(filename: string, content: string, type = "text/csv;charset=utf-8") {
  const blob = new Blob(["\uFEFF" + content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
