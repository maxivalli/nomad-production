import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const PreLoader = () => {
  const symbols = ["⚡︎", "♒︎", "✈︎", "⚽︎", "⛅︎", "⛺︎", "."];
  const [currentSymbol, setCurrentSymbol] = useState(symbols[0]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => {
        if (prev < symbols.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setCurrentSymbol(symbols[index]);
  }, [index]);

  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: "-100%" }}
      transition={{
        duration: 1,
        delay: 3,
        ease: [0.76, 0, 0.24, 1],
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black text-white"
    >
      {/* Eliminamos el overflow-hidden de aquí para que los símbolos grandes no se corten */}
      <div className="p-4">
        <motion.h1
          initial={{ y: 120 }}
          animate={{
            y: 0,
            opacity: [1, 0.5, 1, 0.8, 1], 
          }}
          transition={{
            y: { duration: 0.8, ease: "easeOut" },
            opacity: { duration: 2, repeat: Infinity, ease: "linear" },
          }}
          className="text-[10vw] md:text-[7vw] leading-none font-black italic uppercase tracking-tighter flex items-baseline"
        >
          Nomad
          <span 
            className="text-red-600 inline-block text-left" 
            style={{ 
              // Si es el punto, que no tenga ancho fijo. Si es otro, le damos espacio.
              width: currentSymbol === "." ? "auto" : "1ch",
              paddingLeft: "0.1ch" // Un pequeño respiro para que no toque la 'd'
            }}
          >
            {currentSymbol}
          </span>
        </motion.h1>
      </div>
    </motion.div>
  );
};

export default PreLoader;