import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import PackingModal from "./PackingModal";

const ParallaxImage = ({ url, index, offset, speed, rotation, onClick }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, speed]);

  return (
    <motion.div
      ref={ref}
      style={{ y, rotate: rotation }}
      whileHover={{ rotate: 0, scale: 1.02, zIndex: 10 }}
      onClick={() => onClick(url)}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`relative aspect-[2/3] overflow-hidden bg-neutral-900 group border border-white/10 shadow-2xl cursor-zoom-in ${offset}`}
    >
      <img
        src={url}
        alt="Nomad"
        className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-4 md:p-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
            <span className="text-[7px] md:text-[9px] font-mono text-red-500 tracking-tighter uppercase font-bold">
              NOMAD_PACK_0{index + 1} // 2026_PROT
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Packaging = () => {
  const [selectedImg, setSelectedImg] = useState(null);

  // Prevenir scroll
  useEffect(() => {
    document.body.style.overflow = selectedImg ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedImg]);

  const images = [
    {
      url: "https://res.cloudinary.com/det2xmstl/image/upload/v1769644669/Box_black_nbx2gu.jpg",
      speed: -40,
      rotation: 3,
    },
    {
      url: "https://res.cloudinary.com/det2xmstl/image/upload/v1769645630/ecommerce_xrhppt.jpg",
      speed: -40,
      rotation: -3,
    },
    {
      url: "https://res.cloudinary.com/det2xmstl/image/upload/v1769642575/SECURITY_ner5ki.jpg",
      speed: -70,
      rotation: -2,
    },
    {
      url: "https://res.cloudinary.com/det2xmstl/image/upload/v1769611238/p5_begtlw.jpg",
      speed: -100,
      rotation: 3,
    },
  ];

  // MANEJO DEL BOTÓN "ATRÁS" PARA EL MODAL
  useEffect(() => {
    if (selectedImg) {
      // Cuando se abre el modal, añadimos una entrada artificial al historial
      window.history.pushState({ modalOpen: true }, "");
    }

    const handleBackButton = () => {
      if (selectedImg) {
        setSelectedImg(null); // Cerramos el modal en lugar de irnos de la página
      }
    };

    window.addEventListener("popstate", handleBackButton);
    return () => window.removeEventListener("popstate", handleBackButton);
  }, [selectedImg]);

  const handleClose = () => {
    // Si cerramos el modal manualmente (X o clic fuera),
    // eliminamos la entrada falsa del historial para que no quede "atrás" muerto.
    if (selectedImg && window.history.state?.modalOpen) {
      window.history.back();
    }
    setSelectedImg(null);
  };

  return (
    <section
      id="packing"
      className="bg-black py-24 px-6 md:px-12 border-t border-white/5"
    >
      <div className="max-w-[1400px] mx-auto">
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="text-red-600 text-[9px] md:text-xs font-bold uppercase tracking-[0.6em] block mb-2 pl-1"
        >
          THE EXPERIENCE
        </motion.span>
        <div className="mb-24 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          {/* ... Tu Encabezado ... */}
          <h2 className="text-white text-5xl md:text-8xl font-black uppercase italic tracking-tighter leading-[0.8]">
            Premium <br/> Packaging
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12">
          {images.map((img, index) => (
            <ParallaxImage
              key={index}
              {...img}
              index={index}
              onClick={setSelectedImg}
            />
          ))}
        </div>
      </div>

      {/* Uso del componente separado */}
      <PackingModal selectedImg={selectedImg} onClose={handleClose} />
    </section>
  );
};

export default Packaging;
