const CACHE = {
  STATIC: "static-v1",
  DYNAMIC: "dynamic-v1",
};

const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.json",
  "/cat-fallback.png",
  "/icon_maskable.png",
  "/icon_rounded.png",
];

const FALLBACKS = {
  IMAGE: "/cat-fallback.png",
  PAGE: "/index.html",
};

const API_BASE_URL = "http://localhost:4000/api/v1";
const MAX_DYNAMIC_ITEMS = 50;

self.addEventListener("install", (event) => {
  event.waitUntil(installAppShell());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(removeOldCaches());
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;
  if (!request.url.startsWith("http")) return;
  if (request.url.startsWith(API_BASE_URL)) {
    event.respondWith(networkFirst(request));
    return;
  }
  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, FALLBACKS.PAGE));
    return;
  }
  if (request.destination === "image") {
    event.respondWith(cacheFirst(request, FALLBACKS.IMAGE));
    return;
  }
  if (isStaticResource(request)) {
    event.respondWith(cacheFirst(request));
  }
});

self.addEventListener("push", (event) => {
  const notification = (() => {
    try {
      return event.data?.json()?.notification ?? {};
    } catch {
      return {};
    }
  })();
  const title = notification.title ?? "Nueva notificación";
  const options = {
    body: notification.body ?? "",
    icon: notification.icon ?? "/icon_rounded.png",
    data: notification.data ?? { url: "/mapa" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = buildNotificationUrl(event.notification.data);
  event.waitUntil(openOrFocusWindow(targetUrl));
});

async function installAppShell() {
  const cache = await caches.open(CACHE.STATIC);
  await cache.addAll(APP_SHELL);
  await self.skipWaiting();
}

async function removeOldCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames
      .filter((name) => name !== CACHE.STATIC && name !== CACHE.DYNAMIC)
      .map((name) => caches.delete(name)),
  );
  await self.clients.claim();
}

async function cacheFirst(request, fallbackUrl) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) return cachedResponse;
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE.STATIC);
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    if (fallbackUrl) return caches.match(fallbackUrl);
    if (request.mode === "navigate") return caches.match(FALLBACKS.PAGE);
    return Response.error();
  }
}

async function networkFirst(request, fallbackUrl) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE.DYNAMIC);
      await cache.put(request, networkResponse.clone());
      await trimCache(CACHE.DYNAMIC, MAX_DYNAMIC_ITEMS);
    }
    return networkResponse;
  } catch {
    const cacheResponse = await caches.match(request);
    if (cacheResponse) return cacheResponse;
    if (fallbackUrl) return await caches.match(fallbackUrl);
    return Response.error();
  }
}

async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys.shift());
  }
}

async function openOrFocusWindow(url) {
  const clientList = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });
  for (const client of clientList) {
    if ("focus" in client) {
      await client.navigate(url);
      return client.focus();
    }
  }
  if (self.clients.openWindow) return self.clients.openWindow(url);
  return null;
}

function isStaticResource(request) {
  return (
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "font" ||
    new URL(request.url).origin === self.location.origin
  );
}

function buildNotificationUrl(data = {}) {
  const baseUrl = data.url ?? "/mapa";
  if (!data.idCenso) return baseUrl;
  return `${baseUrl}?idCenso=${encodeURIComponent(data.idCenso)}`;
}
