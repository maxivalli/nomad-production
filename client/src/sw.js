import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { clientsClaim } from "workbox-core";

// Precachear archivos generados automáticamente por Vite
precacheAndRoute(self.__WB_MANIFEST);

// Limpiar cachés antiguos
cleanupOutdatedCaches();

const CACHE_NAME = "nomad-wear-v5"; // ✅ INCREMENTADO a v5
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
    url: "/",
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

  // Preservar la URL del nivel superior
  const urlToUse = data.url || data.data?.url || "/";
  console.log("[SW] 🔗 URL que se usará:", urlToUse);

  // ✅ CONVERTIR LA URL AQUÍ MISMO, antes de crear la notificación
  const convertedURL = convertToHashRouterURL(urlToUse);
  console.log("[SW] 🎯 URL convertida ANTES de mostrar notificación:", convertedURL);

  const options = {
    body: data.body,
    icon: data.icon || "/icon-192-192.png",
    badge: data.badge || "/icon-96-96.png",
    tag: data.tag || "nomad-notification",
    // ✅ FIX ANDROID: requireInteraction en false puede causar problemas
    requireInteraction: false,
    vibrate: [200, 100, 200],
    data: {
      ...data.data,
      url: convertedURL, // ✅ GUARDAR LA URL YA CONVERTIDA
      originalURL: urlToUse, // ✅ Guardar también la original por si acaso
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

// ✅ FIX ANDROID: Click en la notificación (con manejo especial para Android)
self.addEventListener("notificationclick", (event) => {
  // ✅ LOGS INMEDIATOS para detectar si el evento se dispara
  console.log("[SW] ==========================================");
  console.log("[SW] 👆👆👆 NOTIFICATIONCLICK DISPARADO 👆👆👆");
  console.log("[SW] ==========================================");
  console.log("[SW] Event:", event);
  console.log("[SW] Acción:", event.action);
  console.log("[SW] Notification:", event.notification);
  console.log("[SW] Notification.data:", event.notification.data);

  // ✅ CRÍTICO para Android: cerrar la notificación INMEDIATAMENTE
  event.notification.close();
  console.log("[SW] ✅ Notificación cerrada");

  // Si hizo click en "cerrar", no hacer nada más
  if (event.action === "close") {
    console.log("[SW] 👆 Acción cerrar - fin");
    return;
  }

  // ✅ OBTENER LA URL (ya convertida desde el evento push)
  const urlToOpen = event.notification.data?.url || "/";
  console.log("[SW] 🔗 URL a abrir (ya convertida):", urlToOpen);

  // ✅ Construir la URL completa con el origin
  let finalURL;
  try {
    // Si la URL ya incluye el hash, usarla directamente con el origin
    if (urlToOpen.startsWith("/#/")) {
      finalURL = new URL(urlToOpen.substring(1), self.location.origin).href;
    } else if (urlToOpen.startsWith("#/")) {
      finalURL = new URL(urlToOpen, self.location.origin).href;
    } else if (urlToOpen === "/") {
      finalURL = self.location.origin + "/";
    } else {
      finalURL = new URL(urlToOpen, self.location.origin).href;
    }
    console.log("[SW] 🌐 URL final completa:", finalURL);
  } catch (error) {
    console.error("[SW] ❌ Error construyendo URL:", error);
    finalURL = self.location.origin + "/";
    console.log("[SW] 🏠 Fallback a home:", finalURL);
  }

  // ✅ ABRIR/NAVEGAR A LA URL
  event.waitUntil(
    self.clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        console.log("[SW] 🔍 Buscando ventanas...");
        console.log("[SW] 📊 Ventanas encontradas:", clientList.length);

        // Intentar encontrar una ventana del sitio
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          console.log(`[SW] 🪟 Ventana ${i + 1}:`, client.url);

          if (client.url.startsWith(self.location.origin)) {
            console.log("[SW] ✅ Ventana del sitio encontrada");
            console.log("[SW] 👉 Actual:", client.url);
            console.log("[SW] 👉 Destino:", finalURL);

            // ✅ IMPORTANTE para Android: Primero focus, LUEGO navigate
            return client.focus().then(() => {
              console.log("[SW] ✅ Ventana enfocada");
              
              // Solo navegar si la URL es diferente
              if (client.url !== finalURL) {
                console.log("[SW] 🚀 Navegando a nueva URL...");
                return client.navigate(finalURL).then(() => {
                  console.log("[SW] ✅ Navegación completada");
                }).catch((error) => {
                  console.error("[SW] ❌ Error en navigate:", error);
                  // Si navigate falla, intentar abrir nueva ventana
                  console.log("[SW] 🆕 Intentando abrir nueva ventana...");
                  return self.clients.openWindow(finalURL);
                });
              } else {
                console.log("[SW] ℹ️ Ya está en la URL correcta");
                return client;
              }
            });
          }
        }

        // Si no hay ventana del sitio, abrir una nueva
        console.log("[SW] 🆕 No hay ventana del sitio, abriendo nueva...");
        if (self.clients.openWindow) {
          return self.clients.openWindow(finalURL).then((windowClient) => {
            console.log("[SW] ✅ Nueva ventana abierta:", windowClient);
            return windowClient;
          }).catch((error) => {
            console.error("[SW] ❌ Error abriendo ventana:", error);
          });
        } else {
          console.error("[SW] ❌ openWindow no está disponible");
        }
      })
      .catch((error) => {
        console.error("[SW] 💥 Error crítico en notificationclick:", error);
        console.error("[SW] Error stack:", error.stack);
      }),
  );
});

// Cierre de la notificación
self.addEventListener("notificationclose", (event) => {
  console.log("[SW] 🔕 Notificación cerrada sin click:", event);
});

// ==========================================
// MENSAJES DEL CLIENTE
// ==========================================
self.addEventListener("message", (event) => {
  console.log("[SW] 💬 Mensaje recibido:", event.data);
  
  if (event.data && event.data.type === "SKIP_WAITING") {
    console.log("[SW] ⏭️ Skip waiting activado");
    self.skipWaiting();
  }
});

// ✅ LOG DE DEBUGGING AL CARGAR EL SW
console.log("[SW] 🚀 Service Worker cargado - Versión:", CACHE_NAME);
console.log("[SW] 🌍 Origin:", self.location.origin);
console.log("[SW] 📍 Scope:", self.registration?.scope);