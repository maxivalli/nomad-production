import { useState, useEffect } from 'react';
import api from '../services/api';

const usePushNotifications = () => {
  const [permission, setPermission] = useState(Notification.permission);
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);

  // Verificar soporte
  useEffect(() => {
    const checkSupport = () => {
      const supported = 
        'serviceWorker' in navigator && 
        'PushManager' in window && 
        'Notification' in window;
      
      setIsSupported(supported);
      
      if (supported) {
        checkSubscription();
      }
    };

    checkSupport();
  }, []);

  // Verificar suscripción existente
  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      
      if (sub) {
        setSubscription(sub);
        setIsSubscribed(true);
      } else {
        setIsSubscribed(false);
      }
    } catch (error) {
      console.error('Error verificando suscripción:', error);
    }
  };

  // Solicitar permiso
  const requestPermission = async () => {
    if (!isSupported) {
      throw new Error('Las notificaciones no están soportadas en este navegador');
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        return true;
      } else {
        throw new Error('Permiso denegado');
      }
    } catch (error) {
      console.error('Error solicitando permiso:', error);
      throw error;
    }
  };

  // Suscribirse a notificaciones
  const subscribe = async () => {
    if (!isSupported) {
      throw new Error('Las notificaciones no están soportadas');
    }

    setLoading(true);

    try {
      // Solicitar permiso si no lo tenemos
      if (permission !== 'granted') {
        await requestPermission();
      }

      // Obtener el service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Obtener la clave pública del servidor
      const response = await api.getVapidPublicKey();
      const vapidPublicKey = response.data.publicKey;

      // Convertir la clave a formato Uint8Array
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

      // Crear la suscripción
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });

      // Enviar la suscripción al servidor
      await api.subscribeToPush(newSubscription);

      setSubscription(newSubscription);
      setIsSubscribed(true);

      return newSubscription;
    } catch (error) {
      console.error('Error suscribiéndose:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Desuscribirse
  const unsubscribe = async () => {
    if (!subscription) {
      return;
    }

    setLoading(true);

    try {
      // Desuscribirse en el navegador
      await subscription.unsubscribe();

      // Notificar al servidor
      await api.unsubscribeFromPush(subscription.endpoint);

      setSubscription(null);
      setIsSubscribed(false);
    } catch (error) {
      console.error('Error desuscribiéndose:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    isSupported,
    permission,
    isSubscribed,
    subscription,
    loading,
    subscribe,
    unsubscribe,
    requestPermission
  };
};

// Función auxiliar para convertir la clave VAPID
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default usePushNotifications;
