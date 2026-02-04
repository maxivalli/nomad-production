import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';

// Precachear archivos generados automáticamente por Vite
precacheAndRoute(self.__WB_MANIFEST);

// Limpiar cachés antiguos
cleanupOutdatedCaches();

const CACHE_NAME = 'nomad-wear-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/Nomad.svg',
  '/Nomad.png',
  '/hyperwave-one.ttf'
];

// ==========================================
// INSTALACIÓN
// ==========================================
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cache abierto');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('[SW] Error al cachear archivos:', error);
      })
  );
  self.skipWaiting();
});

// ==========================================
// ACTIVACIÓN
// ==========================================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando Service Worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && !cacheName.startsWith('workbox-')) {
            console.log('[SW] Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// ==========================================
// FETCH (Cache Strategy)
// ==========================================
self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith('http')) {
    return;
  }

  if (event.request.url.includes('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((response) => {
          if (response) {
            return response;
          }
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
      })
  );
});

// ==========================================
// PUSH NOTIFICATIONS
// ==========================================

// Recibir una notificación push
self.addEventListener('push', (event) => {
  console.log('[SW] Push recibido:', event);

  let data = {
    title: 'NOMAD® Wear',
    body: 'Nueva actualización disponible',
    icon: '/icon-192-192.png',
    badge: '/icon-96-96.png',
    tag: 'nomad-notification',
    requireInteraction: false,
    data: {
      url: '/'
    }
  };

  // Parsear los datos si vienen en el push
  if (event.data) {
    try {
      const parsedData = event.data.json();
      data = { ...data, ...parsedData };
    } catch (e) {
      console.error('[SW] Error parseando datos push:', e);
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192-192.png',
    badge: data.badge || '/icon-96-96.png',
    tag: data.tag || 'nomad-notification',
    requireInteraction: data.requireInteraction || false,
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
      dateOfArrival: Date.now(),
      ...data.data
    },
    actions: data.actions || [
      {
        action: 'open',
        title: 'Ver más',
        icon: '/icon-96-96.png'
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: '/icon-96-96.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Click en la notificación
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Click en notificación:', event);
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Si hay una ventana abierta, enfocarla
        for (let client of clientList) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }
        // Si no, abrir una nueva
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});

// Cierre de la notificación
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notificación cerrada:', event);
});

// ==========================================
// MENSAJES DEL CLIENTE
// ==========================================
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});