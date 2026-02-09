import { REPLICATE_CONFIG } from "../config/replicate";

class VideoGeneratorService {
  constructor() {
    // Usar backend como proxy (más seguro que llamar a Replicate directo)
    this.baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
  }

  /**
   * Crea una predicción en Replicate (a través del backend)
   * Configurado para Wan 2.2 Fast
   */
  async createPrediction(
    imageUrl,
    prompt = `
Cinematic street fashion video generated from the reference image.
Male model walking forward with subtle attitude.
Stable camera, smooth natural motion.
Clothing remains perfectly identical to the reference image.
No deformation, no warping, no flickering, no morphing.
Realistic fabric behavior, natural folds.
High-end fashion commercial style, natural lighting, sharp details.
`.trim()
  ) {
    const requestBody = {
      model: REPLICATE_CONFIG.model,
      input: {
        image: imageUrl,
        prompt,
        max_area: "832x480", // Mejor ratio para humanos
        num_frames: 81, // Frames del video
        frames_per_second: 16, // FPS final
        sample_steps: 30, // Calidad vs velocidad
        sample_guide_scale: 5, // Qué tanto sigue el prompt
        sample_shift: 3, // Timing del movimiento
      },
    };

    // Agregar versión solo si existe
    if (REPLICATE_CONFIG.version) {
      requestBody.version = REPLICATE_CONFIG.version;
    }

    const response = await fetch(`${this.baseUrl}/api/replicate/predictions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Error al crear la predicción");
    }

    return await response.json();
  }

  /**
   * Obtiene el estado de una predicción
   */
  async getPrediction(predictionId) {
    const response = await fetch(
      `${this.baseUrl}/api/replicate/predictions/${predictionId}`,
      {
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Error al obtener el estado de la predicción");
    }

    return await response.json();
  }

  /**
   * Espera a que la predicción termine (polling)
   */
  async waitForPrediction(predictionId, onProgress) {
    let attempts = 0;
    const maxAttempts = 120; // 2 minutos

    while (attempts < maxAttempts) {
      const prediction = await this.getPrediction(predictionId);

      if (prediction.status === "succeeded") {
        onProgress?.({
          status: "complete",
          message: "Video generado exitosamente",
          progress: 100,
        });
        return prediction;
      }

      if (prediction.status === "failed") {
        throw new Error(prediction.error || "La generación del video falló");
      }

      if (prediction.status === "canceled") {
        throw new Error("La generación fue cancelada");
      }

      // Progreso estimado (Wan 2.2 Fast ~40s)
      const estimatedTime = 40;
      const elapsedTime = attempts;
      const progress = Math.min((elapsedTime / estimatedTime) * 90, 90);

      onProgress?.({
        status: "processing",
        message: "Generando video con Wan 2.2 Fast...",
        progress,
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempts++;
    }

    throw new Error("Timeout: La generación tomó demasiado tiempo");
  }

  /**
   * Descarga el video generado
   */
  async downloadVideo(videoUrl) {
    const response = await fetch(videoUrl);
    if (!response.ok) {
      throw new Error("Error al descargar el video");
    }
    return await response.blob();
  }

  /**
   * Genera un video a partir de una imagen
   */
  async generateVideoFromImage(imageUrl, onProgress) {
    try {
      console.log("🎬 Iniciando generación de video...");

      onProgress?.({
        status: "loading",
        message: "Iniciando generación con Wan 2.2 Fast...",
        progress: 5,
      });

      // 1. Crear predicción
      const prediction = await this.createPrediction(imageUrl);

      console.log("✅ Predicción creada:", prediction.id);

      onProgress?.({
        status: "processing",
        message: "Video en proceso (~40 segundos)...",
        progress: 10,
      });

      // 2. Esperar resultado
      const completedPrediction = await this.waitForPrediction(
        prediction.id,
        onProgress
      );

      console.log("✅ Predicción completada");

      onProgress?.({
        status: "downloading",
        message: "Descargando video generado...",
        progress: 95,
      });

      // 3. Obtener URL del video (array o string)
      const videoUrl = Array.isArray(completedPrediction.output)
        ? completedPrediction.output[0]
        : completedPrediction.output;

      if (!videoUrl) {
        throw new Error("No se recibió la URL del video");
      }

      const videoBlob = await this.downloadVideo(videoUrl);
      const localVideoUrl = URL.createObjectURL(videoBlob);

      onProgress?.({
        status: "complete",
        message: "Video generado exitosamente",
        progress: 100,
      });

      return {
        success: true,
        videoUrl: localVideoUrl,
        videoBlob,
        replicateUrl: videoUrl,
      };
    } catch (error) {
      console.error("❌ Error generando video:", error);

      onProgress?.({
        status: "error",
        message: error.message || "Error al generar el video",
        progress: 0,
      });

      return {
        success: false,
        error: error.message || "Error desconocido",
      };
    }
  }

  /**
   * Sube el video generado a Cloudinary
   */
  async uploadVideoToCloudinary(videoBlob, cloudinaryConfig, productTitle) {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append("file", videoBlob);
      formData.append("upload_preset", cloudinaryConfig.uploadPreset);

      const cleanTitle = productTitle
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-");

      formData.append(
        "public_id",
        `nomad-video-${cleanTitle}-${Date.now()}`
      );
      formData.append("resource_type", "video");

      fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/video/upload`,
        {
          method: "POST",
          body: formData,
        }
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.secure_url) {
            resolve(data.secure_url);
          } else {
            reject(new Error("No se recibió URL del video"));
          }
        })
        .catch(reject);
    });
  }
}

export const videoGenerator = new VideoGeneratorService();
