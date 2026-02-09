import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // ← AGREGAR
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ArrowLeft,
  ArrowRight,
  Loader2,
  ShoppingBag,
  Share2,
  Film,
} from "lucide-react";

// --- COMPONENTE INTERNO PARA EL EFECTO DE CINTA ---
const Tape = ({ position = "top" }) => {
  const styles = {
    top: "top-[-15px] left-1/2 -translate-x-1/2 rotate-[-1deg]",
    bottom: "bottom-[-15px] left-1/2 -translate-x-1/2 rotate-[1deg]",
    topLeft: "top-[-10px] left-[-25px] rotate-[-40deg]",
    topRight: "top-[-10px] right-[-25px] rotate-[40deg]",
  };

  return (
    <div
      className={`absolute ${styles[position]} z-[35] w-32 h-10 bg-white/25 backdrop-blur-[1.5px] pointer-events-none shadow-sm`}
      style={{
        clipPath:
          "polygon(4% 0%, 12% 3%, 88% 1%, 96% 4%, 100% 35%, 97% 75%, 94% 100%, 6% 97%, 3% 72%, 0% 32%)",
        borderLeft: "1px solid rgba(255,255,255,0.15)",
        borderRight: "1px solid rgba(255,255,255,0.15)",
      }}
    >
      <div className="w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
    </div>
  );
};

const ProductModal = ({ item, onClose }) => {
  const navigate = useNavigate(); // ← AGREGAR HOOK
  const location = useLocation(); // ← AGREGAR HOOK
  const [activeIdx, setActiveIdx] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [showFullText, setShowFullText] = useState(false);
  const [isClosing, setIsClosing] = useState(false); // ← Prevenir doble cierre
  const dragThreshold = 50;

  if (!item) return null;

  // Combinar imágenes y video (si existe) en un solo array de medios
  const baseImages = Array.isArray(item.img) ? item.img : [item.img];
  const mediaItems = [...baseImages];

  // Agregar el video al final si existe
  if (item.video_url) {
    mediaItems.push({ type: "video", url: item.video_url });
  }

  // Helper: Generar slug consistente
  const generateSlug = useCallback((title) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
  }, []);

  useEffect(() => {
    const currentMedia = mediaItems[activeIdx];
    const isCurrentVideo =
      typeof currentMedia === "object" && currentMedia.type === "video";

    if (isCurrentVideo) {
      const timer = setTimeout(() => {
        setIsImageLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setIsImageLoading(true);
    }
  }, [activeIdx]);

  // ← CORREGIDO: Manejar popstate para cerrar modal al usar botón atrás del navegador
  useEffect(() => {
    // Si la URL ya no tiene producto o share, forzamos el cierre del modal
    const isProductRoute =
      location.pathname.includes("/producto/") ||
      location.pathname.includes("/share/");

    if (!isProductRoute && !isClosing) {
      onClose();
    }
  }, [location.pathname, onClose, isClosing]);

  const optimizeCloudinaryUrl = (url) => {
    if (!url || !url.includes("cloudinary.com")) return url;
    const splitUrl = url.split("/upload/");
    const optimizationParams = "f_auto,q_auto,w_1200";
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
    if (e) e.stopPropagation();
    if (activeIdx < mediaItems.length - 1) {
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
    if (offset.x < -dragThreshold && activeIdx < mediaItems.length - 1) {
      nextImg();
    } else if (offset.x > dragThreshold && activeIdx > 0) {
      prevImg();
    }
  };

  // ← CORREGIDO: Usar URL canónica /producto/ para compartir (mejor SEO)
  const handleShare = useCallback(
    (e) => {
      e.stopPropagation();
      const slug = generateSlug(item.title);
      // Usar /producto/ en lugar de /share/ para compartir (más limpio)
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
    },
    [item, generateSlug],
  );

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

  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);

    if (onClose) onClose();

    navigate("/", { replace: true });

    setTimeout(() => setIsClosing(false), 500);
  }, [isClosing, navigate, onClose]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
     
        handleClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [handleClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleGlobalClick}
      className="fixed inset-0 h-[100dvh] z-[100] flex items-center justify-center bg-black overflow-hidden touch-none select-none"
    >
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

      <div className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden touch-pan-y perspective-[1200px]">
        {mediaItems.map((media, index) => {
          const offset = index - activeIdx;
          const isActive = index === activeIdx;
          const isVideo = typeof media === "object" && media.type === "video";
          const mediaUrl = isVideo ? media.url : media;

          const tapes = ["top", "topRight", "topLeft"];
          const currentTape = tapes[index % tapes.length];

          return (
            <motion.div
              key={index}
              drag={mediaItems.length > 1 ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={onDragEnd}
              initial={false}
              animate={{
                x: `${offset * 85}%`,
                scale: isActive ? 1 : 0.75,
                opacity: isActive ? 1 : 0.6,
                zIndex: isActive ? 20 : 10,
                rotateY: isActive ? 0 : offset > 0 ? -25 : 25,
                rotateZ: isActive ? 0 : offset > 0 ? 2 : -2,
              }}
              transition={{
                type: "spring",
                stiffness: 180,
                damping: 22,
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
              <div className="relative w-full h-full p-3 pb-12 md:p-4 md:pb-16 bg-[#f9f9f9] shadow-[0_40px_80px_rgba(0,0,0,0.9)] border border-neutral-200 overflow-visible">
                <Tape position={currentTape} />
                {index % 3 === 0 && (
                  <Tape position={index % 2 === 0 ? "bottom" : "top"} />
                )}

                <div className="relative w-full h-full bg-neutral-900 overflow-hidden">
                  {isVideo ? (
                    <>
                      <video
                        src={mediaUrl}
                        className="w-full h-full object-cover"
                        autoPlay
                        loop
                        muted
                        playsInline
                        draggable="false"
                        onLoadedData={() => {
                          if (isActive) setIsImageLoading(false);
                        }}
                        onPlaying={() => {
                          if (isActive) setIsImageLoading(false);
                        }}
                        onClick={(e) => {
                          if (isActive) {
                            e.stopPropagation();
                            const video = e.currentTarget;
                            if (video.paused) {
                              video.play();
                            } else {
                              video.pause();
                            }
                          }
                        }}
                      />

                      {isActive && (
                        <div className="absolute top-3 right-3 flex items-center gap-2 bg-purple-600/90 backdrop-blur-sm px-3 py-1.5 rounded-sm border border-purple-400/30">
                          <Film size={14} className="text-white" />
                          <span className="text-[9px] font-bold uppercase tracking-widest text-white">
                            AI Video
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <img
                      src={optimizeCloudinaryUrl(mediaUrl)}
                      className="w-full h-full object-cover"
                      alt={`${item.title} - ${index}`}
                      draggable="false"
                      onLoad={() => {
                        if (isActive) setIsImageLoading(false);
                      }}
                      onError={() => {
                        if (isActive) setIsImageLoading(false);
                      }}
                      ref={(el) => {
                        if (el && el.complete && isActive) {
                          setIsImageLoading(false);
                        }
                      }}
                    />
                  )}
                  <div className="absolute inset-0 pointer-events-none opacity-[0.04] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-black/20 via-transparent to-white/10" />
                  {!isActive && (
                    <div className="absolute inset-0 bg-black/40 transition-opacity duration-500" />
                  )}
                </div>

                <div className="absolute bottom-4 md:bottom-6 left-0 w-full flex justify-center opacity-50 pointer-events-none">
                  <span className="text-[10px] font-serif italic text-black uppercase tracking-widest">
                    {isVideo ? "NOMAD AI VIDEO" : "RAW 1/125 f2.8 ISO 100"}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

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

      {mediaItems.length > 1 && (
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
            disabled={activeIdx === mediaItems.length - 1}
            className={`pointer-events-auto p-4 transition-all duration-300 ${
              activeIdx === mediaItems.length - 1
                ? "text-white/0 opacity-0 cursor-default"
                : "text-white/40 hover:text-white"
            }`}
          >
            <ArrowRight size={30} strokeWidth={1} />
          </button>
        </div>
      )}

      <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-[120]">
        {mediaItems.map((media, i) => {
          const isVideo = typeof media === "object" && media.type === "video";
          return (
            <div
              key={i}
              className={`h-1 transition-all duration-300 ${
                i === activeIdx
                  ? isVideo
                    ? "w-6 md:w-8 bg-purple-600"
                    : "w-6 md:w-8 bg-red-600"
                  : "w-1.5 md:w-2 bg-white/20"
              }`}
            />
          );
        })}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}
        disabled={isClosing} // ← Deshabilitar mientras se cierra
        className="absolute top-6 right-6 md:top-8 md:right-8 z-[130] text-white/50 hover:text-white transition-colors p-4 disabled:opacity-50"
      >
        <X size={42} strokeWidth={1} />
      </button>

      <motion.h2
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="md:hidden absolute top-20 left-6 z-[110] text-4xl font-black uppercase italic leading-[0.8] tracking-tighter text-white flex flex-col pointer-events-none"
      >
        {item.title.split(" ").map((word, index) => (
          <span
            key={index}
            className={`block ${index === 0 ? "text-white" : "text-red-600"}`}
          >
            {word}
          </span>
        ))}
      </motion.h2>

      <div className="relative z-[110] w-full h-full flex flex-col justify-end p-6 pb-24 md:p-20 pointer-events-none">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full flex flex-row items-end justify-between gap-4 pointer-events-auto"
        >
          <div className="flex-1">
            <h2 className="hidden md:flex text-8xl font-black uppercase italic leading-[0.8] mb-4 tracking-tighter text-white flex-col">
              {item.title.split(" ").map((word, index) => (
                <span
                  key={index}
                  className={`block ${index === 0 ? "text-white" : "text-red-600"}`}
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
                        Talles disponibles
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
                            Colores disponibles
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
