const CACHE_NAME = 'hubfest-v3'; // Nova versão
const ASSETS = [
    '/',
    '/index.html',
    '/login.html',
    '/css/style.css',
    '/css/investimentos.css',
    '/css/auth.css',
    '/js/script.js',
    '/js/data.js',
    '/js/investimentos.js',
    '/js/auth.js',
    '/manifest.json',
    '/icon.png',
    '/logo.png',
    '/bg.png'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
    // Tenta carregar do cache, se não encontrar vai pra rede
    e.respondWith(
        caches.match(e.request).then((response) => {
            return response || fetch(e.request);
        }).catch(() => {
            // Se falhar tudo, tenta retornar o index (opcional)
        })
    );
});

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
    return self.clients.claim();
});
