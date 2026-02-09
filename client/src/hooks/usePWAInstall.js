// hooks/usePWAInstall.js
// Hook centralizado para manejar la instalación de PWA

import { useState, useEffect, useCallback } from 'react';

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState('unknown');

  useEffect(() => {
    // 1. Detectar plataforma
    const detectPlatform = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
      if (/android/.test(userAgent)) return 'android';
      return 'desktop';
    };
    setPlatform(detectPlatform());

    // 2. Detectar si ya está instalada
    const checkIfInstalled = () => {
      // Verificar si se está ejecutando como PWA instalada
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return true;
      }
      // iOS Safari check
      if (window.navigator.standalone === true) {
        setIsInstalled(true);
        return true;
      }
      return false;
    };

    if (checkIfInstalled()) {
      return; // Si ya está instalada, no necesitamos hacer nada más
    }

    // 3. Capturar evento de instalación (solo Android/Desktop)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      console.log('[PWA] Prompt de instalación capturado');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 4. Detectar cuando se instala la app
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log('[PWA] App instalada exitosamente');
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
    if (!deferredPrompt) {
      console.warn('[PWA] No hay prompt de instalación disponible');
      return { success: false, reason: 'no-prompt' };
    }

    try {
      // Mostrar el prompt nativo
      deferredPrompt.prompt();
      
      // Esperar la decisión del usuario
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log(`[PWA] Usuario ${outcome === 'accepted' ? 'aceptó' : 'rechazó'} la instalación`);

      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstallable(false);
        return { success: true, outcome };
      }

      return { success: false, outcome };
    } catch (error) {
      console.error('[PWA] Error al instalar:', error);
      return { success: false, error };
    }
  }, [deferredPrompt]);

  // Verificar si puede mostrar el prompt
  const canShowPrompt = useCallback(() => {
    return isInstallable && !isInstalled && deferredPrompt !== null;
  }, [isInstallable, isInstalled, deferredPrompt]);

  return {
    // Estados
    isInstallable,    // true si se puede instalar (hay deferredPrompt)
    isInstalled,      // true si ya está instalada
    platform,         // 'ios' | 'android' | 'desktop'
    
    // Funciones
    installPWA,       // Función para disparar la instalación
    canShowPrompt,    // Helper para verificar si puede mostrar el prompt
    
    // Raw prompt (por si se necesita acceso directo)
    deferredPrompt,
  };
};