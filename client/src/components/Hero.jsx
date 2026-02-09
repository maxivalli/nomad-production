import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

const Hero = () => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [collectionName, setCollectionName] = useState("LOADING_PROTOCOL");
  const [timeLeft, setTimeLeft] = useState({
    dias: "00", horas: "00", minutos: "00", segundos: "00",
  });
  const [targetDateLabel, setTargetDateLabel] = useState("SYNC_PENDING...");
  
  // ✅ NUEVO: Estado para el video dinámico
  const [videoSrc, setVideoSrc] = useState("");

  useEffect(() => {
    // Función para definir qué video cargar
    const handleVideoSrc = () => {
      const desktopVideo = "https://res.cloudinary.com/det2xmstl/video/upload/f_auto,q_auto,vc_vp9,w_1280/v1770525214/8230588-hd_1920_1080_30fps_bovbcy.mp4";
      const mobileVideo = "https://res.cloudinary.com/det2xmstl/video/upload/v1770629236/8230667-sd_540_960_30fps_i8cpsn.mp4";
      
      // Si el ancho es menor a 768px (móvil/tablet vertical), cargamos el video vertical
      if (window.innerWidth < 768) {
        setVideoSrc(mobileVideo);
      } else {
        setVideoSrc(desktopVideo);
      }
    };

    // Ejecutar al cargar y al redimensionar
    handleVideoSrc();
    window.addEventListener("resize", handleVideoSrc);

    const fetchData = async () => {
      try {
        const resDate = await fetch("/api/settings/launch-date");
        const dataDate = await resDate.json();
        const resCol = await fetch("/api/settings/collection");
        const dataCol = await resCol.json();

        if (dataDate.date) {
          const [y, m, d] = dataDate.date.split("-");
          const meses = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
          setTargetDateLabel(`${d}_${meses[parseInt(m) - 1]}_${y}`);
          const targetTime = new Date(`${dataDate.date}T00:00:00`).getTime();
          startTimer(targetTime);
        }

        if (dataCol && dataCol.value) {
          setCollectionName(dataCol.value.toUpperCase().replace(/\s+/g, "_"));
        } else {
          setCollectionName("NOMAD_CORE");
        }
      } catch (err) {
        setTargetDateLabel("ERROR_SYNC_FAILED");
        setCollectionName("SYSTEM_OFFLINE");
      }
    };

    const startTimer = (targetTime) => {
      const intervalo = setInterval(() => {
        const ahora = new Date().getTime();
        const diferencia = targetTime - ahora;
        if (diferencia < 0) {
          clearInterval(intervalo);
          setTimeLeft({ dias: "00", horas: "00", minutos: "00", segundos: "00" });
        } else {
          const d = Math.floor(diferencia / (1000 * 60 * 60 * 24));
          const h = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const m = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
          const s = Math.floor((diferencia % (1000 * 60)) / 1000);
          setTimeLeft({
            dias: d < 10 ? `0${d}` : d,
            horas: h < 10 ? `0${h}` : h,
            minutos: m < 10 ? `0${m}` : m,
            segundos: s < 10 ? `0${s}` : s,
          });
        }
      }, 1000);
      return () => clearInterval(intervalo);
    };

    fetchData();
    return () => window.removeEventListener("resize", handleVideoSrc);
  }, []);

  return (
    <section className="relative h-screen flex flex-col items-center px-4 overflow-hidden bg-black select-none">
      <div className="absolute inset-0 z-0 bg-black">
        <AnimatePresence>
          {!videoLoaded && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex items-center justify-center bg-black"
            >
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="text-red-600 animate-spin opacity-40" size={48} strokeWidth={1} />
                <span className="text-white/20 text-[8px] tracking-[0.5em] font-mono">BUFFERING_NOMAD_STREAM</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ✅ CAMBIO: Usamos videoSrc en la fuente del video */}
        {videoSrc && (
          <video
            key={videoSrc} // Importante para que React recargue el elemento video al cambiar el src
            autoPlay
            loop
            muted
            playsInline
            onCanPlayThrough={() => setVideoLoaded(true)}
            className={`w-full h-full object-cover grayscale brightness-[0.5] transition-opacity duration-[1500ms] ease-in-out ${
              videoLoaded ? "opacity-90" : "opacity-0"
            }`}
          > 
            <source src={videoSrc} type="video/mp4" />
          </video>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black z-10" />
      </div>

      {/* ... Resto del componente (Marca y Contador) ... */}
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center text-center mt-[-8vw] md:mt-[-9vw]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={videoLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="flex flex-col items-center w-full"
        >
          <h2
            className="text-[30vw] md:text-[20vw] leading-[0.7] uppercase text-white flex items-baseline justify-center ml-[4vw] md:ml-[5vw]"
            style={{ fontFamily: "Hyperwave, sans-serif" }}
          >
            Nomad
            <span
              className="text-[60vw] md:text-[40vw] text-red-600 leading-none inline-block translate-y-[0.08em] ml-[-0.07em]"
              style={{ fontFamily: "Hyperwave, sans-serif" }}
            >
              .
            </span>
          </h2>
          <div className="mt-[-13vw] md:mt-[-9vw] mb-[8vh]">
            <p className="text-white tracking-[0.6em] md:tracking-[1em] uppercase text-[8px] md:text-[12px] opacity-70">
              UNBOUND BY TERRITORY
            </p>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={videoLoaded ? { opacity: 1 } : {}}
        transition={{ delay: 0.5, duration: 1 }}
        className="relative z-10 pb-10 mb-20"
      >
        <div className="flex flex-col items-center gap-5">
          <div className="flex items-center gap-3">
            <span className="h-[1px] w-3 bg-red-600/50"></span>
            <span className="text-red-600 font-mono text-[8px] md:text-[14px] tracking-[0.5em] uppercase font-black">
              {collectionName}
            </span>
            <span className="h-[1px] w-3 bg-red-600/50"></span>
          </div>
          <div className="flex gap-6 md:gap-10">
            {[
              { etiqueta: "DÍAS", valor: timeLeft.dias },
              { etiqueta: "HRS", valor: timeLeft.horas },
              { etiqueta: "MIN", valor: timeLeft.minutos },
              { etiqueta: "SEG", valor: timeLeft.segundos },
            ].map((unidad, index) => (
              <div key={index} className="flex flex-col items-center group">
                <span className="text-3xl md:text-5xl font-[1000] italic uppercase text-white tracking-[-0.05em] tabular-nums leading-none group-hover:text-red-600 transition-colors duration-300">
                  {unidad.valor}
                </span>
                <span className="text-[6px] md:text-[8px] text-white/40 uppercase tracking-[0.4em] font-black mt-2">
                  {unidad.etiqueta}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 px-6 py-2 border border-white/5 bg-white/[0.01] backdrop-blur-sm">
            <span className="text-white/40 text-[7px] md:text-[10px] font-mono tracking-[0.3em] uppercase">
              {targetDateLabel} // PROTOCOLO_ACTIVO
            </span>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;