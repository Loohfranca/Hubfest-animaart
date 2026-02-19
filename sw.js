const CACHE_NAME = 'hubfest-v2'; // Versão atualizada
const ASSETS = [
    './',
    './index.html',
    './login.html',
    './css/style.css',
    './css/investimentos.css',
    './css/auth.css',
    './js/script.js',
    './js/data.js',
    './js/investimentos.js',
    './js/auth.js',
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
    self.skipWaiting(); // Força a ativação imediata
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
    return self.clients.claim(); // Assume o controle das abas abertas imediatamente
});
