import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const PackingModal = ({ selectedImg, onClose }) => {
  const closedByPopStateRef = useRef(false);

  // ✅ Manejo del historial del navegador
  useEffect(() => {
    if (!selectedImg) return;

    // Agregar entrada al historial cuando se abre el modal
    window.history.pushState({ packingModalOpen: true }, '');

    // Escuchar el botón atrás del navegador
    const handlePopState = () => {
      closedByPopStateRef.current = true;
      onClose();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      
      // Si el modal se cerró programáticamente (no por botón atrás)
      // remover la entrada del historial
      if (!closedByPopStateRef.current && window.history.state?.packingModalOpen) {
        window.history.back();
      }
    };
  }, [selectedImg, onClose]);

  // ✅ Manejo de tecla Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && selectedImg) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [selectedImg, onClose]);

  // ✅ Bloquear scroll del body
  useEffect(() => {
    if (selectedImg) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [selectedImg]);

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

          {/* CONTENEDOR DE IMAGEN: Forzamos altura completa */}
          <div className="relative w-auto h-[80dvh] flex items-center justify-center">
            <motion.img
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              src={selectedImg}
              alt="Nomad Full View"
              className="w-auto h-full object-cover md:object-cover" 
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
                Nomad Packing System // Archive_26
              </span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PackingModal;