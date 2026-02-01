import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ArrowLeft,
  ArrowRight,
  Loader2,
  ShoppingBag,
  Share2,
} from "lucide-react";

const ProductModal = ({ item, onClose }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [showFullText, setShowFullText] = useState(false);
  const dragThreshold = 50;

  if (!item) return null;

  const images = Array.isArray(item.img) ? item.img : [item.img];

  // Efecto para resetear el loader cada vez que cambia la imagen activa
  useEffect(() => {
    setIsImageLoading(true);
  }, [activeIdx]);

  // Listener para el botón "atrás" del navegador (móvil y desktop)
  useEffect(() => {
    const handlePopState = () => {
      onClose();
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [onClose]);

  // Listener para tecla Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const optimizeCloudinaryUrl = (url) => {
    if (!url || !url.includes("cloudinary.com")) return url;
    const splitUrl = url.split("/upload/");
    const optimizationParams = "f_auto,q_auto,w_1600";
    return `${splitUrl[0]}/upload/${optimizationParams}/${splitUrl[1]}`;
  };

  const colorMap = {
    negro: "#000000",
    blanco: "#ffffff",
    gris: "#808080",
    beige: "#f5f5dc",
    rojo: "#dc2626",
    azul: "#2563eb",
  };

  // NAVEGACIÓN CON LÍMITES BLOQUEADOS (No infinito)
  const nextImg = (e) => {
    if (e) e.stopPropagation();
    if (activeIdx < images.length - 1) {
      setActiveIdx((prev) => prev + 1);
    }
  };

  const prevImg = (e) => {
    if (e) e.stopPropagation();
    if (activeIdx > 0) {
      setActiveIdx((prev) => prev - 1);
    }
  };

  const onDragEnd = (e, { offset }) => {
    // Solo permite swipe si hay imágenes en esa dirección
    if (offset.x < -dragThreshold && activeIdx < images.length - 1) {
      nextImg();
    } else if (offset.x > dragThreshold && activeIdx > 0) {
      prevImg();
    }
  };

  const handleShare = (e) => {
    e.stopPropagation();
    const slug = item.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    const shareUrl = `${window.location.origin}/#/producto/${slug}`;

    if (navigator.share) {
      navigator
        .share({
          title: `NOMAD - ${item.title}`,
          url: shareUrl,
        })
        .catch(console.error);
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Enlace de producto copiado al portapapeles");
    }
  };

  const handlePurchase = (e) => {
    e.stopPropagation();
    if (item.purchase_link) {
      window.open(item.purchase_link, "_blank", "noopener,noreferrer");
    } else {
      alert("Enlace de compra no disponible.");
    }
  };

  const handleGlobalClick = () => {
    if (showFullText) {
      setShowFullText(false);
    }
  };

  const handleClose = () => {
    if (window.history.state?.modal) {
      window.history.back();
    } else {
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleGlobalClick}
      className="fixed inset-0 h-[100dvh] z-[100] flex items-center justify-center bg-black overflow-hidden touch-none select-none"
    >
      {/* CAPA DEL LOADER */}
      <AnimatePresence>
        {isImageLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 w-full h-full flex items-center justify-center p-4 md:p-10 z-[140] pointer-events-none"
          >
            <Loader2
              className="text-red-600 animate-spin"
              size={48}
              strokeWidth={1}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ÁREA DE CONTENIDO: CARRUSEL 3D LINEAL */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden touch-pan-y perspective-[1200px]">
        {images.map((img, index) => {
          const offset = index - activeIdx;
          const isActive = index === activeIdx;

          return (
            <motion.div
              key={index}
              drag={images.length > 1 ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={onDragEnd}
              initial={false}
              animate={{
                x: `${offset * 85}%`,
                scale: isActive ? 1 : 0.7,
                opacity: isActive ? 1 : 0.7, // Mayor opacidad para fotos laterales
                zIndex: isActive ? 20 : 10,
                rotateY: isActive ? 0 : offset > 0 ? -30 : 30,
              }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 25,
              }}
              style={{ transformStyle: "preserve-3d" }}
              className="absolute h-[60dvh] md:h-[80dvh] aspect-[2/3] cursor-grab active:cursor-grabbing"
              onClick={(e) => {
                if (!isActive) {
                  e.stopPropagation();
                  setActiveIdx(index);
                }
              }}
            >
              <div className="relative w-full h-full shadow-[0_30px_60px_rgba(0,0,0,0.8)] border border-white/5 bg-neutral-900">
                <img
                  src={optimizeCloudinaryUrl(img)}
                  className="w-full h-full object-cover"
                  alt={`${item.title} - ${index}`}
                  draggable="false"
                  onLoad={() => {
                    if (isActive) setIsImageLoading(false);
                  }}
                  ref={(el) => {
                    // Fix infalible para imágenes cacheadas
                    if (el && el.complete && isActive && isImageLoading) {
                      setIsImageLoading(false);
                    }
                  }}
                />
                
                {/* VELO DE OSCURIDAD SUTIL PARA LATERALES */}
                {!isActive && (
                  <div className="absolute inset-0 bg-black/20 transition-opacity duration-500" />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* CAPA DE DEGRADADOS DINÁMICOS */}
      <div className="absolute inset-0 pointer-events-none z-[105]">
        <motion.div
          animate={{
            background: showFullText
              ? "linear-gradient(to top, black 40%, rgba(0,0,0,0.7) 70%, transparent 100%)"
              : "linear-gradient(to top, black 0%, rgba(0,0,0,0.5) 10%, transparent 50%)",
          }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 md:hidden"
        />
        <motion.div
          animate={{
            background: showFullText
              ? "linear-gradient(to right, rgba(0,0,0,0.9) 30%, rgba(0,0,0,0.4) 60%, transparent 100%)"
              : "linear-gradient(to right, rgba(0,0,0,0.8) 0%, transparent 50%)",
          }}
          transition={{ duration: 0.5 }}
          className="hidden md:block absolute inset-0"
        />
      </div>

      {/* BOTONES DE NAVEGACIÓN CON LÓGICA DE VISIBILIDAD */}
      {images.length > 1 && (
        <div className="absolute inset-0 flex items-center justify-between px-2 md:px-10 z-[115] pointer-events-none">
          <button
            onClick={prevImg}
            disabled={activeIdx === 0}
            className={`pointer-events-auto p-4 transition-all duration-300 ${
              activeIdx === 0 
              ? "text-white/0 opacity-0 cursor-default" 
              : "text-white/40 hover:text-white"
            }`}
          >
            <ArrowLeft size={30} strokeWidth={1} />
          </button>
          <button
            onClick={nextImg}
            disabled={activeIdx === images.length - 1}
            className={`pointer-events-auto p-4 transition-all duration-300 ${
              activeIdx === images.length - 1 
              ? "text-white/0 opacity-0 cursor-default" 
              : "text-white/40 hover:text-white"
            }`}
          >
            <ArrowRight size={30} strokeWidth={1} />
          </button>
        </div>
      )}

      {/* INDICADORES DE POSICIÓN */}
      <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-[120]">
        {images.map((_, i) => (
          <div
            key={i}
            className={`h-1 transition-all duration-300 ${
              i === activeIdx
                ? "w-6 md:w-8 bg-red-600"
                : "w-1.5 md:w-2 bg-white/20"
            }`}
          />
        ))}
      </div>

      {/* BOTÓN CERRAR */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}
        className="absolute top-6 right-6 md:top-8 md:right-8 z-[130] text-white/50 hover:text-white transition-colors p-4"
      >
        <X size={42} strokeWidth={1} />
      </button>

      {/* INFORMACIÓN DEL PRODUCTO */}
      <div className="relative z-[110] w-full h-full flex flex-col justify-end p-6 pb-24 md:p-20 pointer-events-none">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full flex flex-row items-end justify-between gap-4 pointer-events-auto"
        >
          <div className="flex-1">
            {/* Título: Absolute en móvil para ir arriba a la izquierda, Relative en desktop */}
            <h2 className="absolute top-20 left-6 md:relative md:top-0 md:left-0 text-4xl md:text-8xl font-black uppercase italic leading-[0.8] mb-2 md:mb-4 tracking-tighter text-white flex flex-col">
              {item.title.split(" ").map((word, index) => (
                <span
                  key={index}
                  className={`block ${index === 0 ? "text-red-600" : "text-white"}`}
                >
                  {word}
                </span>
              ))}
            </h2>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowFullText(!showFullText);
              }}
              className="mb-4 text-[8px] md:text-[10px] uppercase tracking-[0.2em] text-white/50 hover:text-red-600 transition-colors font-bold underline decoration-red-600 underline-offset-4"
            >
              {showFullText ? "— OCULTAR DETALLES" : "+ VER DETALLES"}
            </button>

            <AnimatePresence>
              {showFullText && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="text-gray-300 text-[10px] md:text-sm mb-4 md:mb-8 max-w-[190px] md:max-w-md italic font-light leading-relaxed text-justify">
                    {item.description}
                  </p>

                  <div className="flex flex-col md:flex-row gap-4 md:gap-12 mb-6 md:mb-0">
                    <div className="space-y-1 md:space-y-3">
                      <p className="text-[8px] md:text-[10px] uppercase tracking-[0.4em] text-red-600 font-bold">
                        Size Protocol
                      </p>
                      <div className="flex gap-3 md:gap-6 items-center">
                        {item.sizes?.map((s) => (
                          <span
                            key={s}
                            className="text-lg md:text-4xl font-black text-white"
                          >
                            {s}
                          </span>
                        )) || (
                          <span className="text-[9px] text-gray-500 italic">
                            N/A
                          </span>
                        )}
                      </div>
                    </div>

                    {item.color &&
                      Array.isArray(item.color) &&
                      item.color.length > 0 && (
                        <div className="space-y-1 md:space-y-3">
                          <p className="text-[8px] md:text-[10px] uppercase tracking-[0.4em] text-red-600 font-bold">
                            Color Protocol
                          </p>
                          <div className="flex flex-wrap items-center gap-3 md:gap-5">
                            {item.color.map((c) => (
                              <div
                                key={c}
                                className="flex items-center gap-2 group"
                              >
                                <div
                                  className="w-3 h-3 md:w-6 md:h-6 rounded-full border border-white/40 shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-transform group-hover:scale-110"
                                  style={{
                                    backgroundColor:
                                      colorMap[c.toLowerCase()] || "#333",
                                  }}
                                />
                                <span className="text-lg md:text-4xl font-black text-white uppercase italic tracking-tighter opacity-90 group-hover:opacity-100 transition-opacity">
                                  {c}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col gap-3 ml-auto">
            {item.purchase_link && (
              <button
                onClick={handlePurchase}
                className="group relative flex items-center justify-center gap-3 bg-white px-6 py-4 md:px-10 md:py-5 overflow-hidden transition-all active:scale-95 border border-white"
              >
                <div className="absolute inset-0 bg-black translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-300" />
                <div className="relative z-10 flex items-center gap-2 md:gap-3">
                  <span className="text-black group-hover:text-white font-black italic uppercase tracking-tighter text-sm md:text-3xl">
                    COMPRAR
                  </span>
                  <ShoppingBag
                    size={20}
                    className="text-red-600 md:w-8 md:h-8"
                    strokeWidth={2.5}
                  />
                </div>
              </button>
            )}

            <button
              onClick={handleShare}
              className="group relative flex items-center justify-center gap-2 bg-transparent border border-white/20 px-6 py-3 md:px-8 md:py-3 overflow-hidden transition-all active:scale-95"
            >
              <div className="absolute inset-0 bg-white/10 translate-y-[101%] group-hover:translate-y-0 transition-transform duration-300" />
              <div className="relative z-10 flex items-center gap-2">
                <span className="text-white font-black italic uppercase tracking-tighter text-[10px] md:text-sm">
                  COMPARTIR
                </span>
                <Share2 size={14} className="text-red-600 md:w-4 md:h-4" />
              </div>
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProductModal;