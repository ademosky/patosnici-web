import { headers } from "next/headers";
import { Market, MARKET_PREFIX } from "@/lib/pricing";

/**
 * Server-side market detection.
 *
 * The market prefix (/ks, /al) is implemented as a rewrite in next.config.ts,
 * so by the time a Server Component runs, the original path is gone. The
 * middleware stamps it on the request BEFORE the rewrite — this reads it back.
 *
 * Single source of truth: used by page metadata, canonical/hreflang and
 * structured data so all three always agree.
 */
export const SITE_URL = "https://www.originalpatosnici.com";

/** og:locale for each market — used by every generateMetadata. */
export const OG_LOCALE: Record<Market, string> = {
  mk: "mk_MK",
  ks: "sq_XK",
  al: "sq_AL",
};

/**
 * hreflang map for a path shared by all three markets.
 * Tells Google that "/", "/ks" and "/al" for the same page are translations
 * of one another, and which one to serve by default.
 */
export function marketAlternates(path: string) {
  const p = path === "/" ? "" : path;
  return {
    "mk-MK": `${SITE_URL}${p}`,
    "sq-XK": `${SITE_URL}/ks${p}`,
    "sq-AL": `${SITE_URL}/al${p}`,
    "x-default": `${SITE_URL}${p}`,
  };
}

/** Absolute canonical URL for a path on a given market. */
export function marketUrl(market: Market, path: string): string {
  const p = path === "/" ? "" : path;
  return `${SITE_URL}${MARKET_PREFIX[market]}${p}`;
}

export async function readMarketServer(): Promise<Market> {
  try {
    const h = await headers();
    const m = h.get("x-market");
    if (m === "ks" || m === "al" || m === "mk") return m;
    // Fallbacks: legacy Kosovo header, then the original path
    if (h.get("x-ks-locale") === "1") return "ks";
    const path = h.get("x-original-path") || "";
    if (path.startsWith("/al")) return "al";
    if (path.startsWith("/ks")) return "ks";
    return "mk";
  } catch {
    return "mk";
  }
}
