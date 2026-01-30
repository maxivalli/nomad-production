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
import { useNavigate } from "react-router-dom";

const ProductModal = ({ item, onClose }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [showFullText, setShowFullText] = useState(false);
  const navigate = useNavigate();

  if (!item) return null;

  const images = Array.isArray(item.img) ? item.img : [item.img];

  useEffect(() => {
    setIsImageLoading(true);
  }, [activeIdx]);

  useEffect(() => {
  document.body.style.overflow = 'hidden';
  return () => {
    document.body.style.overflow = 'unset';
    window.scrollTo(0, 0)
  };
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

  const nextImg = (e) => {
    e.stopPropagation();
    setActiveIdx((prev) => (prev + 1) % images.length);
  };

  const prevImg = (e) => {
    e.stopPropagation();
    setActiveIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    const slug = item.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    const shareUrl = `${window.location.origin}/share/${slug}`;

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleGlobalClick}
      className="fixed inset-0 h-[100svh] z-[100] flex items-center justify-center bg-black overflow-hidden cursor-default"
    >
      <AnimatePresence>
        {isImageLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 w-full h-full flex items-center justify-center p-4 md:p-10"
          >
            <Loader2
              className="text-red-600 animate-spin"
              size={48}
              strokeWidth={1}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeIdx}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 w-full h-full flex items-center justify-center"
        >
          <div className="relative h-[100dvh] aspect-[2/3] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex items-center justify-center">
            <img
              src={optimizeCloudinaryUrl(images[activeIdx])}
              className={`w-full h-full object-cover transition-opacity duration-700 ${
                isImageLoading ? "opacity-0" : "opacity-100"
              }`}
              alt={item.title}
              onLoad={() => setIsImageLoading(false)}
            />
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
        </motion.div>
      </AnimatePresence>

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

      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-6 right-6 md:top-8 md:right-8 z-[130] text-white/50 hover:text-white transition-colors"
      >
        <X size={42} strokeWidth={1} />
      </button>

      <div className="relative z-[110] w-full h-full flex flex-col justify-end p-6 pb-24 md:p-20 pointer-events-none">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full flex flex-row items-end justify-between gap-4 pointer-events-auto"
        >
          <div className="flex-1">
            <h2 className="text-4xl md:text-8xl font-black uppercase italic leading-[0.8] mb-2 md:mb-4 tracking-tighter text-white flex flex-col">
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
