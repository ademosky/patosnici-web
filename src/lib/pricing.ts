export type Currency = "MKD" | "EUR";

// MKD → EUR price mapping for Kosovo (includes transport surcharge).
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

/** Format a price string for the given currency.
 *  EUR: manual override → mapping → fixed rate (returns "45 €")
 *  MKD: returns the original price string unchanged. */
export function formatPrice(
  price: string,
  currency: Currency,
  priceEur?: string | null
): string {
  if (currency === "EUR") {
    return `${getEurValue(price, priceEur)} €`;
  }
  return price;
}
