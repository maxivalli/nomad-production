// api/share.js
export default async function handler(req, res) {
  const { slug } = req.query;
  
  // Detectar si es un bot
  const userAgent = req.headers['user-agent'] || '';
  const isBot = /bot|crawler|spider|crawling|facebook|twitter|whatsapp|linkedin|pinterest|twitterbot|facebookexternalhit/i.test(userAgent);
  
  if (!isBot) {
    // Redirigir usuarios normales a la SPA
    return res.redirect(302, `/#/share/${slug}`);
  }

  try {
    // Obtener productos desde tu API (mismo dominio)
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['host'];
    const API_URL = `${protocol}://${host}`;
    
    const response = await fetch(`${API_URL}/api/products`);
    const products = await response.json();
    
    // Buscar el producto por slug
    const product = products.find(p => {
      const productSlug = p.title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
      return productSlug === slug;
    });

    if (!product) {
      return res.redirect(302, '/');
    }

    // Obtener la primera imagen
    const image = Array.isArray(product.img) ? product.img[0] : product.img;
    const description = product.description || 'Ropa urbana diseñada para el movimiento';
    const title = `NOMAD - ${product.title}`;

    // Generar HTML con meta tags dinámicas
    const html = `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="product" />
    <meta property="og:url" content="https://www.nomadwear.com.ar/share/${slug}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:site_name" content="NOMAD Wear" />
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="https://www.nomadwear.com.ar/share/${slug}" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
    
    <title>${title}</title>
    
    <!-- Redirigir a la SPA después de que el bot lea las meta tags -->
    <meta http-equiv="refresh" content="0;url=/#/share/${slug}" />
  </head>
  <body style="margin:0;padding:20px;font-family:system-ui;background:#000;color:#fff;text-align:center;">
    <h1>Redirigiendo a NOMAD...</h1>
  </body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
    
  } catch (error) {
    console.error('Error fetching product:', error);
    return res.redirect(302, '/');
  }
}
