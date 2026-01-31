import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

const ProductModal = ({ item, onClose }) => {
  if (!item) return null;

  useEffect(() => {
    // Bloqueo estricto del scroll
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none"; // Evita gestos del sistema
    
    return () => {
      document.body.style.overflow = "unset";
      document.body.style.touchAction = "auto";
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center p-0 md:p-10 cursor-zoom-out touch-none"
    >
      {/* Botón Cerrar */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-[130] text-white"
      >
        <X size={40} />
      </button>

      {/* Contenedor Imagen Simplificado */}
      <div className="relative flex items-center justify-center w-full h-full p-0 md:p-4">
        <img
          src={Array.isArray(item.img) ? item.img[0] : item.img}
          className="w-screen md:w-auto h-full max-h-[100dvh] md:max-h-[90vh] object-contain shadow-2xl"
          alt="Product"
        />
        
        {/* Info básica para testear lectura */}
        <div className="absolute bottom-0 left-0 p-6 bg-gradient-to-t from-black w-full">
          <h2 className="text-white text-2xl font-bold uppercase italic">
            {item.title}
          </h2>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductModal;