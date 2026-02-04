# 📱 Guía Completa para Convertir NOMAD® Wear en PWA

## ✅ Archivos Creados

He creado los siguientes archivos para tu PWA:

1. **`/client/public/manifest.json`** - Manifiesto de la aplicación web
2. **`/client/public/sw.js`** - Service Worker para caché y funcionalidad offline
3. **`/client/src/hooks/useServiceWorker.js`** - Hook de React para registrar el SW
4. **`/client/generate-icons.sh`** - Script para generar los iconos PWA
5. **`/client/index-pwa.html`** - Index.html actualizado con meta tags PWA

## 🚀 Pasos para Implementar

### 1. Reemplazar el index.html

```bash
# Desde la carpeta client/
cp index-pwa.html index.html
```

O manualmente, agrega estas líneas al `<head>` de tu `index.html` actual (después de la línea 6):

```html
<!-- PWA Meta Tags -->
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#000000" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="NOMAD®" />
<link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
```

### 2. Generar los Iconos PWA

Necesitas crear los iconos en diferentes tamaños. Tienes dos opciones:

#### Opción A: Usar el script automatizado (requiere ImageMagick)

```bash
# Instalar ImageMagick (si no lo tienes)
sudo apt-get install imagemagick

# Ejecutar el script desde la carpeta client/
./generate-icons.sh
```

#### Opción B: Generar manualmente

Crea una carpeta `/client/public/icons/` y genera estos tamaños desde tu logo `Nomad.png`:
- 72x72
- 96x96
- 128x128
- 144x144
- 152x152
- 192x192
- 384x384
- 512x512

Puedes usar herramientas online como:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator

### 3. Registrar el Service Worker en tu App

Abre tu archivo principal de React (`/client/src/App.jsx` o `/client/src/main.jsx`) e importa el hook:

```jsx
import { useServiceWorker } from './hooks/useServiceWorker';

function App() {
  // Registrar el service worker
  useServiceWorker();
  
  // ... resto de tu código
}
```

Si usas `main.jsx`, agrégalo antes de renderizar:

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Registrar Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => console.log('SW registrado:', registration))
      .catch(error => console.log('Error SW:', error));
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

### 4. Actualizar Vite Config (Opcional pero Recomendado)

Para mejor manejo de PWA en producción, instala el plugin de Vite:

```bash
npm install vite-plugin-pwa -D
```

Luego actualiza tu `vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['Nomad.svg', 'Nomad.png', 'hyperwave-one.ttf'],
      manifest: {
        name: 'NOMAD® Wear - Streetwear Argentina',
        short_name: 'NOMAD®',
        description: 'Ropa urbana diseñada para el movimiento',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,ttf}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 año
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
```

## 🧪 Probar la PWA

### En Desarrollo Local

```bash
npm run dev
```

Luego abre Chrome DevTools > Application > Service Workers y verifica que esté registrado.

### En Producción

```bash
npm run build
npm run preview
```

O despliega en Vercel/Netlify y prueba en tu móvil.

## ✨ Verificar que Funciona

1. **Chrome DevTools**
   - Abre DevTools (F12)
   - Ve a "Application" > "Manifest"
   - Deberías ver tu manifest.json
   - Ve a "Service Workers" y verifica que esté activo

2. **Lighthouse**
   - DevTools > Lighthouse
   - Ejecuta un audit de PWA
   - Deberías obtener 100/100 en PWA

3. **Instalación**
   - En Chrome/Edge: Aparecerá un ícono de "Instalar" en la barra de URL
   - En móvil: "Agregar a pantalla de inicio"

## 🎨 Personalización

### Cambiar Colores del Tema

Edita `manifest.json`:

```json
{
  "theme_color": "#TU_COLOR",
  "background_color": "#TU_COLOR"
}
```

### Cambiar Estrategia de Caché

En `sw.js`, modifica la estrategia según necesites:

- **Network First**: Intenta red primero, luego caché (actual)
- **Cache First**: Caché primero, luego red (mejor para recursos estáticos)
- **Network Only**: Solo red (para APIs en tiempo real)
- **Cache Only**: Solo caché (para recursos offline)

## 📊 Características de tu PWA

✅ **Instalable** - Los usuarios pueden agregar la app a su pantalla de inicio
✅ **Offline** - Funciona sin conexión gracias al Service Worker
✅ **Actualización automática** - Detecta nuevas versiones y pregunta al usuario
✅ **Caché inteligente** - Almacena recursos para carga rápida
✅ **App-like** - Se ve y funciona como app nativa
✅ **Compatible iOS/Android** - Funciona en ambos sistemas

## 🔧 Troubleshooting

### El Service Worker no se registra
- Verifica que estés en HTTPS o localhost
- Revisa la consola del navegador para errores
- Asegúrate que `sw.js` esté en la carpeta `public/`

### Los iconos no aparecen
- Verifica que la carpeta `/public/icons/` exista
- Revisa que los tamaños sean correctos
- Usa formato PNG para mejor compatibilidad

### No aparece el prompt de instalación
- Verifica que tengas HTTPS
- Asegúrate que todos los iconos existan
- El manifest debe tener `display: "standalone"`
- Solo aparece si el usuario visita al menos 2 veces

## 📚 Recursos Adicionales

- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Service Worker API](https://developer.mozilla.org/es/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/es/docs/Web/Manifest)

---

¡Tu app NOMAD® Wear ahora es una PWA completa! 🎉
