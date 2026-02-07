import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import api from "../services/api";

const BannerModal = () => {
  const [banner, setBanner] = useState(null);
  const [show, setShow] = useState(false);
  const [showCloseButton, setShowCloseButton] = useState(false); // Nuevo estado

  useEffect(() => {
    const timer = setTimeout(() => {
      checkForActiveBanner();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Efecto para mostrar el botón de cerrar con retraso cuando se abre el modal
  useEffect(() => {
    if (show) {
      const closeTimer = setTimeout(() => {
        setShowCloseButton(true);
      }, 1500); // 1.5 segundos de retraso
      return () => clearTimeout(closeTimer);
    } else {
      setShowCloseButton(false);
    }
  }, [show]);

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
    setTimeout(() => {
      setBanner(null);
      setShowCloseButton(false);
    }, 300);
  };

  if (!banner) return null;

  // ... resto del código igual hasta el return

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          // ✅ Solo cierra si showCloseButton es true
          className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex items-center justify-center p-6"
          onClick={() => showCloseButton && handleClose()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[340px] md:max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón de cerrar animado con retraso */}
            <AnimatePresence>
              {showCloseButton && (
                <motion.button
                  initial={{ scale: 0, opacity: 0, rotate: -45 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 0, opacity: 0 }}
                  onClick={handleClose}
                  className="absolute -top-4 -right-4 bg-[#393939] hover:bg-red-700 text-white p-2.5 rounded-full transition-all z-[150] shadow-[0_5px_15px_rgba(0,0,0,0.5)] hover:scale-110 active:scale-90"
                >
                  <X size={22} strokeWidth={3} />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Contenido del Banner (Marco Blanco) */}
            <div className="bg-white p-1.5 shadow-[0_30px_60px_rgba(0,0,0,1)]">
              <div className="relative overflow-hidden bg-neutral-900 aspect-[9/16]">
                {banner.media_type === "video" ? (
                  <video
                    src={banner.media_url}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <img
                    src={banner.media_url}
                    alt="Banner"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>

            {/* Indicador de carga */}
            <div className="h-8 flex items-center justify-center mt-4">
              <AnimatePresence mode="wait">
                {!showCloseButton ? (
                  <motion.p
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    exit={{ opacity: 0 }}
                    className="text-white text-[10px] uppercase tracking-widest font-bold"
                  >
                    Cerrar disponible en breve...
                  </motion.p>
                ) : (
                  <motion.p
                    key="ready"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    className="text-white text-[9px] uppercase tracking-[0.3em]"
                  >
                    Toca afuera para salir
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BannerModal;
