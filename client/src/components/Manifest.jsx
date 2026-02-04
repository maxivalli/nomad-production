import { useScroll, useTransform, motion, useSpring } from "framer-motion";
import { useRef } from "react";

const ManifiestoSection = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
  });

  const textX = useTransform(smoothProgress, [0, 1], ["10%", "-30%"]);
  const imageY = useTransform(smoothProgress, [0, 1], ["0%", "-40%"]);
  const rotateImg = useTransform(smoothProgress, [0, 1], [0, 5]);
  const opacityLine = useTransform(smoothProgress, [0, 0.5, 1], [0, 1, 0]);

  const sentence = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: { delay: 0.2, staggerChildren: 0.05 },
    },
  };

  const letter = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section
      id="manifiesto"
      ref={containerRef}
      className="relative min-h-screen bg-black text-white py-20 md:py-32 flex flex-col justify-center overflow-hidden"
    >
      {/* FONDO */}
      <div className="absolute inset-0 flex pointer-events-none opacity-[0.1]">
        <motion.h2
          style={{ x: textX }}
          className="text-[110vw] md:text-[51vw] font-black italic uppercase leading-none whitespace-nowrap select-none"
        >
          NOMAD COLLECTIVE NOMAD
        </motion.h2>
      </div>

      <motion.div
        style={{ opacity: opacityLine }}
        className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_4px,3px_100%] z-20"
      />

      <div className="relative z-10 container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row gap-12 lg:gap-16 items-start">
          <div className="w-full md:w-2/3">
            <motion.h3
              variants={sentence}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="font-black uppercase italic leading-[0.85] tracking-tighter flex flex-wrap"
              style={{
                fontSize: "clamp(3.2rem, 7vw, 10rem)",
              }}
            >
              {/* No somos */}
              <div className="w-full flex flex-wrap">
                {"No somos".split(" ").map((word, i) => (
                  <span key={i} className="whitespace-nowrap mr-[0.2em]">
                    {word.split("").map((char, j) => (
                      <motion.span
                        key={j}
                        variants={letter}
                        className="inline-block"
                      >
                        {char}
                      </motion.span>
                    ))}
                  </span>
                ))}
              </div>

              {/* de acá (de en blanco, acá en rojo) */}
              <div className="w-full flex flex-wrap">
                <span className="whitespace-nowrap mr-[0.2em] text-white">
                  {"de".split("").map((char, j) => (
                    <motion.span
                      key={j}
                      variants={letter}
                      className="inline-block"
                    >
                      {char}
                    </motion.span>
                  ))}
                </span>
                <span className="whitespace-nowrap text-red-600">
                  {"acá,".split("").map((char, j) => (
                    <motion.span
                      key={j}
                      variants={letter}
                      className="inline-block"
                    >
                      {char}
                    </motion.span>
                  ))}
                </span>
              </div>

              {/* pero */}
              <div className="w-full flex flex-wrap">
                <span className="whitespace-nowrap text-white">
                  {"pero".split("").map((char, j) => (
                    <motion.span
                      key={j}
                      variants={letter}
                      className="inline-block"
                    >
                      {char}
                    </motion.span>
                  ))}
                </span>
              </div>

              {/* estamos */}
              <div className="w-full flex flex-wrap">
                <span className="whitespace-nowrap text-white">
                  {"estamos".split("").map((char, j) => (
                    <motion.span
                      key={j}
                      variants={letter}
                      className="inline-block"
                    >
                      {char}
                    </motion.span>
                  ))}
                </span>
              </div>

              {/* en todos */}
              <div className="w-full flex flex-wrap">
                {"en todos".split(" ").map((word, i) => (
                  <span
                    key={i}
                    className="whitespace-nowrap mr-[0.2em] text-white"
                  >
                    {word.split("").map((char, j) => (
                      <motion.span
                        key={j}
                        variants={letter}
                        className="inline-block"
                      >
                        {char}
                      </motion.span>
                    ))}
                  </span>
                ))}
              </div>

              {/* lados. */}
              <div className="w-full flex flex-wrap">
                <span className="whitespace-nowrap text-white">
                  {"lados".split("").map((char, j) => (
                    <motion.span
                      key={j}
                      variants={letter}
                      className="inline-block"
                    >
                      {char}
                    </motion.span>
                  ))}
                  <motion.span
                    variants={letter}
                    className="text-red-600 inline-block"
                  >
                    .
                  </motion.span>
                </span>
              </div>
            </motion.h3>

            <div className="mt-12 md:mt-20 max-w-lg space-y-8 md:space-y-12">
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="text-lg md:text-3xl font-light italic text-gray-400 leading-tight border-l-2 border-red-600 pl-6"
              >
                "Nuestra ropa es la armadura para el caos urbano y un refugio
                para la calma del camino."
              </motion.p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 pt-10 border-t border-white/10">
                <motion.div whileHover={{ x: 10 }} className="transition-all">
                  <h4 className="text-red-600 font-bold uppercase text-[10px] tracking-[0.3em] mb-3">
                    Filosofía
                  </h4>
                  <p className="text-sm text-gray-500 uppercase italic font-medium">
                    Movimiento constante, identidad fluida.
                  </p>
                </motion.div>
                <motion.div whileHover={{ x: 10 }} className="transition-all">
                  <h4 className="text-red-600 font-bold uppercase text-[10px] tracking-[0.3em] mb-3">
                    Producción
                  </h4>
                  <p className="text-sm text-gray-500 uppercase italic font-medium">
                    Ediciones limitadas. Calidad estética.
                  </p>
                </motion.div>
              </div>
            </div>
          </div>

          {/* IMAGEN */}
          <motion.div
            style={{ y: imageY, rotate: rotateImg }}
            className="w-full md:w-1/3 mt-10 md:mt-32"
          >
            <div className="relative aspect-[3/4] overflow-hidden transition-all duration-1000 group shadow-2xl ring-1 ring-white/10">
              <motion.img
                whileHover={{ scale: 1.2 }}
                transition={{ duration: 1.5 }}
                src="https://images.unsplash.com/photo-1713885753849-3d32cfd3dd6d?q=80&w=1064"
                alt="Nomad"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-0 left-0 w-full h-full bg-red-600/10 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="absolute bottom-6 left-6 z-30 text-[9px] font-mono tracking-widest text-white/80 leading-none">
                <span className="text-red-600">●</span> SIGNAL_DETECTED <br />
                <span className="opacity-40 uppercase">
                  Santa Fe, AR // 2026
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ManifiestoSection;
