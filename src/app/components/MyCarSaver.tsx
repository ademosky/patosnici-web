"use client";

/**
 * Records the car whose product page is being viewed.
 *
 * Picking a brand and a model on /products is only one way to tell us which car
 * someone has — opening a specific product says it just as clearly, and shoppers
 * arrive that way from Google, from a link, from the hero search and from the
 * brand grid. This is the trigger that covers all of them.
 */

import { useEffect } from "react";
import { MY_CAR_KEY } from "./MyCarBanner";

type Props = {
  brand?: string | null;
  carModel?: string | null;
  label?: string | null;
};

export default function MyCarSaver({ brand, carModel, label }: Props) {
  useEffect(() => {
    if (!brand) return;
    try {
      const existing = JSON.parse(localStorage.getItem(MY_CAR_KEY) || "null");
      // Never replace a precise brand+model with a bare brand.
      if (existing?.carModel && !carModel) return;
      localStorage.setItem(
        MY_CAR_KEY,
        JSON.stringify({
          brand,
          carModel: carModel || "",
          label: label || carModel || brand,
        }),
      );
    } catch { /* private mode */ }
  }, [brand, carModel, label]);

  return null;
}
