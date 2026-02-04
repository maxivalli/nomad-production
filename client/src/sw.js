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
  // Ignorar requests que no sean HTTP/HTTPS
  if (!event.request.url.startsWith('http')) {
    return;
  }

  // ✅ NUEVO: No cachear ni interceptar requests a /push-images
  if (event.request.url.includes('/push-images/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // No cachear requests a la API
  if (event.request.url.includes('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Estrategia Network First con Cache Fallback para el resto
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Solo cachear respuestas exitosas
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Si falla el fetch, intentar obtener desde caché
        return caches.match(event.request).then((response) => {
          if (response) {
            console.log('[SW] ✅ Sirviendo desde caché:', event.request.url);
            return response;
          }
          
          // Si es un documento HTML, devolver index.html cacheado
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
          
          // ✅ CORREGIDO: Si no hay nada en caché, devolver un Response de error
          console.warn('[SW] ❌ Recurso no encontrado:', event.request.url);
          return new Response('Recurso no disponible', {
            status: 404,
            statusText: 'Not Found',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        });
      })
  );
});

// ==========================================
// PUSH NOTIFICATIONS
// ==========================================

// Recibir una notificación push
self.addEventListener('push', (event) => {
  console.log('[SW] 📬 Push recibido:', event);

  let data = {
    title: 'NOMAD® Wear',
    body: 'Nueva actualización disponible',
    icon: '/icon-192-192.png',
    badge: '/icon-96-96.png',
    image: null, // ✅ NUEVO: Soporte para imagen grande
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
      console.log('[SW] 📬 Datos parseados:', data);
    } catch (e) {
      console.error('[SW] ❌ Error parseando datos push:', e);
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
    actions: [
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

  // ✅ NUEVO: Agregar imagen si está presente
  if (data.image) {
    options.image = data.image;
    console.log('[SW] 🖼️ Notificación con imagen:', data.image);
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
      .then(() => {
        console.log('[SW] ✅ Notificación mostrada correctamente');
      })
      .catch((error) => {
        console.error('[SW] ❌ Error mostrando notificación:', error);
      })
  );
});

// Click en la notificación
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] 👆 Click en notificación');
  console.log('[SW] 👆 Acción:', event.action);
  console.log('[SW] 👆 Datos:', event.notification.data);
  
  event.notification.close();

  // Si hizo click en "cerrar", no hacer nada
  if (event.action === 'close') {
    console.log('[SW] 👆 Acción cerrar - no abrir ventana');
    return;
  }

  // Obtener la URL (del click general o de la acción "open")
  const urlToOpen = new URL(event.notification.data?.url || '/', self.location.origin).href;
  console.log('[SW] 👆 Abriendo URL:', urlToOpen);

  event.waitUntil(
    self.clients.matchAll({ 
      type: 'window', 
      includeUncontrolled: true 
    })
      .then((clientList) => {
        console.log('[SW] 👆 Ventanas encontradas:', clientList.length);
        
        // Buscar si ya hay una ventana del sitio abierta
        for (const client of clientList) {
          if (client.url.startsWith(self.location.origin) && 'focus' in client) {
            console.log('[SW] ✅ Enfocando y navegando ventana existente a:', urlToOpen);
            client.focus();
            
            // Solo navegar si la URL es diferente
            if (client.url !== urlToOpen) {
              return client.navigate(urlToOpen);
            }
            return client;
          }
        }
        
        // Si no hay ninguna ventana abierta, abrir una nueva
        if (self.clients.openWindow) {
          console.log('[SW] ✅ Abriendo nueva ventana');
          return self.clients.openWindow(urlToOpen);
        }
      })
      .catch((error) => {
        console.error('[SW] ❌ Error en notificationclick:', error);
      })
  );
});

// Cierre de la notificación
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] 🔔 Notificación cerrada:', event.notification.tag);
});

// ==========================================
// MENSAJES DEL CLIENTE
// ==========================================
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] ⏭️ Saltando espera...');
    self.skipWaiting();
  }
});

console.log('[SW] 🚀 Service Worker cargado correctamente');