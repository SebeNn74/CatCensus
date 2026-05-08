//APP-SHELL

const CACHE_INMUTABLE = "cache-inmutable";
const CACHE_STATIC = "cache-static";
const CACHE_DYNAMIC = "cache-dynamic";

function cleanCache(cacheName, numeroItems) {
    caches.open(cacheName).then((cache) => {
        cache.keys().then((keys) => {
            if (keys.length > numeroItems) {
                cache.delete(keys[0]).then(() => cleanCache(cacheName, numeroItems));
            }
        });
    });
}

self.addEventListener("install", (e) => {
    const cacheStatic = caches.open(CACHE_STATIC).then((cache) => {
        return cache.addAll([
            "/",
            "/index.html",
            "/css/style.css",
            "/js/app.js",
            "/favicon.ico",
            "/not-found.html",
            "/img/Image_Not_Found.jpg",
        ]);
    });
    const cacheInmutable = caches.open(CACHE_INMUTABLE).then((cache) => {
        return cache.addAll([
            "https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css",
        ]);
    });
    e.waitUntil(Promise.all([cacheStatic, cacheInmutable]));
});

self.addEventListener("fetch", (e) => {
    const respuesta = caches
        .match(e.request)
        .then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            return fetch(e.request).then((networkResponse) => {
                caches.open(CACHE_DYNAMIC).then((cache) => {
                    cache.put(e.request, networkResponse);
                    cleanCache(CACHE_DYNAMIC, 10);
                });
                return networkResponse.clone();
            });
        })
        .catch(() => {
            if (e.request.headers.get("accept").includes("text/html")) {
                return caches.match("/not-found.html");
            }
            if (e.request.headers.get("accept").includes("image")) {
                return caches.match("/img/Image_Not_Found.jpg");
            }
        });

    e.respondWith(respuesta);
});
