import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

const Stockists = () => {
  const containerRef = useRef(null);

  // Lógica de scroll para el texto de fondo (parallax)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
  });

  const bgTextX = useTransform(smoothProgress, [0, 1], ["0%", "-50%"]);

  const shops = [
    {
      name: "Nomad Studio",
      city: "SAN CRISTÓBAL,SFE",
      code: "R-04",
      img: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=1000",
    },
    {
      name: "Mihouse",
      city: "SAN GUILLERMO,SFE",
      code: "R-23",
      img: "https://i.etsystatic.com/54504602/r/il/3dcc51/6777432993/il_fullxfull.6777432993_mybe.jpg",
    },
    {
      name: "Urbano",
      city: "CÓRDOBA,CBA",
      code: "R-51",
      img: "https://rijiz.co/wp-content/uploads/2025/07/t-shirts-1024x683.webp",
    },
  ];

  return (
    <section
      id="tiendas"
      ref={containerRef}
      className="relative bg-black py-20 md:py-32 overflow-hidden border-t border-white/10"
    >
      {/* TEXTO GIGANTE DE FONDO (STOCKED NETWORK) */}
      <div className="absolute inset-0 flex pointer-events-none opacity-[0.1] z-0">
        <motion.h2
          style={{ x: bgTextX }}
          className="text-[65vw] md:text-[26vw] font-black italic uppercase leading-none whitespace-nowrap select-none"
        >
          NOMAD STOCKISTS NETWORK
        </motion.h2>
      </div>

      {/* SCANLINES (FILTRO VISUAL) */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.01),rgba(0,255,0,0.01),rgba(0,0,255,0.01))] bg-[length:100%_4px,3px_100%] z-20" />

      <div className="relative z-10 px-6 md:px-12">
        {/* HEADER TIPO POSTER */}
        <div className="mb-24">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-red-600 text-[10px] font-bold uppercase tracking-[0.4em] block mb-1"
          >
            Offline Terminals
          </motion.span>
          <h2 className="text-white text-5xl md:text-8xl font-black uppercase italic tracking-tighter leading-[0.75]">
            official <br /> <span className="text-red-600">retailers</span>
          </h2>
        </div>

        {/* LISTA DE RETAILERS */}
        <div className="grid grid-cols-1 gap-12 md:gap-24">
          {shops.map((shop, index) => (
            <motion.div
              key={index}
              // Configuración de animación de entrada
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              // viewport: once false permite que se repita al subir/bajar el scroll
              viewport={{ once: false, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col md:flex-row gap-8 items-start group"
            >
              {/* IMAGEN DE LA TIENDA */}
              <div className="w-full md:w-1/3 relative aspect-square overflow-hidden md:grayscale md:group-hover:grayscale-0 transition-all duration-700 ring-1 ring-white/20">
                <img
                  src={shop.img}
                  alt={shop.name}
                  className="w-full h-full object-cover"
                />

                {/* DATA OVERLAY */}
                <div className="absolute bottom-4 left-4 z-30 text-[8px] font-mono tracking-widest text-white leading-none bg-black/60 p-2">
                  <span className="text-red-600">●</span> {shop.code}_READY{" "}
                  <br />
                  <span className="opacity-50">{shop.city} // RETAIL</span>
                </div>
              </div>

              {/* TEXTO E INFO */}
              <div className="w-full md:w-2/3 flex flex-col justify-between self-stretch py-2">
                <div>
                  <h3 className="text-5xl md:text-8xl font-black text-white uppercase italic tracking-tighter leading-none mb-4 group-hover:text-red-600 transition-colors">
                    {shop.name}
                  </h3>
                  {/* BARRA DE CARGA ANIMADA */}
                  <div className="h-[2px] w-full bg-white/10 relative">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "100%" }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="absolute top-0 left-0 h-full bg-red-600"
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-between items-end">
                  <p className="text-gray-500 uppercase italic font-light tracking-tighter text-lg">
                    Terminal {index + 1} // Authorized Station
                  </p>
                  <button className="whitespace-nowrap bg-white text-black font-black italic uppercase px-4 py-2 md:px-6 text-[10px] md:text-xs tracking-tighter hover:bg-red-600 hover:text-white transition-all active:scale-95 flex items-center justify-center min-w-[100px]">
                    LOCATE +
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stockists;