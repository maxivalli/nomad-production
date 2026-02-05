import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import api from "../services/api";

const BannerModal = () => {
  const [banner, setBanner] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Esperar 5 segundos después de que el usuario ingrese
    const timer = setTimeout(() => {
      checkForActiveBanner();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const checkForActiveBanner = async () => {
    try {
      const response = await api.getActiveBanner();

      if (response.banner) {
        setBanner(response.banner);
        setShow(true);
      }
    } catch (error) {
      console.error("Error cargando banner:", error);
    }
  };

  const handleClose = () => {
    setShow(false);
    // Después de la animación, limpiar el banner
    setTimeout(() => setBanner(null), 300);
  };

  if (!banner) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón de cerrar */}
            <button
              onClick={handleClose}
              // Ajustamos top y right para que "salga" del marco del banner
              className="absolute -top-4 -right-4 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-all z-[150] shadow-xl hover:scale-110 active:scale-95"
              aria-label="Cerrar"
            >
              <X size={20} strokeWidth={3} />
            </button>

            {/* Contenido del banner */}
            <div className="bg-black border-10 border-white overflow-hidden shadow-2xl">
              {banner.media_type === "video" ? (
                <video
                  src={banner.media_url}
                  className="w-full object-cover"
                  style={{ aspectRatio: "720/1080" }}
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <img
                  src={banner.media_url}
                  alt="Banner publicitario"
                  className="w-full object-cover"
                  style={{ aspectRatio: "720/1080" }}
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BannerModal;
