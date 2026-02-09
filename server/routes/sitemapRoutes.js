const express = require('express');
const router = express.Router();
const pool = require('../config/database');

/**
 * Genera un slug a partir de un título
 * @param {string} title - Título a convertir
 * @returns {string} - Slug generado
 */
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
};

/**
 * GET /sitemap.xml
 * Genera un sitemap dinámico con todos los productos activos
 */
router.get('/sitemap.xml', async (req, res) => {
  try {
    // Obtener todos los productos activos de la base de datos
    const result = await pool.query(
      'SELECT title, updated_at, created_at FROM products ORDER BY created_at DESC'
    );
    const products = result.rows;
    
    const baseUrl = 'https://nomadwear.com.ar';
    const today = new Date().toISOString().split('T')[0];
    
    // Iniciar el XML del sitemap
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  
  <!-- Página principal -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Página de Retailers -->
  <url>
    <loc>${baseUrl}/retailers</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <!-- Productos dinámicos -->`;

    // Agregar cada producto al sitemap
    products.forEach(product => {
      const slug = generateSlug(product.title);
      
      // Usar updated_at si existe, sino created_at, sino la fecha actual
      let lastmod = today;
      if (product.updated_at) {
        lastmod = new Date(product.updated_at).toISOString().split('T')[0];
      } else if (product.created_at) {
        lastmod = new Date(product.created_at).toISOString().split('T')[0];
      }
      
      xml += `
  <url>
    <loc>${baseUrl}/producto/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
    });

    // Cerrar el XML
    xml += '\n</urlset>';
    
    // Configurar headers apropiados para XML
    res.header('Content-Type', 'application/xml; charset=utf-8');
    res.header('Cache-Control', 'public, max-age=3600'); // Cache de 1 hora
    res.send(xml);
    
    console.log(`✅ Sitemap generado con ${products.length} productos`);
  } catch (error) {
    console.error('❌ Error generando sitemap:', error);
    res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><error>Error generando sitemap</error>');
  }
});

module.exports = router;
