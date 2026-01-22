const CACHE_NAME = 'hubfest-v1';
const ASSETS = [
    './',
    './index.html',
    './css/style.css',
    './js/script.js',
    './js/data.js',
    './manifest.json',
    './icon.png',
    './logo.png',
    './bg.png'
];

// Install Event: Cache assets
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

// Fetch Event: Serve from cache, then network
self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => {
            return response || fetch(e.request);
        })
    );
});

// Activate Event: Cleanup old caches
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    return caches.delete(key);
                }
            }));
        })
    );
});
