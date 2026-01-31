import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

// Cambiamos el nombre interno para que coincida con la exportación y el uso
const PackingModal = ({ selectedImg, onClose }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <AnimatePresence>
      {selectedImg && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center p-0 md:p-10 touch-none"
        >
          {/* Botón de Cierre - Más grande en móvil para accesibilidad */}
          <motion.button
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            className="absolute top-4 right-4 md:top-8 md:right-8 text-white/50 hover:text-white transition-colors z-[210] p-4"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            <X size={42} strokeWidth={1} />
          </motion.button>

          {/* Contenedor de Imagen: Eliminamos el p-4 en móvil y usamos p-0 */}
          <div className="relative flex items-center justify-center w-full h-full p-0 md:p-4">
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              src={selectedImg}
              alt="Nomad Full View"
              className="w-screen md:w-auto h-full max-h-[100dvh] md:max-h-[90vh] object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Tag de Seguridad Inferior - Mejorado para legibilidad */}
          <div className="absolute bottom-8 left-0 w-full flex justify-center pointer-events-none px-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 bg-black/60 backdrop-blur-xl border border-white/10 py-2 px-4"
            >
              <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
              <span className="text-white font-mono text-[9px] md:text-[10px] tracking-[0.4em] uppercase font-black">
                Nomad Protective Systems // Archive_26
              </span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PackingModal;
