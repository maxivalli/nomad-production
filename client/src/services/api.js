// services/api.js
// Servicio centralizado para todas las llamadas a la API
// ✅ ACTUALIZADO: Con soporte para upload de imágenes en notificaciones push

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

class ApiService {
  // Método auxiliar para hacer fetch con manejo de errores
  async request(endpoint, options = {}) {
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Importante para enviar cookies
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      // Si no es exitoso, lanzar error con el mensaje del servidor
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error en ${endpoint}:`, error);
      throw error;
    }
  }

  // ==========================================
  // AUTENTICACIÓN
  // ==========================================

  async login(username, password) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async logout() {
    return this.request('/api/auth/logout', {
      method: 'POST',
    });
  }

  async verifyAuth() {
    return this.request('/api/auth/verify');
  }

  // ==========================================
  // PRODUCTOS
  // ==========================================

  async getProducts() {
    return this.request('/api/products');
  }

  async createProduct(productData) {
    return this.request('/api/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id, productData) {
    return this.request(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id) {
    return this.request(`/api/products/${id}`, {
      method: 'DELETE',
    });
  }

  // ==========================================
  // CONFIGURACIÓN
  // ==========================================

  async getLaunchDate() {
    return this.request('/api/settings/launch-date');
  }

  async setLaunchDate(date) {
    return this.request('/api/settings/launch-date', {
      method: 'POST',
      body: JSON.stringify({ date }),
    });
  }

  async getCollection() {
    return this.request('/api/settings/collection');
  }

  async updateCollection(value) {
    return this.request('/api/settings/collection', {
      method: 'PUT',
      body: JSON.stringify({ value }),
    });
  }

  // ==========================================
  // CLOUDINARY
  // ==========================================

  async getCloudinaryConfig() {
    return this.request('/api/cloudinary/signature', {
      method: 'POST',
    });
  }

  // ==========================================
  // PUSH NOTIFICATIONS
  // ==========================================

  async getVapidPublicKey() {
    return this.request('/api/push/vapid-public-key');
  }

  async subscribeToPush(subscription) {
    return this.request('/api/push/subscribe', {
      method: 'POST',
      body: JSON.stringify(subscription),
    });
  }

  async unsubscribeFromPush(endpoint) {
    return this.request('/api/push/unsubscribe', {
      method: 'POST',
      body: JSON.stringify({ endpoint }),
    });
  }

  async getPushStats() {
    return this.request('/api/push/stats');
  }

  // ✅ ACTUALIZADO: Enviar notificación push CON SOPORTE DE IMAGEN
  async sendPushNotification(notificationData) {
    return this.request('/api/push/send', {
      method: 'POST',
      body: JSON.stringify({
        title: notificationData.title,
        body: notificationData.body,
        url: notificationData.url || '/',
        image: notificationData.image || null, // ✅ NUEVO: Incluir imagen
        tag: notificationData.tag || 'nomad-notification'
      }),
    });
  }

  async getPushHistory() {
    return this.request('/api/push/history');
  }

  // ✅ NUEVO: Subir imagen para notificación push
  async uploadPushImage(formData) {
    try {
      // Para upload de archivos, NO incluir Content-Type en headers
      // El browser lo maneja automáticamente con el boundary correcto
      const response = await fetch(`${API_BASE_URL}/api/push/upload-image`, {
        method: 'POST',
        credentials: 'include',
        body: formData // FormData se envía directamente
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Error al subir imagen');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en uploadPushImage:', error);
      throw error;
    }
  }

  // ✅ NUEVO: Eliminar imagen de notificación
  async deletePushImage(filename) {
    return this.request(`/api/push/delete-image/${filename}`, {
      method: 'DELETE',
    });
  }

  // ✅ NUEVO: Listar imágenes subidas
  async getPushImages() {
    try {
      const data = await this.request('/api/push/images');
      return data.images || [];
    } catch (error) {
      console.error('Error en getPushImages:', error);
      return [];
    }
  }
}

export default new ApiService();