"use client";

/**
 * MetaPixel
 * ─────────
 * Single Client Component that owns the entire Meta Pixel lifecycle:
 *
 *  1. Renders the <Script> tag that initialises fbq and fires the first
 *     PageView.  Using next/script inside a Client Component is required —
 *     dangerouslySetInnerHTML inside a Server Component Script tag is
 *     parsed but NOT executed by Next.js's afterInteractive runner.
 *
 *  2. Listens to pathname changes (client-side navigation) and fires
 *     subsequent PageView events, skipping the very first render because
 *     the init Script already fired it.
 */

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { pageview, FB_PIXEL_ID } from "@/lib/facebookPixel";

export default function MetaPixel(): JSX.Element {
  const pathname = usePathname();
  const isFirst = useRef(true);

  useEffect(() => {
    // Skip initial mount — the Script below already fires PageView on load.
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    pageview();
  }, [pathname]);

  return (
    <Script
      id="fb-pixel"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){
          n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;
          s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
          (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init','${FB_PIXEL_ID}');
          fbq('track','PageView');
        `,
      }}
    />
  );
}
