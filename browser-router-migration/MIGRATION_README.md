# Migración de Hash Router a Browser Router

Este documento explica la migración del proyecto de `HashRouter` a `BrowserRouter` en React Router.

## 📋 Tabla de Contenidos

- [¿Por qué migrar?](#por-qué-migrar)
- [Cambios realizados](#cambios-realizados)
- [Instalación](#instalación)
- [Uso del script](#uso-del-script)
- [Configuración del servidor](#configuración-del-servidor)
- [Solución de problemas](#solución-de-problemas)
- [Rollback](#rollback)

## 🎯 ¿Por qué migrar?

### Problema con HashRouter
- URLs con hash: `https://tudominio.com/#/producto/camisa`
- Menos amigables para SEO
- No funcionan bien con meta tags de redes sociales
- URLs poco profesionales

### Ventajas de BrowserRouter
- URLs limpias: `https://tudominio.com/producto/camisa`
- Mejor SEO
- Meta tags funcionan correctamente para compartir
- URLs más profesionales y compartibles

## 🔧 Cambios realizados

### 1. **main.jsx**
```jsx
// ANTES (HashRouter)
import { HashRouter } from "react-router-dom";

<HashRouter>
  <Routes>
    <Route path="/" element={<App />} />
    <Route path="/producto/:slug" element={<App />} />
  </Routes>
</HashRouter>

// DESPUÉS (BrowserRouter)
import { BrowserRouter } from "react-router-dom";

<BrowserRouter>
  <Routes>
    <Route path="/" element={<App />} />
    <Route path="/producto/:slug" element={<App />} />
    <Route path="/share/:slug" element={<App />} />
  </Routes>
</BrowserRouter>
```

**Cambios clave:**
- Reemplazado `HashRouter` por `BrowserRouter`
- Agregada ruta `/share/:slug` para enlaces compartidos con meta tags
- Mantenidas todas las rutas existentes (`/admin`, `/login`, `/retailers`)

### 2. **App.jsx**
```jsx
// Nuevo manejador de apertura de modal con URL
const handleOpenModal = (product) => {
  const productSlug = product.title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
  
  setSelectedItem(product);
  navigate(`/producto/${productSlug}`, { state: { fromModal: true } });
};
```

**Cambios clave:**
- Uso de `navigate()` para actualizar la URL cuando se abre un modal
- Detección automática de productos desde URL al cargar
- Soporte para rutas `/producto/:slug` y `/share/:slug`
- Redirección al home si no se encuentra el producto

### 3. **ProductModal.jsx**
```jsx
// Manejo del botón "atrás" del navegador
useEffect(() => {
  const handlePopState = (e) => {
    onClose();
  };
  
  window.addEventListener("popstate", handlePopState);
  return () => window.removeEventListener("popstate", handlePopState);
}, [onClose]);

// Botón de compartir usa /share/ para meta tags
const handleShare = (e) => {
  const shareUrl = `${window.location.origin}/share/${slug}`;
  // ...
};
```

**Cambios clave:**
- Simplificado el manejo del botón "atrás"
- Los enlaces compartidos usan `/share/` para aprovechar SSR del servidor

### 4. **_redirects (Netlify)**
```
# Redirect /share/:slug to server for SSR meta tags
/share/*  /.netlify/functions/share  200

# API routes to server
/api/*  /.netlify/functions/api  200

# SPA fallback - todas las demás rutas van al index.html
/*  /index.html  200
```

**Nota:** Si usas Vercel u otro hosting, necesitarás ajustar la configuración.

## 📦 Instalación

### Opción 1: Migración automática (Recomendado)

1. **Descargar los archivos de migración:**
   ```bash
   # Los archivos ya están en tu proyecto en:
   # - migration-files/
   # - migrate-to-browser-router.sh
   ```

2. **Ejecutar el script de migración:**
   ```bash
   chmod +x migrate-to-browser-router.sh
   ./migrate-to-browser-router.sh
   ```

3. **El script hará:**
   - ✅ Backup automático de todos los archivos
   - ✅ Aplicación de los cambios
   - ✅ Verificación de la migración
   - ✅ Instrucciones post-migración

### Opción 2: Migración manual

1. Copia los archivos de `migration-files/` a tu proyecto:
   ```bash
   cp migration-files/client/src/main.jsx client/src/main.jsx
   cp migration-files/client/src/App.jsx client/src/App.jsx
   cp migration-files/client/src/components/ProductModal.jsx client/src/components/ProductModal.jsx
   cp migration-files/client/public/_redirects client/public/_redirects
   ```

2. Verifica que los cambios se hayan aplicado correctamente

## 🚀 Uso del script

El script `migrate-to-browser-router.sh` tiene varios comandos:

### Migrar
```bash
./migrate-to-browser-router.sh migrate
# o simplemente
./migrate-to-browser-router.sh
```

### Listar backups
```bash
./migrate-to-browser-router.sh list
```

### Verificar migración
```bash
./migrate-to-browser-router.sh verify
```

### Rollback (revertir cambios)
```bash
./migrate-to-browser-router.sh rollback ./backups/browser-router-migration-YYYYMMDD_HHMMSS
```

### Ayuda
```bash
./migrate-to-browser-router.sh help
```

## ⚙️ Configuración del servidor

### Netlify
El archivo `_redirects` ya está configurado. Solo asegúrate de que esté en `client/public/`.

### Vercel
Crea un archivo `vercel.json` en la raíz del proyecto:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/"
    }
  ]
}
```

### Apache
Crea o modifica `.htaccess`:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### Nginx
Agrega a tu configuración:
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

### Node.js/Express
```javascript
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});
```

## 🧪 Pruebas después de la migración

Después del deploy, prueba estas URLs:

1. **Página principal:**
   ```
   https://tudominio.com/
   ```

2. **Modal de producto (navegación interna):**
   - Abre un producto desde la galería
   - La URL debería cambiar a: `https://tudominio.com/producto/nombre-producto`
   - Al presionar "atrás" debería cerrar el modal

3. **Enlace directo a producto:**
   ```
   https://tudominio.com/producto/nombre-producto
   ```
   - Debería abrir el modal automáticamente

4. **Enlace compartido (con meta tags):**
   ```
   https://tudominio.com/share/nombre-producto
   ```
   - Debería mostrar las imágenes en WhatsApp/Facebook

5. **Rutas de admin:**
   ```
   https://tudominio.com/admin
   https://tudominio.com/login
   https://tudominio.com/retailers
   ```

## 🐛 Solución de problemas

### Problema: "Cannot GET /producto/nombre"
**Solución:** Tu servidor no está configurado correctamente. Revisa la sección [Configuración del servidor](#configuración-del-servidor).

### Problema: Las URLs compartidas no muestran meta tags
**Solución:** 
1. Verifica que la ruta `/share/:slug` esté en el archivo `_redirects`
2. Asegúrate de que el servidor esté manejando esta ruta para SSR
3. Usa `/share/` en lugar de `/producto/` para compartir

### Problema: El modal no se abre al acceder directamente
**Solución:**
1. Verifica que el slug en la URL coincida con el formato del producto
2. Revisa la consola del navegador para errores
3. Asegúrate de que los productos se hayan cargado antes de intentar abrir el modal

### Problema: El botón "atrás" no funciona
**Solución:** Este debería estar resuelto con la nueva implementación. Si persiste:
1. Limpia el caché del navegador
2. Verifica que `ProductModal.jsx` tenga el listener de `popstate`

## 🔄 Rollback

Si algo sale mal, puedes revertir fácilmente:

1. **Listar backups disponibles:**
   ```bash
   ./migrate-to-browser-router.sh list
   ```

2. **Revertir a un backup específico:**
   ```bash
   ./migrate-to-browser-router.sh rollback ./backups/browser-router-migration-20250208_120000
   ```

3. **Los archivos se restaurarán automáticamente**

## 📝 Notas importantes

1. **URLs sin hash:** Las URLs ya no tendrán `#`. Actualiza cualquier enlace hardcodeado.

2. **Meta tags:** Los enlaces `/share/` son manejados por el servidor para inyectar meta tags. Los enlaces `/producto/` son manejados por el cliente.

3. **SEO:** Considera implementar Server-Side Rendering (SSR) o Static Site Generation (SSG) para mejorar el SEO.

4. **Caché:** Después del deploy, es posible que necesites limpiar el caché del navegador o hacer un hard refresh (`Ctrl+Shift+R`).

## 🎉 Beneficios obtenidos

- ✅ URLs limpias sin hash
- ✅ Mejor SEO
- ✅ Meta tags funcionan correctamente
- ✅ Compartir en redes sociales funciona perfectamente
- ✅ URLs más profesionales
- ✅ Mejor experiencia de usuario
- ✅ Compatible con todos los navegadores modernos

## 📞 Soporte

Si tienes problemas con la migración:
1. Revisa este README completo
2. Consulta la sección de Solución de problemas
3. Ejecuta el rollback si es necesario
4. Verifica la configuración de tu servidor

---

**¡La migración a BrowserRouter está completa! 🚀**
