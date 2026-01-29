import React from "react";
import { motion } from "framer-motion";

const IntroMarquee = () => {
  const words = [
    "WORKING", 
    "NOMAD STUDIO", 
    "PACKING AREA", 
    "EXPERIENCE",
    "CORE DESIGN"
  ];

  return (
    <div className="relative py-12 overflow-hidden w-full flex items-center justify-center">
      
      <div className="relative w-full bg-[#facc15] border-y-4 border-black h-16 md:h-22 -rotate-[2deg] scale-110 flex items-center shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(45deg, #000 25%, transparent 25%, transparent 50%, #000 50%, #000 75%, transparent 75%, transparent)`,
            backgroundSize: `40px 40px`
          }}
        />

        <motion.div 
          initial={{ x: 0 }}
          animate={{ x: "-50%" }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="flex whitespace-nowrap items-center"
        >
          {[...words, ...words].map((word, i) => (
            <div key={i} className="flex items-center">
              <span className="text-black font-[1000] italic text-3xl md:text-5xl tracking-[-0.05em] px-12">
                {word}
              </span>
              <div className="flex gap-1.5 opacity-80">
                 <div className="w-2 h-8 md:h-10 bg-black -rotate-12" />
                 <div className="w-2 h-8 md:h-10 bg-black -rotate-12" />
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default IntroMarquee;