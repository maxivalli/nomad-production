const pool = require("../config/database");

const getLaunchDate = async (req, res) => {
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
};

const setLaunchDate = async (req, res) => {
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
};

const getCollection = async (req, res) => {
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
};

const updateCollection = async (req, res) => {
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
};

const getCloudinaryConfig = async (req, res) => {
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
};

module.exports = {
  getLaunchDate,
  setLaunchDate,
  getCollection,
  updateCollection,
  getCloudinaryConfig,
};
