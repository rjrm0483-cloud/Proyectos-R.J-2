// Guarda la app en el teléfono para que abra sin internet.
// Al cambiar cualquier archivo de la app, subir el número de VERSION.
const VERSION = 'solafv-1.2.0';
const ARCHIVOS = ['./', './index.html', './manifest.webmanifest', './img/logo.png',
  './img/apple-touch-icon.png', './img/icon-192.png', './img/icon-512.png', './img/icon-maskable-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Primero la red (para recibir actualizaciones); sin conexión, lo guardado.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(fetch(req).then(r => {
    if (r.ok) { const copia = r.clone(); caches.open(VERSION).then(c => c.put(req, copia)); }
    return r;
  }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./index.html'))));
});
