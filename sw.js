// SW KILL SWITCH - Desativa e remove o cache para resolver erros de acesso
self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    self.registration.unregister()
        .then(() => self.clients.matchAll())
        .then((clients) => {
            clients.forEach(client => client.navigate(client.url));
        });
});
