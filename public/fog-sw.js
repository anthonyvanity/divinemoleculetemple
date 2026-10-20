/* Fog node — cache on the operator's device, between CDN and origin. */
const CACHE = "dmt-fog-v3";
const PRECACHE = [
  "/hero-crest.jpg",
  "/hex-seal.webp",
  "/flame-gold.webp",
  "/halo.jpg",
];

const LIVE = new Set([
  "/login",
  "/register",
  "/dashboard",
  "/profile",
  "/nexus",
  "/leaderboard",
]);

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
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

function isLivePath(pathname) {
  if (pathname.startsWith("/api")) return true;
  return LIVE.has(pathname);
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (isLivePath(url.pathname)) return;

  if (req.mode === "navigate") {
    event.respondWith(fetch(req).catch(() => caches.match("/") || caches.match("/hero-crest.jpg")));
    return;
  }

  const dest = req.destination;
  const staticAsset =
    dest === "image" ||
    dest === "audio" ||
    dest === "video" ||
    dest === "font" ||
    dest === "style" ||
    /\.(?:jpg|jpeg|png|webp|gif|svg|mp3|mp4|woff2)$/i.test(url.pathname);
  if (!staticAsset) return;

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const hit = await cache.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok) cache.put(req, res.clone());
      return res;
    }),
  );
});
