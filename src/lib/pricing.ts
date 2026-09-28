export type Currency = "MKD" | "EUR" | "ALL";

/** Market identifiers — one per storefront. */
export type Market = "mk" | "ks" | "al";

/** Currency each market always uses (URL-locked, never user-chosen). */
export const MARKET_CURRENCY: Record<Market, Currency> = {
  mk: "MKD",
  ks: "EUR",
  al: "ALL",
};

/** URL prefix for each market (Macedonia lives at the root). */
export const MARKET_PREFIX: Record<Market, string> = {
  mk: "",
  ks: "/ks",
  al: "/al",
};

// ── MKD → EUR mapping for Kosovo (includes transport surcharge). ──
// Values are rounded to clean whole-euro prices for ads.
const MKD_TO_EUR: Record<number, number> = {
  1290: 28,
  1390: 30,
  1490: 32,
  1590: 34,
  1690: 35,
  1790: 37,
  1890: 40,
  1990: 40,
  2190: 45,
  2390: 50,
  2890: 55,
};

// ── Albania: Kosovo EUR price + 2 € surcharge, at 1 € = 100 Lekë. ──
// Derived from MKD_TO_EUR so there is a SINGLE source of truth for the
// whole price ladder — change the EUR table and ALL follows automatically.
const EUR_SURCHARGE_ALL = 2;
const EUR_TO_ALL = 100;
const MKD_TO_ALL: Record<number, number> = Object.fromEntries(
  Object.entries(MKD_TO_EUR).map(([mkd, eur]) => [
    Number(mkd),
    (eur + EUR_SURCHARGE_ALL) * EUR_TO_ALL,
  ])
);

const FALLBACK_RATE = 61.5; // 1 EUR = 61.5 MKD (fixed fallback)

/** Extract the numeric MKD value from messy price strings.
 *  Handles: "1.690 ден", "1,690ден", "1690 den", "2.890", etc. */
export function normalizePriceToMkd(price: string | null | undefined): number {
  if (!price) return 0;
  const digits = price.replace(/[^0-9]/g, "");
  return parseInt(digits, 10) || 0;
}

/** Return the numeric EUR value for a product price.
 *  Priority: manual price_eur override → mapping table → fixed rate. */
export function getEurValue(price: string, priceEur?: string | null): number {
  // 1. Manual override (admin-entered price_eur)
  if (priceEur && priceEur.trim()) {
    const n = parseInt(priceEur.replace(/[^0-9]/g, ""), 10);
    if (n) return n;
  }
  // 2. Mapping table
  const mkd = normalizePriceToMkd(price);
  const mapped = MKD_TO_EUR[mkd];
  if (mapped) return mapped;
  // 3. Fixed-rate fallback
  return Math.round((mkd / FALLBACK_RATE) * 100) / 100;
}

/** Return the numeric Lekë value for a product price (Albania market).
 *  Kosovo EUR price + 2 € surcharge, converted at a fixed 1 € = 100 Lekë
 *  and rounded to a clean 100 Lekë. */
export function getAllValue(price: string, priceEur?: string | null): number {
  // 1. Mapping table (derived from the EUR ladder)
  const mkd = normalizePriceToMkd(price);
  const mapped = MKD_TO_ALL[mkd];
  if (mapped) return mapped;
  // 2. Surcharge + conversion, rounded to the nearest 100 Lekë
  const eur = getEurValue(price, priceEur) + EUR_SURCHARGE_ALL;
  return Math.round((eur * EUR_TO_ALL) / 100) * 100;
}

/** Format a price string for the given currency.
 *  MKD: returns the original price string unchanged.
 *  EUR: manual override → mapping → fixed rate (returns "45 €")
 *  ALL: Kosovo EUR + 2 €, × 100 Lekë (returns "4.700 Lekë") */
export function formatPrice(
  price: string,
  currency: Currency,
  priceEur?: string | null
): string {
  if (currency === "EUR") {
    return `${getEurValue(price, priceEur)} €`;
  }
  if (currency === "ALL") {
    return `${getAllValue(price, priceEur).toLocaleString("mk-MK")} Lekë`;
  }
  return price;
}

/** Sum a list of cart items and format the total in the given currency.
 *  Single market-aware helper so cart/checkout never duplicate the maths. */
export function sumCartTotal(
  items: Array<{ price: string; price_eur?: string | null; quantity: number }>,
  currency: Currency
): string {
  if (currency === "MKD") {
    const n = items.reduce(
      (s, i) => s + normalizePriceToMkd(i.price) * i.quantity,
      0
    );
    return `${n.toLocaleString("mk-MK")} ден`;
  }
  if (currency === "EUR") {
    const n = items.reduce(
      (s, i) => s + getEurValue(i.price, i.price_eur) * i.quantity,
      0
    );
    return `${n} €`;
  }
  const n = items.reduce(
    (s, i) => s + getAllValue(i.price, i.price_eur) * i.quantity,
    0
  );
  return `${n.toLocaleString("mk-MK")} Lekë`;
}
