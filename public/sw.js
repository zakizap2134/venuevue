/* Venue Vue offline service worker.
 *
 * - Precaches the offline fallback page and self-hosted fonts.
 * - Static assets: cache-first.
 * - Navigations: network-first, falling back to the cached copy of the same
 *   page, then to any cached page, so the app opens with no connection.
 */

const CACHE = "venue-vue-v1";
const PRECACHE = [
  "/",
  "/login",
  "/favicon.ico",
  "/fonts/Inter-400-latin.woff2",
  "/fonts/Inter-500-latin.woff2",
  "/fonts/Inter-600-latin.woff2",
  "/fonts/Inter-700-latin.woff2",
  "/fonts/SpaceGrotesk-500-latin.woff2",
  "/fonts/SpaceGrotesk-600-latin.woff2",
  "/fonts/SpaceGrotesk-700-latin.woff2",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) =>
        Promise.all(
          PRECACHE.map((url) =>
            cache.add(new Request(url, { cache: "reload" })).catch(() => undefined),
          ),
        ),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

function isSameOrigin(url) {
  return new URL(url).origin === self.location.origin;
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || !isSameOrigin(request.url)) return;

  const url = new URL(request.url);
  // Never cache backend/API traffic.
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/_serverFn/")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE);
          return (
            (await cache.match(request)) ||
            (await cache.match("/login")) ||
            (await cache.match("/")) ||
            new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } })
          );
        }),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          if (response.ok && response.type === "basic") {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached || Response.error());
    }),
  );
});
