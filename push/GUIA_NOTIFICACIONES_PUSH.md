# 🔔 Guía Completa: Implementación de Notificaciones Push en NOMAD Wear

## Índice
1. [Configuración Inicial](#1-configuración-inicial)
2. [Service Worker Mejorado](#2-service-worker-mejorado)
3. [Hook de Notificaciones](#3-hook-de-notificaciones)
4. [Componente de Suscripción](#4-componente-de-suscripción)
5. [Backend - Gestión de Suscripciones](#5-backend---gestión-de-suscripciones)
6. [Backend - Envío de Notificaciones](#6-backend---envío-de-notificaciones)
7. [Panel de Administración](#7-panel-de-administración)
8. [Ejemplos de Uso](#8-ejemplos-de-uso)

---

## 1. Configuración Inicial

### 1.1 Obtener VAPID Keys

Las VAPID keys son necesarias para identificar tu servidor ante los navegadores.

```bash
# En tu carpeta server/
npm install web-push --save
```

Crea un script para generar las keys:

```javascript
// server/scripts/generate-vapid-keys.js
const webpush = require('web-push');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('=== VAPID KEYS ===');
console.log('Public Key:', vapidKeys.publicKey);
console.log('Private Key:', vapidKeys.privateKey);
console.log('\nAgrega estas keys a tu archivo .env:');
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
```

Ejecuta:
```bash
node scripts/generate-vapid-keys.js
```

### 1.2 Actualizar .env

Agrega las siguientes variables:

```env
# VAPID Keys para Push Notifications
VAPID_PUBLIC_KEY=tu_clave_publica_aqui
VAPID_PRIVATE_KEY=tu_clave_privada_aqui
VAPID_EMAIL=mailto:tu-email@nomadwear.com
```

### 1.3 Actualizar package.json del servidor

```bash
cd server
npm install web-push --save
```

---

## 2. Service Worker Mejorado

Reemplaza tu archivo `client/public/sw.js` con esta versión mejorada:

```javascript
// client/public/sw.js
const CACHE_NAME = 'nomad-wear-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.jsx',
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
          if (cacheName !== CACHE_NAME) {
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
    return fetch(event.request);
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
            return caches.match('/');
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
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Si hay una ventana abierta, enfocarla
        for (let client of clientList) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }
        // Si no, abrir una nueva
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
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
```

---

## 3. Hook de Notificaciones

Crea un hook personalizado para gestionar las suscripciones:

```javascript
// client/src/hooks/usePushNotifications.js
import { useState, useEffect } from 'react';
import api from '../services/api';

const usePushNotifications = () => {
  const [permission, setPermission] = useState(Notification.permission);
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);

  // Verificar soporte
  useEffect(() => {
    const checkSupport = () => {
      const supported = 
        'serviceWorker' in navigator && 
        'PushManager' in window && 
        'Notification' in window;
      
      setIsSupported(supported);
      
      if (supported) {
        checkSubscription();
      }
    };

    checkSupport();
  }, []);

  // Verificar suscripción existente
  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      
      if (sub) {
        setSubscription(sub);
        setIsSubscribed(true);
      } else {
        setIsSubscribed(false);
      }
    } catch (error) {
      console.error('Error verificando suscripción:', error);
    }
  };

  // Solicitar permiso
  const requestPermission = async () => {
    if (!isSupported) {
      throw new Error('Las notificaciones no están soportadas en este navegador');
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        return true;
      } else {
        throw new Error('Permiso denegado');
      }
    } catch (error) {
      console.error('Error solicitando permiso:', error);
      throw error;
    }
  };

  // Suscribirse a notificaciones
  const subscribe = async () => {
    if (!isSupported) {
      throw new Error('Las notificaciones no están soportadas');
    }

    setLoading(true);

    try {
      // Solicitar permiso si no lo tenemos
      if (permission !== 'granted') {
        await requestPermission();
      }

      // Obtener el service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Obtener la clave pública del servidor
      const response = await api.getVapidPublicKey();
      const vapidPublicKey = response.data.publicKey;

      // Convertir la clave a formato Uint8Array
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

      // Crear la suscripción
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });

      // Enviar la suscripción al servidor
      await api.subscribeToPush(newSubscription);

      setSubscription(newSubscription);
      setIsSubscribed(true);

      return newSubscription;
    } catch (error) {
      console.error('Error suscribiéndose:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Desuscribirse
  const unsubscribe = async () => {
    if (!subscription) {
      return;
    }

    setLoading(true);

    try {
      // Desuscribirse en el navegador
      await subscription.unsubscribe();

      // Notificar al servidor
      await api.unsubscribeFromPush(subscription.endpoint);

      setSubscription(null);
      setIsSubscribed(false);
    } catch (error) {
      console.error('Error desuscribiéndose:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    isSupported,
    permission,
    isSubscribed,
    subscription,
    loading,
    subscribe,
    unsubscribe,
    requestPermission
  };
};

// Función auxiliar para convertir la clave VAPID
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default usePushNotifications;
```

---

## 4. Componente de Suscripción

Crea un componente para que los usuarios se suscriban:

```javascript
// client/src/components/PushNotificationPrompt.jsx
import { useState, useEffect } from 'react';
import { Bell, BellOff, X } from 'lucide-react';
import usePushNotifications from '../hooks/usePushNotifications';

const PushNotificationPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  
  const {
    isSupported,
    permission,
    isSubscribed,
    loading,
    subscribe,
    unsubscribe
  } = usePushNotifications();

  useEffect(() => {
    // Mostrar el prompt después de 10 segundos si:
    // - El navegador soporta notificaciones
    // - El usuario no ha otorgado/denegado permiso
    // - No se ha suscrito
    // - No ha sido descartado previamente
    const timer = setTimeout(() => {
      const hasBeenDismissed = localStorage.getItem('notification-prompt-dismissed');
      
      if (
        isSupported && 
        permission === 'default' && 
        !isSubscribed && 
        !hasBeenDismissed
      ) {
        setShowPrompt(true);
      }
    }, 10000); // 10 segundos

    return () => clearTimeout(timer);
  }, [isSupported, permission, isSubscribed]);

  const handleSubscribe = async () => {
    try {
      await subscribe();
      setShowPrompt(false);
    } catch (error) {
      console.error('Error al suscribirse:', error);
      alert('No se pudo activar las notificaciones. Por favor, verifica los permisos del navegador.');
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('notification-prompt-dismissed', 'true');
  };

  if (!showPrompt || !isSupported) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-96 z-50 animate-slide-up">
      <div className="bg-black border border-white/20 rounded-lg shadow-2xl p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-2 rounded-full">
              <Bell size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm uppercase tracking-wider">
                Ofertas Exclusivas
              </h3>
              <p className="text-white/60 text-xs">
                NOMAD® Wear
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/40 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <p className="text-white/80 text-sm mb-4">
          ¿Querés recibir notificaciones sobre nuevos drops, descuentos exclusivos y ofertas especiales?
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2.5 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
          >
            {loading ? 'Activando...' : 'Activar'}
          </button>
          <button
            onClick={handleDismiss}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white text-sm font-bold py-2.5 px-4 rounded transition-colors uppercase tracking-wider"
          >
            Ahora no
          </button>
        </div>
      </div>
    </div>
  );
};

export default PushNotificationPrompt;
```

---

## 5. Backend - Gestión de Suscripciones

Agrega estas rutas y funciones a tu `server/index.js`:

```javascript
// ==========================================
// TABLA DE SUSCRIPCIONES (Agregar a initDB)
// ==========================================

// Dentro de la función initDB(), agregar:
await pool.query(`
  CREATE TABLE IF NOT EXISTS push_subscriptions (
    id SERIAL PRIMARY KEY,
    endpoint TEXT UNIQUE NOT NULL,
    keys_p256dh TEXT NOT NULL,
    keys_auth TEXT NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN DEFAULT true
  );
`);

await pool.query(`
  CREATE TABLE IF NOT EXISTS push_notifications (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    url TEXT,
    icon TEXT,
    tag VARCHAR(100),
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    recipients_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0
  );
`);

console.log('✅ Tablas de notificaciones push creadas');

// ==========================================
// CONFIGURACIÓN DE WEB-PUSH
// ==========================================

const webpush = require('web-push');

// Configurar VAPID
webpush.setVapidDetails(
  process.env.VAPID_EMAIL || 'mailto:info@nomadwear.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// ==========================================
// RUTAS DE NOTIFICACIONES PUSH
// ==========================================

// Obtener la clave pública VAPID
app.get('/api/push/vapid-public-key', (req, res) => {
  res.json({
    publicKey: process.env.VAPID_PUBLIC_KEY
  });
});

// Suscribirse a notificaciones
app.post('/api/push/subscribe', async (req, res) => {
  try {
    const { endpoint, keys } = req.body;

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return res.status(400).json({ 
        error: 'Datos de suscripción incompletos' 
      });
    }

    const userAgent = req.headers['user-agent'] || 'unknown';

    // Guardar en la base de datos
    await pool.query(
      `INSERT INTO push_subscriptions (endpoint, keys_p256dh, keys_auth, user_agent)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (endpoint) 
       DO UPDATE SET 
         last_used = CURRENT_TIMESTAMP,
         active = true`,
      [endpoint, keys.p256dh, keys.auth, userAgent]
    );

    console.log('✅ Nueva suscripción push registrada');

    res.status(201).json({ 
      success: true,
      message: 'Suscripción registrada correctamente' 
    });
  } catch (error) {
    console.error('Error guardando suscripción:', error);
    res.status(500).json({ error: 'Error al registrar suscripción' });
  }
});

// Desuscribirse
app.post('/api/push/unsubscribe', async (req, res) => {
  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({ error: 'Endpoint requerido' });
    }

    await pool.query(
      'UPDATE push_subscriptions SET active = false WHERE endpoint = $1',
      [endpoint]
    );

    console.log('✅ Suscripción desactivada');

    res.json({ 
      success: true,
      message: 'Suscripción cancelada' 
    });
  } catch (error) {
    console.error('Error cancelando suscripción:', error);
    res.status(500).json({ error: 'Error al cancelar suscripción' });
  }
});

// Obtener estadísticas de suscripciones
app.get('/api/push/stats', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_subscriptions,
        COUNT(*) FILTER (WHERE active = true) as active_subscriptions,
        COUNT(*) FILTER (WHERE active = false) as inactive_subscriptions
      FROM push_subscriptions
    `);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// Enviar notificación a todos los suscriptores (solo admin)
app.post('/api/push/send', authenticateToken, async (req, res) => {
  try {
    const { title, body, url, icon, tag } = req.body;

    if (!title || !body) {
      return res.status(400).json({ 
        error: 'Título y mensaje son requeridos' 
      });
    }

    // Obtener todas las suscripciones activas
    const result = await pool.query(
      'SELECT * FROM push_subscriptions WHERE active = true'
    );

    const subscriptions = result.rows;
    
    if (subscriptions.length === 0) {
      return res.json({ 
        message: 'No hay suscriptores activos',
        sent: 0 
      });
    }

    // Payload de la notificación
    const payload = JSON.stringify({
      title,
      body,
      icon: icon || '/icon-192-192.png',
      badge: '/icon-96-96.png',
      url: url || '/',
      tag: tag || 'nomad-notification',
      requireInteraction: false,
      actions: [
        { action: 'open', title: 'Ver más' },
        { action: 'close', title: 'Cerrar' }
      ]
    });

    // Enviar notificaciones
    const promises = subscriptions.map(async (sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.keys_p256dh,
          auth: sub.keys_auth
        }
      };

      try {
        await webpush.sendNotification(pushSubscription, payload);
        return { success: true, endpoint: sub.endpoint };
      } catch (error) {
        console.error('Error enviando a:', sub.endpoint, error);
        
        // Si el endpoint ya no es válido, desactivarlo
        if (error.statusCode === 410 || error.statusCode === 404) {
          await pool.query(
            'UPDATE push_subscriptions SET active = false WHERE endpoint = $1',
            [sub.endpoint]
          );
        }
        
        return { success: false, endpoint: sub.endpoint, error };
      }
    });

    const results = await Promise.all(promises);
    
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    // Guardar registro de la notificación enviada
    await pool.query(
      `INSERT INTO push_notifications 
       (title, body, url, icon, tag, recipients_count, success_count, failure_count)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [title, body, url, icon, tag, subscriptions.length, successCount, failureCount]
    );

    console.log(`✅ Notificación enviada: ${successCount}/${subscriptions.length} exitosos`);

    res.json({
      success: true,
      message: 'Notificación enviada',
      total: subscriptions.length,
      successful: successCount,
      failed: failureCount
    });
  } catch (error) {
    console.error('Error enviando notificación:', error);
    res.status(500).json({ error: 'Error al enviar notificación' });
  }
});

// Obtener historial de notificaciones
app.get('/api/push/history', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM push_notifications 
       ORDER BY sent_at DESC 
       LIMIT 50`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
});
```

---

## 6. Actualizar services/api.js

Agrega estos métodos al archivo `client/src/services/api.js`:

```javascript
// Agregar al final del archivo api.js

// ==========================================
// PUSH NOTIFICATIONS
// ==========================================

getVapidPublicKey: async () => {
  return axios.get(`${API_URL}/push/vapid-public-key`);
},

subscribeToPush: async (subscription) => {
  return axios.post(`${API_URL}/push/subscribe`, subscription);
},

unsubscribeFromPush: async (endpoint) => {
  return axios.post(`${API_URL}/push/unsubscribe`, { endpoint });
},

getPushStats: async () => {
  return axios.get(`${API_URL}/push/stats`, {
    headers: { Authorization: `Bearer ${getAuthToken()}` }
  });
},

sendPushNotification: async (notificationData) => {
  return axios.post(`${API_URL}/push/send`, notificationData, {
    headers: { Authorization: `Bearer ${getAuthToken()}` }
  });
},

getPushHistory: async () => {
  return axios.get(`${API_URL}/push/history`, {
    headers: { Authorization: `Bearer ${getAuthToken()}` }
  });
},
```

---

## 7. Panel de Administración

Crea un componente para gestionar notificaciones desde el admin panel:

```javascript
// client/src/components/PushNotificationPanel.jsx
import { useState, useEffect } from 'react';
import { Bell, Send, Users, TrendingUp, Clock } from 'lucide-react';
import api from '../services/api';

const PushNotificationPanel = () => {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    url: '/',
    tag: 'nomad-offer'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, historyRes] = await Promise.all([
        api.getPushStats(),
        api.getPushHistory()
      ]);
      
      setStats(statsRes.data);
      setHistory(historyRes.data);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.body) {
      alert('Por favor completa título y mensaje');
      return;
    }

    if (!window.confirm('¿Enviar notificación a todos los suscriptores?')) {
      return;
    }

    setSending(true);
    try {
      const response = await api.sendPushNotification(formData);
      
      alert(`Notificación enviada: ${response.data.successful}/${response.data.total} exitosos`);
      
      // Reset form
      setFormData({
        title: '',
        body: '',
        url: '/',
        tag: 'nomad-offer'
      });
      
      // Reload data
      loadData();
    } catch (error) {
      console.error('Error enviando notificación:', error);
      alert('Error al enviar la notificación');
    } finally {
      setSending(false);
    }
  };

  // Plantillas predefinidas
  const templates = [
    {
      name: 'Nuevo Drop',
      title: '🔥 NUEVO DROP DISPONIBLE',
      body: 'Descubrí la nueva colección NOMAD®. ¡Stock limitado!',
      url: '/'
    },
    {
      name: 'Descuento',
      title: '💥 20% OFF en toda la tienda',
      body: 'Solo por 48hs. Aprovechá esta oportunidad única.',
      url: '/'
    },
    {
      name: 'Restock',
      title: '✨ RESTOCK ALERT',
      body: 'Volvieron tus productos favoritos. No te los pierdas.',
      url: '/'
    }
  ];

  const applyTemplate = (template) => {
    setFormData({
      ...formData,
      title: template.title,
      body: template.body,
      url: template.url
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-xs uppercase tracking-wider mb-1">
                Total Suscriptores
              </p>
              <p className="text-white text-2xl font-bold">
                {stats?.total_subscriptions || 0}
              </p>
            </div>
            <Users className="text-white/40" size={32} />
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-xs uppercase tracking-wider mb-1">
                Activos
              </p>
              <p className="text-white text-2xl font-bold">
                {stats?.active_subscriptions || 0}
              </p>
            </div>
            <TrendingUp className="text-green-500" size={32} />
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-xs uppercase tracking-wider mb-1">
                Inactivos
              </p>
              <p className="text-white text-2xl font-bold">
                {stats?.inactive_subscriptions || 0}
              </p>
            </div>
            <Bell className="text-white/40" size={32} />
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <h3 className="text-white font-bold text-lg mb-4 uppercase tracking-wider">
          Enviar Notificación
        </h3>

        {/* Templates */}
        <div className="mb-4">
          <p className="text-white/60 text-sm mb-2">Plantillas rápidas:</p>
          <div className="flex flex-wrap gap-2">
            {templates.map((template) => (
              <button
                key={template.name}
                onClick={() => applyTemplate(template)}
                className="bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 rounded transition-colors"
              >
                {template.name}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="block text-white/80 text-sm mb-2">
              Título *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
              placeholder="Ej: 🔥 NUEVO DROP DISPONIBLE"
              maxLength={65}
            />
            <p className="text-white/40 text-xs mt-1">
              {formData.title.length}/65 caracteres
            </p>
          </div>

          <div>
            <label className="block text-white/80 text-sm mb-2">
              Mensaje *
            </label>
            <textarea
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
              placeholder="Ej: Descubrí la nueva colección NOMAD®"
              rows={3}
              maxLength={200}
            />
            <p className="text-white/40 text-xs mt-1">
              {formData.body.length}/200 caracteres
            </p>
          </div>

          <div>
            <label className="block text-white/80 text-sm mb-2">
              URL (opcional)
            </label>
            <input
              type="text"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
              placeholder="/"
            />
          </div>

          <button
            type="submit"
            disabled={sending || !formData.title || !formData.body}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            <Send size={18} />
            {sending ? 'Enviando...' : 'Enviar Notificación'}
          </button>
        </form>
      </div>

      {/* History */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <h3 className="text-white font-bold text-lg mb-4 uppercase tracking-wider flex items-center gap-2">
          <Clock size={20} />
          Historial
        </h3>

        {history.length === 0 ? (
          <p className="text-white/60 text-sm">No hay notificaciones enviadas</p>
        ) : (
          <div className="space-y-3">
            {history.map((notif) => (
              <div
                key={notif.id}
                className="bg-white/5 border border-white/10 rounded p-3"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-white font-bold text-sm">
                      {notif.title}
                    </p>
                    <p className="text-white/60 text-xs mt-1">
                      {notif.body}
                    </p>
                  </div>
                  <p className="text-white/40 text-xs whitespace-nowrap ml-4">
                    {new Date(notif.sent_at).toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="flex gap-4 text-xs">
                  <span className="text-green-500">
                    ✓ {notif.success_count} exitosos
                  </span>
                  <span className="text-red-500">
                    ✗ {notif.failure_count} fallidos
                  </span>
                  <span className="text-white/40">
                    Total: {notif.recipients_count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PushNotificationPanel;
```

---

## 8. Integración en App

### 8.1 Agregar el prompt al App.jsx

```javascript
// client/src/App.jsx
// Importar el componente
import PushNotificationPrompt from './components/PushNotificationPrompt';

// Agregar dentro del return, antes del cierre final:
<PushNotificationPrompt />
```

### 8.2 Agregar al Panel de Admin

```javascript
// client/src/AdminPanel.jsx
// Importar
import PushNotificationPanel from './components/PushNotificationPanel';

// Agregar una nueva sección/tab para notificaciones
```

---

## 9. Ejemplos de Uso

### 9.1 Notificación de Nuevo Producto

```javascript
// Cuando agregas un producto nuevo
const notificationData = {
  title: '🔥 NUEVO DROP DISPONIBLE',
  body: 'Acabamos de lanzar la nueva hoodie NOMAD®. ¡Stock limitado!',
  url: '/producto/nueva-hoodie',
  tag: 'new-product'
};

await api.sendPushNotification(notificationData);
```

### 9.2 Descuentos y Ofertas

```javascript
const notificationData = {
  title: '💥 20% OFF - Solo 48hs',
  body: 'Aprovechá el descuento en toda la tienda. No te lo pierdas.',
  url: '/',
  tag: 'sale'
};

await api.sendPushNotification(notificationData);
```

### 9.3 Restock Alert

```javascript
const notificationData = {
  title: '✨ RESTOCK ALERT',
  body: 'Tu producto favorito volvió a estar disponible.',
  url: '/producto/tu-favorito',
  tag: 'restock'
};

await api.sendPushNotification(notificationData);
```

---

## 10. Testing

### Probar en desarrollo:

1. **HTTPS es requerido**: Usa `ngrok` o similar para testing local
2. **Probar suscripción**: Abre DevTools > Application > Service Workers
3. **Ver notificaciones**: Application > Push Messaging

### Comandos útiles:

```bash
# Ver suscripciones en la base de datos
psql -d tu_database -c "SELECT * FROM push_subscriptions;"

# Ver historial de notificaciones
psql -d tu_database -c "SELECT * FROM push_notifications ORDER BY sent_at DESC LIMIT 10;"
```

---

## 11. Mejores Prácticas

1. **No abuses**: No envíes más de 1-2 notificaciones por semana
2. **Personaliza**: Segmenta tu audiencia cuando sea posible
3. **Timing**: Envía en horarios apropiados (10am - 8pm)
4. **Valor**: Cada notificación debe aportar valor real
5. **Testing**: Prueba siempre antes de enviar masivamente
6. **Respeta**: Permite desuscribirse fácilmente

---

## 12. Troubleshooting

### "Permission denied"
- Verifica que el sitio esté en HTTPS
- Limpia las cookies y recarga

### "Registration failed"
- Verifica que el service worker esté correctamente registrado
- Chequea la consola por errores

### "Subscription failed"
- Verifica las VAPID keys
- Asegúrate que el endpoint del backend esté accesible

### Notificaciones no llegan
- Verifica que la suscripción esté activa en la BD
- Chequea que las VAPID keys sean las correctas
- Revisa los logs del servidor

---

¡Listo! Ahora tenés un sistema completo de notificaciones push para tu PWA. 🚀
