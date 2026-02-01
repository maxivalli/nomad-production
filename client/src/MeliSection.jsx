import React from "react";
import { motion } from "framer-motion";
import { ShoppingCart, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
// Importación del logo desde tus assets
import MLlogo from "../src/assets/MLlogo.png";

const MeliSection = () => {
  const meliLink = "https://www.mercadolibre.com.ar";
  const productImg =
    "https://res.cloudinary.com/det2xmstl/image/upload/v1769708493/unqvrrh5cftb010pnwx5.jpg";

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  };

  return (
    <section className="py-20 bg-black px-6 flex flex-col items-center overflow-hidden">
      <div className="w-full max-w-[90vw] flex flex-col items-center">
        {/* ENCABEZADO NOMAD */}
        <div className="mb-12 w-full max-w-[1200px]">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-red-600 text-[10px] font-bold uppercase tracking-[0.4em] block mb-1"
          >
            Terminal Online 
          </motion.span>
          <h2 className="text-white text-5xl md:text-8xl font-black uppercase italic tracking-tighter leading-[0.75]">
            official <br /> <span className="text-red-600">Store</span>
          </h2>
        </div>

        {/* CARD DE MELI */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="bg-[#FFE600] rounded-sm overflow-hidden flex flex-col md:flex-row items-stretch border border-white/10 w-full max-w-[1200px] shadow-2xl"
        >
          {/* COLUMNA FOTO */}
          <div className="md:w-1/2 relative bg-white flex items-center justify-center p-8 border-b md:border-b-0 md:border-r border-black/5 overflow-hidden">
            <motion.div
              variants={itemVariants}
              className="absolute top-4 left-4 flex flex-col gap-2 z-10"
            >
              <span className="bg-[#3483fa] text-white text-[10px] font-bold px-2 py-1 rounded-sm tracking-wide">
                MÁS VENDIDO
              </span>
              <div className="flex items-center gap-1 bg-[#00a650] text-white text-[10px] font-bold px-2 py-1 rounded-sm w-fit">
                <Zap size={10} className="fill-current" />
                FULL
              </div>
            </motion.div>

            <motion.img
              variants={itemVariants}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              src={productImg}
              alt="Product View"
              className="w-full h-auto max-h-[480px] object-contain mix-blend-multiply drop-shadow-2xl"
            />
          </div>

          {/* COLUMNA INFO */}
          <div className="md:w-1/2 p-8 md:p-14 flex flex-col justify-center text-black">
            {/* Eliminé el párrafo vacío que tenías arriba para limpiar el código */}
            <motion.p
              variants={itemVariants}
              className="mt-8 text-[9px] font-mono uppercase tracking-[0.2em] text-black/40 border-t border-black/5 pt-6 w-full text-center md:text-left md:text-[11px]"
            ></motion.p>
            <motion.div
              variants={itemVariants}
              className="flex items-center justify-center md:justify-start gap-3 mb-20"
            >
              {/* LOGO DE MERCADO LIBRE */}
              <img
                src={MLlogo}
                alt="Mercado Libre Logo"
                className="h-8 md:h-21 w-auto object-contain"
              />
              <div className="h-6 w-[1px] bg-black/20" />
              <span className="text-[10px] font-black uppercase tracking-widest text-black/60">
                Official Store
              </span>
            </motion.div>

            {/* Título: También centrado en móvil para que acompañe al logo */}
            <motion.div variants={itemVariants} className="space-y-4 mb-10">
              {/* Contenedores de checks: Ajustados para centrar en móvil */}
              <div className="flex items-center md:justify-start gap-3">
                <ShieldCheck size={20} className="text-[#00A650] shrink-0" />
                <p className="text-[10px] md:text-[13px] font-bold uppercase tracking-tight">
                  Compra Protegida con Mercado Pago
                </p>
              </div>
              <div className="flex items-center md:justify-start gap-3">
                <CheckCircle2 size={20} className="text-[#00A650] shrink-0" />
                <p className="text-[10px] md:text-[13px] font-bold uppercase tracking-tight">
                  Envíos a todo el país por Mercado Envíos
                </p>
              </div>
            </motion.div>

            <motion.a
              variants={itemVariants}
              href={meliLink}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center justify-between bg-[#3483fa] text-white px-8 py-5 transition-all hover:bg-black active:scale-95 shadow-xl rounded-md"
            >
              <span className="font-black italic uppercase tracking-tighter text-sm md:text-xl">
                Ir a la tienda oficial
              </span>
              <ShoppingCart className="ml-4 group-hover:rotate-[-12deg] transition-transform" />
            </motion.a>

            <motion.p
              variants={itemVariants}
              className="mt-8 text-[9px] font-mono uppercase tracking-[0.2em] text-black/40 border-t border-black/5 pt-6 w-full text-center md:text-left md:text-[11px]"
            >
              hasta 3 cuotas sin interés. Despacho en menos de 24hs.
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MeliSection;
