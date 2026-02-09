import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { registerRoute, NavigationRoute } from "workbox-routing";
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { clientsClaim } from "workbox-core";

// Precachear assets del manifest generado por Vite
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();
clientsClaim();

const CACHE_NAME = "nomad-wear-v7"; // Incrementamos versión por el cambio de router

// 1. ESTRATEGIA PARA IMÁGENES (Cache First)
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'nomad-images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 días
      }),
    ],
  })
);

// 2. ESTRATEGIA PARA FUENTES Y ESTILOS (Stale While Revalidate)
registerRoute(
  ({ request }) => request.destination === 'font' || request.destination === 'style',
  new StaleWhileRevalidate({
    cacheName: 'nomad-assets',
  })
);

// 3. ESTRATEGIA PARA API (Network First) - Excluir /api y /share del SW
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/') || url.pathname.startsWith('/share/'),
  new NetworkFirst({
    cacheName: 'nomad-api-data',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 24 * 60 * 60, // 24 horas
      }),
    ],
  })
);

// 4. ESTRATEGIA PARA RUTAS DE NAVEGACIÓN (BrowserRouter)
// Todas las rutas de navegación devuelven index.html (SPA fallback)
const navigationRoute = new NavigationRoute(
  new NetworkFirst({
    cacheName: 'nomad-pages',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 días para páginas HTML
      }),
    ],
  }),
  {
    // Excluir rutas que no deben ser manejadas por el SW de navegación
    denylist: [/^\/api/, /^\/share/],
  }
);
registerRoute(navigationRoute);

// --- LÓGICA DE INSTALACIÓN Y ACTIVACIÓN ---

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Limpiar caches antiguas excepto las actuales
          const validCaches = [
            CACHE_NAME, 
            'workbox-precache', 
            'nomad-images', 
            'nomad-assets', 
            'nomad-api-data',
            'nomad-pages'
          ];
          if (!validCaches.some(valid => cacheName.startsWith(valid))) {
            console.log('[SW] Borrando cache antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// --- LÓGICA DE NOTIFICACIONES PUSH (BrowserRouter Optimizado) ---

// Ya NO convertimos a hash router - usamos URLs limpias
function normalizeURL(url) {
  if (!url || url === "/" || url === "") return "/";
  
  // Si ya es una URL completa, devolverla
  if (url.startsWith("http")) return url;
  
  // Limpiar parámetros de query y hash para rutas internas
  let cleanUrl = url.split("?")[0].split("#")[0];
  
  // Asegurar que empiece con /
  if (!cleanUrl.startsWith("/")) cleanUrl = "/" + cleanUrl;
  
  // Manejar rutas específicas
  if (cleanUrl.includes("/share/")) {
    const slug = cleanUrl.split("/share/")[1];
    return slug ? `/producto/${slug}` : "/";
  }
  
  if (cleanUrl.includes("/producto/")) {
    return cleanUrl; // Ya está en formato correcto
  }
  
  // Remover trailing slash excepto para root
  cleanUrl = cleanUrl.replace(/\/$/, "");
  return cleanUrl || "/";
}

self.addEventListener("push", (event) => {
  let data = {
    title: "NOMAD® Wear",
    body: "Nueva actualización disponible",
    icon: "/icon-192-192.png",
    badge: "/badge-96.png",
    tag: "nomad-notification",
    url: "/",
    data: { url: "/" },
  };

  if (event.data) {
    try {
      const parsedData = event.data.json();
      data = { ...data, ...parsedData };
    } catch (e) {
      console.error('[SW] Error parseando push data:', e);
    }
  }

  // Normalizar URL para BrowserRouter (sin #/)
  const normalizedURL = normalizeURL(data.url || data.data?.url || "/");

  const options = {
    body: data.body,
    icon: data.icon || "/icon-192-192.png",
    badge: data.badge || "/badge-96.png",
    tag: data.tag,
    requireInteraction: true,
    vibrate: [200, 100, 200],
    data: {
      ...data.data,
      url: normalizedURL,
      dateOfArrival: Date.now(),
    },
    actions: [
      { action: "open", title: "Ver más" },
      { action: "close", title: "Cerrar" },
    ],
  };

  if (data.image) options.image = data.image;

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "close") return;

  // URL limpia sin #/ para BrowserRouter
  const urlToOpen = event.notification.data?.url || "/";
  const finalURL = new URL(urlToOpen, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin)) {
          return client.focus().then(() => {
            // Navegar a la URL limpia (sin hash)
            if (new URL(client.url).pathname !== urlToOpen) {
              return client.navigate(finalURL);
            }
            return client;
          });
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(finalURL);
    })
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});