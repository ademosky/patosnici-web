
/* Original Patosnici — Admin PWA service worker
 *
 * Strategy:
 *   • App shell  → stale-while-revalidate (instant open, background refresh)
 *   • /api/*     → ALWAYS network. Never cached (the admin creates orders,
 *                  changes stock and prices; showing a cached response would
 *                  display data that no longer exists).
 *   • Navigations while offline → cached shell, so the app still opens.
 */
const VERSION = "op-admin-v1";
const SHELL = `${VERSION}-shell`;

const SHELL_ASSETS = [
  "/admin",
  "/admin/orders",
  "/admin/products",
  "/admin/inventory",
  "/admin/accessories",
  "/admin/showcase",
  "/admin/stats",
  "/admin/settings",
  "/admin/icon-192.png",
  "/admin/icon-512.png",
  "/admin/apple-touch-icon.png",
  "/admin/manifest.webmanifest"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL).then((cache) =>
      // addAll is all-or-nothing; add individually so one 404 can't abort install
      Promise.all(SHELL_ASSETS.map((u) => cache.add(u).catch(() => null)))
    ).then(() => self.skipWaiting())
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

  // Never cache API or Next.js data/router traffic.
  if (url.pathname.startsWith("/api/") ||
      url.pathname.startsWith("/_next/data") ||
      request.headers.get("RSC") === "1" ||
      request.headers.get("Next-Router-Prefetch")) {
    return;
  }

  // Navigations: network first, fall back to the cached shell when offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(SHELL).then((c) => c.put(request, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match("/admin")))
    );
    return;
  }

  // Static assets: stale-while-revalidate.
  if (url.pathname.startsWith("/admin/") || url.pathname.startsWith("/_next/static/")) {
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

// Allow the page to trigger an immediate update.
self.addEventListener("message", (e) => {
  if (e.data === "SKIP_WAITING") self.skipWaiting();
});
