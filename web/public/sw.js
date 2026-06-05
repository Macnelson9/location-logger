/*
 * LocationLog service worker.
 *
 * Strategy:
 *   - Navigations: network-first, falling back to a cached offline page when the
 *     network is unavailable. Pages are auth-gated and data-driven, so we never
 *     want to serve a stale logged-in shell — only an offline notice.
 *   - Immutable static assets (/_next/static, /icons): cache-first.
 *   - Everything else (including /api/* auth + data calls): left to the network,
 *     never cached. Caching /api would break sessions and serve stale data.
 *
 * Bump VERSION to invalidate old caches on the next activation.
 */
const VERSION = "v1";
const STATIC_CACHE = `locationlog-static-${VERSION}`;
const OFFLINE_URL = "/offline";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.add(OFFLINE_URL)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== STATIC_CACHE).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Never intercept API/auth traffic — it must always hit the network.
  if (url.pathname.startsWith("/api/")) return;

  // Network-first for page navigations, offline page as the fallback.
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
    return;
  }

  // Cache-first for build-immutable static assets.
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/")
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const copy = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
            return response;
          }),
      ),
    );
  }
});
