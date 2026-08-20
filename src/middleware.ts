import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware that marks requests coming from the Kosovo (/ks) locale.
 *
 * Why: /ks/* is implemented as a rewrite in next.config.ts. When a crawler
 * (Messenger, Facebook, Google) fetches /ks/products/:slug, the rewrite maps
 * it to /products/:slug and the Server Component's headers() no longer knows
 * the original path — so generateMetadata() emitted a canonical/og:url WITHOUT
 * /ks, which stripped the locale when shared.
 *
 * This middleware runs BEFORE the rewrite and stamps a custom header with the
 * original path so the Server Component can reconstruct the correct URL.
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isKs = pathname === "/ks" || pathname.startsWith("/ks/");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-ks-locale", isKs ? "1" : "0");
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
