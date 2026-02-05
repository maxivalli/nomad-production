import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { clientsClaim } from "workbox-core";

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();
clientsClaim();

const CACHE_NAME = "nomad-wear-v6";

// 1. ESTRATEGIA PARA IMÁGENES (Cache First)
// Optimiza el ancho de banda y carga instantáneamente fotos de productos.
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'nomad-images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60, // Limita a 60 imágenes para no saturar el móvil
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 días de vida
      }),
    ],
  })
);

// 2. ESTRATEGIA PARA FUENTES Y ESTILOS (Stale While Revalidate)
// Las fuentes no cambian seguido, pero queremos la versión más rápida disponible.
registerRoute(
  ({ request }) => request.destination === 'font' || request.destination === 'style',
  new StaleWhileRevalidate({
    cacheName: 'nomad-assets',
  })
);

// 3. ESTRATEGIA PARA API (Network First)
// Siempre intenta traer el stock/precio real. Si falla (offline), usa el caché.
registerRoute(
  ({ url }) => url.pathname.includes('/api/'),
  new NetworkFirst({
    cacheName: 'nomad-api-data',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 24 * 60 * 60, // 24 horas para datos de API
      }),
    ],
  })
);

// --- LÓGICA DE INSTALACIÓN Y ACTIVACIÓN ---

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && !cacheName.startsWith("workbox-") && cacheName !== 'nomad-images') {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// --- LÓGICA DE NOTIFICACIONES PUSH (ANDROID OPTIMIZED) ---

function convertToHashRouterURL(url) {
  if (url.includes("#/")) return url;
  if (url === "/" || url === "") return "/";

  let slug = url;
  if (url.includes("/share/")) {
    slug = url.split("/share/")[1].split("?")[0].split("#")[0];
  } else if (url.includes("/producto/")) {
    slug = url.split("/producto/")[1].split("?")[0].split("#")[0];
  } else if (!url.startsWith("http") && !url.startsWith("/")) {
    slug = url.split("?")[0].split("#")[0];
  } else if (url.startsWith("/") && !url.includes("/share/") && !url.includes("/producto/")) {
    slug = url.substring(1).split("?")[0].split("#")[0];
  }

  slug = slug.replace(/\/$/, "");
  return (!slug || slug === "") ? "/" : `/#/producto/${slug}`;
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
    } catch (e) {}
  }

  const convertedURL = convertToHashRouterURL(data.url || data.data?.url || "/");

  const options = {
    body: data.body,
    icon: data.icon || "/icon-192-192.png",
    badge: data.badge || "/badge-96.png",
    tag: data.tag,
    requireInteraction: true, // Cambiado a true para que el usuario deba cerrarla
    vibrate: [200, 100, 200],
    color: "#e60000",
    data: {
      ...data.data,
      url: convertedURL,
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

  const urlToOpen = event.notification.data?.url || "/";
  const finalURL = new URL(urlToOpen.startsWith("/#") ? urlToOpen.substring(1) : urlToOpen, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin)) {
          return client.focus().then(() => {
            if (client.url !== finalURL) return client.navigate(finalURL);
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