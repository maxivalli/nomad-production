# 🚀 Instalación Rápida - Notificaciones Push NOMAD Wear

## Paso 1: Instalar Dependencias

```bash
# En la carpeta server/
cd server
npm install web-push --save
```

## Paso 2: Generar VAPID Keys

```bash
# Crear el script en server/scripts/
# Copia el contenido de generate-vapid-keys.js

# Ejecutar:
node scripts/generate-vapid-keys.js
```

Copia las keys generadas y agrégalas a tu `.env`:

```env
VAPID_PUBLIC_KEY=tu_clave_publica_aqui
VAPID_PRIVATE_KEY=tu_clave_privada_aqui
VAPID_EMAIL=mailto:info@nomadwear.com
```

## Paso 3: Actualizar el Backend

### 3.1 Modificar server/index.js

1. Agregar al inicio (después de los requires):
```javascript
const webpush = require('web-push');
```

2. Configurar VAPID (después de configurar la DB):
```javascript
webpush.setVapidDetails(
  process.env.VAPID_EMAIL || 'mailto:info@nomadwear.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);
```

3. Agregar las tablas en la función `initDB()`:
   - Copia el código de `backend-push-routes.js` (sección de CREATE TABLE)

4. Agregar las rutas de API:
   - Copia todas las rutas del archivo `backend-push-routes.js`

## Paso 4: Actualizar el Frontend

### 4.1 Reemplazar el Service Worker

```bash
# Reemplaza client/public/sw.js con el contenido de sw-nuevo.js
```

### 4.2 Crear el Hook

```bash
# Crea client/src/hooks/usePushNotifications.js
# Copia el contenido de usePushNotifications.js
```

### 4.3 Crear el Componente de Prompt

```bash
# Crea client/src/components/PushNotificationPrompt.jsx
# Copia el contenido de PushNotificationPrompt.jsx
```

### 4.4 Crear el Panel de Admin

```bash
# Crea client/src/components/PushNotificationPanel.jsx
# Copia el contenido de PushNotificationPanel.jsx
```

### 4.5 Actualizar api.js

En `client/src/services/api.js`, agrega los métodos de `api-push-methods.js`

### 4.6 Integrar en App.jsx

```javascript
// Importar
import PushNotificationPrompt from './components/PushNotificationPrompt';

// Agregar dentro del return principal:
<PushNotificationPrompt />
```

### 4.7 Integrar en AdminPanel.jsx

```javascript
// Importar
import PushNotificationPanel from './components/PushNotificationPanel';

// Agregar una nueva sección o tab:
<PushNotificationPanel />
```

## Paso 5: Testing

### 5.1 Verificar el Service Worker

1. Abre DevTools > Application > Service Workers
2. Verifica que el SW esté registrado
3. Chequea que no haya errores

### 5.2 Probar Suscripción

1. Navega a tu app
2. Espera 10 segundos para que aparezca el prompt
3. Haz clic en "Activar"
4. Verifica que se solicite el permiso

### 5.3 Enviar Notificación de Prueba

1. Inicia sesión en el panel de admin
2. Ve a la sección de Notificaciones Push
3. Usa una plantilla o escribe tu propio mensaje
4. Haz clic en "Enviar Notificación"

## Paso 6: Despliegue

### IMPORTANTE: HTTPS es Requerido

Las notificaciones push solo funcionan en HTTPS. Asegúrate de que tu app esté en:
- Producción: HTTPS habilitado
- Desarrollo local: Usa `localhost` (permite HTTP) o ngrok/similar

### Variables de Entorno

Verifica que en producción tengas:
```env
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_EMAIL=mailto:info@nomadwear.com
```

## Checklist de Verificación

- [ ] Dependencia `web-push` instalada
- [ ] VAPID keys generadas y en .env
- [ ] Tablas de BD creadas (push_subscriptions, push_notifications)
- [ ] Rutas de backend agregadas
- [ ] Service Worker actualizado
- [ ] Hook usePushNotifications creado
- [ ] Componente PushNotificationPrompt creado
- [ ] Componente PushNotificationPanel creado
- [ ] Métodos de API agregados
- [ ] Integrado en App.jsx
- [ ] Integrado en AdminPanel.jsx
- [ ] App corriendo en HTTPS
- [ ] Notificaciones probadas exitosamente

## Solución de Problemas

### Error: "Permission denied"
- Verifica HTTPS
- Limpia cookies y recarga
- Revisa permisos del navegador

### Error: "Subscription failed"
- Verifica VAPID keys
- Chequea que el backend esté corriendo
- Revisa la consola del navegador

### Notificaciones no llegan
- Verifica suscripciones activas en la BD
- Chequea logs del servidor
- Confirma que VAPID keys coincidan

## Siguientes Pasos

1. **Segmentación**: Agrega campos para segmentar usuarios
2. **Scheduling**: Implementa programación de notificaciones
3. **A/B Testing**: Prueba diferentes mensajes
4. **Analytics**: Trackea clicks y conversiones
5. **Personalización**: Usa datos del usuario en mensajes

¡Listo! 🎉
