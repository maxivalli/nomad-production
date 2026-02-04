import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { clientsClaim } from "workbox-core";

// Precachear archivos generados automáticamente por Vite
precacheAndRoute(self.__WB_MANIFEST);

// Limpiar cachés antiguos
cleanupOutdatedCaches();

const CACHE_NAME = "nomad-wear-v2";
const urlsToCache = [
  "/",
  "/index.html",
  "/Nomad.svg",
  "/Nomad.png",
  "/hyperwave-one.ttf",
];

// ==========================================
// INSTALACIÓN
// ==========================================
self.addEventListener("install", (event) => {
  console.log("[SW] Instalando Service Worker...");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Cache abierto");
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error("[SW] Error al cachear archivos:", error);
      }),
  );
  self.skipWaiting();
});

// ==========================================
// ACTIVACIÓN
// ==========================================
self.addEventListener("activate", (event) => {
  console.log("[SW] Activando Service Worker...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName !== CACHE_NAME &&
            !cacheName.startsWith("workbox-")
          ) {
            console.log("[SW] Eliminando cache antiguo:", cacheName);
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
  self.clients.claim();
});

// ==========================================
// FETCH (Cache Strategy)
// ==========================================
self.addEventListener("fetch", (event) => {
  if (!event.request.url.startsWith("http")) {
    return;
  }

  if (event.request.url.includes("/api/")) {
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
          if (event.request.destination === "document") {
            return caches.match("/index.html");
          }
        });
      }),
  );
});

// ==========================================
// PUSH NOTIFICATIONS
// ==========================================

// ✅ FUNCIÓN AUXILIAR: Convertir URL a formato HashRouter
function convertToHashRouterURL(url) {
  console.log("[SW] 🔄 Convirtiendo URL:", url);

  // Si ya es una URL completa con hash, devolverla tal cual
  if (url.includes("#/")) {
    console.log("[SW] ✅ URL ya tiene hash, sin cambios:", url);
    return url;
  }

  // Si es solo "/" devolver el home
  if (url === "/" || url === "") {
    console.log("[SW] 🏠 URL es home");
    return "/";
  }

  // Extraer el slug de diferentes formatos:
  // 1. https://www.nomadwear.com.ar/share/remera-santas-delivery
  // 2. /share/remera-santas-delivery
  // 3. /producto/remera-santas-delivery
  // 4. remera-santas-delivery
  
  let slug = url;

  // Caso 1: URL completa con /share/
  if (url.includes("/share/")) {
    slug = url.split("/share/")[1].split("?")[0].split("#")[0];
    console.log("[SW] 📦 Slug extraído de /share/:", slug);
  }
  // Caso 2: URL con /producto/
  else if (url.includes("/producto/")) {
    slug = url.split("/producto/")[1].split("?")[0].split("#")[0];
    console.log("[SW] 📦 Slug extraído de /producto/:", slug);
  }
  // Caso 3: Ya es solo el slug
  else if (!url.startsWith("http") && !url.startsWith("/")) {
    slug = url.split("?")[0].split("#")[0];
    console.log("[SW] 📦 Usando como slug directo:", slug);
  }
  // Caso 4: Empieza con / pero no tiene /share/ ni /producto/
  else if (url.startsWith("/") && !url.includes("/share/") && !url.includes("/producto/")) {
    // Quitar el / inicial
    slug = url.substring(1).split("?")[0].split("#")[0];
    console.log("[SW] 📦 Slug limpiado de /:", slug);
  }

  // Limpiar cualquier / al final
  slug = slug.replace(/\/$/, "");

  // Si después de limpiar queda vacío, ir al home
  if (!slug || slug === "") {
    console.log("[SW] 🏠 Slug vacío, ir al home");
    return "/";
  }

  // Construir la URL con HashRouter
  const hashURL = `/#/producto/${slug}`;
  console.log("[SW] ✅ URL final en formato HashRouter:", hashURL);
  return hashURL;
}

// Recibir una notificación push
self.addEventListener("push", (event) => {
  console.log("[SW] 📬 Push recibido:", event);

  let data = {
    title: "NOMAD® Wear",
    body: "Nueva actualización disponible",
    icon: "/icon-192-192.png",
    badge: "/icon-96-96.png",
    image: null,
    tag: "nomad-notification",
    requireInteraction: false,
    data: {
      url: "/",
    },
  };

  // Parsear los datos si vienen en el push
  if (event.data) {
    try {
      const parsedData = event.data.json();
      data = { ...data, ...parsedData };
      console.log("[SW] 📬 Datos parseados:", data);
    } catch (e) {
      console.error("[SW] ❌ Error parseando datos push:", e);
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || "/icon-192-192.png",
    badge: data.badge || "/icon-96-96.png",
    tag: data.tag || "nomad-notification",
    requireInteraction: data.requireInteraction || false,
    vibrate: [200, 100, 200],
    data: {
      url: data.url || "/", // ✅ Guardar la URL RAW tal como viene
      dateOfArrival: Date.now(),
      ...data.data,
    },
    actions: [
      {
        action: "open",
        title: "Ver más",
        icon: "/icon-96-96.png",
      },
      {
        action: "close",
        title: "Cerrar",
        icon: "/icon-96-96.png",
      },
    ],
  };

  // Agregar imagen si está presente
  if (data.image) {
    options.image = data.image;
    console.log("[SW] 🖼️ Notificación con imagen:", data.image);
  }

  event.waitUntil(
    self.registration
      .showNotification(data.title, options)
      .then(() => {
        console.log("[SW] ✅ Notificación mostrada correctamente");
      })
      .catch((error) => {
        console.error("[SW] ❌ Error mostrando notificación:", error);
      }),
  );
});

// Click en la notificación
// Recibir una notificación push
self.addEventListener("push", (event) => {
  console.log("[SW] 📬 Push recibido:", event);

  let data = {
    title: "NOMAD® Wear",
    body: "Nueva actualización disponible",
    icon: "/icon-192-192.png",
    badge: "/icon-96-96.png",
    image: null,
    tag: "nomad-notification",
    requireInteraction: false,
    url: "/", // ✅ Default URL aquí también
    data: {
      url: "/",
    },
  };

  // Parsear los datos si vienen en el push
  if (event.data) {
    try {
      const parsedData = event.data.json();
      data = { ...data, ...parsedData };
      console.log("[SW] 📬 Datos parseados completos:", data);
      console.log("[SW] 📬 URL en nivel superior:", data.url);
      console.log("[SW] 📬 URL en data.data:", data.data?.url);
    } catch (e) {
      console.error("[SW] ❌ Error parseando datos push:", e);
    }
  }

  // ✅ FIX CRÍTICO: Preservar la URL del nivel superior
  const urlToUse = data.url || data.data?.url || "/";
  console.log("[SW] 🔗 URL que se usará:", urlToUse);

  const options = {
    body: data.body,
    icon: data.icon || "/icon-192-192.png",
    badge: data.badge || "/icon-96-96.png",
    tag: data.tag || "nomad-notification",
    requireInteraction: data.requireInteraction || false,
    vibrate: [200, 100, 200],
    data: {
      // ✅ FIX: Primero el spread, DESPUÉS la URL correcta
      ...data.data,
      url: urlToUse, // ✅ Ahora prevalece la URL correcta
      dateOfArrival: Date.now(),
    },
    actions: [
      {
        action: "open",
        title: "Ver más",
        icon: "/icon-96-96.png",
      },
      {
        action: "close",
        title: "Cerrar",
        icon: "/icon-96-96.png",
      },
    ],
  };

  // Agregar imagen si está presente
  if (data.image) {
    options.image = data.image;
    console.log("[SW] 🖼️ Notificación con imagen:", data.image);
  }

  console.log("[SW] 📦 Options finales:", options);
  console.log("[SW] 📦 URL final en options.data:", options.data.url);

  event.waitUntil(
    self.registration
      .showNotification(data.title, options)
      .then(() => {
        console.log("[SW] ✅ Notificación mostrada correctamente");
      })
      .catch((error) => {
        console.error("[SW] ❌ Error mostrando notificación:", error);
      }),
  );
});

// Cierre de la notificación
self.addEventListener("notificationclose", (event) => {
  console.log("[SW] ❌ Notificación cerrada:", event);
});

// ==========================================
// MENSAJES DEL CLIENTE
// ==========================================
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});