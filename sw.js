const CACHE_NAME = 'pocket-arcade-v31';
const APP_FILES = [
    './',
    './index.html',
    './manifest.json',
    './icon.svg',
    './src/data/countries.json',
    './src/data/world-map.svg',
    './src/data/flags.svg',
    './src/data/COUNTRY_DATA_LICENSE.txt',
    './src/data/ASSETS_LICENSE.txt'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(APP_FILES))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(
                keys
                    .filter((key) =>
                        (key.startsWith('pocket-arcade-') || key.startsWith('pocket-snake-')) &&
                        key !== CACHE_NAME
                    )
                    .map((key) => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;

    const requestUrl = new URL(event.request.url);
    const moviesPath = new URL('movies/', self.registration.scope).pathname;
    if (requestUrl.pathname === moviesPath.slice(0, -1) || requestUrl.pathname.startsWith(moviesPath)) return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            return fetch(event.request).then((response) => {
                if (response.ok) {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
                }
                return response;
            });
        })
    );
});
