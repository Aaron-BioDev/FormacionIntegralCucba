const cacheName = 'cucba-qr-v1';
const assets = [
  './',
  './asistencias.html',
  './asistencias.css',
  './asistencias.js',
  './ico192.png',
  './ico512.png',
  'https://unpkg.com/html5-qrcode'
];

// Instala el Service Worker y guarda los archivos en el celular
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll(assets);
    })
  );
});

// Permite que la app funcione sin internet usando lo guardado
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request);
    })
  );
});