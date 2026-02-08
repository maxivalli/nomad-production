const { cloudinary } = require("../config/cloudinary");

const uploadVideo = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No se proporcionó ningún video",
      });
    }

    console.log("✅ Video AI subido a Cloudinary:", {
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
    console.error("❌ Error subiendo video:", error);
    res.status(500).json({
      error: "Error al subir el video",
    });
  }
};

const deleteVideo = async (req, res) => {
  try {
    const { public_id } = req.params;
    
    const decodedPublicId = decodeURIComponent(public_id);

    const result = await cloudinary.uploader.destroy(decodedPublicId, {
      resource_type: "video",
    });

    if (result.result !== "ok") {
      return res.status(404).json({
        error: "Video no encontrado en Cloudinary",
        details: result,
      });
    }

    console.log("✅ Video AI eliminado de Cloudinary:", decodedPublicId);

    res.json({
      success: true,
      message: "Video eliminado correctamente",
    });
  } catch (error) {
    console.error("❌ Error eliminando video:", error);
    res.status(500).json({
      error: "Error al eliminar el video",
    });
  }
};

const listVideos = async (req, res) => {
  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: "ai-videos/",
      resource_type: "video",
      max_results: 100,
    });

    const videos = result.resources.map((resource) => ({
      filename: resource.public_id,
      url: resource.secure_url,
      size: resource.bytes,
      uploadedAt: resource.created_at,
      duration: resource.duration,
      format: resource.format,
    }));

    res.json({
      success: true,
      videos,
      count: videos.length,
    });
  } catch (error) {
    console.error("❌ Error listando videos:", error);
    res.status(500).json({
      error: "Error al listar videos",
    });
  }
};

module.exports = {
  uploadVideo,
  deleteVideo,
  listVideos,
};
