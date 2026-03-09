const CACHE_NAME = "happy-living-cache-v1";
const urlsToCache = [
    "/HAPPYLIVING/",
    "/HAPPYLIVING/index.html",
    "/HAPPYLIVING/css/style.css",
    "/HAPPYLIVING/js/main.js",
    "/HAPPYLIVING/manifest.json",
    "/HAPPYLIVING/icon-192.png",
    "/HAPPYLIVING/icon-512.png"
];

self.addEventListener("install", function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function (cache) {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener("fetch", function (event) {
    event.respondWith(
        caches.match(event.request)
            .then(function (response) {
                return response || fetch(event.request);
            })
    );
});
