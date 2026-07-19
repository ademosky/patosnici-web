"use client";

/**
 * ProductViewEvent
 * ────────────────
 * Client-only component rendered inside the (Server Component) product
 * page.  Fires a Meta Pixel "ViewContent" event exactly once — on the
 * initial client mount — following Meta ecommerce best practices.
 *
 * Returns null: no visible UI is rendered.
 */

import { useEffect } from "react";
import { event } from "@/lib/facebookPixel";

type Props = {
  /** Database ID of the product (used as content_id). */
  productId: number;
  /** Human-readable product name sent as content_name. */
  productName: string;
  /**
   * Price string as stored in the DB, e.g. "1500 МКД" or "1.500 МКД".
   * The component strips all non-numeric characters to get the value.
   */
  productPrice: string;
};

export default function ProductViewEvent({
  productId,
  productName,
  productPrice,
}: Props): null {
  useEffect(() => {
    // Parse numeric value from price string, e.g. "1500 МКД" → 1500
    const numericValue =
      parseFloat(productPrice.replace(/[^\d.]/g, "")) || 0;

    event("ViewContent", {
      content_ids: [String(productId)],
      content_name: productName,
      content_type: "product",
      value: numericValue,
      currency: "MKD",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // empty deps — fire once on mount only

  return null;
}
