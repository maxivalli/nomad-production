const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const path = require("path");
const fs = require("fs");
const webpush = require("web-push");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config();

const app = express();

// ==========================================
// CONFIGURACIÓN DE CLOUDINARY
// ==========================================

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage de Cloudinary para imágenes push
const pushImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "push-images",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
    transformation: [{ width: 1200, height: 630, crop: "limit" }],
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      return "push-" + uniqueSuffix;
    },
  },
});

const upload = multer({
  storage: pushImageStorage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB máximo
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten imágenes (JPG, PNG, WebP, GIF)"), false);
    }
  },
});

// ==========================================
// CONFIGURACIÓN DE SEGURIDAD
// ==========================================

app.set("trust proxy", 1);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  optionsSuccessStatus: 200,
  exposedHeaders: ["Content-Type", "Content-Length"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.",
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message:
    "Demasiados intentos de inicio de sesión, intenta de nuevo más tarde.",
});

app.use("/api/", apiLimiter);

// ==========================================
// CONFIGURACIÓN DE BASE DE DATOS
// ==========================================

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on("error", (err, client) => {
  console.error("Error inesperado en el pool de PostgreSQL", err);
});

// ==========================================
// INICIALIZACIÓN DE BASE DE DATOS
// ==========================================

const initDB = async () => {
  try {
    // Función para actualizar updated_at
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Tabla de productos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        season VARCHAR(50) CHECK (season IN ('spring', 'summer', 'autumn', 'winter')),
        year INTEGER CHECK (year >= 2026 AND year <= 2050),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        img TEXT[] NOT NULL,
        sizes VARCHAR(10)[] NOT NULL,
        purchase_link TEXT DEFAULT '',
        color TEXT[] NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Trigger para products
    await pool.query(`
      DROP TRIGGER IF EXISTS update_products_updated_at ON products;
      CREATE TRIGGER update_products_updated_at
        BEFORE UPDATE ON products
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    // Tabla de notificaciones push
    await pool.query(`
      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id SERIAL PRIMARY KEY,
        endpoint TEXT UNIQUE NOT NULL,
        keys_p256dh TEXT NOT NULL,
        keys_auth TEXT NOT NULL,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        active BOOLEAN DEFAULT true
      );
    `);

    // Tabla de historial de notificaciones
    await pool.query(`
      CREATE TABLE IF NOT EXISTS push_notifications (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        url TEXT,
        icon TEXT,
        image TEXT,
        tag VARCHAR(100),
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        recipients_count INTEGER DEFAULT 0,
        success_count INTEGER DEFAULT 0,
        failure_count INTEGER DEFAULT 0
      );
    `);

    // Tabla de configuración
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insertar valores iniciales
    await pool.query(`
      INSERT INTO settings (key, value) VALUES ('current_collection', 'AUTUMN COLLECTION 2026')
      ON CONFLICT (key) DO NOTHING;
    `);

    await pool.query(`
      INSERT INTO settings (key, value) VALUES ('launch_date', '')
      ON CONFLICT (key) DO NOTHING;
    `);

    // Tabla de administradores
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Crear usuario admin por defecto
    const adminExists = await pool.query(
      "SELECT * FROM admins WHERE username = 'admin'",
    );
    if (adminExists.rows.length === 0 && process.env.DEFAULT_ADMIN_PASSWORD) {
      const hashedPassword = await bcrypt.hash(
        process.env.DEFAULT_ADMIN_PASSWORD,
        12,
      );
      await pool.query(
        "INSERT INTO admins (username, password_hash) VALUES ($1, $2)",
        ["admin", hashedPassword],
      );
      console.log("✅ Usuario admin creado");
    }

    console.log("✅ Sistema de Base de Datos Sincronizado");
  } catch (err) {
    console.error("❌ Error en inicialización de DB:", err);
  }
};

initDB();

webpush.setVapidDetails(
  process.env.VAPID_EMAIL || "mailto:info@nomadwear.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY,
);

// ==========================================
// ESQUEMAS DE VALIDACIÓN JOI
// ==========================================

const productSchema = Joi.object({
  season: Joi.string()
    .valid("spring", "summer", "autumn", "winter")
    .required()
    .messages({
      "any.only": "La temporada debe ser spring, summer, autumn o winter",
      "any.required": "La temporada es obligatoria",
    }),
  year: Joi.number().integer().min(2026).max(2050).required().messages({
    "number.base": "El año debe ser un número",
    "number.min": "El año debe ser al menos 2026",
    "number.max": "El año no puede ser mayor a 2050",
    "any.required": "El año es obligatorio",
  }),
  title: Joi.string().min(3).max(255).required().messages({
    "string.min": "El título debe tener al menos 3 caracteres",
    "string.max": "El título no puede exceder 255 caracteres",
    "any.required": "El título es obligatorio",
  }),
  description: Joi.string().min(10).required().messages({
    "string.min": "La descripción debe tener al menos 10 caracteres",
    "any.required": "La descripción es obligatoria",
  }),
  img: Joi.array().items(Joi.string().uri()).min(1).max(5).required().messages({
    "array.min": "Debes proporcionar al menos 1 imagen",
    "array.max": "No puedes subir más de 5 imágenes",
    "any.required": "Las imágenes son obligatorias",
  }),
  sizes: Joi.array()
    .items(Joi.string().valid("S", "M", "L", "XL"))
    .min(1)
    .required()
    .messages({
      "array.min": "Debes seleccionar al menos una talla",
      "any.required": "Las tallas son obligatorias",
    }),
  purchase_link: Joi.string().uri().allow("").default(""),
  color: Joi.array().items(Joi.string().max(50)).min(1).required().messages({
    "array.base": "El campo color debe ser una lista de colores",
    "array.min": "Debes seleccionar al menos un color",
    "any.required": "Los colores son obligatorios",
  }),
});

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

// ==========================================
// MIDDLEWARE DE AUTENTICACIÓN
// ==========================================

const authenticateAdmin = (req, res, next) => {
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).json({
      error: "No autorizado",
      message: "No se encontró token de autenticación",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      error: "Token inválido",
      message: "El token de autenticación no es válido o ha expirado",
    });
  }
};

// ==========================================
// FUNCIÓN AUXILIAR: GENERAR SLUG
// ==========================================

const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
};

// ==========================================
// FUNCIÓN AUXILIAR: INYECTAR META TAGS
// ==========================================

const injectMetaTags = (html, product, baseUrl) => {
  const productUrl = `${baseUrl}/share/${generateSlug(product.title)}`;
  const imageUrl = Array.isArray(product.img) ? product.img[0] : product.img;

  const escapeHtml = (text) => {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

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

// ==========================================
// RUTA PARA COMPARTIR PRODUCTOS (SSR)
// ==========================================

app.get("/share/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    console.log("📤 Solicitud de compartir:", slug);

    const result = await pool.query(
      `SELECT * FROM products 
       WHERE LOWER(REGEXP_REPLACE(title, '[^a-zA-Z0-9]', '-', 'g')) = LOWER($1)`,
      [slug],
    );

    if (result.rows.length === 0) {
      console.log("❌ Producto no encontrado:", slug);
      return res.redirect("/");
    }

    const product = result.rows[0];
    console.log("✅ Producto encontrado:", product.title);

    let html;
    const possiblePaths = [
      path.join(__dirname, "../client/dist/index.html"),
      path.join(__dirname, "dist/index.html"),
      path.join(process.cwd(), "client/dist/index.html"),
      path.join(process.cwd(), "dist/index.html"),
    ];

    for (const htmlPath of possiblePaths) {
      try {
        html = fs.readFileSync(htmlPath, "utf8");
        console.log("✅ HTML encontrado en:", htmlPath);
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

    console.log("🔗 URL base:", baseUrl);

    const modifiedHtml = injectMetaTags(html, product, baseUrl);
    res.send(modifiedHtml);
  } catch (err) {
    console.error("❌ Error en ruta de compartir:", err);
    res.redirect("/");
  }
});

// ==========================================
// RUTAS DE AUTENTICACIÓN
// ==========================================

app.post("/api/auth/login", authLimiter, async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Datos inválidos",
        message: error.details[0].message,
      });
    }

    const { username, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM admins WHERE username = $1",
      [username],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: "Credenciales inválidas",
        message: "Usuario o contraseña incorrectos",
      });
    }

    const admin = result.rows[0];

    const isValidPassword = await bcrypt.compare(password, admin.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        error: "Credenciales inválidas",
        message: "Usuario o contraseña incorrectos",
      });
    }

    const token = jwt.sign(
      {
        id: admin.id,
        username: admin.username,
        admin: true,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: "Autenticación exitosa",
      user: { username: admin.username },
    });
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({
      error: "Error del servidor",
      message: "No se pudo procesar la autenticación",
    });
  }
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("authToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.json({
    success: true,
    message: "Sesión cerrada exitosamente",
  });
});

app.get("/api/auth/verify", authenticateAdmin, (req, res) => {
  res.json({
    authenticated: true,
    user: { username: req.admin.username },
  });
});

// ==========================================
// RUTAS DE PRODUCTOS
// ==========================================

app.get("/api/products", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM products ORDER BY created_at DESC",
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener productos:", err);
    res.status(500).json({
      error: "Error del servidor",
      message: "No se pudieron obtener los productos",
    });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(id)) {
      return res.status(400).json({
        error: "ID inválido",
        message: "El ID del producto debe ser un número",
      });
    }

    const result = await pool.query("SELECT * FROM products WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "No encontrado",
        message: "El producto no existe",
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error al obtener producto:", err);
    res.status(500).json({
      error: "Error del servidor",
      message: "No se pudo obtener el producto",
    });
  }
});

app.post("/api/products", authenticateAdmin, async (req, res) => {
  try {
    const { error, value } = productSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Datos inválidos",
        message: error.details[0].message,
      });
    }

    const {
      season,
      year,
      title,
      description,
      img,
      sizes,
      purchase_link,
      color,
    } = value;

    const result = await pool.query(
      `INSERT INTO products (season, year, title, description, img, sizes, purchase_link, color) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [season, year, title, description, img, sizes, purchase_link, color],
    );

    res.status(201).json({
      success: true,
      message: "Producto creado exitosamente",
      product: result.rows[0],
    });
  } catch (err) {
    console.error("Error al crear producto:", err);
    res.status(500).json({
      error: "Error del servidor",
      message: "No se pudo crear el producto",
    });
  }
});

app.put("/api/products/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(id)) {
      return res.status(400).json({
        error: "ID inválido",
        message: "El ID del producto debe ser un número",
      });
    }

    const { error, value } = productSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Datos inválidos",
        message: error.details[0].message,
      });
    }

    const {
      season,
      year,
      title,
      description,
      img,
      sizes,
      purchase_link,
      color,
    } = value;

    const result = await pool.query(
      `UPDATE products 
       SET season = $1, year = $2, title = $3, description = $4, img = $5, sizes = $6, 
           purchase_link = $7, color = $8
       WHERE id = $9 RETURNING *`,
      [season, year, title, description, img, sizes, purchase_link, color, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "No encontrado",
        message: "El producto no existe",
      });
    }

    res.json({
      success: true,
      message: "Producto actualizado exitosamente",
      product: result.rows[0],
    });
  } catch (err) {
    console.error("Error al actualizar producto:", err);
    res.status(500).json({
      error: "Error del servidor",
      message: "No se pudo actualizar el producto",
    });
  }
});

app.delete("/api/products/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(id)) {
      return res.status(400).json({
        error: "ID inválido",
        message: "El ID del producto debe ser un número",
      });
    }

    const result = await pool.query(
      "DELETE FROM products WHERE id = $1 RETURNING id",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "No encontrado",
        message: "El producto no existe",
      });
    }

    res.json({
      success: true,
      message: "Producto eliminado exitosamente",
    });
  } catch (err) {
    console.error("Error al eliminar producto:", err);
    res.status(500).json({
      error: "Error del servidor",
      message: "No se pudo eliminar el producto",
    });
  }
});

// ==========================================
// RUTAS DE CONFIGURACIÓN
// ==========================================

app.get("/api/settings/launch-date", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT value FROM settings WHERE key = 'launch_date'",
    );
    res.json({
      date: result.rows.length > 0 ? result.rows[0].value : null,
    });
  } catch (err) {
    console.error("Error al obtener fecha:", err);
    res.status(500).json({
      error: "Error del servidor",
      message: "No se pudo obtener la fecha de lanzamiento",
    });
  }
});

app.post("/api/settings/launch-date", authenticateAdmin, async (req, res) => {
  try {
    const { date } = req.body;

    if (!date) {
      return res.status(400).json({
        error: "Datos inválidos",
        message: "La fecha es obligatoria",
      });
    }

    await pool.query(
      `INSERT INTO settings (key, value, updated_at) 
       VALUES ('launch_date', $1, CURRENT_TIMESTAMP) 
       ON CONFLICT (key) 
       DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`,
      [date],
    );

    res.json({
      success: true,
      message: "Fecha de lanzamiento actualizada",
    });
  } catch (err) {
    console.error("Error al actualizar fecha:", err);
    res.status(500).json({
      error: "Error del servidor",
      message: "No se pudo actualizar la fecha",
    });
  }
});

app.get("/api/settings/collection", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT value FROM settings WHERE key = 'current_collection'",
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "No encontrado",
        message: "No se encontró la colección",
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error al obtener colección:", err);
    res.status(500).json({
      error: "Error del servidor",
      message: "No se pudo obtener la colección",
    });
  }
});

app.put("/api/settings/collection", authenticateAdmin, async (req, res) => {
  try {
    const { value } = req.body;

    if (!value) {
      return res.status(400).json({
        error: "Datos inválidos",
        message: "El nombre de la colección es obligatorio",
      });
    }

    await pool.query(
      `INSERT INTO settings (key, value, updated_at) 
       VALUES ('current_collection', $1, CURRENT_TIMESTAMP)
       ON CONFLICT (key) 
       DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`,
      [value],
    );

    res.json({
      success: true,
      message: "Colección actualizada exitosamente",
    });
  } catch (err) {
    console.error("Error al actualizar colección:", err);
    res.status(500).json({
      error: "Error del servidor",
      message: "No se pudo actualizar la colección",
    });
  }
});

// ==========================================
// RUTA PARA CLOUDINARY
// ==========================================

app.post("/api/cloudinary/signature", authenticateAdmin, async (req, res) => {
  try {
    res.json({
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
    });
  } catch (err) {
    console.error("Error en Cloudinary:", err);
    res.status(500).json({
      error: "Error del servidor",
      message: "No se pudo obtener la configuración de Cloudinary",
    });
  }
});

// ==========================================
// RUTAS DE PUSH NOTIFICATIONS
// ==========================================

app.get("/api/push/vapid-public-key", (req, res) => {
  res.json({
    publicKey: process.env.VAPID_PUBLIC_KEY,
  });
});

app.post("/api/push/subscribe", async (req, res) => {
  try {
    const { endpoint, keys } = req.body;

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return res.status(400).json({
        error: "Datos de suscripción incompletos",
      });
    }

    const userAgent = req.headers["user-agent"] || "unknown";

    await pool.query(
      `INSERT INTO push_subscriptions (endpoint, keys_p256dh, keys_auth, user_agent)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (endpoint) 
       DO UPDATE SET 
         last_used = CURRENT_TIMESTAMP,
         active = true`,
      [endpoint, keys.p256dh, keys.auth, userAgent],
    );

    console.log("✅ Nueva suscripción push registrada");

    res.status(201).json({
      success: true,
      message: "Suscripción registrada correctamente",
    });
  } catch (error) {
    console.error("Error guardando suscripción:", error);
    res.status(500).json({ error: "Error al registrar suscripción" });
  }
});

app.post("/api/push/unsubscribe", async (req, res) => {
  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({ error: "Endpoint requerido" });
    }

    await pool.query(
      "UPDATE push_subscriptions SET active = false WHERE endpoint = $1",
      [endpoint],
    );

    console.log("✅ Suscripción desactivada");

    res.json({
      success: true,
      message: "Suscripción cancelada",
    });
  } catch (error) {
    console.error("Error cancelando suscripción:", error);
    res.status(500).json({ error: "Error al cancelar suscripción" });
  }
});

app.get("/api/push/stats", authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_subscriptions,
        COUNT(*) FILTER (WHERE active = true) as active_subscriptions,
        COUNT(*) FILTER (WHERE active = false) as inactive_subscriptions
      FROM push_subscriptions
    `);

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
    res.status(500).json({ error: "Error al obtener estadísticas" });
  }
});

app.post("/api/push/send", authenticateAdmin, async (req, res) => {
  try {
    const { title, body, url, icon, image, tag } = req.body;

    console.log("📧 [PUSH] Iniciando envío de notificación");
    console.log("📧 [PUSH] Título:", title);
    console.log("📧 [PUSH] Imagen:", image || "Sin imagen");

    if (!title || !body) {
      return res.status(400).json({
        error: "Título y mensaje son requeridos",
      });
    }

    if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
      console.error("❌ [PUSH] Claves VAPID no configuradas");
      return res.status(500).json({
        error: "Configuración de VAPID incompleta",
      });
    }

    const result = await pool.query(
      "SELECT * FROM push_subscriptions WHERE active = true",
    );

    const subscriptions = result.rows;
    console.log(
      `📧 [PUSH] Suscripciones activas encontradas: ${subscriptions.length}`,
    );

    if (subscriptions.length === 0) {
      return res.json({
        message: "No hay suscriptores activos",
        sent: 0,
      });
    }

    const payload = JSON.stringify({
      title,
      body,
      icon: icon || "/icon-192-192.png",
      badge: "/icon-96-96.png",
      image: image || null,
      url: url || "/",
      tag: tag || "nomad-notification",
      requireInteraction: false,
      actions: [
        { action: "open", title: "Ver más" },
        { action: "close", title: "Cerrar" },
      ],
    });

    const promises = subscriptions.map(async (sub, index) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.keys_p256dh,
          auth: sub.keys_auth,
        },
      };

      try {
        console.log(`📧 [PUSH] Enviando a suscripción ${index + 1}...`);
        const response = await webpush.sendNotification(
          pushSubscription,
          payload,
        );
        console.log(
          `✅ [PUSH] Suscripción ${index + 1} exitosa:`,
          response.statusCode,
        );
        return {
          success: true,
          endpoint: sub.endpoint,
          statusCode: response.statusCode,
        };
      } catch (error) {
        console.error(`❌ [PUSH] Error en suscripción ${index + 1}:`, {
          endpoint: sub.endpoint.substring(0, 50) + "...",
          statusCode: error.statusCode,
          message: error.message,
        });

        if (error.statusCode === 410 || error.statusCode === 404) {
          console.log(
            `🗑️ [PUSH] Desactivando suscripción ${index + 1} (endpoint inválido)`,
          );
          await pool.query(
            "UPDATE push_subscriptions SET active = false WHERE endpoint = $1",
            [sub.endpoint],
          );
        }

        return {
          success: false,
          endpoint: sub.endpoint,
          error: error.message,
          statusCode: error.statusCode,
        };
      }
    });

    const results = await Promise.all(promises);

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    console.log(
      `📊 [PUSH] Resultados finales: ${successCount} exitosos, ${failureCount} fallidos`,
    );

    await pool.query(
      `INSERT INTO push_notifications 
       (title, body, url, icon, image, tag, recipients_count, success_count, failure_count)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        title,
        body,
        url,
        icon,
        image,
        tag,
        subscriptions.length,
        successCount,
        failureCount,
      ],
    );

    console.log(`✅ [PUSH] Notificación guardada en historial`);

    res.json({
      success: true,
      message: "Notificación enviada",
      total: subscriptions.length,
      successful: successCount,
      failed: failureCount,
    });
  } catch (error) {
    console.error("❌ [PUSH] Error enviando notificación:", error);
    res.status(500).json({ error: "Error al enviar notificación" });
  }
});

app.get("/api/push/history", authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM push_notifications 
       ORDER BY sent_at DESC 
       LIMIT 50`,
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error obteniendo historial:", error);
    res.status(500).json({ error: "Error al obtener historial" });
  }
});

// ==========================================
// RUTAS DE IMÁGENES PUSH (CLOUDINARY)
// ==========================================

app.post(
  "/api/push/upload-image",
  authenticateAdmin,
  upload.single("image"),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: "No se proporcionó ninguna imagen",
        });
      }

      // req.file contiene la respuesta de Cloudinary
      console.log("✅ Imagen subida a Cloudinary:", {
        url: req.file.path,
        filename: req.file.filename,
        size: req.file.size,
      });

      res.json({
        success: true,
        url: req.file.path, // URL completa de Cloudinary
        filename: req.file.filename,
        size: req.file.size,
      });
    } catch (error) {
      console.error("❌ Error subiendo imagen:", error);
      res.status(500).json({
        error: "Error al subir la imagen",
      });
    }
  },
);

app.delete(
  "/api/push/delete-image/:public_id",
  authenticateAdmin,
  async (req, res) => {
    try {
      const { public_id } = req.params;
      
      // Decodificar el public_id si viene codificado
      const decodedPublicId = decodeURIComponent(public_id);

      // Eliminar de Cloudinary
      const result = await cloudinary.uploader.destroy(decodedPublicId);

      if (result.result !== "ok") {
        return res.status(404).json({
          error: "Imagen no encontrada en Cloudinary",
          details: result,
        });
      }

      console.log("✅ Imagen eliminada de Cloudinary:", decodedPublicId);

      res.json({
        success: true,
        message: "Imagen eliminada correctamente",
      });
    } catch (error) {
      console.error("❌ Error eliminando imagen:", error);
      res.status(500).json({
        error: "Error al eliminar la imagen",
      });
    }
  },
);

app.get("/api/push/images", authenticateAdmin, async (req, res) => {
  try {
    // Obtener imágenes de la carpeta push-images en Cloudinary
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: "push-images/",
      max_results: 100,
    });

    const images = result.resources.map((resource) => ({
      filename: resource.public_id,
      url: resource.secure_url,
      size: resource.bytes,
      uploadedAt: resource.created_at,
      width: resource.width,
      height: resource.height,
    }));

    res.json({
      success: true,
      images,
      count: images.length,
    });
  } catch (error) {
    console.error("❌ Error listando imágenes:", error);
    res.status(500).json({
      error: "Error al listar imágenes",
    });
  }
});

// ==========================================
// MANEJO DE ERRORES GLOBAL
// ==========================================

app.use((err, req, res, next) => {
  console.error("Error no manejado:", err);
  res.status(500).json({
    error: "Error interno del servidor",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Ocurrió un error inesperado",
  });
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 Nomad Core activo en puerto ${PORT}`);
    console.log(`🔒 Autenticación JWT habilitada`);
    console.log(`🛡️  Headers de seguridad activos`);
  });
}

module.exports = app;