# NOMAD® Wear — Documentación del Proyecto

> Sitio web y tienda online de **NOMAD® Wear**, marca de streetwear argentina. Aplicación fullstack con panel de administración, PWA, notificaciones push y generación de contenido con IA.

---

## Stack Tecnológico

### Frontend (Client)
- **React 19** con React Router DOM v7 (BrowserRouter)
- **Vite 7** como bundler + **vite-plugin-pwa** (PWA con `injectManifest`)
- **Tailwind CSS v4** + PostCSS
- **Framer Motion** — animaciones
- **Lucide React** — iconos
- **Workbox** — service worker y caching

### Backend (Server)
- **Node.js** con **Express v5** (CommonJS)
- **PostgreSQL** con pool de conexiones (`pg`)
- **JWT** en cookies httpOnly para autenticación
- **Cloudinary** para almacenamiento de imágenes y videos (multer-storage-cloudinary)
- **Web Push** con claves VAPID para notificaciones push
- **Helmet + CORS + express-rate-limit** para seguridad
- **Joi** para validación de schemas
- **bcrypt** para hasheo de contraseñas

### Deploy
- **Vercel** — frontend (static build) + backend (serverless function)
- Configuración en `vercel.json` con rewrites para `/api/*` y `/share/*`

---

## Estructura del Proyecto

```
nomad-production-main/
├── client/                        # Frontend React
│   ├── public/                    # Assets estáticos (icons, manifest.json, fuentes)
│   ├── src/
│   │   ├── App.jsx                # Componente raíz, manejo de rutas y modal de producto
│   │   ├── main.jsx               # Entry point, PreLoader global
│   │   ├── components/            # Componentes UI
│   │   │   ├── Navbar.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── Gallery.jsx        # Grilla de productos
│   │   │   ├── ProductModal.jsx   # Modal de detalle de producto
│   │   │   ├── Collage.jsx        # Sección visual de collage
│   │   │   ├── Manifest.jsx       # Sección "manifiesto" de la marca
│   │   │   ├── Packing.jsx        # Sección packaging
│   │   │   ├── TheStudio.jsx      # Sección del estudio
│   │   │   ├── MeliSection.jsx    # Integración Mercado Libre
│   │   │   ├── Stockists.jsx      # Distribuidores
│   │   │   ├── Contacto.jsx       # Formulario de contacto
│   │   │   ├── Footer.jsx
│   │   │   ├── BannerModal.jsx    # Banner publicitario al ingresar
│   │   │   ├── AdminBannersPanel.jsx
│   │   │   ├── PushNotificationPanel.jsx
│   │   │   ├── PushNotificationPrompt.jsx
│   │   │   ├── InstallPrompt.jsx  # Prompt de instalación PWA
│   │   │   ├── PWAInstallButton.jsx
│   │   │   ├── PreLoader.jsx
│   │   │   ├── Toast.jsx          # Sistema de notificaciones UI
│   │   │   ├── IntroMarque.jsx    # Marquee animado
│   │   │   └── StudioMarque.jsx
│   │   ├── views/
│   │   │   ├── AdminPanel.jsx     # Panel de administración completo
│   │   │   ├── Login.jsx          # Login del admin
│   │   │   └── Retailers.jsx      # Vista de distribuidores
│   │   ├── hooks/
│   │   │   ├── useProducts.js     # Hook para fetch de productos
│   │   │   ├── usePushNotifications.js
│   │   │   └── usePWAInstall.jsx
│   │   ├── services/
│   │   │   ├── api.js             # Clase ApiService centralizada (todas las llamadas)
│   │   │   ├── flyerGenerator.js  # Generación de flyers
│   │   │   └── videoGenerator-replicate.js  # Generación de video con Replicate
│   │   ├── config/
│   │   │   └── replicate.js
│   │   └── sw.js                  # Service worker custom (Workbox injectManifest)
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── server/                        # Backend Node.js
│   ├── index.js                   # Entry point Express
│   ├── config/
│   │   ├── database.js            # Pool PostgreSQL
│   │   ├── cloudinary.js          # Config Cloudinary + multer storages
│   │   ├── webpush.js             # Config VAPID para Web Push
│   │   └── security.js            # Helmet, CORS, rate limiters
│   ├── models/
│   │   └── initDB.js              # Inicialización y migración de tablas
│   ├── middleware/
│   │   ├── auth.js                # JWT middleware (authenticateAdmin)
│   │   └── errorHandler.js
│   ├── controllers/
│   │   ├── authController.js      # login / logout / verify
│   │   ├── productController.js   # CRUD productos + cleanup Cloudinary
│   │   ├── bannerController.js    # CRUD banners publicitarios
│   │   ├── pushController.js      # Suscripciones + envío masivo push
│   │   ├── pushImageController.js # Upload imágenes para push
│   │   ├── settingsController.js  # launch_date, current_collection
│   │   ├── shareController.js     # SSR para Open Graph (compartir productos)
│   │   ├── videoController.js
│   │   └── replicateController.js # Generación de video IA
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── bannerRoutes.js
│   │   ├── pushRoutes.js
│   │   ├── cloudinaryRoutes.js
│   │   ├── settingsRoutes.js
│   │   ├── shareRoutes.js
│   │   ├── videoRoutes.js
│   │   ├── replicateRoutes.js
│   │   └── sitemapRoutes.js       # Sitemap dinámico
│   ├── validators/
│   │   └── schemas.js             # Schemas Joi (productSchema, loginSchema)
│   ├── utils/
│   │   └── helpers.js             # extractPublicId, injectMetaTags
│   └── scripts/
│       └── generate-vapid-keys.js
│
└── vercel.json                    # Config de deploy Vercel
```

---

## Base de Datos (PostgreSQL)

### Tablas

| Tabla | Descripción |
|---|---|
| `products` | Productos del catálogo |
| `admins` | Usuarios administradores |
| `settings` | Configuración clave-valor (`current_collection`, `launch_date`) |
| `banners` | Banners publicitarios con fechas de vigencia |
| `push_subscriptions` | Suscripciones Web Push de los usuarios |
| `push_notifications` | Historial de notificaciones enviadas |

### Esquema de `products`

```sql
id          SERIAL PRIMARY KEY
season      VARCHAR(50)  -- 'spring' | 'summer' | 'autumn' | 'winter'
year        INTEGER      -- 2026 a 2050
title       VARCHAR(255)
description TEXT
img         TEXT[]       -- Array de URLs de Cloudinary
sizes       VARCHAR(10)[] -- ['S', 'M', 'L', 'XL']
purchase_link TEXT       -- URL a Mercado Libre u otro
color       TEXT[]       -- Array de colores (ej: ['negro', 'blanco'])
video_url   TEXT         -- URL de video en Cloudinary (opcional)
created_at  TIMESTAMP
updated_at  TIMESTAMP    -- Actualizado automáticamente por trigger
```

---

## API Endpoints

### Auth (`/api/auth`)
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/login` | No | Login admin, devuelve cookie JWT |
| POST | `/logout` | Sí | Limpia cookie |
| GET | `/verify` | Sí | Verifica token activo |

### Productos (`/api/products`)
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/` | No | Todos los productos |
| GET | `/:id` | No | Producto por ID |
| POST | `/` | Sí | Crear producto |
| PUT | `/:id` | Sí | Actualizar (limpia imágenes/video eliminados de Cloudinary) |
| DELETE | `/:id` | Sí | Eliminar (limpia todos los assets de Cloudinary) |

### Banners (`/api/banners`)
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/active` | No | Banner activo según fechas |
| GET | `/all` | Sí | Todos los banners |
| POST | `/upload-media` | Sí | Subir imagen/video a Cloudinary |
| POST | `/` | Sí | Crear banner |
| PUT | `/:id` | Sí | Actualizar |
| DELETE | `/:id` | Sí | Eliminar + cleanup Cloudinary |

### Push Notifications (`/api/push`)
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/vapid-public-key` | No | Clave pública VAPID |
| POST | `/subscribe` | No | Registrar suscripción |
| POST | `/unsubscribe` | No | Cancelar suscripción |
| GET | `/stats` | Sí | Estadísticas de suscriptores |
| POST | `/send` | Sí | Enviar notificación masiva |
| GET | `/history` | Sí | Historial de notificaciones |
| POST | `/upload-image` | Sí | Subir imagen para notificación |

### Settings (`/api/settings`)
- `GET/POST /launch-date` — Fecha de lanzamiento de colección
- `GET/PUT /collection` — Nombre de colección actual

### Otros
- `GET /sitemap.xml` — Sitemap dinámico generado desde productos
- `GET /share/:slug` — SSR con Open Graph tags para compartir productos en redes

---

## Sistema de Rutas (Frontend)

El frontend usa **BrowserRouter**. Las rutas principales son:

| Ruta | Componente | Descripción |
|---|---|---|
| `/` | `App.jsx` | Home con todos los componentes |
| `/producto/:slug` | `App.jsx` | Home con ProductModal abierto |
| `/share/:slug` | Manejado por server | SSR Open Graph → redirige a `/producto/:slug` |
| `/admin` | `AdminPanel.jsx` | Panel de administración (protegido) |
| `/login` | `Login.jsx` | Login del admin |
| `/retailers` | `Retailers.jsx` | Vista de distribuidores |

El slug del producto se genera desde el título: minúsculas, sin caracteres especiales, espacios reemplazados por guiones.

> **Nota:** Se mantiene compatibilidad con el formato antiguo de HashRouter (`#/producto/slug`), que redirige automáticamente al formato nuevo.

---

## Autenticación

- **JWT en cookie httpOnly** (`authToken`), con `sameSite: 'strict'` y `secure` en producción
- Expiración: 24 horas
- Protegido por rate limiter: 5 intentos por 15 minutos en `/api/auth/login`
- El middleware `authenticateAdmin` verifica la cookie en todas las rutas protegidas

---

## Cloudinary — Organización de Assets

| Carpeta | Contenido | Límite |
|---|---|---|
| *(raíz del producto)* | Imágenes de productos | Máx. 5 por producto |
| `push-images/` | Imágenes para notificaciones push | 2MB, transformadas a 1200×630 |
| `banners/` | Imágenes y videos de banners | 10MB |
| `ai-videos/` | Videos generados con IA (Replicate) | 50MB |

Cuando se elimina o actualiza un producto, el servidor **limpia automáticamente** los assets huérfanos de Cloudinary.

---

## PWA (Progressive Web App)

- Estrategia: `injectManifest` (service worker custom en `src/sw.js`)
- Se registra automáticamente (`registerType: 'autoUpdate'`)
- Precaching de JS, CSS, HTML, imágenes, SVG y fuentes TTF
- Nombre: **NOMAD® Wear - Streetwear Argentina**
- Tema: `#1b1b1b` (negro)
- Display: `standalone`
- Incluye lógica de `InstallPrompt` y `PWAInstallButton` para iOS y Android

---

## Variables de Entorno

### Server (`.env`)
```env
# Base de datos
POSTGRES_URL=
DATABASE_URL=

# JWT
JWT_SECRET=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Web Push
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_EMAIL=mailto:info@nomadwear.com

# Admin por defecto
DEFAULT_ADMIN_PASSWORD=

# CORS
FRONTEND_URL=https://tu-dominio.com

# Entorno
NODE_ENV=production
```

### Client (`.env`)
```env
VITE_API_URL=   # Vacío en producción (mismo origen)
```

Para generar nuevas claves VAPID:
```bash
node server/scripts/generate-vapid-keys.js
```

---

## Desarrollo Local

```bash
# Instalar dependencias
cd client && npm install
cd server && npm install

# Iniciar servidor (puerto 3001)
cd server && npm run dev

# Iniciar cliente (puerto 5173, proxy → 3001)
cd client && npm run dev
```

El `vite.config.js` tiene configurado el proxy: `/api` → `http://localhost:3001`

---

## Panel de Administración

Acceso en `/admin` (requiere login previo en `/login`).

**Funcionalidades:**
- CRUD completo de productos (imágenes múltiples, video opcional, talles, colores, temporada/año, link de compra)
- Gestión de banners publicitarios con fecha de inicio/fin
- Envío de notificaciones push masivas (con imagen opcional)
- Historial de notificaciones enviadas
- Configuración de nombre de colección y fecha de lanzamiento
- Generación de videos con IA (Replicate)

**Configuración de productos:**
- Temporadas disponibles: `summer`, `autumn`, `winter`, `spring`
- Años: 2026–2050
- Talles: `S`, `M`, `L`, `XL`
- Colores: negro, blanco, gris, beige, rojo, azul
- Máximo 5 imágenes por producto

---

## Notas Importantes

- El servidor se exporta como módulo (`module.exports = app`) para funcionar como serverless function en Vercel
- El servidor solo levanta `app.listen()` cuando `NODE_ENV !== 'production'`
- La tabla `settings` usa una estructura clave-valor; los valores actuales son `current_collection` y `launch_date`
- El SSR de `/share/:slug` inyecta meta tags Open Graph en el HTML estático del build para compartir en redes sociales con preview de imagen y descripción del producto
