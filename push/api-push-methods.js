// ==========================================
// CÓDIGO PARA AGREGAR AL client/src/services/api.js
// ==========================================

// Agregar estos métodos al objeto que exportas (al final del archivo)

// PUSH NOTIFICATIONS
getVapidPublicKey: async () => {
  return axios.get(`${API_URL}/push/vapid-public-key`);
},

subscribeToPush: async (subscription) => {
  return axios.post(`${API_URL}/push/subscribe`, subscription);
},

unsubscribeFromPush: async (endpoint) => {
  return axios.post(`${API_URL}/push/unsubscribe`, { endpoint });
},

getPushStats: async () => {
  return axios.get(`${API_URL}/push/stats`, {
    headers: { Authorization: `Bearer ${getAuthToken()}` }
  });
},

sendPushNotification: async (notificationData) => {
  return axios.post(`${API_URL}/push/send`, notificationData, {
    headers: { Authorization: `Bearer ${getAuthToken()}` }
  });
},

getPushHistory: async () => {
  return axios.get(`${API_URL}/push/history`, {
    headers: { Authorization: `Bearer ${getAuthToken()}` }
  });
},

// NOTA: Asegúrate de que getAuthToken() esté definido en tu archivo
// Si no lo tienes, agrega algo como:
// const getAuthToken = () => localStorage.getItem('token') || '';
