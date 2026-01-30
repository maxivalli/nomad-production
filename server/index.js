const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
require("dotenv").config();

const app = express();

// ==========================================
// CONFIGURACIÓN DE SEGURIDAD
// ==========================================

app.set("trust proxy", 1);

// Helmet para headers de seguridad
app.use(
  helmet({
    contentSecurityPolicy: false, // Ajustar según necesidad
    crossOriginEmbedderPolicy: false,
  }),
);

// CORS configurado correctamente
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true, // Permitir cookies
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// Rate limiting para prevenir ataques
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 requests por ventana
  message: "Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.",
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Solo 5 intentos de login en 15 minutos
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
    // Tabla de productos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        img TEXT[] NOT NULL, 
        sizes TEXT[],
        purchase_link TEXT,
        color TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Migración: Agregar columnas si no existen
    await pool.query(`
      ALTER TABLE products 
        ADD COLUMN IF NOT EXISTS purchase_link TEXT,
        ADD COLUMN IF NOT EXISTS color TEXT,
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        ALTER TABLE settings 
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);

    // Tabla de configuración
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      INSERT INTO settings (key, value) VALUES ('current_collection', 'AUTUMN COLLECTION 2026')
      ON CONFLICT DO NOTHING;
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

    // Agrega esta línea para convertir la columna si ya existe y es de tipo texto:
    await pool.query(`
      DO $$ 
      BEGIN 
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='color' AND data_type='text') THEN
      ALTER TABLE products ALTER COLUMN color TYPE TEXT[] USING array[color];
    END IF;
  END $$;
`);

    // Crear usuario admin por defecto si no existe
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

// ==========================================
// ESQUEMAS DE VALIDACIÓN JOI
// ==========================================

const productSchema = Joi.object({
  title: Joi.string().min(3).max(255).required().messages({
    "string.min": "El título debe tener al menos 3 caracteres",
    "string.max": "El título no puede exceder 255 caracteres",
    "any.required": "El título es obligatorio",
  }),
  description: Joi.string().min(10).required().messages({
    "string.min": "La descripción debe tener al menos 10 caracteres",
    "any.required": "La descripción es obligatoria",
  }),
  img: Joi.array().items(Joi.string().uri()).min(1).max(3).required().messages({
    "array.min": "Debes proporcionar al menos 1 imagen",
    "array.max": "No puedes subir más de 3 imágenes",
    "any.required": "Las imágenes son obligatorias",
  }),
  sizes: Joi.array()
    .items(Joi.string().valid("S", "M", "L", "XL"))
    .default([]),
  purchase_link: Joi.string().uri().allow("").default(""),
  color: Joi.array().items(Joi.string().max(50)).default([]).messages({
    "array.base": "El campo color debe ser una lista de colores",
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
// RUTAS DE AUTENTICACIÓN
// ==========================================

app.post("/api/auth/login", authLimiter, async (req, res) => {
  try {
    // Validar entrada
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Datos inválidos",
        message: error.details[0].message,
      });
    }

    const { username, password } = req.body;

    // Buscar admin en la base de datos
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

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, admin.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        error: "Credenciales inválidas",
        message: "Usuario o contraseña incorrectos",
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        id: admin.id,
        username: admin.username,
        admin: true,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    // Enviar token como cookie HTTP-only
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
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
      message: "Ocurrió un error al procesar la solicitud",
    });
  }
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("authToken");
  res.json({ success: true, message: "Sesión cerrada" });
});

app.get("/api/auth/verify", authenticateAdmin, (req, res) => {
  res.json({
    authenticated: true,
    user: { username: req.admin.username },
  });
});

// ==========================================
// RUTA DE PREVISUALIZACIÓN (WHATSAPP/SOCIAL)
// ==========================================

app.get("/share/:slug", async (req, res) => {
  const { slug } = req.params;
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
      return res.redirect(FRONTEND_URL);
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
    
    console.log("4. Titulo generado:", tituloFinal);

    const desc = producto.description
      ? producto.description.substring(0, 150) + "..."
      : "Explora nuestra nueva colección.";
    const imagen = Array.isArray(producto.img) ? producto.img[0] : producto.img;

    // IMPORTANTE: fíjate en las comillas dobles en content="${tituloFinal}"
    // Si no hay comillas, WhatsApp corta en el espacio.
    res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>${tituloFinal}</title>
        <meta property="og:title" content="${tituloFinal}">
        <meta property="og:description" content="${desc}">
        <meta property="og:image" content="${imagen}">
        <meta property="og:type" content="website">
        <meta property="og:url" content="${FRONTEND_URL}/#/producto/${slug}">
        
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
    res.redirect(FRONTEND_URL);
  }
});

// ==========================================
// RUTAS DE PRODUCTOS (PROTEGIDAS)
// ==========================================

// GET: Obtener todos los productos (PÚBLICA)
app.get("/api/products", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM products ORDER BY created_at DESC",
    );

    // Normalizar imágenes como array
    const normalizedProducts = result.rows.map((product) => ({
      ...product,
      img: Array.isArray(product.img) ? product.img : [product.img],
      color: Array.isArray(product.color)
        ? product.color
        : product.color
          ? [product.color]
          : [],
    }));

    res.json(normalizedProducts);
  } catch (err) {
    console.error("Error al obtener productos:", err);
    res.status(500).json({
      error: "Error del servidor",
      message: "No se pudieron cargar los productos",
    });
  }
});

// POST: Crear producto (PROTEGIDA)
app.post("/api/products", authenticateAdmin, async (req, res) => {
  try {
    // Validar datos
    const { error, value } = productSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Datos inválidos",
        message: error.details[0].message,
      });
    }

    const { title, description, img, sizes, purchase_link, color } = value;

    const result = await pool.query(
      `INSERT INTO products (title, description, img, sizes, purchase_link, color) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, description, img, sizes, purchase_link, color],
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

// PUT: Actualizar producto (PROTEGIDA)
app.put("/api/products/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que el ID sea un número
    if (isNaN(id)) {
      return res.status(400).json({
        error: "ID inválido",
        message: "El ID del producto debe ser un número",
      });
    }

    // Validar datos
    const { error, value } = productSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Datos inválidos",
        message: error.details[0].message,
      });
    }

    const { title, description, img, sizes, purchase_link, color } = value;

    const result = await pool.query(
      `UPDATE products 
       SET title = $1, description = $2, img = $3, sizes = $4, 
           purchase_link = $5, color = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 RETURNING *`,
      [title, description, img, sizes, purchase_link, color, id],
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

// DELETE: Eliminar producto (PROTEGIDA)
app.delete("/api/products/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que el ID sea un número
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
// RUTAS DE CONFIGURACIÓN (PROTEGIDAS)
// ==========================================

// GET: Fecha de lanzamiento
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

// POST: Actualizar fecha de lanzamiento (PROTEGIDA)
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

// GET: Nombre de colección
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

// PUT: Actualizar colección (PROTEGIDA)
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
      `UPDATE settings 
       SET value = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE key = 'current_collection'`,
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
// RUTA PARA CLOUDINARY (PROTEGIDA)
// ==========================================

app.post("/api/cloudinary/signature", authenticateAdmin, async (req, res) => {
  try {
    // Aquí podrías generar una firma para Cloudinary
    // Por ahora devolvemos la config que el frontend necesita
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
