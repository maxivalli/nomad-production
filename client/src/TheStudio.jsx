import React, { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

const ProcessCard = ({ step }) => {
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
    offset: ["start 0.9", "center center"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const grayscale = useTransform(smoothProgress, [0, 1], ["grayscale(100%)", "grayscale(10%)"]);
  const opacity = useTransform(smoothProgress, [0, 1], [0.3, 1]);

  return (
    <div ref={cardRef} className="flex flex-col">
      <div className="relative aspect-[3/2] overflow-hidden bg-black border border-white/5 mb-6 group">
        <AnimatePresence>
          {isVideoLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center z-[25] bg-black"
            >
              <Loader2 className="text-red-600 animate-spin" size={32} strokeWidth={1} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute inset-0 pointer-events-none z-20 opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(circle,transparent_40%,rgba(0,0,0,0.8)_100%)]" />

        <div className="absolute inset-4 z-20 pointer-events-none border-t border-l border-white/20 w-4 h-4" />
        <div className="absolute inset-4 left-auto z-20 pointer-events-none border-t border-r border-white/20 w-4 h-4" />
        <div className="absolute inset-4 top-auto z-20 pointer-events-none border-b border-l border-white/20 w-4 h-4" />
        <div className="absolute inset-4 top-auto left-auto z-20 pointer-events-none border-b border-r border-white/20 w-4 h-4" />

        <motion.video
          autoPlay
          loop
          muted
          playsInline
          onCanPlayThrough={() => setIsVideoLoading(false)} 
          style={{
            filter: grayscale,
            opacity: isVideoLoading ? 0 : opacity,
          }}
          className="w-full h-full object-cover scale-105 transition-opacity duration-1000"
        >
          <source src={optimizeVideoUrl(step.video)} type="video/mp4" />
        </motion.video>

        <div className="absolute top-6 right-6 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-1 rounded-sm border border-white/10 z-30">
          <motion.div
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-2 h-2 bg-red-600 rounded-full shadow-[0_0_8px_rgba(220,38,38,0.8)]"
          />
          <span className="text-[8px] font-mono text-white tracking-widest">RAW 24FPS</span>
        </div>

        <div className="absolute bottom-4 left-4 z-30 flex gap-4 text-[7px] font-mono text-white/40 uppercase tracking-[0.2em]">
          <span>ISO 400</span>
          <span>F 2.8</span>
          <span>1/50</span>
        </div>

        <div className="absolute top-6 left-6 z-30">
          <span className="text-white font-mono text-[10px] bg-red-600 px-1.5 py-0.5">{step.id}</span>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-white text-xl font-black uppercase italic tracking-tighter">
          {step.title}
        </h3>
        <p className="text-neutral-500 text-[10px] md:text-xs uppercase tracking-[0.15em] leading-relaxed font-medium text-justify">
          {step.desc}
        </p>
        <div className="pt-4 overflow-hidden">
          <motion.div
            style={{ scaleX: smoothProgress }}
            className="h-[1px] bg-red-600 origin-left w-full"
          />
        </div>
      </div>
    </div>
  );
};

const Studio = () => {
  const processSteps = [
    {
      id: "01",
      title: "TOP QUALITY",
      desc: "Todas la prendas están confeccionadas con algodón peinado 24.1. Durabilidad testeada bajo condiciones urbanas reales.",
      video: "https://res.cloudinary.com/det2xmstl/video/upload/v1769665843/6460112-sd_960_540_25fps_wmmcsw.mp4",
    },
    {
      id: "02",
      title: "HAND MADE",
      desc: "Cada pieza es ensamblada individualmente en nuestro taller. El error no es una opción; la precisión manual es nuestra ley.",
      video: "https://res.cloudinary.com/det2xmstl/video/upload/v1769665851/3936483-sd_960_540_30fps_rrr305.mp4",
    },
    {
      id: "03",
      title: "UNIQUE DESIGN",
      desc: "Nuestros diseños capturan el caos y la geometría del arte urbano. Transformamos la ciudad en piezas únicas.",
      video: "https://res.cloudinary.com/det2xmstl/video/upload/v1769665841/14970144_960_540_25fps_ieytzu.mp4",
    },
  ];

  return (
    <section id="studio" className="bg-[#0a0a0a] py-32 border-t border-white/5 font-inter">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        {/* HEADER SECTION */}
        <div className="mb-16 relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-red-600 text-[9px] md:text-xs font-bold uppercase tracking-[0.6em] block mb-0">
              the hole of rabbit
            </span>
          </div>
          <h2 className="text-white text-5xl md:text-8xl font-black uppercase italic tracking-tighter leading-[0.8]">
            creative <br /> Studio
          </h2>
        </div>

        {/* MANIFIESTO CREATIVO / NUEVO BLOQUE DE TEXTO */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-24 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 border-l border-red-600 pl-6 md:pl-10"
        >
          <div className="space-y-4">
            <span className="text-white/30 font-mono text-[9px] tracking-[0.4em] uppercase">Operational_Manual // Dev_Phase</span>
            <p className="text-gray-400 text-xs md:text-sm uppercase tracking-[0.1em] leading-relaxed italic font-light text-justify">
              En NOMAD, el proceso creativo no comienza en un lienzo, sino en el asfalto. Nuestra metodología fusiona la ingeniería textil con la cultura underground, interpretando las texturas de la ciudad para transformarlas en indumentaria técnica de alto rendimiento. Cada pieza es un prototipo diseñado para resistir el movimiento constante.
            </p>
          </div>
          <div className="flex flex-col justify-end space-y-4">
            <p className="text-gray-400 text-xs md:text-sm uppercase tracking-[0.1em] leading-relaxed italic font-light text-justify">
              La confección se rige por estándares de precisión manual absoluta. Utilizamos algodón peinado de alta densidad y costuras reforzadas que garantizan una estructura indeformable. No creamos ropa de temporada; construimos armaduras urbanas destinadas a aquellos que entienden que el territorio es un estado mental, no un límite geográfico.
            </p>
            <div className="flex gap-4 opacity-20 group">
                <span className="text-[8px] text-white font-mono tracking-widest">REF: NOMAD_PROT_26</span>
                <span className="text-[8px] text-white font-mono tracking-widest">AUTH: 100%_TECH_SPEC</span>
            </div>
          </div>
        </motion.div>

        {/* SEPARADOR CON LÍNEA ANIMADA */}
        <div className="mb-24 h-[1px] w-full bg-white/5 relative">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "100%" }}
            transition={{ duration: 1.5, ease: "circOut" }}
            className="absolute h-full bg-red-600/30"
          />
        </div>

        {/* GRID DE VIDEOS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12">
          {processSteps.map((step) => (
            <ProcessCard key={step.id} step={step} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Studio;