/* Fog node — images only. Never cache HTML, CSS, or scripts. */
const CACHE = "dmt-fog-v4";
const PRECACHE = ["/hero-crest.jpg", "/hex-seal.webp", "/flame-gold.webp", "/halo.jpg"];

const LIVE = new Set(["/login", "/register", "/dashboard", "/profile", "/nexus", "/leaderboard"]);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .then(() => caches.open(CACHE))
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.clients.claim()),
  );
});

function isLivePath(pathname) {
  if (pathname.startsWith("/api") || pathname.startsWith("/assets")) return true;
  return LIVE.has(pathname);
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (isLivePath(url.pathname)) return;
  if (req.mode === "navigate" || req.destination === "style" || req.destination === "script") return;

  const image =
    req.destination === "image" ||
    req.destination === "font" ||
    /\.(?:jpg|jpeg|png|webp|gif|svg|woff2)$/i.test(url.pathname);
  if (!image) return;

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const hit = await cache.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      const type = res.headers.get("content-type") || "";
      if (res.ok && (type.startsWith("image/") || type.startsWith("font/"))) cache.put(req, res.clone());
      return res;
    }),
  );
});
