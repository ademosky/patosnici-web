"use client";

/**
 * MetaPixel — Client Component that fires a PageView event on every
 * client-side route change (App Router navigation).
 *
 * The very first PageView is handled by the inline init Script in
 * layout.tsx, so we skip the initial render with a ref to avoid
 * double-counting.
 */

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { pageview } from "@/lib/facebookPixel";

export default function MetaPixel(): null {
  const pathname = usePathname();
  const isFirst = useRef(true);

  useEffect(() => {
    // Skip initial mount — the init Script in layout.tsx already
    // fires fbq("track", "PageView") for the first load.
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    pageview();
  }, [pathname]);

  return null;
}
