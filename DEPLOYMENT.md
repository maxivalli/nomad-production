# 🚀 Guía de Despliegue - Nomad Wear

Esta guía te llevará paso a paso para desplegar tu aplicación Nomad Wear mejorada en producción.

---

## 📋 Antes de Comenzar

### Checklist Pre-Despliegue

- [ ] Tienes una cuenta en Vercel (https://vercel.com)
- [ ] Tienes una base de datos PostgreSQL lista (Vercel Postgres, Supabase, Railway, etc.)
- [ ] Tienes una cuenta de Cloudinary configurada
- [ ] Has probado la aplicación localmente
- [ ] Has ejecutado el script de migración de base de datos

---

## 🗄️ Paso 1: Configurar Base de Datos

### Opción A: Vercel Postgres (Recomendado)

1. Ve a tu dashboard de Vercel
2. Selecciona tu proyecto o crea uno nuevo
3. Ve a la pestaña **Storage**
4. Click en **Create Database** → **Postgres**
5. Sigue las instrucciones
6. Copia la **POSTGRES_URL** que te proporcionen

### Opción B: Supabase (Gratis y fácil)

1. Ve a https://supabase.com
2. Crea un nuevo proyecto
3. Ve a **Settings** → **Database**
4. Copia la **Connection String** (URI)
5. Reemplaza `[YOUR-PASSWORD]` con tu contraseña

### Opción C: Railway

1. Ve a https://railway.app
2. Crea un nuevo proyecto
3. Agrega PostgreSQL
4. Copia la **DATABASE_URL**

---

## 🔐 Paso 2: Preparar Variables de Entorno

### Generar JWT Secret

Ejecuta este comando en tu terminal:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copia el resultado, lo necesitarás para `JWT_SECRET`.

### Lista de Variables Necesarias

Prepara estas variables en un documento temporal:

```env
# Base de datos
POSTGRES_URL=postgresql://user:pass@host:5432/db

# Seguridad
JWT_SECRET=tu-secreto-aleatorio-generado-arriba
DEFAULT_ADMIN_PASSWORD=tu-password-super-segura

# Aplicación
NODE_ENV=production
FRONTEND_URL=https://tu-app.vercel.app

# Cloudinary
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret
CLOUDINARY_UPLOAD_PRESET=tu-preset

# Frontend
VITE_API_URL=https://tu-app.vercel.app
```

**⚠️ IMPORTANTE:** 
- Usa una contraseña fuerte para `DEFAULT_ADMIN_PASSWORD`
- El `JWT_SECRET` debe ser largo y aleatorio
- `FRONTEND_URL` y `VITE_API_URL` deben apuntar a tu dominio de Vercel

---

## 📦 Paso 3: Subir Código a GitHub

Si aún no has subido tu código:

```bash
# Inicializar git (si no lo has hecho)
git init

# Agregar archivos
git add .

# Commit
git commit -m "Versión mejorada de Nomad Wear"

# Crear repositorio en GitHub y conectar
git remote add origin https://github.com/tu-usuario/nomad-wear.git

# Subir
git push -u origin main
```

---

## 🌐 Paso 4: Desplegar en Vercel

### Método A: Desde la Web (Más Fácil)

1. Ve a https://vercel.com
2. Click en **Add New** → **Project**
3. Importa tu repositorio de GitHub
4. Vercel detectará automáticamente que es un proyecto monorepo

5. **Configuración del Proyecto:**
   - Framework Preset: `Other`
   - Root Directory: `./`
   - Build Command: `cd client && npm install && npm run build`
   - Output Directory: `client/dist`

6. Click en **Environment Variables**
7. Agrega TODAS las variables del Paso 2:
   - Click en **Add Another**
   - Pega cada variable (ejemplo: `JWT_SECRET` = `tu-valor`)
   - Repite para todas

8. Click en **Deploy**

### Método B: Desde la CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Desde la raíz del proyecto
vercel

# Sigue las instrucciones interactivas
# Cuando pregunte por variables de entorno, configúralas una por una
```

---

## 🔄 Paso 5: Ejecutar Migración de Base de Datos

### Opción A: Localmente (Recomendado)

1. Crea un archivo `.env` en la carpeta `server/` con tus variables de producción:

```env
POSTGRES_URL=tu-url-de-produccion
```

2. Ejecuta el script de migración:

```bash
cd server
npm install
node scripts/migrate.js
```

3. Sigue las instrucciones e ingresa la contraseña para el admin

### Opción B: Desde Vercel (Avanzado)

1. Ve a tu proyecto en Vercel
2. Pestaña **Settings** → **Functions**
3. Crea una función serverless temporal para ejecutar la migración

---

## ✅ Paso 6: Verificar Despliegue

### Checklist de Verificación

1. **Visita tu sitio:**
   - Abre `https://tu-proyecto.vercel.app`
   - Verifica que el home cargue correctamente

2. **Prueba el Login:**
   - Ve a `https://tu-proyecto.vercel.app/#/login`
   - Ingresa usuario: `admin`
   - Ingresa la contraseña que configuraste
   - Debe redirigirte al panel de administración

3. **Prueba crear un producto:**
   - Sube una imagen
   - Completa los campos
   - Click en crear
   - Debe aparecer un toast verde de éxito

4. **Verifica la galería:**
   - Regresa al home
   - El producto debe aparecer en la galería

### Si algo no funciona:

1. **Revisa los logs:**
   - Ve a Vercel → Tu Proyecto → **Functions**
   - Click en una función → **Logs**
   - Busca errores

2. **Verifica las variables:**
   - Ve a Settings → Environment Variables
   - Asegúrate de que todas estén configuradas
   - Sin espacios extra, sin comillas

3. **Revisa CORS:**
   - Asegúrate de que `FRONTEND_URL` sea exactamente tu dominio de Vercel
   - Incluye `https://`

---

## 🔒 Paso 7: Seguridad Post-Despliegue

### Acciones Inmediatas

1. **Cambia la contraseña del admin:**
   - Haz login
   - (Implementa una página de cambio de contraseña, o hazlo directamente en la DB)

2. **Revisa las variables de entorno:**
   - Asegúrate de que no haya secretos expuestos en el código

3. **Configura un dominio personalizado (Opcional):**
   - Ve a Vercel → Settings → Domains
   - Agrega tu dominio
   - Actualiza `FRONTEND_URL` y `VITE_API_URL`

4. **Habilita 2FA en Vercel:**
   - Para proteger tu cuenta

---

## 📊 Paso 8: Monitoreo

### Configurar Alertas

1. Ve a Vercel → Settings → **Notifications**
2. Habilita alertas para:
   - Errores de despliegue
   - Fallos de función
   - Límites de uso

### Revisar Métricas

1. Ve a Analytics en Vercel
2. Monitorea:
   - Tiempo de respuesta
   - Errores
   - Tráfico

---

## 🔄 Actualizaciones Futuras

### Desplegar Cambios

```bash
# Hacer cambios en tu código
git add .
git commit -m "Descripción de los cambios"
git push

# Vercel desplegará automáticamente
```

### Rollback (Volver a Versión Anterior)

1. Ve a Vercel → Deployments
2. Encuentra el deployment anterior que funcionaba
3. Click en los tres puntos → **Promote to Production**

---

## 🆘 Problemas Comunes

### Error: "Unable to connect to database"

**Solución:**
```
1. Verifica que POSTGRES_URL esté correcta
2. Asegúrate de que la DB esté activa
3. Revisa los permisos del usuario
4. Si usas Vercel Postgres, verifica que esté en el mismo proyecto
```

### Error: "CORS Policy"

**Solución:**
```
1. Verifica que FRONTEND_URL apunte a tu dominio exacto
2. Incluye https://
3. Sin barra al final
4. Redeploy después de cambiar
```

### Error: "JWT Secret Not Found"

**Solución:**
```
1. Ve a Settings → Environment Variables
2. Asegúrate de que JWT_SECRET esté configurado
3. Redeploy
```

### Error: "Cannot read properties of undefined"

**Solución:**
```
1. Revisa los logs en Vercel
2. Probablemente falta una variable de entorno
3. Verifica que todas las variables del Paso 2 estén configuradas
```

---

## 📚 Recursos Adicionales

- [Documentación de Vercel](https://vercel.com/docs)
- [Vercel Postgres Docs](https://vercel.com/docs/storage/vercel-postgres)
- [Supabase Docs](https://supabase.com/docs)
- [Cloudinary Docs](https://cloudinary.com/documentation)

---

## ✨ ¡Listo!

Tu aplicación Nomad Wear está ahora en producción con:

✅ Autenticación segura  
✅ APIs protegidas  
✅ Base de datos configurada  
✅ Imágenes en Cloudinary  
✅ Headers de seguridad  
✅ Rate limiting  

**¡Felicitaciones! 🎉**

---

## 💡 Próximos Pasos Recomendados

1. Configurar un dominio personalizado
2. Implementar analytics (Google Analytics, Plausible)
3. Agregar error tracking (Sentry)
4. Configurar backups automáticos de la base de datos
5. Implementar tests automatizados
6. Agregar más funcionalidades al panel de admin

---

**¿Necesitas ayuda?** Abre un issue en GitHub o contacta al equipo de soporte.
