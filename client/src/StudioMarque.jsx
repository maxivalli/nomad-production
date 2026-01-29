import React from "react";
import { motion } from "framer-motion";

const StudioMarquee = () => {
  const words = ["CRAFTED IN ARGENTINA", "LIMITED EDITION", "TECHWEAR PROTOCOL", "NOMAD CORE", "URBAN ADAPTATION"];

  return (
    <div className="bg-red-600 py-4 overflow-hidden flex whitespace-nowrap border-y border-black">
      <motion.div 
        initial={{ x: 0 }}
        animate={{ x: "-50%" }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="flex gap-10 items-center"
      >
        {/* Duplicamos el contenido para que el loop sea infinito */}
        {[...words, ...words].map((word, i) => (
          <div key={i} className="flex items-center gap-10">
            <span className="text-black font-black italic text-xl md:text-4xl tracking-tighter">
              {word}
            </span>
            <span className="w-2 h-2 bg-black rotate-45" />
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default StudioMarquee;