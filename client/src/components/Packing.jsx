import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import PackingModal from "./PackingModal";

const PackingItem = ({ url, index, span = "", speed = 0, onClick }) => {
  const ref = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Parallax interno: la imagen se mueve dentro del contenedor
  const y = useTransform(scrollYProgress, [0, 1], [speed, -speed]);
  
  // Revelado de color y opacidad (0% saturación a 100%)
  const saturate = useTransform(scrollYProgress, [0, 0.5], ["grayscale(100%)", "grayscale(0%)"]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

  return (
    <motion.div
      ref={ref}
      style={{ opacity }}
      onClick={() => onClick(url)}
      className={`relative overflow-hidden bg-neutral-900 border border-white/5 group cursor-zoom-in ${span}`}
    >
      <motion.img
        src={url}
        style={{ y, scale: 1.2, filter: saturate }}
        alt="Nomad Packing"
        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.25]"
      />
      
      {/* Overlay de información técnica */}
      <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-between pointer-events-none">
        <div className="flex justify-between items-start">
          <span className="text-[7px] md:text-[9px] font-mono text-white/30 tracking-[0.4em] uppercase">
            UNIT_0{index + 1}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
          <span className="text-[8px] md:text-[10px] font-black text-white tracking-[0.2em] uppercase italic">
            Nomad_Pack_System
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const Packaging = () => {
  const [selectedImg, setSelectedImg] = useState(null);

  const images = [
    {
      url: "https://res.cloudinary.com/det2xmstl/image/upload/f_auto,q_auto/v1770817019/BOX_FIN_azqs9k.jpg",
      speed: 30,
      span: "col-span-12 md:col-span-8 md:row-span-2 row-span-2",
    },
    {
      url: "https://res.cloudinary.com/det2xmstl/image/upload/f_auto,q_auto/v1770512068/PACKING-1_uym24f.jpg",
      speed: -40,
      span: "col-start-3 col-span-10 md:col-start-auto md:col-span-4",
    },
    {
      url: "https://res.cloudinary.com/det2xmstl/image/upload/f_auto,q_auto/v1770512067/PACKING-2_uywox1.jpg",
      speed: 50,
      span: "col-span-9 md:col-span-4",
    },
    {
      url: "https://res.cloudinary.com/det2xmstl/image/upload/f_auto,q_auto/v1770815939/calco2_h0at8x.jpg",
      speed: -20,
      span: "col-start-2 col-span-11 md:col-start-auto md:col-span-12 md:h-[400px]",
    },
  ];

  // Manejo de scroll lock y popstate (omitido por brevedad, igual a tu original)
  useEffect(() => {
    document.body.style.overflow = selectedImg ? "hidden" : "unset";
  }, [selectedImg]);

  return (
    <section id="packing" className="bg-black py-24 px-4 md:px-12 border-t border-white/5 overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        <header className="mb-20">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-red-600 text-[10px] font-black tracking-[0.5em] uppercase block mb-4"
          >
            LOGISTICS_STATION
          </motion.span>
          <h2 className="text-white text-6xl md:text-9xl font-black uppercase italic tracking-tighter leading-[0.8]">
            Pack<span className="text-red-600">.</span>ing
          </h2>
        </header>

        <div className="grid grid-cols-12 gap-4 md:gap-8 auto-rows-[250px] md:auto-rows-[400px]">
          {images.map((img, index) => (
            <PackingItem
              key={index}
              {...img}
              index={index}
              onClick={setSelectedImg}
            />
          ))}
        </div>
      </div>

      <PackingModal selectedImg={selectedImg} onClose={() => setSelectedImg(null)} />
    </section>
  );
};

export default Packaging;