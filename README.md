# 🚀 Nomad Wear - E-commerce Platform (VERSIÓN MEJORADA)

Plataforma de e-commerce de moda con panel de administración, completamente renovada con mejoras de seguridad, rendimiento y UX.

## 📋 Tabla de Contenidos

- [Cambios Principales](#-cambios-principales)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Desarrollo](#-desarrollo)
- [Despliegue](#-despliegue)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Seguridad](#-seguridad)

---

## 🎉 Cambios Principales

### 🔒 Seguridad
- ✅ **Autenticación JWT real** con cookies HTTP-only
- ✅ **APIs protegidas** con middleware de autenticación
- ✅ **Rate limiting** para prevenir ataques
- ✅ **Validación de datos** con Joi
- ✅ **Headers de seguridad** con Helmet
- ✅ **Cloudinary config** desde el servidor (no expuesta)

### 🐛 Correcciones
- ✅ **Manejo de errores** visible en UI
- ✅ **Sistema de toast/notificaciones** profesional
- ✅ **Custom hooks** reutilizables
- ✅ **Servicio de API** centralizado
- ✅ **Estados de carga** en todas las operaciones

### ⚡ Rendimiento
- ✅ **Pool de PostgreSQL** optimizado
- ✅ **Manejo de errores** en conexiones DB
- ✅ Preparado para **optimización de imágenes**

---

## 📦 Requisitos Previos

- **Node.js** >= 18.0.0
- **PostgreSQL** >= 12
- **npm** o **yarn**
- Cuenta de **Cloudinary** (para imágenes)
- Cuenta de **Vercel** (recomendado para deployment)

---

## 🔧 Instalación

### 1. Clonar el repositorio

```bash
git clone <tu-repositorio>
cd nomad-wear-improved
```

### 2. Instalar dependencias del servidor

```bash
cd server
npm install
```

### 3. Instalar dependencias del cliente

```bash
cd ../client
npm install
```

---

## ⚙️ Configuración

### Backend (Server)

1. Copia el archivo de ejemplo:
```bash
cd server
cp .env.example .env
```

2. Edita `.env` con tus valores:

```env
# Base de datos
POSTGRES_URL=postgresql://usuario:password@host:5432/nomad_wear

# JWT Secret (genera uno aleatorio)
JWT_SECRET=tu-secreto-super-seguro-aleatorio

# Contraseña del admin por defecto
DEFAULT_ADMIN_PASSWORD=tu-password-segura

# Servidor
PORT=3001
NODE_ENV=development

# Frontend URL (para CORS)
FRONTEND_URL=http://localhost:5173

# Cloudinary
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret
CLOUDINARY_UPLOAD_PRESET=tu-preset
```

**⚠️ IMPORTANTE:** 
- Cambia `JWT_SECRET` por algo aleatorio y largo (puedes generarlo con: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)
- Cambia `DEFAULT_ADMIN_PASSWORD` por una contraseña fuerte

### Frontend (Client)

1. Copia el archivo de ejemplo:
```bash
cd client
cp .env.example .env
```

2. Edita `.env`:

```env
VITE_API_URL=http://localhost:3001
```

---

## 💻 Desarrollo

### Iniciar el servidor

```bash
cd server
npm run dev
```

El servidor se iniciará en `http://localhost:3001`

### Iniciar el cliente

En otra terminal:

```bash
cd client
npm run dev
```

El cliente se iniciará en `http://localhost:5173`

### Credenciales por defecto

- **Usuario:** `admin`
- **Contraseña:** La que configuraste en `DEFAULT_ADMIN_PASSWORD`

**⚠️ Cambia estas credenciales inmediatamente en producción**

---

## 🚀 Despliegue

### Opción 1: Vercel (Recomendado)

1. **Preparar la base de datos:**
   - Crea una base de datos PostgreSQL en [Vercel Postgres](https://vercel.com/storage/postgres), [Supabase](https://supabase.com), o [Railway](https://railway.app)

2. **Desplegar en Vercel:**

```bash
# Instalar Vercel CLI
npm install -g vercel

# Desde la raíz del proyecto
vercel
```

3. **Configurar variables de entorno en Vercel:**

Ve a tu proyecto en Vercel → Settings → Environment Variables y agrega:

**Backend:**
```
POSTGRES_URL=tu-conexion-postgres
JWT_SECRET=tu-secreto-jwt
DEFAULT_ADMIN_PASSWORD=tu-password
NODE_ENV=production
FRONTEND_URL=https://tu-dominio.vercel.app
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_UPLOAD_PRESET=...
```

**Frontend:**
```
VITE_API_URL=https://tu-dominio.vercel.app
```

4. **Redeploy:**
```bash
vercel --prod
```

### Opción 2: Otros servicios

- **Backend:** Puedes desplegar en Railway, Render, o cualquier servicio que soporte Node.js
- **Frontend:** Netlify, Cloudflare Pages, o GitHub Pages
- **Base de datos:** Supabase, PlanetScale, o cualquier PostgreSQL

---

## 📁 Estructura del Proyecto

```
nomad-wear-improved/
├── client/                          # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/             # Componentes reutilizables
│   │   │   └── Toast.jsx           # Sistema de notificaciones
│   │   ├── hooks/                  # Custom hooks
│   │   │   └── useProducts.js      # Hook para gestión de productos
│   │   ├── services/               # Servicios de API
│   │   │   └── api.js              # Cliente de API centralizado
│   │   ├── App.jsx                 # Componente principal
│   │   ├── Login.jsx               # Página de login
│   │   ├── AdminPanel.jsx          # Panel de administración
│   │   └── ...                     # Otros componentes
│   ├── .env.example
│   └── package.json
│
├── server/                          # Backend (Express + PostgreSQL)
│   ├── index.js                    # Servidor principal con JWT
│   ├── .env.example
│   └── package.json
│
├── ADMIN_PANEL_UPDATES.js          # Guía de actualización del AdminPanel
├── vercel.json                     # Configuración de Vercel
└── README.md                       # Este archivo
```

---

## 🔒 Seguridad

### Implementaciones de Seguridad

1. **Autenticación JWT:**
   - Tokens firmados con secreto fuerte
   - Cookies HTTP-only (no accesibles desde JavaScript)
   - Expiración de 24 horas
   - SameSite strict

2. **Protección de APIs:**
   - Middleware de autenticación en todas las rutas sensibles
   - Rate limiting (100 req/15min general, 5 req/15min en login)
   - Validación de datos con Joi

3. **Headers de Seguridad:**
   - Helmet configurado
   - CORS restrictivo
   - Content Security Policy

4. **Base de Datos:**
   - Consultas parametrizadas (previene SQL injection)
   - Pool de conexiones con límites
   - Passwords hasheados con bcrypt (12 rounds)

### Mejores Prácticas

- ✅ **Nunca** expongas secretos en el código del cliente
- ✅ **Siempre** usa HTTPS en producción
- ✅ **Cambia** las credenciales por defecto
- ✅ **Mantén** las dependencias actualizadas
- ✅ **Revisa** los logs regularmente

---

## 🔄 Actualización desde la Versión Anterior

Si tienes la versión anterior de Nomad Wear y quieres migrar:

### 1. Migración de Base de Datos

La nueva versión es compatible con la estructura anterior. Las nuevas tablas se crean automáticamente:
- `admins` (nueva tabla para autenticación)
- Campos `created_at` y `updated_at` (se agregan automáticamente)

### 2. Cambiar el Sistema de Autenticación

**Antes:**
```javascript
// Login basado en localStorage
localStorage.setItem('adminAuth', 'true');
```

**Ahora:**
```javascript
// Login con JWT en cookies HTTP-only
await api.login(username, password);
```

### 3. Actualizar las Llamadas a la API

**Antes:**
```javascript
const response = await fetch('/api/products');
```

**Ahora:**
```javascript
import api from './services/api';
const products = await api.getProducts();
```

---

## 🐛 Solución de Problemas

### Error: "CORS Policy"
- Verifica que `FRONTEND_URL` en el servidor apunte a tu dominio del frontend
- En desarrollo: `http://localhost:5173`
- En producción: `https://tu-dominio.com`

### Error: "JWT Secret Not Found"
- Asegúrate de tener `JWT_SECRET` en tu archivo `.env` del servidor
- Genera uno con: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

### Error: "Cannot Connect to Database"
- Verifica tu `POSTGRES_URL`
- Asegúrate de que la base de datos esté corriendo
- Revisa los permisos del usuario de la base de datos

### Error: "Unauthorized" al hacer requests
- El token JWT puede haber expirado (válido por 24h)
- Intenta hacer logout y volver a loguearte

---

## 📚 Recursos Adicionales

- [Documentación de Express](https://expressjs.com/)
- [Documentación de React](https://react.dev/)
- [Documentación de Vite](https://vitejs.dev/)
- [Documentación de PostgreSQL](https://www.postgresql.org/docs/)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)

---

## 👥 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📝 Licencia

ISC

---

## 💬 Soporte

Si encuentras problemas o tienes preguntas:

1. Revisa la sección de [Solución de Problemas](#-solución-de-problemas)
2. Abre un issue en GitHub
3. Contacta al equipo de desarrollo

---

**¡Gracias por usar Nomad Wear! 🎉**
