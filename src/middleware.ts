import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware that marks WHICH market a request belongs to.
 *
 * Why: every non-Macedonian market is implemented as a rewrite in
 * next.config.ts (/ks/* and /al/* → /*). When a crawler (Messenger,
 * Facebook, Google) — or the browser itself — fetches /ks/products/:slug,
 * the rewrite maps it to /products/:slug and the Server Component's
 * headers() no longer knows the original path. generateMetadata() then
 * emitted a canonical/og:url WITHOUT the market prefix, which stripped the
 * locale when shared.
 *
 * This middleware runs BEFORE the rewrite and stamps the market on the
 * request so Server Components can reconstruct the correct URL.
 *
 * Markets:
 *   ""/mk  → Macedonia  · MKD · Macedonian
 *   /ks    → Kosovo     · EUR · Albanian
 *   /al    → Albania    · ALL · Albanian
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  let market: "mk" | "ks" | "al" = "mk";
  if (pathname === "/ks" || pathname.startsWith("/ks/")) market = "ks";
  else if (pathname === "/al" || pathname.startsWith("/al/")) market = "al";

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-market", market);
  // Kept for backward compatibility with the existing Kosovo logic.
  requestHeaders.set("x-ks-locale", market === "ks" ? "1" : "0");
  requestHeaders.set("x-original-path", pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/|api/).*)"],
};
