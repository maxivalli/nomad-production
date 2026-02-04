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
  console.log('[SW] Acción:', event.action);
  console.log('[SW] Datos:', event.notification.data);
  
  event.notification.close();

  // Si hizo click en "cerrar", no hacer nada
  if (event.action === 'close') {
    console.log('[SW] Acción cerrar - no abrir ventana');
    return;
  }

  // Obtener la URL (del click general o de la acción "open")
  const urlToOpen = new URL(event.notification.data?.url || '/', self.location.origin).href;
  console.log('[SW] Abriendo URL:', urlToOpen);

  event.waitUntil(
    self.clients.matchAll({ 
      type: 'window', 
      includeUncontrolled: true 
    })
      .then((clientList) => {
        console.log('[SW] Ventanas encontradas:', clientList.length);
        
        // Buscar si ya hay una ventana del sitio abierta
        for (const client of clientList) {
          console.log('[SW] Checkeando ventana:', client.url);
          if (client.url === urlToOpen && 'focus' in client) {
            console.log('[SW] Enfocando ventana existente');
            return client.focus();
          }
        }
        
        // Si no hay ventana específica, buscar cualquier ventana del sitio
        for (const client of clientList) {
          if (client.url.startsWith(self.location.origin) && 'focus' in client) {
            console.log('[SW] Navegando ventana existente a:', urlToOpen);
            client.focus();
            return client.navigate(urlToOpen);
          }
        }
        
        // Si no hay ninguna ventana abierta, abrir una nueva
        if (self.clients.openWindow) {
          console.log('[SW] Abriendo nueva ventana');
          return self.clients.openWindow(urlToOpen);
        }
      })
      .catch((error) => {
        console.error('[SW] Error en notificationclick:', error);
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