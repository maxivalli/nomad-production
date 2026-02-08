# 🔧 Notas Técnicas - Migración BrowserRouter

## Para Desarrolladores Avanzados

Este documento explica los detalles técnicos de la migración y consideraciones avanzadas.

---

## 🏗️ Arquitectura

### Flujo de Routing Actual (HashRouter)

```
Usuario → URL con # → React Router → Componente
         (#/producto/slug)   └─ Ignora servidor
                                └─ Cliente maneja todo
```

**Problema:** El hash (#) no se envía al servidor, por lo que:
- El servidor siempre ve la misma URL: `/`
- No se pueden hacer rewrites por ruta
- SEO limitado

### Flujo de Routing Nuevo (BrowserRouter)

```
Usuario → URL limpia → Servidor → SPA Fallback → React Router → Componente
         (/producto/slug)  └─ Lee ruta    └─ index.html
                              └─ Decide acción
```

**Ventaja:** El servidor ve la ruta completa y puede:
- Hacer SSR para `/share/:slug` (meta tags)
- Servir index.html para rutas de cliente
- Implementar redirecciones específicas

---

## 🔀 Manejo de Estado del Historial

### Problema con HashRouter
```javascript
// Antes: HashRouter
window.location.hash = '#/producto/camisa'
// El servidor NO ve el cambio de ruta

// Compartir:
const url = `${origin}/share/camisa`
// Inconsistencia: /share/ no usa #, pero /producto/ sí
```

### Solución con BrowserRouter
```javascript
// Después: BrowserRouter
navigate('/producto/camisa')
// El servidor VE la ruta completa

// Compartir:
const url = `${origin}/share/camisa`
// Consistencia: ambas sin #
```

### Manejo del History API

#### App.jsx
```javascript
// Cuando se abre un modal desde la galería
const handleOpenModal = (product) => {
  const slug = createSlug(product.title);
  setSelectedItem(product);
  
  // Navegar a la ruta del producto
  // state: { fromModal: true } ayuda a distinguir navegación interna
  navigate(`/producto/${slug}`, { state: { fromModal: true } });
};

// Cuando se cierra el modal
const handleCloseModal = () => {
  setSelectedItem(null);
  
  // Si estamos en una ruta de producto, volver al home
  if (slug) {
    navigate('/', { replace: true });
  }
};
```

#### ProductModal.jsx
```javascript
// Listener del botón "atrás"
useEffect(() => {
  const handlePopState = () => {
    // Simplemente cerrar el modal
    // React Router maneja el resto
    onClose();
  };
  
  window.addEventListener('popstate', handlePopState);
  return () => window.removeEventListener('popstate', handlePopState);
}, [onClose]);
```

**Por qué funciona:**
1. Usuario abre modal → URL cambia a `/producto/slug`
2. Usuario presiona "atrás" → `popstate` se dispara
3. Modal se cierra → React Router vuelve a `/`
4. Estado limpio ✅

---

## 🌐 Configuración de Servidor (Deep Dive)

### Netlify (_redirects)

```
# Orden IMPORTANTE - primero las rutas específicas

# 1. Rutas con SSR (server-side rendering)
/share/*  /.netlify/functions/share  200

# 2. API routes
/api/*  /.netlify/functions/api  200

# 3. SPA fallback (todas las demás)
/*  /index.html  200
```

**Cómo funciona:**
1. Request a `/share/camisa` → Netlify Functions maneja (SSR)
2. Request a `/api/products` → Netlify Functions maneja (API)
3. Request a `/producto/camisa` → Sirve `index.html` (SPA)
4. React Router lee `/producto/camisa` y abre el modal

### Vercel (vercel.json)

```json
{
  "rewrites": [
    {
      "source": "/share/(.*)",
      "destination": "/api/share/$1"
    },
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Diferencia con Netlify:**
- Vercel usa `rewrites` en lugar de `_redirects`
- Los rewrites no cambian la URL en el navegador
- El orden también es importante

### Apache (.htaccess)

```apache
RewriteEngine On
RewriteBase /

# No reescribir archivos que existen
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d

# Reescribir todo a index.html
RewriteRule ^ index.html [QSA,L]
```

**QSA = Query String Append:**
Preserva los query params (e.g., `?utm_source=fb`)

**L = Last:**
Para el procesamiento de reglas aquí

### Nginx

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

**try_files:**
1. Intenta servir el archivo ($uri)
2. Si no existe, intenta servir como directorio ($uri/)
3. Si no existe, sirve index.html

**Mucho más simple que Apache** 😄

---

## 🔍 SEO Considerations

### Meta Tags Dinámicos

#### Problema con SPA puro:
```html
<!-- index.html estático -->
<meta property="og:title" content="NOMAD Wear">
<meta property="og:image" content="/logo.png">
```

**Problema:** Todos los productos comparten los mismos meta tags.

#### Solución con SSR para /share/:

```javascript
// server/controllers/shareController.js
const shareProduct = async (req, res) => {
  const { slug } = req.params;
  const product = await getProductBySlug(slug);
  
  // Leer index.html
  let html = fs.readFileSync('dist/index.html', 'utf8');
  
  // Inyectar meta tags específicos del producto
  html = injectMetaTags(html, product, baseUrl);
  
  res.send(html);
};
```

```javascript
// utils/helpers.js
const injectMetaTags = (html, product, baseUrl) => {
  const metaTags = `
    <meta property="og:title" content="NOMAD - ${product.title}">
    <meta property="og:description" content="${product.description}">
    <meta property="og:image" content="${product.img[0]}">
    <meta property="og:url" content="${baseUrl}/share/${slug}">
  `;
  
  return html.replace('</head>', `${metaTags}</head>`);
};
```

**Resultado:**
- `/producto/camisa` → SPA (sin meta tags especiales)
- `/share/camisa` → SSR (con meta tags del producto)

### Sitemap.xml

Con BrowserRouter, puedes generar un sitemap dinámico:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://nomad.com.ar/</loc>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://nomad.com.ar/producto/camisa-urban</loc>
    <priority>0.8</priority>
  </url>
  <!-- Más productos... -->
</urlset>
```

---

## ⚡ Performance

### Code Splitting

Con BrowserRouter, puedes hacer code splitting por ruta:

```javascript
// Lazy load de AdminPanel ya implementado
const AdminPanel = lazy(() => import('./views/AdminPanel'));

// Podrías agregar:
const ProductPage = lazy(() => import('./views/ProductPage'));
```

### Preloading

```javascript
// Precargar la ruta de producto al hacer hover
<Link
  to={`/producto/${slug}`}
  onMouseEnter={() => prefetch(`/producto/${slug}`)}
>
  Ver producto
</Link>
```

### Service Worker Cache

```javascript
// sw.js
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Sin BrowserRouter: todas las rutas son /
  // Con BrowserRouter: puedes cachear por ruta específica
  if (url.pathname.startsWith('/producto/')) {
    // Cache strategy para productos
  }
});
```

---

## 🧪 Testing

### Unit Tests

```javascript
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

test('opens product modal from URL', () => {
  // Simular navegación directa
  window.history.pushState({}, '', '/producto/camisa-urban');
  
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  
  expect(screen.getByText(/camisa urban/i)).toBeInTheDocument();
});
```

### E2E Tests (Cypress)

```javascript
describe('Product Navigation', () => {
  it('updates URL when opening product', () => {
    cy.visit('/');
    cy.get('[data-testid="product-card"]').first().click();
    cy.url().should('include', '/producto/');
  });
  
  it('opens modal from direct URL', () => {
    cy.visit('/producto/camisa-urban');
    cy.get('[data-testid="product-modal"]').should('be.visible');
  });
  
  it('closes modal with back button', () => {
    cy.visit('/producto/camisa-urban');
    cy.go('back');
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });
});
```

---

## 🐛 Edge Cases

### 1. Producto no encontrado

```javascript
useEffect(() => {
  if (slug && products.length > 0) {
    const product = products.find(/* ... */);
    
    if (product) {
      setSelectedItem(product);
    } else {
      // Producto no existe → redirigir al home
      navigate('/', { replace: true });
    }
  }
}, [slug, products]);
```

### 2. Deep linking desde otra app

```javascript
// Usuario toca link en WhatsApp → abre navegador
// URL: /producto/camisa-urban

useEffect(() => {
  // Esperar a que los productos se carguen
  if (slug && products.length > 0) {
    // Ahora sí buscar el producto
  }
}, [slug, products]);
```

### 3. Múltiples modales

Si en el futuro tienes más modales:

```javascript
// Usar query params para modal state
navigate(`/producto/${slug}?view=details`);
navigate(`/producto/${slug}?view=gallery`);

// O rutas anidadas
<Route path="/producto/:slug">
  <Route path="details" element={<DetailsModal />} />
  <Route path="gallery" element={<GalleryModal />} />
</Route>
```

---

## 🔐 Seguridad

### 1. Validación de slugs

```javascript
const createSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiales
    .replace(/\s+/g, '-')         // Espacios → guiones
    .replace(/-+/g, '-');         // Múltiples guiones → uno solo
};
```

**Previene:** Inyección de caracteres maliciosos

### 2. XSS en meta tags (Server-side)

```javascript
const injectMetaTags = (html, product, baseUrl) => {
  // Escapar HTML en descripción
  const escapeHtml = (text) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };
  
  const description = escapeHtml(product.description);
  // ...
};
```

---

## 📊 Monitoreo

### Analytics

Con BrowserRouter, las rutas se trackean mejor:

```javascript
// Google Analytics
useEffect(() => {
  const { pathname } = location;
  
  // Antes (HashRouter): siempre "/"
  // Después (BrowserRouter): "/producto/camisa-urban"
  ga('send', 'pageview', pathname);
}, [location]);
```

### Error Tracking (Sentry)

```javascript
Sentry.init({
  beforeSend(event) {
    // Con BrowserRouter, el contexto de ruta es más útil
    event.tags = {
      ...event.tags,
      route: window.location.pathname
    };
    return event;
  }
});
```

---

## 🚀 Optimizaciones Avanzadas

### 1. Prefetching de productos

```javascript
// Precargar datos del producto al hacer hover
const ProductCard = ({ product }) => {
  const handleMouseEnter = () => {
    // Precargar imágenes
    product.img.forEach(url => {
      const img = new Image();
      img.src = url;
    });
  };
  
  return (
    <Link
      to={`/producto/${createSlug(product.title)}`}
      onMouseEnter={handleMouseEnter}
    >
      {/* ... */}
    </Link>
  );
};
```

### 2. Route-based code splitting

```javascript
const routes = [
  {
    path: '/',
    component: lazy(() => import('./views/Home'))
  },
  {
    path: '/admin',
    component: lazy(() => import('./views/Admin'))
  }
];
```

### 3. Progressive Web App

```javascript
// sw.js - Cache strategies por ruta
const CACHE_STRATEGIES = {
  '/producto/': 'network-first',
  '/share/': 'network-only',
  '/api/': 'network-first',
  '/': 'cache-first'
};
```

---

## 📝 Checklist para Code Review

- [ ] BrowserRouter importado y usado correctamente
- [ ] HashRouter removido completamente
- [ ] navigate() usado en lugar de window.location
- [ ] Rutas definidas correctamente en Routes
- [ ] Servidor configurado para SPA fallback
- [ ] Meta tags dinámicos para /share/
- [ ] Manejo del botón "atrás" implementado
- [ ] Slugs validados y sanitizados
- [ ] Tests actualizados para BrowserRouter
- [ ] Analytics actualizado
- [ ] Rollback script probado

---

## 🎓 Recursos Adicionales

### Documentación oficial:
- [React Router v6 - BrowserRouter](https://reactrouter.com/en/main/router-components/browser-router)
- [History API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/History_API)

### Artículos recomendados:
- "Understanding React Router v6"
- "SPA SEO Best Practices"
- "Server-side rendering for social media"

---

**¿Preguntas técnicas?** Revisa el código en `migration-files/` o consulta la documentación de React Router.
