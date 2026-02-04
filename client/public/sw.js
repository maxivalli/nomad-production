const CACHE_NAME = 'nomad-wear-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.jsx',
  '/Nomad.svg',
  '/Nomad.png',
  '/hyperwave-one.ttf'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('Error al cachear archivos:', error);
      })
  );
  self.skipWaiting();
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estrategia de cache: Network First con fallback a Cache
self.addEventListener('fetch', (event) => {
  // Ignorar solicitudes no HTTP/HTTPS
  if (!event.request.url.startsWith('http')) {
    return;
  }

  // Ignorar solicitudes a la API
  if (event.request.url.includes('/api/')) {
    return fetch(event.request);
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la respuesta es válida, clonarla y guardarla en cache
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Si falla la red, intentar obtener del cache
        return caches.match(event.request).then((response) => {
          if (response) {
            return response;
          }
          // Si no está en cache, retornar página offline (opcional)
          if (event.request.destination === 'document') {
            return caches.match('/');
          }
        });
      })
  );
});

// Manejo de mensajes para actualización manual
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
