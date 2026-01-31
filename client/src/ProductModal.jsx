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

  if (!item) return null;

  const images = Array.isArray(item.img) ? item.img : [item.img];

  useEffect(() => {
    const esc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  useEffect(() => {
    setIsImageLoading(true);
  }, [activeIdx]);

  const optimizeCloudinaryUrl = (url) => {
    if (!url || !url.includes("cloudinary.com")) return url;
    const [a, b] = url.split("/upload/");
    return `${a}/upload/f_auto,q_auto,w_1600/${b}`;
  };

  const nextImg = (e) => {
    e.stopPropagation();
    setActiveIdx((i) => (i + 1) % images.length);
  };

  const prevImg = (e) => {
    e.stopPropagation();
    setActiveIdx((i) => (i - 1 + images.length) % images.length);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    const slug = item.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

    const url = `${window.location.origin}/share/${slug}`;

    if (navigator.share) {
      navigator.share({ title: item.title, url });
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copiado");
    }
  };

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowFullText(false)}
          className="fixed inset-0 z-[100] bg-black touch-none"
        >
          {/* LOADER */}
          <AnimatePresence>
            {isImageLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center z-[200]"
              >
                <Loader2 className="animate-spin text-red-600" size={48} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* IMAGEN */}
          <div className="relative w-full h-full flex items-center justify-center">
            <motion.img
              key={activeIdx}
              src={optimizeCloudinaryUrl(images[activeIdx])}
              alt={item.title}
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="w-screen h-full max-h-[100dvh] object-cover"
              onLoad={() => setIsImageLoading(false)}
              onClick={(e) => e.stopPropagation()}
            />

            {/* NAV */}
            {images.length > 1 && (
              <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
                <button
                  onClick={prevImg}
                  className="pointer-events-auto text-white/40 hover:text-white p-4"
                >
                  <ArrowLeft size={30} />
                </button>
                <button
                  onClick={nextImg}
                  className="pointer-events-auto text-white/40 hover:text-white p-4"
                >
                  <ArrowRight size={30} />
                </button>
              </div>
            )}
          </div>

          {/* CERRAR */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-4 right-4 p-4 text-white/50 hover:text-white z-[300]"
          >
            <X size={42} />
          </button>

          {/* INFO */}
          <div className="absolute bottom-0 left-0 w-full z-[250] pointer-events-none">
            <div className="pointer-events-auto p-6">
              <h2 className="text-4xl font-black uppercase italic text-white mb-2">
                {item.title}
              </h2>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFullText((v) => !v);
                }}
                className="text-[10px] uppercase tracking-[0.3em] text-white/50 underline"
              >
                {showFullText ? "OCULTAR" : "VER DETALLES"}
              </button>

              <AnimatePresence>
                {showFullText && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="text-gray-300 text-xs mt-3 max-w-md"
                  >
                    {item.description}
                  </motion.p>
                )}
              </AnimatePresence>

              <div className="flex gap-3 mt-4">
                {item.purchase_link && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(item.purchase_link, "_blank");
                    }}
                    className="bg-white text-black px-6 py-3 font-black uppercase"
                  >
                    Comprar
                  </button>
                )}

                <button
                  onClick={handleShare}
                  className="border border-white/30 text-white px-5 py-3 uppercase text-xs"
                >
                  Compartir
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProductModal;
