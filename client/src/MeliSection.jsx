import React from "react";
import { motion } from "framer-motion";
import { ShoppingCart, CheckCircle2, ShieldCheck } from "lucide-react";

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
    <section className="py-20 bg-black px-6 flex flex-col items-center">
      {/* 1. CONTENEDOR DE TÍTULOS: Al 90% del ancho de la pantalla */}
      <div className="w-full max-w-[90vw]">
        <div className="mb-12">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-red-600 text-[10px] font-bold uppercase tracking-[0.4em] block mb-1"
          >
            Online Terminal
          </motion.span>
          <h2 className="text-white text-5xl md:text-8xl font-black uppercase italic tracking-tighter leading-[0.75]">
            official <br /> <span className="text-red-600">Store</span>
          </h2>
        </div>
      </div>

      {/* 2. CONTENEDOR DE LA CARD: Centrado pero limitado a 1200px */}
      <div className="w-full flex justify-start lg:justify-center"> 
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="bg-[#FFE600] rounded-sm overflow-hidden flex flex-col md:flex-row items-stretch border border-white/10 w-full max-w-[1200px]"
        >
          {/* COLUMNA FOTO */}
          <div className="md:w-1/2 relative bg-white flex items-center justify-center p-8 border-b md:border-b-0 md:border-r border-black/5 overflow-hidden">
            <motion.div
              variants={itemVariants}
              className="absolute top-4 left-4 flex gap-2 z-10"
            >
              <span className="bg-[#303370] text-white text-[10px] font-bold px-2 py-0.5 rounded-sm">
                MÁS VENDIDO
              </span>
            </motion.div>

            <motion.img
              variants={itemVariants}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              src={productImg}
              alt="Producto en Meli"
              className="w-full h-auto max-h-[400px] object-contain mix-blend-multiply drop-shadow-xl"
            />
          </div>

          {/* COLUMNA INFO */}
          <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center text-black">
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-2 mb-4"
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-black/60">
                Official Store
              </span>
              <div className="h-[1px] w-12 bg-black/20" />
            </motion.div>

            <motion.h2
              variants={itemVariants}
              className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-[0.9] mb-6"
            >
              VISIT US ON <br />
              <span className="text-[#303370]">MERCADO LIBRE</span>
            </motion.h2>

            <motion.div variants={itemVariants} className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <ShieldCheck size={20} className="text-[#00A650]" />
                <p className="text-xs font-bold uppercase tracking-tight">
                  Compra Protegida con Mercado Pago
                </p>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 size={20} className="text-[#00A650]" />
                <p className="text-xs font-bold uppercase tracking-tight">
                  Envíos a todo el país por Mercado Envíos
                </p>
              </div>
            </motion.div>

            <motion.a
              variants={itemVariants}
              href={meliLink}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center justify-between bg-[#303370] text-white px-8 py-4 transition-all hover:bg-black active:scale-95 shadow-xl"
            >
              <span className="font-black italic uppercase tracking-tighter text-sm md:text-xl">
                Ir a la tienda oficial
              </span>
              <ShoppingCart className="ml-4 group-hover:rotate-[-12deg] transition-transform" />
            </motion.a>

            <motion.p
              variants={itemVariants}
              className="mt-6 text-[9px] font-mono uppercase tracking-widest text-black/40"
            >
              hasta 3 cuotas sin interés • Despacho en menos de 24hs
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MeliSection;