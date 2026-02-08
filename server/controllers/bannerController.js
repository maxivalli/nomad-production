const pool = require("../config/database");
const { cloudinary } = require("../config/cloudinary");

const uploadMedia = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No se proporcionó ningún archivo",
      });
    }

    const mediaType = req.file.mimetype.startsWith("video/")
      ? "video"
      : "image";

    console.log("✅ Media subida a Cloudinary:", {
      url: req.file.path,
      type: mediaType,
      filename: req.file.filename,
      size: req.file.size,
    });

    res.json({
      success: true,
      url: req.file.path,
      type: mediaType,
      filename: req.file.filename,
      size: req.file.size,
    });
  } catch (error) {
    console.error("❌ Error subiendo media:", error);
    res.status(500).json({
      error: "Error al subir el archivo",
    });
  }
};

const createBanner = async (req, res) => {
  try {
    const { media_url, media_type, start_date, end_date } = req.body;

    if (!media_url || !media_type || !start_date || !end_date) {
      return res.status(400).json({
        error: "Todos los campos son requeridos",
      });
    }

    if (media_type !== "image" && media_type !== "video") {
      return res.status(400).json({
        error: "El tipo de media debe ser 'image' o 'video'",
      });
    }

    const start = new Date(start_date);
    const end = new Date(end_date);

    if (end <= start) {
      return res.status(400).json({
        error: "La fecha de fin debe ser posterior a la fecha de inicio",
      });
    }

    const result = await pool.query(
      `INSERT INTO banners (media_url, media_type, start_date, end_date, active)
       VALUES ($1, $2, $3, $4, true)
       RETURNING *`,
      [media_url, media_type, start_date, end_date]
    );

    res.json({
      success: true,
      banner: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error creando banner:", error);
    res.status(500).json({ error: "Error al crear el banner" });
  }
};

const getAllBanners = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM banners 
       ORDER BY created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error obteniendo banners:", error);
    res.status(500).json({ error: "Error al obtener banners" });
  }
};

const getActiveBanner = async (req, res) => {
  try {
    const now = new Date();

    const result = await pool.query(
      `SELECT * FROM banners 
       WHERE active = true 
       AND start_date <= $1 
       AND end_date >= $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [now]
    );

    if (result.rows.length === 0) {
      return res.json({ banner: null });
    }

    res.json({ banner: result.rows[0] });
  } catch (error) {
    console.error("Error obteniendo banner activo:", error);
    res.status(500).json({ error: "Error al obtener banner activo" });
  }
};

const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { media_url, media_type, start_date, end_date, active } = req.body;

    if (start_date && end_date) {
      const start = new Date(start_date);
      const end = new Date(end_date);

      if (end <= start) {
        return res.status(400).json({
          error: "La fecha de fin debe ser posterior a la fecha de inicio",
        });
      }
    }

    const result = await pool.query(
      `UPDATE banners 
       SET media_url = COALESCE($1, media_url),
           media_type = COALESCE($2, media_type),
           start_date = COALESCE($3, start_date),
           end_date = COALESCE($4, end_date),
           active = COALESCE($5, active)
       WHERE id = $6
       RETURNING *`,
      [media_url, media_type, start_date, end_date, active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Banner no encontrado" });
    }

    res.json({
      success: true,
      banner: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error actualizando banner:", error);
    res.status(500).json({ error: "Error al actualizar el banner" });
  }
};

const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await pool.query("SELECT * FROM banners WHERE id = $1", [
      id,
    ]);

    if (banner.rows.length === 0) {
      return res.status(404).json({ error: "Banner no encontrado" });
    }

    const url = banner.rows[0].media_url;
    const publicIdMatch = url.match(/\/banners\/([^\.]+)/);

    if (publicIdMatch) {
      const publicId = `banners/${publicIdMatch[1]}`;
      const resourceType =
        banner.rows[0].media_type === "video" ? "video" : "image";

      try {
        await cloudinary.uploader.destroy(publicId, {
          resource_type: resourceType,
        });
        console.log("✅ Archivo eliminado de Cloudinary:", publicId);
      } catch (cloudinaryError) {
        console.error(
          "⚠️ Error eliminando archivo de Cloudinary:",
          cloudinaryError
        );
      }
    }

    await pool.query("DELETE FROM banners WHERE id = $1", [id]);

    res.json({
      success: true,
      message: "Banner eliminado correctamente",
    });
  } catch (error) {
    console.error("❌ Error eliminando banner:", error);
    res.status(500).json({ error: "Error al eliminar el banner" });
  }
};

module.exports = {
  uploadMedia,
  createBanner,
  getAllBanners,
  getActiveBanner,
  updateBanner,
  deleteBanner,
};
