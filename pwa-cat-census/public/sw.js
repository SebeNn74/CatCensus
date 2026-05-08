// CONFIGURACIÓN DE CACHÉS
const CACHE_STATIC = "static-v2";
const CACHE_DYNAMIC = "dynamic-v2";

// Shell real de la app
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/cat-face.svg",
  "/icon_maskable.png",
  "/icon_rounded.png",
];

// API real usada por la app
const API_BASE_URL = "http://localhost:4000/api/v1";
const MAX_DYNAMIC_ITEMS = 50;
const IMAGE_FALLBACK = "/cat-face.svg";

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const staticCache = await caches.open(CACHE_STATIC);
      await staticCache.addAll(STATIC_ASSETS);
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_STATIC && name !== CACHE_DYNAMIC)
          .map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (request.url.startsWith(API_BASE_URL)) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, "/index.html"));
    return;
  }

  if (request.destination === "image") {
    event.respondWith(cacheFirst(request, IMAGE_FALLBACK));
    return;
  }

  if (
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "font" ||
    url.origin === self.location.origin
  ) {
    event.respondWith(cacheFirst(request));
  }
});

async function cacheFirst(request, fallbackUrl) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_STATIC);
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    if (fallbackUrl) {
      return caches.match(fallbackUrl);
    }
    if (request.mode === "navigate") {
      return caches.match("/index.html");
    }
    return undefined;
  }
}

async function networkFirst(request, fallbackUrl) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_DYNAMIC);
      await cache.put(request, response.clone());
      await cleanCache(CACHE_DYNAMIC, MAX_DYNAMIC_ITEMS);
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (fallbackUrl) return caches.match(fallbackUrl);
    return undefined;
  }
}

async function cleanCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();

  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    await cleanCache(cacheName, maxItems);
  }
}
