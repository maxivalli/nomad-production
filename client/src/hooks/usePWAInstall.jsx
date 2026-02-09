// hooks/usePWAInstall.js
// Hook centralizado para manejar la instalación de PWA
// Usa Context API para compartir el estado del prompt entre todos los componentes

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Context para compartir el estado del prompt
const PWAContext = createContext(null);

// Provider que debe envolver la app
export const PWAProvider = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState('unknown');

  useEffect(() => {
    console.log('[PWA Provider] Inicializando...');

    // 1. Detectar plataforma
    const detectPlatform = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
      if (/android/.test(userAgent)) return 'android';
      return 'desktop';
    };
    const detectedPlatform = detectPlatform();
    setPlatform(detectedPlatform);
    console.log('[PWA Provider] Plataforma detectada:', detectedPlatform);

    // 2. Detectar si ya está instalada
    const checkIfInstalled = () => {
      // Verificar si se está ejecutando como PWA instalada
      if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('[PWA Provider] App ya instalada (standalone mode)');
        return true;
      }
      // iOS Safari check
      if (window.navigator.standalone === true) {
        console.log('[PWA Provider] App ya instalada (iOS standalone)');
        return true;
      }
      return false;
    };

    if (checkIfInstalled()) {
      setIsInstalled(true);
      return; // Si ya está instalada, no necesitamos escuchar eventos
    }

    // 3. Capturar evento de instalación (solo Android/Desktop)
    const handleBeforeInstallPrompt = (e) => {
      console.log('[PWA Provider] beforeinstallprompt capturado!');
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 4. Detectar cuando se instala la app
    const handleAppInstalled = () => {
      console.log('[PWA Provider] App instalada exitosamente');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Función para instalar la PWA
  const installPWA = useCallback(async () => {
    console.log('[PWA Provider] installPWA llamado, deferredPrompt:', !!deferredPrompt);

    if (!deferredPrompt) {
      console.warn('[PWA Provider] No hay prompt disponible');
      return { success: false, reason: 'no-prompt' };
    }

    try {
      // Mostrar el prompt nativo
      console.log('[PWA Provider] Mostrando prompt nativo...');
      deferredPrompt.prompt();
      
      // Esperar la decisión del usuario
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`[PWA Provider] Usuario ${outcome === 'accepted' ? 'aceptó' : 'rechazó'}`);

      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstallable(false);
        return { success: true, outcome };
      }

      return { success: false, outcome };
    } catch (error) {
      console.error('[PWA Provider] Error:', error);
      return { success: false, error };
    }
  }, [deferredPrompt]);

  // Verificar si puede mostrar el prompt
  const canShowPrompt = useCallback(() => {
    const canShow = isInstallable && !isInstalled && deferredPrompt !== null;
    console.log('[PWA Provider] canShowPrompt:', canShow, { isInstallable, isInstalled, hasDeferredPrompt: !!deferredPrompt });
    return canShow;
  }, [isInstallable, isInstalled, deferredPrompt]);

  const value = {
    deferredPrompt,
    isInstallable,
    isInstalled,
    platform,
    installPWA,
    canShowPrompt,
  };

  return <PWAContext.Provider value={value}>{children}</PWAContext.Provider>;
};

// Hook para usar el contexto
export const usePWAInstall = () => {
  const context = useContext(PWAContext);
  
  if (!context) {
    throw new Error('usePWAInstall debe usarse dentro de PWAProvider');
  }
  
  return context;
};