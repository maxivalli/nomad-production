import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "./Navbar";
import Footer from "./Footer";
import {
  Send,
  MapPin,
  User,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Zap,
  Package,
  Layout,
  Box,
  Award,
  CheckCircle2,
  HardHat,
  Globe,
  Database,
} from "lucide-react";

const Retailers = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    localidad: "",
    mensaje: "",
  });
  const CHARACTER_LIMIT = 250;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "mensaje" && value.length > CHARACTER_LIMIT) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleWhatsAppSend = (e) => {
    e.preventDefault();
    const phone = "5493408677294";
    const text = `*NUEVA SOLICITUD RETAILER - NOMAD*%0A%0A*Nombre:* ${formData.nombre}%0A*Localidad:* ${formData.localidad}%0A*Mensaje:* ${formData.mensaje}`;
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  };

  const packagingImages = [
    "https://res.cloudinary.com/det2xmstl/image/upload/v1769696323/tuv0nsw9yjlot50opwxc.jpg",
    "https://res.cloudinary.com/det2xmstl/image/upload/v1769696292/sbvoik8lyhocv9rvkrnf.jpg",
    "https://res.cloudinary.com/det2xmstl/image/upload/v1769970095/Gemini_Generated_Image_6zmp3p6zmp3p6zmp_de_taman%CC%83o_grande_djl4fm.jpg",
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black text-white pt-32 md:pt-48 pb-20 px-6 md:px-12 selection:bg-red-600 font-inter">
        <div className="max-w-7xl mx-auto">
          {/* 01. HEADER SECTION - ADN NOMAD */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-32 items-end">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <span className="text-red-600 text-[10px] font-black uppercase tracking-[0.6em] block mb-4">
                operaciones_mayoristas // v2.6
              </span>
              <h1 className="text-5xl md:text-8xl font-black italic uppercase leading-[0.8] tracking-tighter">
                AMPLIFICA <br />{" "}
                <span className="text-red-600">EL IMPACTO</span>
              </h1>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-4 border-l border-white/30 pl-6"
            >
              <p className="text-justify text-gray-400 uppercase text-xs md:text-sm tracking-[0.2em] leading-relaxed italic">
                No somos solo una marca, somos un estudio creativo aplicado a la
                indumentaria técnica. Buscamos puntos de distribución que
                funcionen como terminales de nuestro ecosistema urbano.
              </p>
              <div className="flex gap-4 opacity-30">
                <span className="text-[8px] font-mono tracking-widest text-white">
                  NOMAD_STUDIO_DEPT
                </span>
                <span className="text-[8px] font-mono tracking-widest text-white">
                  TECH_SPEC_V01
                </span>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* COLUMNA IZQUIERDA: MANIFIESTO Y BENEFICIOS */}
            <div className="space-y-24">
              {/* BLOQUE: CALIDAD TÉCNICA (STUDIO DRIVEN) */}
              <section className="space-y-6">
                <div className="flex items-center gap-4 text-red-600">
                  <HardHat size={20} />
                  <h3 className="font-black uppercase tracking-tighter text-xl italic">
                    MANUFACTURA DE ESTUDIO
                  </h3>
                </div>
                <p className="text-justify text-gray-400 text-sm uppercase leading-relaxed tracking-wider italic">
                  Cada prenda distribuida nace en nuestro{" "}
                  <span className="text-white">Creative Studio</span>.
                  Utilizamos Algodón Peinado 24.1 de alta densidad, con procesos
                  de confección que aseguran una estructura indeformable.
                  Entregamos armaduras urbanas listas para la exposición.
                </p>
              </section>

              {/* BLOQUE: STANDS MÓVILES (HARDWARE) */}
              <section className="space-y-8">
                <div className="flex items-center gap-4 text-red-600">
                  <Database size={20} />
                  <h3 className="font-black uppercase tracking-tighter text-xl italic">
                    SISTEMAS DE EXHIBICIÓN
                  </h3>
                </div>
                <div className="border border-white/10 bg-neutral-900/40 overflow-hidden group relative">
                  <div className="absolute inset-0 bg-red-600/10 mix-blend-overlay pointer-events-none" />
                  <img
                    src="https://res.cloudinary.com/det2xmstl/image/upload/v1769983171/exhibidor_qy5ygu.jpg"
                    alt="NOMAD Mobile Stands"
                    className="w-full h-auto transition-all duration-700 group-hover:scale-105"
                  />
                </div>
                <p className="text-justify text-gray-500 text-[10px] md:text-xs tracking-widest uppercase italic leading-loose">
                  // UNIDAD DE EXHIBICIÓN AUTOPORTANTE: NEGRO MATE INDUSTRIAL.
                  OPTIMIZADA PARA MAXIMIZAR EL METRO CUADRADO EN TU LOCAL.
                  *EXCLISIVO, EN CONSIGNACIÓN, PARA RETAILERS CON STOCK PROPIO.
                </p>
              </section>

              {/* BLOQUE: PACKAGING (GIFTS & STICKERS) */}
              <section className="space-y-8">
                <div className="flex items-center gap-4 text-red-600">
                  <Package size={20} />
                  <h3 className="font-black uppercase tracking-tighter text-xl italic">
                    KIT DE LANZAMIENTO
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {packagingImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="aspect-square border border-white/5 overflow-hidden group"
                    >
                      <img
                        src={img}
                        className="w-full h-full object-cover md:grayscale group-hover:grayscale-0 transition-all duration-700"
                        alt="Packaging NOMAD"
                      />
                    </div>
                  ))}
                </div>
                <div className="p-6 bg-white/[0.02] border border-white/10 relative">
                  <div className="absolute top-0 right-0 p-2 opacity-20">
                    <Award size={14} />
                  </div>
                  <p className="text-justify text-[10px] text-gray-400 uppercase tracking-widest leading-relaxed">
                    Nuestra entrega incluye merchandising exclusivo:{" "}
                    <span className="text-red-600">
                      Stickers de vinilo custom
                    </span>
                    , etiquetas de seguridad holográficas y packaging reforzado.
                    Todo diseñado para elevar la percepción de marca en tu punto
                    de venta.
                  </p>
                </div>
              </section>

              {/* BLOQUE: PROTOCOLO COMERCIAL */}
              <section className="space-y-10">
                <div className="flex items-center gap-4 text-red-600">
                  <Globe size={20} />
                  <h3 className="font-black uppercase tracking-tighter text-xl italic">
                    LOGÍSTICA Y ESCALA
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* CARD 01: EXCLUSIVIDAD */}
                  <div className="bg-neutral-900/50 p-6 border border-white/5 group hover:border-red-600/30 transition-all">
                    <p className="text-red-600 font-black text-[10px] tracking-[0.3em] uppercase mb-2">
                      GEO-EXCLUSIVIDAD
                    </p>
                    <p className="text-justify text-xs text-gray-400 leading-relaxed uppercase italic">
                      Protección de zona por radio de influencia. Garantizamos
                      que NOMAD sea un activo único y estratégico en tu
                      localidad para evitar la saturación del mercado.
                    </p>
                  </div>

                  {/* CARD 02: CONSIGNACIÓN */}
                  <div className="bg-red-600/10 p-6 border border-red-600/20 group hover:bg-red-600/20 transition-all">
                    <p className="text-red-600 font-black text-[10px] tracking-[0.3em] uppercase mb-2">
                      CONSIGNACIÓN_ALPHA
                    </p>
                    <p className="text-justify text-xs text-gray-300 leading-relaxed uppercase italic">
                      Esquema de rotación dinámica para locales seleccionados.
                      Permite mantener el stock siempre fresco y actualizado sin
                      la necesidad de una inversión inicial masiva.
                    </p>
                  </div>

                  {/* CARD 03: REPOSICIÓN */}
                  <div className="bg-neutral-900/50 p-6 border border-white/5 group hover:border-red-600/30 transition-all">
                    <p className="text-red-600 font-black text-[10px] tracking-[0.3em] uppercase mb-2">
                      REPOSICIÓN RÁPIDA
                    </p>
                    <p className="text-justify text-xs text-gray-400 leading-relaxed uppercase italic">
                      Sistema de reabastecimiento priorizado. Despachamos drops
                      y reposiciones de básicos en menos de 48hs para asegurar
                      que nunca pierdas una venta por falta de talles.
                    </p>
                  </div>

                  {/* CARD 04: MARKETING */}
                  <div className="bg-neutral-900/50 p-6 border border-white/5 group hover:border-red-600/30 transition-all">
                    <p className="text-red-600 font-black text-[10px] tracking-[0.3em] uppercase mb-2">
                      KIT DE SORPORTE MULTIMEDIA
                    </p>
                    <p className="text-justify text-xs text-gray-400 leading-relaxed uppercase italic">
                      Acceso directo a nuestro drive de assets: fotografías de
                      campaña en alta resolución, videos para redes y material
                      gráfico listo para imprimir o pautar.
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* COLUMNA DERECHA: FORMULARIO STICKY (TERMINAL DE ACCESO) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-neutral-900/50 border border-white/10 p-8 md:p-12 relative overflow-hidden lg:sticky lg:top-32"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-red-600" />
              <div className="mb-8">
                <h2 className="text-2xl font-black uppercase italic tracking-tighter">
                  SOLICITAR ACCESO
                </h2>
                <p className="text-[8px] text-white/30 font-mono mt-1 uppercase tracking-[0.2em]">
                  Retail_Partnership_System // EST. 2026
                </p>
              </div>

              <form onSubmit={handleWhatsAppSend} className="space-y-8">
                <div className="space-y-6">
                  {/* Campo Nombre */}
                  <div className="relative border-b border-white/20 focus-within:border-red-600 transition-colors group">
                    <label className="text-[9px] uppercase tracking-widest text-red-600 font-bold">
                      Razón Social / Identidad
                    </label>
                    <div className="flex items-center gap-3 pb-2">
                      <User size={16} className="text-white/30" />
                      <input
                        required
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        placeholder="NOMBRE DEL LOCAL"
                        className="bg-transparent border-none outline-none w-full text-sm uppercase tracking-tighter placeholder:text-white/30 focus:ring-0"
                      />
                    </div>
                  </div>

                  {/* Campo Localidad */}
                  <div className="relative border-b border-white/20 focus-within:border-red-600 transition-colors group">
                    <label className="text-[9px] uppercase tracking-widest text-red-600 font-bold">
                      Ubicación Estratégica
                    </label>
                    <div className="flex items-center gap-3 pb-2">
                      <MapPin size={16} className="text-white/30" />
                      <input
                        required
                        name="localidad"
                        value={formData.localidad}
                        onChange={handleChange}
                        placeholder="CIUDAD, PROVINCIA"
                        className="bg-transparent border-none outline-none w-full text-sm uppercase tracking-tighter placeholder:text-white/30 focus:ring-0"
                      />
                    </div>
                  </div>

                  {/* Campo Mensaje */}
                  <div className="relative border-b border-white/20 focus-within:border-red-600 transition-colors group">
                    <div className="flex justify-between items-end">
                      <label className="text-[9px] uppercase tracking-widest text-red-600 font-bold">
                        Propuesta_Técnica
                      </label>
                      <span className="text-[8px] text-white/30 font-mono">
                        {formData.mensaje.length}/{CHARACTER_LIMIT}
                      </span>
                    </div>
                    <div className="flex items-start gap-3 pb-2 pt-2">
                      <MessageSquare size={16} className="text-white/30 mt-1" />
                      <textarea
                        required
                        name="mensaje"
                        rows="4"
                        value={formData.mensaje}
                        onChange={handleChange}
                        placeholder="DETALLE DE INTERÉS: CONSIGNACIÓN, VOLUMEN O STANDS..."
                        className="bg-transparent border-none outline-none w-full text-sm uppercase tracking-tighter placeholder:text-white/30 resize-none focus:ring-0"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="group relative w-full bg-white py-5 flex items-center justify-center gap-3 overflow-hidden active:scale-[0.98] transition-all"
                >
                  <div className="absolute inset-0 bg-red-600 translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-300" />
                  <span className="relative z-10 text-black group-hover:text-white font-black italic uppercase text-lg tracking-tighter transition-colors">
                    SINCRONIZAR SOLICITUD
                  </span>
                  <Send
                    size={18}
                    className="relative z-10 text-red-600 group-hover:text-white transition-colors"
                  />
                </button>

                <div className="flex items-center justify-center gap-2 pt-4">
                  <CheckCircle2 size={12} className="text-red-600" />
                  <span className="text-[8px] text-white/30 uppercase tracking-[0.2em]">
                    Respuesta operativa en 24hs
                  </span>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Retailers;
