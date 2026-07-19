"use client";

/**
 * ProductViewEvent
 * ────────────────
 * Fires Meta Pixel "ViewContent" exactly once when a product page mounts.
 *
 * WHY POLLING?
 * The Pixel init <Script strategy="afterInteractive"> runs AFTER React
 * hydration, so window.fbq is not yet defined when useEffect first fires.
 * We poll every 100 ms until fbq is available, then fire once and stop.
 * A 10-second safety timeout prevents infinite polling on slow connections.
 */

import { useEffect } from "react";

type Fbq = (...args: unknown[]) => void;
type WindowWithFbq = Window & { fbq?: Fbq };

type Props = {
  productId: number;
  productName: string;
  /** Price string from DB, e.g. "1500 МКД" — numeric part is extracted. */
  productPrice: string;
};

export default function ProductViewEvent({
  productId,
  productName,
  productPrice,
}: Props): null {
  useEffect(() => {
    const numericValue =
      parseFloat(productPrice.replace(/[^\d.]/g, "")) || 0;

    let fired = false;

    const fire = (): boolean => {
      if (fired) return true;
      const win = window as WindowWithFbq;
      if (typeof win.fbq !== "function") return false; // not ready yet

      fired = true;
      win.fbq("track", "ViewContent", {
        content_ids: [String(productId)],
        content_name: productName,
        content_type: "product",
        value: numericValue,
        currency: "MKD",
      });
      return true;
    };

    // Attempt immediately — covers the rare case where fbq is already loaded
    if (fire()) return;

    // Poll every 100 ms until fbq is defined (afterInteractive finishes)
    const interval = setInterval(() => {
      if (fire()) clearInterval(interval);
    }, 100);

    // Safety: stop polling after 10 s to avoid leaking timers
    const timeout = setTimeout(() => clearInterval(interval), 10_000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // empty deps — run once on mount only

  return null;
}
