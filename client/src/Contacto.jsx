import React from "react";
import { motion } from "framer-motion";

const Contacto = () => {
  return (
    <section
      id="contacto"
      className="relative py-20 md:py-32 border-t border-black/5 overflow-hidden bg-white text-black group transition-colors duration-500 md:hover:bg-neutral-900"
    >
      {/* Enlace al Instagram que envuelve el Marquee */}
      <a
        href="https://instagram.com/nomadwear"
        target="_blank"
        rel="noopener noreferrer"
        className="relative z-10 block"
      >
        <div className="flex whitespace-nowrap overflow-hidden">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              repeat: Infinity,
              duration: 25,
              ease: "linear",
            }}
            className="flex items-center"
          >
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center">
                {/* - Móvil: Texto negro sólido (legible).
                  - Desktop: Efecto Outline al hacer hover.
                */}
                <span className="text-5xl md:text-[12vw] font-black uppercase italic py-4 tracking-tighter transition-all duration-500 
                  md:group-hover:text-transparent 
                  md:group-hover:[text-shadow:_-1px_-1px_0_#fff,1px_-1px_0_#fff,-1px_1px_0_#fff,1px_1px_0_#fff]
                  group-hover:text-red-600 md:group-hover:text-transparent"
                >
                  FOLLOW @NOMADWEAROK
                </span>
                <span className="text-3xl md:text-6xl px-6 md:px-12 opacity-20 md:opacity-10 md:group-hover:text-red-600 md:group-hover:opacity-100 transition-all duration-500">
                  ///
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </a>

      {/* Bloque de Información Inferior */}
      <div className="relative z-10 mt-12 md:mt-16 px-6 md:px-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
        
        {/* Columna Izquierda: Contacto Directo */}
        <div className="space-y-6 md:space-y-4 w-full md:w-auto">
          <div className="overflow-hidden">
            <motion.p
              whileInView={{ y: [20, 0] }}
              viewport={{ once: true }}
              className="text-[10px] tracking-[0.4em] text-gray-400 uppercase font-bold"
            >
              Contact Sales
            </motion.p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6 md:gap-12 text-sm uppercase tracking-widest font-black transition-colors md:group-hover:text-white">
            <a
              href="mailto:info@nomadwear.com.ar"
              className="hover:text-red-600 transition-colors flex items-center justify-between md:justify-start"
            >
              info@nomadwear.com.ar <span className="md:hidden">↗</span>
            </a>
            <a
              href="https://wa.me/+5493408677294?text=Hola, quiero más información sobre las colecciones de NOMAD"
              target="_blank"
              rel="noreferrer"
              className="hover:text-red-600 transition-colors flex items-center justify-between md:justify-start"
            >
              WhatsApp <span className="md:hidden">↗</span>
            </a>
          </div>
        </div>

        {/* Columna Derecha: Ubicación (Ajustada para que no se corte) */}
        <div className="text-left md:text-right transition-colors md:group-hover:text-white w-full md:w-auto md:min-w-max border-t md:border-none border-black/5 pt-6 md:pt-0">
          <p className="text-[10px] tracking-[0.3em] uppercase opacity-60 md:opacity-40 whitespace-nowrap">
            Based in Santa Fe, AR
          </p>
          <p className="text-[10px] tracking-[0.3em] uppercase opacity-60 md:opacity-40 whitespace-nowrap">
            Worldwide Shipping
          </p>
        </div>
      </div>
    </section>
  );
};

export default Contacto;