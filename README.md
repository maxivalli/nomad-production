# 🌐 Nomad Wear - E-commerce Fashion Platform

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.0-red.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)
![License](https://img.shields.io/badge/license-ISC-blue.svg)

**Plataforma de e-commerce de moda minimalista con panel de administración completo, sistema de notificaciones push y gestión de banners publicitarios.**

[Demo](#) • [Documentación](#) • [Reportar Bug](https://github.com/tu-repo/issues) • [Solicitar Feature](https://github.com/tu-repo/issues)

</div>

---

## 📑 Tabla de Contenidos

- [Descripción General](#-descripción-general)
- [Características Principales](#-características-principales)
- [Stack Tecnológico](#-stack-tecnológico)
- [Arquitectura](#-arquitectura)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Desarrollo](#-desarrollo)
- [Producción](#-producción)
- [API Reference](#-api-reference)
- [Seguridad](#-seguridad)
- [Performance](#-performance)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Contribuir](#-contribuir)

---

## 🎯 Descripción General

Nomad Wear es una plataforma e-commerce completa diseñada para marcas de moda que buscan una presencia digital moderna y minimalista. El proyecto combina un frontend altamente visual con un backend robusto y seguro, ofreciendo:

- **Landing page interactiva** con video hero, countdown timer dinámico y galería de productos
- **Panel de administración** completo para gestión de productos, colecciones y configuración
- **Sistema de notificaciones push** con soporte de imágenes
- **Gestión de banners publicitarios** con imágenes y videos
- **Progressive Web App (PWA)** con capacidad de instalación
- **Integración con Mercado Libre** para expansión de ventas
- **Sistema de compartir productos** con deep linking

### 🎨 Filosofía de Diseño

El proyecto sigue una estética **técnica/cyberpunk** minimalista, con:
- Tipografía monoespaciada y fuente personalizada "Hyperwave"
- Paleta de colores negro/blanco/rojo (#dc2626)
- Animaciones sutiles con Framer Motion
- UI estilo "terminal" en algunos componentes

---

## ✨ Características Principales

### 🛍️ Frontend (Cliente)

#### 1. **Landing Page Dinámica**
- Video hero con loading state elegante
- Countdown timer configurable desde el admin
- Nombre de colección dinámico
- Secciones: Hero, Gallery, Manifest, Packing, Studio, Stockists, Contact

#### 2. **Galería de Productos**
- Grid responsive con hover effects
- Modal de detalle con múltiples imágenes
- Información de tallas, colores y precio
- Links de compra a Mercado Libre
- Sistema de compartir por URL

#### 3. **PWA Features**
- Instalable en dispositivos móviles y desktop
- Service Worker para caching
- Manifest.json configurado
- Prompt de instalación personalizado
- Iconos optimizados para múltiples plataformas

#### 4. **Push Notifications**
- Suscripción automática o manual
- Notificaciones con imágenes
- Historial de notificaciones en admin
- Estadísticas de suscriptores

#### 5. **Banners Publicitarios**
- Modales emergentes con imágenes o videos
- Control de frecuencia de aparición
- Gestión desde el panel admin
- Soporte para múltiples banners

### 🔐 Backend (Servidor)

#### 1. **Sistema de Autenticación**
- JWT con cookies HTTP-only
- Bcrypt para hashing de contraseñas (12 rounds)
- Middleware de autenticación en todas las rutas protegidas
- Rate limiting: 5 intentos de login cada 15 min
- Endpoints: `/api/auth/login`, `/api/auth/logout`, `/api/auth/verify`

#### 2. **Gestión de Productos**
- CRUD completo (Create, Read, Update, Delete)
- Múltiples imágenes por producto
- Tallas, colores y pricing
- Organización por temporada (season/year)
- Validación con Joi schemas

#### 3. **Configuración Dinámica**
- Launch date configurable
- Nombre de colección personalizable
- Almacenamiento en PostgreSQL

#### 4. **Cloudinary Integration**
- Upload de imágenes de productos
- Upload de imágenes para push notifications
- Upload de media para banners (imágenes/videos)
- Transformaciones automáticas
- Gestión segura desde el servidor

#### 5. **Push Notifications**
- Web Push con VAPID keys
- Almacenamiento de suscripciones
- Envío masivo de notificaciones
- Historial y estadísticas

#### 6. **Seguridad**
- Helmet para headers de seguridad
- CORS configurado
- Rate limiting general: 100 req/15min
- Validación de datos en todas las entradas
- Protección contra SQL injection (consultas parametrizadas)

---

## 🛠️ Stack Tecnológico

### Frontend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **React** | 19.2.0 | Framework UI |
| **Vite** | 7.2.4 | Build tool & dev server |
| **React Router** | 7.13.0 | Navegación |
| **Framer Motion** | 12.29.0 | Animaciones |
| **Tailwind CSS** | 4.1.18 | Estilos |
| **Lucide React** | 0.563.0 | Iconos |
| **Workbox** | 7.4.0 | Service Worker/PWA |

### Backend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Node.js** | ≥18.0.0 | Runtime |
| **Express** | 5.2.1 | Framework web |
| **PostgreSQL** | ≥12 | Base de datos |
| **JWT** | 9.0.2 | Autenticación |
| **Bcrypt** | 5.1.1 | Hashing passwords |
| **Joi** | 17.13.3 | Validación de datos |
| **Helmet** | 8.0.0 | Headers de seguridad |
| **Cloudinary** | 1.41.3 | Gestión de imágenes |
| **Web Push** | 3.6.7 | Notificaciones |

### Infraestructura
- **Hosting**: Vercel (recomendado)
- **Database**: Vercel Postgres / Supabase / Railway
- **Storage**: Cloudinary

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTE (React)                        │
├─────────────────────────────────────────────────────────────┤
│  Landing Page  │  Admin Panel  │  Login  │  Retailers       │
│  (App.jsx)     │  (AdminPanel) │         │                  │
└────────┬────────────────────────────────────────────────────┘
         │
         │ HTTP/HTTPS (API Calls via services/api.js)
         │ Credentials: include (para cookies JWT)
         │
┌────────▼────────────────────────────────────────────────────┐
│                    SERVIDOR (Express)                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐  ┌──────────────────┐                 │
│  │  Middleware     │  │  Rate Limiting   │                 │
│  │  - Helmet       │  │  - 100/15min API │                 │
│  │  - CORS         │  │  - 5/15min Login │                 │
│  │  - JWT Auth     │  └──────────────────┘                 │
│  └─────────────────┘                                        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                API Endpoints                          │  │
│  │  /api/auth/*      - Login, Logout, Verify            │  │
│  │  /api/products/*  - CRUD Productos                    │  │
│  │  /api/settings/*  - Launch date, Collection           │  │
│  │  /api/cloudinary  - Signature segura                  │  │
│  │  /api/push/*      - Notificaciones, Stats            │  │
│  │  /api/banners/*   - Gestión banners                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└────────┬────────────────────────────────────┬───────────────┘
         │                                    │
         │                                    │
┌────────▼────────────┐              ┌───────▼────────────┐
│   PostgreSQL DB     │              │    Cloudinary      │
│   - productos       │              │    - Imágenes      │
│   - admins          │              │    - Videos        │
│   - settings        │              │    - Transformac.  │
│   - push_subs       │              └────────────────────┘
│   - notifications   │
│   - banners         │
└─────────────────────┘
```

### Flujo de Autenticación

```
1. Usuario → POST /api/auth/login (username, password)
2. Servidor valida con bcrypt
3. Servidor genera JWT (expiración 24h)
4. Servidor envía cookie HTTP-only con JWT
5. Cliente hace requests con credentials: 'include'
6. Middleware verifica JWT en cada request protegido
```

---

## 📦 Instalación

### Requisitos Previos

- Node.js ≥ 18.0.0
- PostgreSQL ≥ 12
- npm o yarn
- Cuenta de Cloudinary
- (Opcional) Cuenta de Vercel para deployment

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/nomad-wear.git
cd nomad-wear
```

### 2. Instalar Dependencias

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd ../client
npm install
```

### 3. Crear Base de Datos

```sql
CREATE DATABASE nomad_wear;
```

Las tablas se crearán automáticamente al ejecutar el servidor por primera vez.

---

## ⚙️ Configuración

### Variables de Entorno - Backend

Crea un archivo `.env` en la carpeta `server/`:

```env
# ============================================
# BASE DE DATOS
# ============================================
POSTGRES_URL=postgresql://usuario:password@localhost:5432/nomad_wear

# ============================================
# AUTENTICACIÓN
# ============================================
# IMPORTANTE: Genera un secreto aleatorio fuerte
# Puedes usar: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=tu-secreto-super-seguro-de-64-caracteres-o-mas

# Contraseña del admin por defecto (usuario: admin)
DEFAULT_ADMIN_PASSWORD=cambiar-por-password-segura

# ============================================
# SERVIDOR
# ============================================
PORT=3001
NODE_ENV=development

# URL del frontend para CORS
FRONTEND_URL=http://localhost:5173

# ============================================
# CLOUDINARY
# ============================================
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret
CLOUDINARY_UPLOAD_PRESET=tu-preset

# ============================================
# WEB PUSH (Opcional)
# ============================================
# Genera con: node server/scripts/generate-vapid-keys.js
VAPID_PUBLIC_KEY=tu-vapid-public-key
VAPID_PRIVATE_KEY=tu-vapid-private-key
VAPID_SUBJECT=mailto:tu-email@ejemplo.com
```

### Variables de Entorno - Frontend

Crea un archivo `.env` en la carpeta `client/`:

```env
# URL del backend
VITE_API_URL=http://localhost:3001
```

### Configurar Cloudinary

1. Crea una cuenta en [Cloudinary](https://cloudinary.com)
2. Ve a Settings → Upload
3. Crea un Upload Preset:
   - Preset name: `nomad_presets` (o el que prefieras)
   - Signing mode: **Unsigned**
4. Copia los valores a tu `.env`

### Generar VAPID Keys (Push Notifications)

```bash
cd server
node scripts/generate-vapid-keys.js
```

Copia las claves generadas a tu `.env`.

---

## 💻 Desarrollo

### Iniciar el Servidor

```bash
cd server
npm run dev
```

El servidor estará disponible en `http://localhost:3001`

### Iniciar el Cliente

En otra terminal:

```bash
cd client
npm run dev
```

El cliente estará disponible en `http://localhost:5173`

### Credenciales Iniciales

- **Usuario**: `admin`
- **Contraseña**: La que configuraste en `DEFAULT_ADMIN_PASSWORD`

**⚠️ IMPORTANTE**: Cambia la contraseña inmediatamente en producción.

### Scripts Disponibles

**Backend:**
```bash
npm start          # Producción
npm run dev        # Desarrollo con nodemon
```

**Frontend:**
```bash
npm run dev        # Desarrollo
npm run build      # Build para producción
npm run preview    # Preview del build
npm run lint       # Linter
```

---

## 🚀 Producción

### Despliegue en Vercel (Recomendado)

#### 1. Preparar Base de Datos

Crea una base de datos PostgreSQL:
- [Vercel Postgres](https://vercel.com/storage/postgres)
- [Supabase](https://supabase.com)
- [Railway](https://railway.app)

#### 2. Desplegar con Vercel CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Desde la raíz del proyecto
vercel

# Seguir las instrucciones
```

#### 3. Configurar Variables de Entorno

Ve a tu proyecto en Vercel → Settings → Environment Variables

**Variables del Backend:**
```
POSTGRES_URL=postgresql://...
JWT_SECRET=tu-secreto-largo-y-aleatorio
DEFAULT_ADMIN_PASSWORD=password-segura
NODE_ENV=production
FRONTEND_URL=https://tu-dominio.vercel.app
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_UPLOAD_PRESET=...
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:...
```

**Variables del Frontend:**
```
VITE_API_URL=https://tu-dominio.vercel.app
```

#### 4. Redeploy

```bash
vercel --prod
```

### Otras Opciones de Hosting

- **Backend**: Railway, Render, Heroku, DigitalOcean
- **Frontend**: Netlify, Cloudflare Pages, GitHub Pages
- **Database**: PlanetScale, ElephantSQL

---

## 📚 API Reference

### Autenticación

#### POST `/api/auth/login`
Login de administrador.

**Body:**
```json
{
  "username": "admin",
  "password": "tu-password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login exitoso",
  "admin": {
    "id": 1,
    "username": "admin"
  }
}
```

#### POST `/api/auth/logout`
Cerrar sesión.

**Response:**
```json
{
  "success": true,
  "message": "Logout exitoso"
}
```

#### GET `/api/auth/verify`
Verificar autenticación actual.

**Response:**
```json
{
  "authenticated": true,
  "admin": {
    "id": 1,
    "username": "admin"
  }
}
```

### Productos

#### GET `/api/products`
Obtener todos los productos.

**Response:**
```json
[
  {
    "id": 1,
    "season": "summer",
    "year": 2026,
    "title": "Nomad Tee",
    "description": "Camiseta básica",
    "img": ["url1.jpg", "url2.jpg"],
    "sizes": ["S", "M", "L"],
    "color": ["negro", "blanco"],
    "purchase_link": "https://mercadolibre.com/...",
    "created_at": "2026-01-01T00:00:00.000Z"
  }
]
```

#### POST `/api/products`
Crear producto (requiere autenticación).

**Body:**
```json
{
  "season": "summer",
  "year": 2026,
  "title": "Producto Nuevo",
  "description": "Descripción",
  "img": ["url1.jpg"],
  "sizes": ["M", "L"],
  "color": ["negro"],
  "purchase_link": "https://..."
}
```

#### PUT `/api/products/:id`
Actualizar producto (requiere autenticación).

#### DELETE `/api/products/:id`
Eliminar producto (requiere autenticación).

### Configuración

#### GET `/api/settings/launch-date`
Obtener fecha de lanzamiento.

#### POST `/api/settings/launch-date`
Actualizar fecha de lanzamiento (requiere autenticación).

**Body:**
```json
{
  "date": "2026-06-15"
}
```

#### GET `/api/settings/collection`
Obtener nombre de colección.

#### PUT `/api/settings/collection`
Actualizar nombre de colección (requiere autenticación).

**Body:**
```json
{
  "value": "Summer Collection 2026"
}
```

### Push Notifications

#### GET `/api/push/vapid-public-key`
Obtener clave pública VAPID.

#### POST `/api/push/subscribe`
Suscribir a notificaciones.

**Body:**
```json
{
  "endpoint": "https://...",
  "keys": {
    "p256dh": "...",
    "auth": "..."
  }
}
```

#### POST `/api/push/send`
Enviar notificación (requiere autenticación).

**Body:**
```json
{
  "title": "Nueva Colección",
  "body": "Descubre nuestra nueva línea",
  "url": "/",
  "image": "https://..."
}
```

#### GET `/api/push/history`
Obtener historial de notificaciones (requiere autenticación).

### Banners

#### GET `/api/banners/active`
Obtener banner activo.

#### GET `/api/banners/all`
Obtener todos los banners (requiere autenticación).

#### POST `/api/banners`
Crear banner (requiere autenticación).

#### PUT `/api/banners/:id`
Actualizar banner (requiere autenticación).

#### DELETE `/api/banners/:id`
Eliminar banner (requiere autenticación).

---

## 🔒 Seguridad

### Implementaciones

#### 1. Autenticación JWT
- Tokens firmados con secreto de 64+ caracteres
- Cookies HTTP-only (no accesibles desde JavaScript)
- Secure flag en producción (solo HTTPS)
- SameSite: Strict
- Expiración: 24 horas

#### 2. Passwords
- Bcrypt con 12 rounds de salt
- No se almacenan en texto plano
- Validación de fuerza al crear

#### 3. Rate Limiting
- API general: 100 requests / 15 minutos
- Login: 5 intentos / 15 minutos
- Por IP

#### 4. Validación de Datos
- Joi schemas en todos los endpoints
- Sanitización de inputs
- Type checking

#### 5. Headers de Seguridad (Helmet)
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Content-Security-Policy configurada

#### 6. Base de Datos
- Consultas parametrizadas (previene SQL injection)
- Pool de conexiones con límites
- Manejo de errores sin exponer detalles

#### 7. CORS
- Origen específico (no wildcard)
- Credentials permitidos
- Headers permitidos limitados

### Mejores Prácticas

✅ **Hacer**
- Cambiar `JWT_SECRET` y `DEFAULT_ADMIN_PASSWORD` inmediatamente
- Usar HTTPS en producción
- Mantener dependencias actualizadas
- Revisar logs regularmente
- Hacer backups de la base de datos
- Rotar VAPID keys periódicamente

❌ **No Hacer**
- Exponer secretos en el código del cliente
- Usar contraseñas débiles
- Compartir JWT_SECRET
- Commitear archivos `.env`
- Deshabilitar HTTPS en producción

---

## ⚡ Performance

### Optimizaciones Implementadas

#### Frontend
- **Code Splitting**: AdminPanel lazy loaded
- **Service Worker**: Caching de assets estáticos
- **Compresión de Imágenes**: Cloudinary transformaciones
- **Tailwind CSS**: Purge de CSS no usado
- **Framer Motion**: Animaciones con GPU acceleration

#### Backend
- **Connection Pooling**: PostgreSQL pool optimizado (max 20 conexiones)
- **Rate Limiting**: Previene sobrecarga
- **Consultas Optimizadas**: Índices en columnas frecuentes

### Métricas Objetivo

| Métrica | Objetivo |
|---------|----------|
| **First Contentful Paint (FCP)** | < 1.5s |
| **Time to Interactive (TTI)** | < 3.5s |
| **Lighthouse Performance** | > 90 |
| **Lighthouse Accessibility** | > 95 |
| **Lighthouse SEO** | > 90 |

### Futuras Optimizaciones

- [ ] Image lazy loading
- [ ] React.lazy para más componentes
- [ ] CDN para assets estáticos
- [ ] Redis para caching
- [ ] Database query optimization
- [ ] WebP images por defecto

---

## 📁 Estructura del Proyecto

```
nomad-wear/
├── client/                          # Frontend (React + Vite)
│   ├── public/                      # Assets estáticos
│   │   ├── icons/                   # PWA icons
│   │   ├── manifest.json            # PWA manifest
│   │   └── robots.txt               # SEO
│   ├── src/
│   │   ├── assets/                  # Imágenes locales
│   │   ├── components/              # Componentes reutilizables
│   │   │   ├── AdminBannersPanel.jsx
│   │   │   ├── BannerModal.jsx
│   │   │   ├── Contacto.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Gallery.jsx          # Galería de productos
│   │   │   ├── Hero.jsx             # Hero con video
│   │   │   ├── InstallPrompt.jsx    # PWA install
│   │   │   ├── IntroMarque.jsx
│   │   │   ├── Manifest.jsx
│   │   │   ├── MeliSection.jsx      # Mercado Libre
│   │   │   ├── Navbar.jsx
│   │   │   ├── Packing.jsx
│   │   │   ├── PackingModal.jsx
│   │   │   ├── PreLoader.jsx
│   │   │   ├── ProductModal.jsx     # Modal detalle producto
│   │   │   ├── PushNotificationPanel.jsx
│   │   │   ├── PushNotificationPrompt.jsx
│   │   │   ├── Stockists.jsx
│   │   │   ├── StudioMarque.jsx
│   │   │   ├── TheStudio.jsx
│   │   │   └── Toast.jsx            # Sistema de notificaciones
│   │   ├── hooks/                   # Custom hooks
│   │   │   ├── useProducts.js       # Hook para productos
│   │   │   └── usePushNotifications.js
│   │   ├── services/                # Servicios
│   │   │   └── api.js               # Cliente API centralizado
│   │   ├── views/                   # Páginas
│   │   │   ├── AdminPanel.jsx       # Panel administrador
│   │   │   ├── Login.jsx            # Login
│   │   │   └── Retailers.jsx        # Página retailers
│   │   ├── App.jsx                  # Componente principal
│   │   ├── main.jsx                 # Entry point + routing
│   │   ├── index.css                # Estilos globales
│   │   └── sw.js                    # Service Worker
│   ├── .env.example                 # Template variables de entorno
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                          # Backend (Express + PostgreSQL)
│   ├── scripts/                     # Scripts de utilidad
│   │   ├── generate-vapid-keys.js   # Generar VAPID keys
│   │   └── migrate.js               # Migración DB
│   ├── .env.example                 # Template variables de entorno
│   ├── index.js                     # Servidor principal
│   └── package.json
│
├── backup/                          # Archivos de respaldo
├── vercel.json                      # Configuración Vercel
├── CHANGES.md                       # Log de cambios
└── README.md                        # Este archivo
```

### Componentes Clave

#### Frontend

**`App.jsx`**
- Orquestador principal
- Maneja routing de landing page
- Gestión de modales globales

**`AdminPanel.jsx`**
- CRUD de productos
- Gestión de colección y launch date
- Panel de notificaciones push
- Panel de banners
- Logout

**`services/api.js`**
- Centraliza todas las llamadas API
- Manejo de errores automático
- Credentials incluidos para cookies

**`hooks/useProducts.js`**
- Estado global de productos
- Loading y error states
- Función refetch

**`components/Toast.jsx`**
- Sistema de notificaciones UI
- 4 tipos: success, error, info, warning
- Auto-dismiss configurable

#### Backend

**`server/index.js`**
- Configuración Express
- Middleware de seguridad (Helmet, CORS, Rate Limiting)
- Autenticación JWT
- API endpoints
- Conexión PostgreSQL pool

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas!

### Proceso

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

### Guidelines

- Seguir el estilo de código existente
- Escribir mensajes de commit descriptivos
- Actualizar documentación si es necesario
- Probar antes de hacer PR

---

## 🐛 Solución de Problemas

### Error: "CORS Policy"

**Problema**: El frontend no puede hacer requests al backend.

**Solución**:
- Verifica que `FRONTEND_URL` en el backend apunte a la URL correcta del frontend
- En desarrollo: `http://localhost:5173`
- En producción: `https://tu-dominio.vercel.app`

### Error: "JWT Secret Not Found"

**Problema**: El servidor no puede generar tokens JWT.

**Solución**:
```bash
# Genera un secreto seguro
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Copia el resultado a tu .env
JWT_SECRET=el-secreto-generado
```

### Error: "Cannot Connect to Database"

**Problema**: No se puede conectar a PostgreSQL.

**Solución**:
- Verifica que PostgreSQL esté corriendo
- Revisa la URL de conexión en `POSTGRES_URL`
- Verifica permisos del usuario de base de datos
- Prueba la conexión con `psql`:
```bash
psql "postgresql://usuario:password@host:5432/nomad_wear"
```

### Error: "Unauthorized" al hacer requests

**Problema**: El token JWT expiró o es inválido.

**Solución**:
- El token dura 24 horas, haz logout y vuelve a loguearte
- Verifica que las cookies estén habilitadas
- En desarrollo, verifica que ambos servicios estén en el mismo dominio

### Error: "Cloudinary Upload Failed"

**Problema**: No se pueden subir imágenes.

**Solución**:
- Verifica que `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET` sean correctos
- Verifica que el upload preset exista y sea "Unsigned"
- Revisa límites de tamaño (2MB para push, 10MB para banners)

---

## 📊 Roadmap

### Version 2.1 (Q2 2026)
- [ ] Multi-admin con roles
- [ ] Dashboard con analytics
- [ ] Integración con Google Analytics
- [ ] A/B testing de banners

### Version 2.2 (Q3 2026)
- [ ] Carrito de compras integrado
- [ ] Sistema de pagos (Stripe/MercadoPago)
- [ ] Wishlist de productos
- [ ] Reviews de clientes

### Version 3.0 (Q4 2026)
- [ ] Versión móvil nativa (React Native)
- [ ] Internacionalización (i18n)
- [ ] Programa de fidelidad
- [ ] Recomendaciones con AI

---

## 📄 Licencia

ISC License - ver [LICENSE](LICENSE) para más detalles.

---

## 👏 Créditos

- **Tipografía Hyperwave**: Font personalizada
- **Iconos**: Lucide React
- **Animaciones**: Framer Motion
- **Video Hero**: Cloudinary

---

## 💬 Soporte

Si encuentras problemas o tienes preguntas:

1. Revisa la sección [Solución de Problemas](#-solución-de-problemas)
2. Busca en [Issues existentes](https://github.com/tu-repo/issues)
3. Abre un [nuevo Issue](https://github.com/tu-repo/issues/new)
4. Contacta al equipo: contacto@nomadwear.com

---

## 📞 Contacto

- **Website**: [nomadwear.com](https://www.nomadwear.com.ar)
- **Email**: contacto@nomadwear.com
- **Instagram**: [@nomad.wear](https://instagram.com/nomadwearok)
- **GitHub**: [github.com/nomadwear](https://github.com/maxivalli/nomad-production)

---

<div align="center">

**Hecho con ❤️ para la comunidad de moda minimalista**

[⬆ Volver arriba](#-nomad-wear---e-commerce-fashion-platform)

</div>
