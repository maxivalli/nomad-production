import { motion } from "framer-motion";

const PreLoader = () => {

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
          className="text-[10vw] md:text-[10vw] leading-none tracking-tighter flex items-baseline"
          style={{ fontFamily: "Hyperwave, sans-serif" }}
        >
          Nomad
          <span className="text-red-600 inline-block text-left text-[20vw] md:text-[20vw] translate-y-[0.08em] ml-[-0.05em]">
            .
          </span>
        </motion.h1>
      </div>
    </motion.div>
  );
};

export default PreLoader;
