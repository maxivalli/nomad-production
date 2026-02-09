// components/PWAInstallButton.jsx
// Botón reutilizable para instalar la PWA en diferentes contextos

import React from 'react';
import { motion } from 'framer-motion';
import { Download, Smartphone, CheckCircle } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

const PWAInstallButton = ({ 
  variant = 'default', // 'default' | 'menu' | 'minimal'
  onInstallStart,
  onInstallComplete,
  className = ''
}) => {
  const { isInstallable, isInstalled, platform, installPWA, canShowPrompt } = usePWAInstall();

  const handleClick = async () => {
    if (onInstallStart) onInstallStart();

    const result = await installPWA();

    if (result.success && onInstallComplete) {
      onInstallComplete(result);
    }
  };

  // No mostrar el botón si ya está instalada
  if (isInstalled) {
    if (variant === 'menu') {
      return (
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="flex items-center gap-3 text-green-500 mt-8"
        >
          <CheckCircle size={20} />
          <span className="text-xs uppercase tracking-[0.3em]">
            App Instalada
          </span>
        </motion.div>
      );
    }
    return null;
  }

  // No mostrar si no es instalable
  if (!canShowPrompt()) {
    // En iOS mostrar mensaje de cómo instalar manualmente
    if (platform === 'ios' && variant === 'menu') {
      return (
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 border-t border-white/10 pt-6"
        >
          <div className="flex items-start gap-3">
            <Smartphone size={20} className="text-red-600 flex-shrink-0 mt-1" />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white mb-2 font-bold">
                Instalar en iOS
              </p>
              <p className="text-[10px] text-gray-400 leading-relaxed">
                Toca <span className="text-white">Compartir</span> → <span className="text-white">Agregar a pantalla de inicio</span>
              </p>
            </div>
          </div>
        </motion.div>
      );
    }
    return null;
  }

  // VARIANT: Menu móvil
  if (variant === 'menu') {
    return (
      <motion.button
        onClick={handleClick}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.7 }}
        whileTap={{ scale: 0.95 }}
        className={`
          mt-8 border-t border-white/10 pt-6
          flex items-center gap-4 group
          ${className}
        `}
      >
        <motion.div
          animate={{ 
            rotate: [0, -10, 10, -10, 0],
            y: [0, -2, 0, -2, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="flex-shrink-0"
        >
          <Download size={24} className="text-red-600" />
        </motion.div>
        
        <div className="text-left flex-1">
          <p className="text-xs uppercase tracking-[0.3em] text-white font-bold mb-1">
            Instalar App
          </p>
          <p className="text-[10px] text-gray-400">
            Acceso rápido sin navegador
          </p>
        </div>

        <motion.div
          className="flex-shrink-0 w-2 h-2 bg-red-600 rounded-full"
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [1, 0.5, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.button>
    );
  }

  // VARIANT: Default (botón estándar)
  if (variant === 'default') {
    return (
      <motion.button
        onClick={handleClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`
          flex items-center gap-2 px-6 py-3
          bg-red-600 text-white
          text-sm uppercase tracking-wider font-bold
          hover:bg-red-700 transition-colors
          ${className}
        `}
      >
        <Download size={18} />
        <span>Instalar App</span>
      </motion.button>
    );
  }

  // VARIANT: Minimal
  if (variant === 'minimal') {
    return (
      <button
        onClick={handleClick}
        className={`
          flex items-center gap-2
          text-xs uppercase tracking-wider
          text-gray-400 hover:text-white
          transition-colors
          ${className}
        `}
      >
        <Download size={14} />
        <span>Instalar</span>
      </button>
    );
  }

  return null;
};

export default PWAInstallButton;