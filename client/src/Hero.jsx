import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const Hero = () => {
  const [timeLeft, setTimeLeft] = useState({
    dias: "00",
    horas: "00",
    minutos: "00",
    segundos: "00",
  });
  const [targetDateLabel, setTargetDateLabel] = useState("Cargando...");

  useEffect(() => {
    const fetchLaunchDate = async () => {
      try {
        const res = await fetch("/api/settings/launch-date");
        const data = await res.json();

        if (data.date) {
          // Ajustamos el label visual (de YYYY-MM-DD a DD_MES_YYYY)
          const [y, m, d] = data.date.split("-");
          const meses = [
            "ENERO",
            "FEBRERO",
            "MARZO",
            "ABRIL",
            "MAYO",
            "JUNIO",
            "JULIO",
            "AGOSTO",
            "SEPTIEMBRE",
            "OCTUBRE",
            "NOVIEMBRE",
            "DICIEMBRE",
          ];
          setTargetDateLabel(`${d}_${meses[parseInt(m) - 1]}_${y}`);

          // Iniciamos el contador
          const targetTime = new Date(`${data.date}T00:00:00`).getTime();
          startTimer(targetTime);
        }
      } catch (err) {
        console.error("Error conectando con el servidor de tiempo:", err);
      }
    };

    const startTimer = (targetTime) => {
      const intervalo = setInterval(() => {
        const ahora = new Date().getTime();
        const diferencia = targetTime - ahora;

        if (diferencia < 0) {
          clearInterval(intervalo);
          setTimeLeft({
            dias: "00",
            horas: "00",
            minutos: "00",
            segundos: "00",
          });
        } else {
          const d = Math.floor(diferencia / (1000 * 60 * 60 * 24));
          const h = Math.floor(
            (diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
          );
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

    fetchLaunchDate();
  }, []);

  return (
    <section className="relative h-screen flex flex-col items-center px-4 overflow-hidden bg-black">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover grayscale brightness-[0.5] opacity-90"
        >
          <source
            src="https://res.cloudinary.com/det2xmstl/video/upload/v1769384250/nomad_nz8rov.mov"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black" />
      </div>

      {/* MARCA */}
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <h2 className="text-[18vw] md:text-[11vw] leading-none font-black italic uppercase tracking-tighter text-white">
            Nomad<span className="text-red-600">.</span>
          </h2>
          <p className="text-white tracking-[0.6em] md:tracking-[1em] uppercase text-[8px] md:text-[12px] mt-2 opacity-70">
            UNBOUND BY TERRITORY
          </p>
        </motion.div>
      </div>

      {/* CONTADOR DINÁMICO */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="relative z-10 pb-10 md:pb-10 mb-20"
      >
        <div className="flex flex-col items-center gap-5">
          <div className="flex items-center gap-3">
            <span className="h-[1px] w-3 bg-red-600/50"></span>
            <span className="text-red-600 font-mono text-[8px] md:text-[14px] tracking-[0.5em] uppercase font-black">
              AUTUMN_COLLECTION
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
                <span
                  className="text-3xl md:text-4xl font-[1000] italic uppercase text-white tracking-[-0.05em] tabular-nums leading-none group-hover:text-red-600 transition-colors"
                  style={{ WebkitFontSmoothing: "antialiased" }}
                >
                  {unidad.valor}
                </span>
                <span className="text-[6px] md:text-[8px] text-white-600/60 uppercase tracking-[0.4em] font-black mt-2 opacity-60">
                  {unidad.etiqueta}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-0 px-4 py-1 border border-none bg-white/[0.02]">
            <span className="text-white-500 text-[7px] md:text-[10px] font-mono tracking-[0.3em] uppercase">
              {targetDateLabel} // PROTOCOLO_ACTIVO
            </span>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
