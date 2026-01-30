const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  const { slug } = req.query;
  const FRONTEND_URL = process.env.FRONTEND_URL || "https://www.nomadwear.com.ar";

  console.log("--- DEBUG SHARE ---");
  console.log("1. Slug recibido:", slug);

  const generarSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
  };

  try {
    const result = await pool.query("SELECT title, description, img FROM products");
    const producto = result.rows.find((p) => generarSlug(p.title) === slug);

    if (!producto) {
      console.log("2. Producto no encontrado para slug:", slug);
      res.writeHead(302, { Location: FRONTEND_URL });
      return res.end();
    }

    console.log("3. Producto encontrado:", producto.title);

    const formatTitle = (text) => {
      return text
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    };

    const tituloLimpio = formatTitle(producto.title);
    const tituloFinal = `${tituloLimpio} | NOMAD`;

    const desc = producto.description
      ? producto.description.substring(0, 150) + "..."
      : "Explora nuestra nueva colección.";

    let imagen = Array.isArray(producto.img) ? producto.img[0] : producto.img;

    if (imagen && !imagen.startsWith("http")) {
      imagen = `${FRONTEND_URL}${imagen.startsWith("/") ? "" : "/"}${imagen}`;
    }

    console.log("5. URL de imagen:", imagen);

    res.setHeader("Content-Type", "text/html");
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>${tituloFinal}</title>
        
        <!-- Open Graph para Facebook -->
        <meta property="og:title" content="${tituloFinal}">
        <meta property="og:description" content="${desc}">
        <meta property="og:image" content="${imagen}">
        <meta property="og:image:secure_url" content="${imagen}">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="630">
        <meta property="og:type" content="website">
        <meta property="og:url" content="${FRONTEND_URL}/share/${slug}">
        <meta property="og:site_name" content="NOMAD">
        
        <!-- Twitter Cards -->
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="${tituloFinal}">
        <meta name="twitter:description" content="${desc}">
        <meta name="twitter:image" content="${imagen}">
        
        <meta http-equiv="refresh" content="0;url=${FRONTEND_URL}/#/producto/${slug}">
      </head>
      <body style="background:black; color:white; display:flex; align-items:center; justify-content:center; height:100vh; font-family:sans-serif;">
        <div style="text-align:center;">
          <h1 style="letter-spacing:0.5em;">NOMAD</h1>
          <p style="font-size:10px; text-transform:uppercase; opacity:0.5;">Cargando producto...</p>
        </div>
        <script>
          window.location.href = "${FRONTEND_URL}/#/producto/${slug}";
        </script>
      </body>
      </html>
    `);
  } catch (err) {
    console.error("❌ Error en ruta share:", err);
    res.writeHead(302, { Location: FRONTEND_URL });
    res.end();
  }
}