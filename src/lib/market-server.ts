import { headers } from "next/headers";
import { Market } from "@/lib/pricing";

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
