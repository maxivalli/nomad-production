const pool = require("../config/database");
const path = require("path");
const fs = require("fs");
const { injectMetaTags } = require("../utils/helpers");

const shareProduct = async (req, res) => {
  try {
    const { slug } = req.params;

    const result = await pool.query(
      `SELECT * FROM products 
       WHERE LOWER(REGEXP_REPLACE(title, '[^a-zA-Z0-9]', '-', 'g')) = LOWER($1)`,
      [slug],
    );

    if (result.rows.length === 0) {
      return res.redirect("/");
    }

    const product = result.rows[0];

    let html;
    const possiblePaths = [
      path.join(__dirname, "../../client/dist/index.html"),
      path.join(__dirname, "../dist/index.html"),
      path.join(process.cwd(), "client/dist/index.html"),
      path.join(process.cwd(), "dist/index.html"),
    ];

    for (const htmlPath of possiblePaths) {
      try {
        html = fs.readFileSync(htmlPath, "utf8");
        break;
      } catch (err) {
        continue;
      }
    }

    if (!html) {
      console.error("❌ No se pudo encontrar el archivo HTML");
      return res.redirect("/");
    }

    const protocol = req.get("x-forwarded-proto") || req.protocol;
    const host = req.get("host");
    const baseUrl = `${protocol}://${host}`;

    // Inyectar meta tags para compartir en redes sociales
    // pero la URL canónica será /producto/:slug
    const modifiedHtml = injectMetaTags(html, product, baseUrl, slug);
    res.send(modifiedHtml);
  } catch (err) {
    console.error("❌ Error en ruta de compartir:", err);
    res.redirect("/");
  }
};

module.exports = {
  shareProduct,
};
