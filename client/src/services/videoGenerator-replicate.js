import { REPLICATE_CONFIG } from '../config/replicate';

class VideoGeneratorService {
  constructor() {
    // Cambiar para usar el backend en lugar de Replicate directamente
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  }

  /**
   * Crea una predicción en Replicate (a través del backend)
   */
  async createPrediction(imageUrl) {
    const response = await fetch(`${this.baseUrl}/api/replicate/predictions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Usar cookies en lugar de Bearer token
      body: JSON.stringify({
        version: REPLICATE_CONFIG.version,
        input: {
          image: imageUrl,
          motion_bucket_id: 127,        // Controla intensidad del movimiento (1-255)
          fps: 6,                        // Frames por segundo
          num_frames: 25,                // Total de frames (max 25)
          cond_aug: 0.02,                // Augmentación condicional
          decoding_t: 14,                // Pasos de decodificación
          num_inference_steps: 25,       // Pasos de inferencia
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al crear la predicción');
    }

    return await response.json();
  }

  /**
   * Obtiene el estado de una predicción (a través del backend)
   */
  async getPrediction(predictionId) {
    const response = await fetch(`${this.baseUrl}/api/replicate/predictions/${predictionId}`, {
      credentials: 'include', // Usar cookies en lugar de Bearer token
    });

    if (!response.ok) {
      throw new Error('Error al obtener el estado de la predicción');
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

      if (prediction.status === 'succeeded') {
        return prediction;
      }

      if (prediction.status === 'failed') {
        throw new Error(prediction.error || 'La generación del video falló');
      }

      if (prediction.status === 'canceled') {
        throw new Error('La generación fue cancelada');
      }

      // Actualizar progreso
      const progress = Math.min((attempts / maxAttempts) * 100, 90);
      onProgress?.({ 
        status: 'processing', 
        message: `Generando video... ${Math.round(progress)}%`,
        progress 
      });

      // Esperar 1 segundo antes de volver a consultar
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }

    throw new Error('Timeout: La generación tomó demasiado tiempo');
  }

  /**
   * Descarga el video generado y lo convierte a Blob
   */
  async downloadVideo(videoUrl) {
    const response = await fetch(videoUrl);
    if (!response.ok) {
      throw new Error('Error al descargar el video');
    }
    return await response.blob();
  }

  /**
   * Genera un video a partir de una imagen usando Replicate
   */
  async generateVideoFromImage(imageUrl, onProgress) {
    try {
      onProgress?.({ status: 'loading', message: 'Iniciando generación en Replicate...', progress: 0 });

      // 1. Crear la predicción
      const prediction = await this.createPrediction(imageUrl);
      
      onProgress?.({ 
        status: 'processing', 
        message: 'Video en proceso de generación...', 
        progress: 10 
      });

      // 2. Esperar a que termine
      const completedPrediction = await this.waitForPrediction(prediction.id, onProgress);

      onProgress?.({ 
        status: 'processing', 
        message: 'Descargando video generado...', 
        progress: 95 
      });

      // 3. Descargar el video
      const videoUrl = completedPrediction.output;
      if (!videoUrl) {
        throw new Error('No se generó URL del video');
      }

      const videoBlob = await this.downloadVideo(videoUrl);
      const localVideoUrl = URL.createObjectURL(videoBlob);

      onProgress?.({ 
        status: 'complete', 
        message: 'Video generado exitosamente', 
        progress: 100 
      });

      return {
        success: true,
        videoUrl: localVideoUrl,
        videoBlob,
        replicateUrl: videoUrl, // URL original de Replicate (por si la necesitas)
      };

    } catch (error) {
      console.error('Error generando video:', error);
      
      onProgress?.({ 
        status: 'error', 
        message: error.message || 'Error al generar el video',
        progress: 0
      });

      return {
        success: false,
        error: error.message || 'Error desconocido',
      };
    }
  }

  /**
   * Sube el video generado a Cloudinary
   */
  async uploadVideoToCloudinary(videoBlob, cloudinaryConfig, productTitle) {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', videoBlob);
      formData.append('upload_preset', cloudinaryConfig.uploadPreset);
      
      // Generar nombre optimizado para el video
      const cleanTitle = productTitle
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-');
      
      formData.append('public_id', `nomad-video-${cleanTitle}-${Date.now()}`);
      formData.append('resource_type', 'video');

      fetch(`https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/video/upload`, {
        method: 'POST',
        body: formData,
      })
        .then(response => response.json())
        .then(data => {
          if (data.secure_url) {
            resolve(data.secure_url);
          } else {
            reject(new Error('No se recibió URL del video'));
          }
        })
        .catch(reject);
    });
  }
}

export const videoGenerator = new VideoGeneratorService();
