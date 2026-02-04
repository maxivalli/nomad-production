import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import usePushNotifications from '../hooks/usePushNotifications';

const PushNotificationPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  
  const {
    isSupported,
    permission,
    isSubscribed,
    loading,
    subscribe,
  } = usePushNotifications();

  useEffect(() => {
    // Mostrar el prompt después de 10 segundos si:
    // - El navegador soporta notificaciones
    // - El usuario no ha otorgado/denegado permiso
    // - No se ha suscrito
    // - No ha sido descartado previamente
    const timer = setTimeout(() => {
      const hasBeenDismissed = localStorage.getItem('notification-prompt-dismissed');
      
      if (
        isSupported && 
        permission === 'default' && 
        !isSubscribed && 
        !hasBeenDismissed
      ) {
        setShowPrompt(true);
      }
    }, 10000); // 10 segundos

    return () => clearTimeout(timer);
  }, [isSupported, permission, isSubscribed]);

  const handleSubscribe = async () => {
    try {
      await subscribe();
      setShowPrompt(false);
    } catch (error) {
      console.error('Error al suscribirse:', error);
      alert('No se pudo activar las notificaciones. Por favor, verifica los permisos del navegador.');
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('notification-prompt-dismissed', 'true');
  };

  if (!showPrompt || !isSupported) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-96 z-50 animate-slide-up">
      <div className="bg-black border border-white/20 rounded-lg shadow-2xl p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-2 rounded-full">
              <Bell size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm uppercase tracking-wider">
                Ofertas Exclusivas
              </h3>
              <p className="text-white/60 text-xs">
                NOMAD® Wear
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/40 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <p className="text-white/80 text-sm mb-4">
          ¿Querés recibir notificaciones sobre nuevos drops, descuentos exclusivos y ofertas especiales?
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2.5 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
          >
            {loading ? 'Activando...' : 'Activar'}
          </button>
          <button
            onClick={handleDismiss}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white text-sm font-bold py-2.5 px-4 rounded transition-colors uppercase tracking-wider"
          >
            Ahora no
          </button>
        </div>
      </div>
    </div>
  );
};

export default PushNotificationPrompt;
