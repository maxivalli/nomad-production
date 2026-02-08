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
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/**
 * Inyecta meta tags en HTML para compartir productos
 * @param {string} html - HTML base
 * @param {object} product - Datos del producto
 * @param {string} baseUrl - URL base del sitio
 * @returns {string} - HTML con meta tags inyectados
 */
const injectMetaTags = (html, product, baseUrl) => {
  const productUrl = `${baseUrl}/share/${generateSlug(product.title)}`;
  const imageUrl = Array.isArray(product.img) ? product.img[0] : product.img;
  const tituloFormateado = escapeHtml(product.title.toUpperCase());

  const metaTags = `
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="product" />
    <meta property="og:url" content="${escapeHtml(productUrl)}" />
    <meta property="og:title" content="NOMAD® - ${tituloFormateado}" />
    <meta property="og:description" content="${escapeHtml(product.description)}" />
    <meta property="og:image" content="${escapeHtml(imageUrl)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:site_name" content="NOMAD® Wear" />
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${escapeHtml(productUrl)}" />
    <meta name="twitter:title" content="NOMAD® - ${escapeHtml(product.title)}" />
    <meta name="twitter:description" content="${escapeHtml(product.description)}" />
    <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />
    
    <!-- Metadata adicional -->
    <meta name="description" content="${escapeHtml(product.description)}" />
    <title>NOMAD® - ${tituloFormateado}</title>
    
    <!-- Script para redirigir a la ruta correcta del HashRouter -->
    <script>
      if (window.location.pathname.includes('/share/')) {
        const slug = window.location.pathname.split('/share/')[1];
        window.location.href = '/#/producto/' + slug;
      }
    </script>
  `;

  return html
    .replace(/<meta[^>]*property="og:[^"]*"[^>]*>/gi, "")
    .replace(/<meta[^>]*name="twitter:[^"]*"[^>]*>/gi, "")
    .replace(/<meta[^>]*name="description"[^>]*>/gi, "")
    .replace(/<title>.*?<\/title>/i, "")
    .replace("</head>", `${metaTags}\n  </head>`);
};

module.exports = {
  generateSlug,
  extractPublicId,
  escapeHtml,
  injectMetaTags,
};
