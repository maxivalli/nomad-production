# 🚀 Inicio Rápido - Migración a BrowserRouter

## TL;DR (Muy rápido)

```bash
# 1. Validar que todo esté listo
./validate-pre-migration.sh

# 2. Ejecutar migración (incluye backup automático)
./migrate-to-browser-router.sh

# 3. Listo! ✨
```

Si algo sale mal:
```bash
# Revertir cambios
./migrate-to-browser-router.sh list
./migrate-to-browser-router.sh rollback ./backups/[nombre-del-backup]
```

---

## 📋 Pasos Detallados (5 minutos)

### Paso 1: Preparación
```bash
# Asegúrate de estar en el directorio del proyecto
cd /ruta/a/nomad-production-main

# Hacer commit de cambios pendientes (si usas Git)
git add .
git commit -m "Antes de migrar a BrowserRouter"
```

### Paso 2: Validación Pre-Migración
```bash
# Dar permisos de ejecución a los scripts
chmod +x validate-pre-migration.sh
chmod +x migrate-to-browser-router.sh

# Ejecutar validación
./validate-pre-migration.sh
```

**Resultado esperado:**
```
✓ Todo listo para la migración!
```

### Paso 3: Ejecutar Migración
```bash
./migrate-to-browser-router.sh
```

**El script hará:**
1. ✅ Crear backup de todos los archivos
2. ✅ Aplicar cambios (HashRouter → BrowserRouter)
3. ✅ Verificar que todo esté correcto
4. ✅ Mostrar instrucciones post-migración

### Paso 4: Verificar Cambios Localmente
```bash
# Ir al directorio del cliente
cd client

# Instalar dependencias (si no lo has hecho)
npm install

# Iniciar en desarrollo
npm run dev
```

**Prueba:**
1. Abre http://localhost:5173
2. Abre un producto
3. Verifica que la URL cambie a `/producto/nombre-producto`
4. Presiona "atrás" - debería cerrar el modal
5. Accede directamente a http://localhost:5173/producto/nombre-producto

### Paso 5: Deploy

#### Para Netlify:
```bash
# El archivo _redirects ya está actualizado
# Solo haz deploy normalmente:
git add .
git commit -m "Migrado a BrowserRouter"
git push origin main

# Netlify detectará los cambios y deployará automáticamente
```

#### Para Vercel:
```bash
# Copia el archivo de configuración
cp migration-files/vercel.json ./

# Deploy
git add .
git commit -m "Migrado a BrowserRouter con configuración Vercel"
git push origin main
```

#### Para Apache:
```bash
# Copia el .htaccess al directorio public
cp migration-files/.htaccess client/public/

# Luego sube los archivos a tu servidor
```

### Paso 6: Verificar en Producción

**URLs a probar:**
```
✅ https://tudominio.com/
✅ https://tudominio.com/producto/nombre-producto
✅ https://tudominio.com/share/nombre-producto
✅ https://tudominio.com/admin
✅ https://tudominio.com/login
✅ https://tudominio.com/retailers
```

**Funcionalidad a probar:**
- [ ] Home carga correctamente
- [ ] Abrir producto desde la galería actualiza la URL
- [ ] Botón "atrás" cierra el modal
- [ ] Acceso directo a `/producto/slug` abre el modal
- [ ] Compartir producto genera URL correcta
- [ ] Meta tags funcionan en WhatsApp/Facebook
- [ ] Rutas admin funcionan con autenticación

---

## ⚠️ Problemas Comunes

### "Cannot GET /producto/nombre"

**Causa:** Servidor no configurado para BrowserRouter

**Solución:**
- Netlify: Verifica que `_redirects` esté en `client/public/`
- Vercel: Agrega `vercel.json`
- Apache: Agrega `.htaccess`
- Nginx: Actualiza configuración con `nginx.conf`

### Modal no se abre al acceder directamente

**Causa:** Productos no se cargaron antes de intentar abrir

**Solución:** Ya está resuelto en el código migrado. Si persiste:
1. Limpia caché del navegador
2. Verifica la consola para errores
3. Asegúrate de que el slug coincida exactamente

### URLs compartidas no muestran meta tags

**Causa:** El servidor no maneja `/share/:slug` correctamente

**Solución:** 
1. Verifica que el servidor tenga la ruta `/share/:slug` configurada
2. Revisa `server/controllers/shareController.js`
3. Asegúrate de que `_redirects` apunte a la función correcta

---

## 🔄 Rollback (Si algo sale mal)

### Ver backups disponibles
```bash
./migrate-to-browser-router.sh list
```

### Revertir a un backup
```bash
./migrate-to-browser-router.sh rollback ./backups/browser-router-migration-20250208_120000
```

### Verificar que se revirtió correctamente
```bash
# Debería mostrar HashRouter
grep "HashRouter" client/src/main.jsx
```

---

## 📚 Documentación Adicional

- **README completo**: Ver `MIGRATION_README.md`
- **Comparativa detallada**: Ver `COMPARATIVA.md`
- **Configuración servidor**: Archivos en `migration-files/`

---

## 🎯 Checklist Final

Antes de dar por finalizada la migración:

### En Desarrollo
- [ ] `npm run dev` funciona sin errores
- [ ] Navegar entre secciones funciona
- [ ] Abrir/cerrar modales funciona
- [ ] Botón "atrás" funciona
- [ ] No hay errores en consola

### En Producción
- [ ] Deploy exitoso
- [ ] URLs sin hash (/)
- [ ] Acceso directo a productos funciona
- [ ] Compartir funciona en WhatsApp
- [ ] Compartir funciona en Facebook
- [ ] Meta tags se muestran correctamente
- [ ] Rutas admin protegidas funcionan

### SEO y Performance
- [ ] URLs indexables por Google
- [ ] Sin errores en Search Console
- [ ] Lighthouse score mantenido o mejorado
- [ ] Tiempo de carga similar

---

## 🎉 ¡Listo!

Tu aplicación ahora usa **BrowserRouter** con:
- ✅ URLs limpias sin hash
- ✅ Mejor SEO
- ✅ Compartir optimizado
- ✅ Misma funcionalidad

**¿Preguntas?** Revisa `MIGRATION_README.md` para documentación completa.

**¿Problemas?** Ejecuta el rollback y revisa la sección de solución de problemas.
