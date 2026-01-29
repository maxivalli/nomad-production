import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProductModal = ({ item, onClose }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const navigate = useNavigate();

  if (!item) return null;

  const images = Array.isArray(item.img) ? item.img : [item.img];

  const colorMap = {
    negro: "#000000",
    blanco: "#ffffff",
    gris: "#808080",
    beige: "#f5f5dc",
    rojo: "#dc2626",
    azul: "#2563eb",
  };

  const nextImg = (e) => {
    e.stopPropagation();
    setActiveIdx((prev) => (prev + 1) % images.length);
  };

  const prevImg = (e) => {
    e.stopPropagation();
    setActiveIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToContact = (e) => {
    e.stopPropagation();
    onClose();
    navigate("/");
    setTimeout(() => {
      const contactSection = document.getElementById("contacto");
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const handlePurchase = (e) => {
    e.stopPropagation();
    if (item.purchase_link) {
      window.open(item.purchase_link, "_blank", "noopener,noreferrer");
    } else {
      alert("Enlace de compra no disponible.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden"
    >
      {/* IMAGEN DE FONDO */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIdx}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src={images[activeIdx]}
            className="w-full h-full object-cover md:object-contain"
            alt={item.title}
          />
          
          {/* MODIFICACIÓN: Degradado solo en el 30% inferior en móvil, y lateral en desktop */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Capa para Móvil (Bottom 30%) */}
            <div className="absolute bottom-0 left-0 w-full h-[50%] bg-gradient-to-t from-black via-black/50 to-transparent md:hidden" />
            
            {/* Capa para Desktop (Lateral Izquierdo para lectura) */}
            <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* CONTROLES NAVEGACIÓN */}
      {images.length > 1 && (
        <div className="absolute inset-0 flex items-center justify-between px-2 md:px-10 z-[115] pointer-events-none">
          <button
            onClick={prevImg}
            className="pointer-events-auto p-4 text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft size={30} strokeWidth={1} />
          </button>
          <button
            onClick={nextImg}
            className="pointer-events-auto p-4 text-white/40 hover:text-white transition-colors"
          >
            <ArrowRight size={30} strokeWidth={1} />
          </button>
        </div>
      )}

      {/* INDICADORES (PUNTITOS) */}
      <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-[120]">
        {images.map((_, i) => (
          <div
            key={i}
            className={`h-1 transition-all duration-300 ${i === activeIdx ? "w-6 md:w-8 bg-red-600" : "w-1.5 md:w-2 bg-white/20"}`}
          />
        ))}
      </div>

      {/* BOTÓN CERRAR */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 md:top-8 md:right-8 z-[130] text-white/50 hover:text-white transition-colors"
      >
        <X size={32} strokeWidth={1} />
      </button>

      {/* INFO DEL PRODUCTO Y BOTONES */}
      <div className="relative z-[110] w-full h-full flex flex-col justify-end p-6 pb-24 md:p-20 pointer-events-none">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full flex flex-row items-end justify-between gap-4 pointer-events-auto"
        >
          {/* COLUMNA IZQUIERDA */}
          <div className="flex-1">
            <h2 className="text-3xl md:text-8xl font-black uppercase italic leading-[0.85] mb-2 md:mb-4 tracking-tighter text-white flex flex-col">
              <span className="block">{item.title.split(" ")[0]}</span>
              <span className="block text-white">
                {item.title.split(" ").slice(1).join(" ")}
              </span>
            </h2>

            <p className="text-gray-300 text-[10px] md:text-sm mb-4 md:mb-8 max-w-[280px] md:max-w-md italic font-light leading-relaxed">
              {item.description}
            </p>

            <div className="flex flex-col md:flex-row gap-4 md:gap-12">
              <div className="space-y-1 md:space-y-3">
                <p className="text-[8px] md:text-[10px] uppercase tracking-[0.4em] text-red-600 font-bold">
                  Size Protocol
                </p>
                <div className="flex gap-3 md:gap-6 items-center">
                  {item.sizes && item.sizes.length > 0 ? (
                    item.sizes.map((s) => (
                      <span key={s} className="text-lg md:text-4xl font-black text-white">{s}</span>
                    ))
                  ) : (
                    <span className="text-[9px] uppercase tracking-widest text-gray-500 italic">N/A</span>
                  )}
                </div>
              </div>

              {item.color && (
                <div className="space-y-1 md:space-y-3">
                  <p className="text-[8px] md:text-[10px] uppercase tracking-[0.4em] text-red-600 font-bold">Color</p>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 md:w-5 md:h-5 rounded-full border border-white/30"
                      style={{ backgroundColor: colorMap[item.color.toLowerCase()] || "#333" }}
                    />
                    <span className="text-lg md:text-4xl font-black text-white uppercase italic tracking-tighter">
                      {item.color}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* COLUMNA DERECHA */}
          <div className="flex flex-col gap-3 ml-auto">
            {item.purchase_link && (
              <button
                onClick={handlePurchase}
                className="group relative flex items-center justify-center gap-2 bg-white px-6 py-4 md:px-10 md:py-5 overflow-hidden transition-all active:scale-95 border border-white"
              >
                <div className="absolute inset-0 bg-black translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-300" />
                <div className="relative z-10 flex items-center">
                  <span className="text-black group-hover:text-white font-black italic uppercase tracking-tighter text-sm md:text-3xl">
                    COMPRAR
                  </span>
                  <span className="text-red-600 font-black italic text-sm md:text-3xl ml-0.5">+</span>
                </div>
              </button>
            )}

            <button
              onClick={goToContact}
              className="group relative flex items-center justify-center gap-2 bg-transparent border border-white/20 px-6 py-3 md:px-8 md:py-3 overflow-hidden transition-all active:scale-95"
            >
              <div className="absolute inset-0 bg-white/10 translate-y-[101%] group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative z-10 text-white font-black italic uppercase tracking-tighter text-[10px] md:text-sm">
                RETAILERS
              </span>
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProductModal;