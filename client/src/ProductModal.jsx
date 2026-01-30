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
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden"
      style={{ height: '100svh' }} // Altura estática (barra de navegación incluida)
    >
      {/* Botón Cerrar */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-[130] text-white"
      >
        <X size={40} />
      </button>

      {/* Contenedor Imagen Simplificado */}
      <div className="relative h-[80%] aspect-[2/3] bg-neutral-900 shadow-2xl">
        <img
          src={Array.isArray(item.img) ? item.img[0] : item.img}
          className="w-full h-full object-cover"
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