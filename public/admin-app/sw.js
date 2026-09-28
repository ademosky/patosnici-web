
/* Original Patosnici — Admin PWA service worker
 *
 * Scope is /admin-app only, so the storefront and the legacy /admin panel are
 * never affected.
 *
 * Strategy:
 *   • App shell          → stale-while-revalidate (instant open, refresh behind)
 *   • /api/*             → ALWAYS network. Never cached: the admin changes
 *                          orders/stock/prices, and a cached response would
 *                          show data that no longer exists.
 *   • Offline navigation → cached shell, so the app still opens.
 */
const VERSION = "op-admin-app-v1";
const SHELL = `${VERSION}-shell`;

const SHELL_ASSETS = [
  "/admin-app",
  "/admin-app/icon-192.png",
  "/admin-app/icon-512.png",
  "/admin-app/apple-touch-icon.png",
  "/admin-app/manifest.webmanifest"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL)
      // add individually — addAll is all-or-nothing and one 404 aborts install
      .then((cache) => Promise.all(SHELL_ASSETS.map((u) => cache.add(u).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never intercept API or Next.js data/router traffic.
  if (url.pathname.startsWith("/api/") ||
      url.pathname.startsWith("/_next/data") ||
      request.headers.get("RSC") === "1" ||
      request.headers.get("Next-Router-Prefetch")) {
    return;
  }

  // Navigations: network first, cached shell when offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(SHELL).then((c) => c.put(request, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match("/admin-app")))
    );
    return;
  }

  // Static assets: stale-while-revalidate.
  if (url.pathname.startsWith("/admin-app/") || url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((res) => {
            if (res && res.status === 200) {
              const copy = res.clone();
              caches.open(SHELL).then((c) => c.put(request, copy)).catch(() => {});
            }
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
  }
});

self.addEventListener("message", (e) => {
  if (e.data === "SKIP_WAITING") self.skipWaiting();
});
