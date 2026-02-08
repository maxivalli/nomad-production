import React, { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import { Loader2 } from "lucide-react";

const ProcessCard = ({ step, index }) => {
  const cardRef = useRef(null);
  const [isVideoLoading, setIsVideoLoading] = useState(true);

  const optimizeVideoUrl = (url) => {
    if (!url || !url.includes("cloudinary.com")) return url;
    const splitUrl = url.split("/upload/");
    const optimizationParams = "f_auto,q_auto,vc_vp9";
    const baseUrl = splitUrl[1].split(".")[0];
    return `${splitUrl[0]}/upload/${optimizationParams}/${baseUrl}.mp4`;
  };

  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start 0.8", "center center"],
  });

  const yMove = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 1]);

  return (
    <motion.div
      ref={cardRef}
      style={{ y: yMove, opacity }}
      className="relative my-[20vh] md:my-[30vh] group"
    >
      {/* Número de paso brutalista */}
      <div className="absolute -left-6 md:-left-10 top-0 text-[#dc2626] font-mono text-4xl md:text-6xl font-black z-30">
        0{index + 1}
      </div>

      {/* Contenedor principal con borde */}
      <div className="relative border-4 border-white p-2 bg-black transition-all duration-700 group-hover:border-[#dc2626]">
        {/* Video container */}
        <div className="relative h-[300px] md:h-[500px] overflow-hidden">
          <AnimatePresence>
            {isVideoLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center z-[25] bg-black"
              >
                <Loader2
                  className="text-red-600 animate-spin"
                  size={32}
                  strokeWidth={1}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Overlays y efectos */}
          <div className="absolute inset-0 pointer-events-none z-20 opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

          {/* Corners brutalistas */}
          <div className="absolute top-4 left-4 z-20 pointer-events-none border-t-2 border-l-2 border-white/40 w-6 h-6" />
          <div className="absolute top-4 right-4 z-20 pointer-events-none border-t-2 border-r-2 border-white/40 w-6 h-6" />
          <div className="absolute bottom-4 left-4 z-20 pointer-events-none border-b-2 border-l-2 border-white/40 w-6 h-6" />
          <div className="absolute bottom-4 right-4 z-20 pointer-events-none border-b-2 border-r-2 border-white/40 w-6 h-6" />

          <motion.video
            autoPlay
            loop
            muted
            playsInline
            onCanPlayThrough={() => setIsVideoLoading(false)}
            style={{
              opacity: isVideoLoading ? 0 : 1,
            }}
            className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000"
          >
            <source src={optimizeVideoUrl(step.video)} type="video/mp4" />
          </motion.video>

          {/* Badge indicador de grabación */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/80 px-3 py-1.5 border border-white/20 z-30">
            <motion.div
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="w-2 h-2 bg-[#dc2626] rounded-full"
            />
            <span className="text-[8px] font-mono text-white tracking-widest font-bold">
              SISTEMA: V.2026
            </span>
          </div>

          {/* ID Badge */}
          <div className="absolute top-4 left-4 z-30">
            <span className="text-black font-mono text-xs bg-white px-2 py-1 font-black">
              {step.id}
            </span>
          </div>
        </div>

        {/* Caja de información flotante */}
        <div className="absolute -bottom-12 md:-bottom-14 right-6 md:right-10 bg-white text-black p-6 md:p-8 min-w-[250px] md:min-w-[300px] shadow-2xl z-20">
          <h3 className="text-3xl md:text-4xl font-black italic leading-none uppercase">
            {step.title}
          </h3>
          <p className="mt-3 font-mono text-[9px] md:text-[10px] uppercase tracking-widest font-bold opacity-50">
            {step.category}
          </p>
        </div>
      </div>

      {/* Descripción debajo */}
      <div className="mt-20 md:mt-24 pl-0 md:pl-12">
        <p className="text-white/60 text-xs md:text-sm uppercase tracking-wider leading-relaxed font-bold">
          {step.desc}
        </p>
      </div>
    </motion.div>
  );
};

const Studio = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const processSteps = [
    {
      id: "01",
      title: "CALIDAD",
      category: "Textil de Alto Rendimiento",
      desc: "Todas las prendas están confeccionadas con algodón peinado 24.1. Durabilidad testeada bajo condiciones urbanas reales.",
      video:
        "https://res.cloudinary.com/det2xmstl/video/upload/f_auto,q_auto,vc_vp9,w_1280/v1770524663/13735636_3840_2160_30fps_gafbec.mp4",
    },
    {
      id: "02",
      title: "DEDICACIÓN",
      category: "Confección Manual Precisa",
      desc: "Cada pieza es ensamblada individualmente en nuestro taller. El error no es una opción; la precisión manual es nuestra ley.",
      video:
        "https://res.cloudinary.com/det2xmstl/video/upload/f_auto,q_auto,vc_vp9,w_1280/v1770524858/5393028-hd_1280_720_30fps_ay2aq9.mp4",
    },
    {
      id: "03",
      title: "DISEÑO",
      category: "Arte Urbano Aplicado",
      desc: "Nuestros diseños capturan el caos y la geometría del arte urbano. Transformamos la ciudad en piezas únicas.",
      video:
        "https://res.cloudinary.com/det2xmstl/video/upload/f_auto,q_auto,vc_vp9,w_1280/v1770512768/14970153_3840_2160_25fps_d6yl4m.mp4",
    },
  ];

  return (
    <div
      ref={containerRef}
      className="bg-black text-white h-[500vh] font-sans selection:bg-[#dc2626]"
    >
      {/* --- SECTION 1: HERO KINÉTICO --- */}
      <section className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden">
        <motion.div
          id="studio"
          style={{
            scale: useTransform(scrollYProgress, [0, 0.2], [1, 15]),
            opacity: useTransform(scrollYProgress, [0, 0.15], [1, 0]),
          }}
          className="absolute z-0 font-black italic text-[20vw] md:text-[25vw] leading-none whitespace-nowrap text-[#dc2626]"
        >
          STUDIO
        </motion.div>

        <motion.div
          className="z-10 text-center px-6"
          style={{
            scale: useTransform(scrollYProgress, [0, 0.2], [1, 0.8]),
            rotate: useTransform(scrollYProgress, [0, 1], [0, -5]),
          }}
        >
          <h1 className="text-5xl md:text-[9vw] font-black uppercase italic leading-[0.8] tracking-tighter">
            CREATIVE <br />
            <span
              className="text-transparent"
              style={{ WebkitTextStroke: "2px white" }}
            >
              WORKSHOP
            </span>
          </h1>
          <div className="mt-8 md:mt-10 flex flex-wrap justify-center gap-3 md:gap-4">
            <div className="px-3 md:px-4 py-2 border border-[#dc2626] text-[#dc2626] font-mono text-[9px] md:text-[10px] animate-pulse">
              OPERATIONAL: ACTIVE
            </div>
            <div className="px-3 md:px-4 py-2 border border-white/20 text-white/40 font-mono text-[9px] md:text-[10px]">
              ORIGEN: NOMAD_LAB
            </div>
          </div>
        </motion.div>
      </section>

      {/* --- SECTION 2: PROCESO FLOTANTE --- */}
      <section className="relative w-full px-6 md:px-12">
        {processSteps.map((step, i) => (
          <ProcessCard key={i} step={step} index={i} />
        ))}
      </section>
    </div>
  );
};

export default Studio;
