/**
 * Genera un slug a partir de un título
 * @param {string} title - Título a convertir
 * @returns {string} - Slug generado
 */
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
};

/**
 * Extrae el public_id de una URL de Cloudinary
 * @param {string} cloudinaryUrl - URL completa de Cloudinary
 * @returns {string|null} - Public ID sin extensión, o null si falla
 */
const extractPublicId = (cloudinaryUrl) => {
  try {
    if (!cloudinaryUrl || typeof cloudinaryUrl !== 'string') {
      console.warn('⚠️ URL de Cloudinary inválida:', cloudinaryUrl);
      return null;
    }

    const urlParts = cloudinaryUrl.split('/upload/');
    
    if (urlParts.length !== 2) {
      console.warn('⚠️ URL de Cloudinary no válida:', cloudinaryUrl);
      return null;
    }
    
    const afterUpload = urlParts[1];
    const withoutVersion = afterUpload.replace(/^v\d+\//, '');
    const publicId = withoutVersion.replace(/\.[^.]+$/, '');
    
    return publicId;
  } catch (error) {
    console.error('⚠️ Error extrayendo public_id:', error);
    return null;
  }
};

/**
 * Escapa caracteres HTML especiales
 * @param {string} text - Texto a escapar
 * @returns {string} - Texto escapado
 */
const escapeHtml = (text) => {
  if (!text) return '';
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/**
 * Detecta si el request viene de un bot de redes sociales
 * @param {string} userAgent - User-Agent header
 * @returns {boolean} - true si es un bot
 */
const isSocialBot = (userAgent) => {
  if (!userAgent) return false;
  const bots = [
    'facebookexternalhit',
    'whatsapp',
    'twitterbot',
    'linkedinbot',
    'pinterest',
    'slackbot',
    'telegrambot',
    'discordbot',
    'googlebot',
    'bingbot',
  ];
  return bots.some(bot => userAgent.toLowerCase().includes(bot));
};

/**
 * Inyecta meta tags en HTML para compartir productos
 * @param {string} html - HTML base
 * @param {object} product - Datos del producto
 * @param {string} baseUrl - URL base del sitio
 * @param {string} userAgent - User-Agent para detectar bots (opcional)
 * @returns {string} - HTML con meta tags inyectados
 */
const injectMetaTags = (html, product, baseUrl, userAgent = '') => {
  const slug = generateSlug(product.title);
  
  // URLs limpias para BrowserRouter
  const shareUrl = `${baseUrl}/share/${slug}`;
  const canonicalUrl = `${baseUrl}/producto/${slug}`;
  const imageUrl = Array.isArray(product.img) ? product.img[0] : product.img;
  const tituloFormateado = escapeHtml(product.title.toUpperCase());
  const description = escapeHtml(product.description || 'Streetwear diseñado para el movimiento. NOMAD® Wear Argentina.');

  // Meta tags para SEO y redes sociales
  const metaTags = `
    <!-- Canonical URL -->
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="product" />
    <meta property="og:url" content="${escapeHtml(shareUrl)}" />
    <meta property="og:title" content="NOMAD® - ${tituloFormateado}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${escapeHtml(imageUrl)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:site_name" content="NOMAD® Wear" />
    <meta property="product:price:amount" content="${product.price || ''}" />
    <meta property="product:price:currency" content="ARS" />
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${escapeHtml(shareUrl)}" />
    <meta name="twitter:title" content="NOMAD® - ${escapeHtml(product.title)}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />
    
    <!-- Metadata adicional -->
    <meta name="description" content="${description}" />
    <title>NOMAD® - ${tituloFormateado}</title>
    
    <!-- Redirección para usuarios reales (BrowserRouter) -->
    <script>
      (function() {
        // Solo redirigir si NO es un bot
        const isBot = /bot|crawler|spider|crawling|facebookexternalhit|whatsapp|twitterbot|linkedinbot/i.test(navigator.userAgent);
        
        if (!isBot && window.location.pathname.includes('/share/')) {
          const slug = window.location.pathname.split('/share/')[1].split('/')[0];
          // Redirigir a URL limpia /producto/ (BrowserRouter)
          window.location.replace('/producto/' + slug);
        }
      })();
    </script>
  `;

  // Limpiar meta tags existentes y agregar los nuevos
  let cleanHtml = html
    .replace(/<link[^>]*rel="canonical"[^>]*>/gi, "")
    .replace(/<meta[^>]*property="og:[^"]*"[^>]*>/gi, "")
    .replace(/<meta[^>]*name="twitter:[^"]*"[^>]*>/gi, "")
    .replace(/<meta[^>]*name="description"[^>]*>/gi, "")
    .replace(/<title>.*?<\/title>/i, "")
    .replace(/<script[^>]*>[\s\S]*?redirigir[\s\S]*?<\/script>/gi, ""); // Limpiar scripts de redirect antiguos

  // Insertar nuevos meta tags antes de </head>
  return cleanHtml.replace("</head>", `${metaTags}\n  </head>`);
};

/**
 * Genera HTML de redirect para usuarios (no bots)
 * @param {string} slug - Slug del producto
 * @returns {string} - HTML con redirect
 */
const generateRedirectHtml = (slug) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta http-equiv="refresh" content="0; url=/producto/${slug}" />
        <script>window.location.replace('/producto/${slug}');</script>
      </head>
      <body>
        <p>Redirigiendo...</p>
      </body>
    </html>
  `;
};

module.exports = {
  generateSlug,
  extractPublicId,
  escapeHtml,
  injectMetaTags,
  isSocialBot,
  generateRedirectHtml,
};