const express = require("express");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();

// Configuración
const { helmetConfig, corsOptions, apiLimiter } = require("./config/security");
const initDB = require("./models/initDB");
const errorHandler = require("./middleware/errorHandler");

// Rutas
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const cloudinaryRoutes = require("./routes/cloudinaryRoutes");
const pushRoutes = require("./routes/pushRoutes");
const bannerRoutes = require("./routes/bannerRoutes");
const videoRoutes = require("./routes/videoRoutes");
const replicateRoutes = require("./routes/replicateRoutes");
const shareRoutes = require("./routes/shareRoutes");

// ==========================================
// MIDDLEWARE GLOBAL
// ==========================================

app.set("trust proxy", 1);
app.use(helmetConfig);
app.use(corsOptions);
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use("/api/", apiLimiter);

// ==========================================
// INICIALIZACIÓN DE BASE DE DATOS
// ==========================================

initDB();

// ==========================================
// RUTAS
// ==========================================

// Ruta de compartir (SSR) - debe ir antes de las rutas API
app.use("/share", shareRoutes);

// Rutas API
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/cloudinary", cloudinaryRoutes);
app.use("/api/push", pushRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/replicate", replicateRoutes);

// ==========================================
// MANEJO DE ERRORES
// ==========================================

app.use(errorHandler);

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
