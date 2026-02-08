const { cloudinary } = require("../config/cloudinary");

const uploadImage = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No se proporcionó ninguna imagen",
      });
    }

    console.log("✅ Imagen subida a Cloudinary:", {
      url: req.file.path,
      filename: req.file.filename,
      size: req.file.size,
    });

    res.json({
      success: true,
      url: req.file.path,
      filename: req.file.filename,
      size: req.file.size,
    });
  } catch (error) {
    console.error("❌ Error subiendo imagen:", error);
    res.status(500).json({
      error: "Error al subir la imagen",
    });
  }
};

const deleteImage = async (req, res) => {
  try {
    const { public_id } = req.params;
    
    const decodedPublicId = decodeURIComponent(public_id);

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
};

const listImages = async (req, res) => {
  try {
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
};

module.exports = {
  uploadImage,
  deleteImage,
  listImages,
};
