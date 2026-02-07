// Reemplaza todo el archivo videoGenerator-replicate.js con esta versión corregida:

import { REPLICATE_CONFIG } from "../config/replicate";

class VideoGeneratorService {
  constructor() {
    // Cambiar para usar el backend en lugar de Replicate directamente
    this.baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
  }

  /**
   * Crea una predicción en Replicate (a través del backend)
   * Actualizado para Wan 2.2 Fast
   */
  async createPrediction(
    imageUrl,
    prompt = "Cinematic fashion video generated from the reference imag. Ultra realistic, high quality, smooth motion, no distortion",
  ) {
    const requestBody = {
      model: REPLICATE_CONFIG.model,
      input: {
        image: imageUrl,
        prompt: prompt,
        max_area: "832x480", // Resolución 480p (rápido y económico)
        num_frames: 81, // Número de frames (25-177 disponibles)
        frames_per_second: 16, // FPS del video resultante
        sample_steps: 30, // Pasos de muestreo (calidad vs velocidad)
        sample_guide_scale: 5, // Guidance scale para seguir el prompt
        sample_shift: 3, // Control de timing del movimiento
      },
    };

    // Solo agregar version si está definida en la config
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
   * Obtiene el estado de una predicción (a través del backend)
   */
  async getPrediction(predictionId) {
    const response = await fetch(
      `${this.baseUrl}/api/replicate/predictions/${predictionId}`,
      {
        credentials: "include",
      },
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
    const maxAttempts = 120; // 2 minutos máximo (1 seg por intento)

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

      // CORRECCIÓN: Calcular progreso basado en el tiempo estimado
      // Wan 2.2 Fast toma ~40 segundos, así que usamos una escala realista
      const estimatedTime = 40; // segundos estimados
      const elapsedTime = attempts; // segundos transcurridos
      const progress = Math.min((elapsedTime / estimatedTime) * 90, 90); // Máximo 90% durante procesamiento

      onProgress?.({
        status: "processing",
        message: `Generando video con Wan 2.2`,
        progress,
      });

      // Esperar 1 segundo antes de volver a consultar
      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempts++;
    }

    throw new Error("Timeout: La generación tomó demasiado tiempo");
  }

  /**
   * Descarga el video generado y lo convierte a Blob
   */
  async downloadVideo(videoUrl) {
    const response = await fetch(videoUrl);
    if (!response.ok) {
      throw new Error("Error al descargar el video");
    }
    return await response.blob();
  }

  /**
   * Genera un video a partir de una imagen usando Replicate (Wan 2.2 Fast)
   */
  async generateVideoFromImage(imageUrl, onProgress) {
    try {
      console.log("🎬 Iniciando generación de video...");

      onProgress?.({
        status: "loading",
        message: "Iniciando generación con Wan 2.2 Fast...",
        progress: 5,
      });

      // 1. Crear la predicción
      const prediction = await this.createPrediction(imageUrl);

      console.log("✅ Predicción creada:", prediction.id);

      onProgress?.({
        status: "processing",
        message: "Video en proceso de generación (esto toma ~40 segundos)...",
        progress: 10,
      });

      // 2. Esperar a que termine
      const completedPrediction = await this.waitForPrediction(
        prediction.id,
        onProgress,
      );

      console.log("✅ Predicción completada");

      onProgress?.({
        status: "downloading",
        message: "Descargando video generado...",
        progress: 95,
      });

      // 3. Descargar el video
      const videoUrl = completedPrediction.output;
      if (!videoUrl) {
        throw new Error("No se generó URL del video");
      }

      const videoBlob = await this.downloadVideo(videoUrl);
      const localVideoUrl = URL.createObjectURL(videoBlob);

      console.log("✅ Video descargado y listo");

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

      // Generar nombre optimizado para el video
      const cleanTitle = productTitle
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-");

      formData.append("public_id", `nomad-video-${cleanTitle}-${Date.now()}`);
      formData.append("resource_type", "video");

      fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/video/upload`,
        {
          method: "POST",
          body: formData,
        },
      )
        .then((response) => response.json())
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
