import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { 
  Send, MapPin, User, MessageSquare, ArrowRight, 
  ShieldCheck, Zap, Package, Layout, Box, Award, CheckCircle2 
} from "lucide-react";

const Retailers = () => {
  const [formData, setFormData] = useState({ nombre: "", localidad: "", mensaje: "" });
  const CHARACTER_LIMIT = 250;

  useEffect(() => { window.scrollTo(0, 0); }, []);

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
    "https://res.cloudinary.com/det2xmstl/image/upload/v1769970095/Gemini_Generated_Image_6zmp3p6zmp3p6zmp_de_taman%CC%83o_grande_djl4fm.jpg"
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black text-white pt-32 md:pt-48 pb-20 px-6 md:px-12 selection:bg-red-600 font-inter">
        <div className="max-w-7xl mx-auto">
          
          {/* 01. HEADER SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-32 items-end">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <span className="text-red-600 text-[10px] font-black uppercase tracking-[0.6em] block mb-4">
                programa de asociación minorista
              </span>
              <h1 className="text-5xl md:text-8xl font-black italic uppercase leading-[0.8] tracking-tighter">
                AMPLIFICA<br /> <span className="text-red-600">EL IMPACTO</span>
              </h1>
            </motion.div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="text-justify text-gray-400 uppercase text-xs md:text-sm tracking-[0.2em] leading-relaxed italic border-l border-white/30 pl-6">
              Buscamos socios estratégicos, no puntos de venta. NOMAD ofrece una infraestructura de diseño técnico y logística optimizada para locales que entienden el lenguaje de la calle.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            
            {/* COLUMNA IZQUIERDA: MANIFIESTO Y BENEFICIOS */}
            <div className="space-y-24">
              
              {/* BLOQUE: CALIDAD TÉCNICA */}
              <section className="space-y-6">
                <div className="flex items-center gap-4 text-red-600">
                  <ShieldCheck size={20} />
                  <h3 className="font-black uppercase tracking-tighter text-xl italic">ESPECIFICACIONES PREMIUM</h3>
                </div>
                <p className="text-justify text-gray-400 text-sm uppercase leading-relaxed tracking-wider italic">
                  Nuestras prendas utilizan textiles de alta densidad (Premium Cotton 24.1) y costuras reforzadas. El fit es testeado para durabilidad extrema, manteniendo la forma tras múltiples ciclos de lavado.
                </p>
              </section>

              {/* BLOQUE: STANDS MÓVILES (IMAGEN ORIGINAL) */}
              <section className="space-y-8">
                <div className="flex items-center gap-4 text-red-600">
                  <Layout size={20} />
                  <h3 className="font-black uppercase tracking-tighter text-xl italic">EXHIBIDORES PORTÁTILES</h3>
                </div>
                <div className="border border-white/10 bg-neutral-900/40 overflow-hidden group">
                  <img 
                    src="https://res.cloudinary.com/det2xmstl/image/upload/v1769903449/Stands_yd8zuv.jpg" 
                    alt="NOMAD Mobile Stands" 
                    className="w-full h-auto transition-all duration-700"
                  />
                </div>
                <p className="text-justify text-gray-500 text-[10px] md:text-xs tracking-widest uppercase italic leading-loose">
                  // SISTEMA DE EXHIBICIÓN AUTOPORTANTE CON GRÁFICA URBANA CUSTOMIZADA. DISEÑADO PARA ALTO IMPACTO VISUAL EN LOCALES Y EVENTOS POP-UP.
                </p>
              </section>

              {/* BLOQUE: PACKAGING & UNBOXING */}
              <section className="space-y-8">
                <div className="flex items-center gap-4 text-red-600">
                  <Box size={20} />
                  <h3 className="font-black uppercase tracking-tighter text-xl italic">EXPERIENCIA UNBOXIN</h3>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {packagingImages.map((img, idx) => (
                    <div key={idx} className="aspect-square border border-white/5 overflow-hidden">
                      <img src={img} className="w-full h-full object-cover transition-all duration-500" alt="Packaging NOMAD" />
                    </div>
                  ))}
                </div>
                <div className="flex items-start gap-4 p-4 bg-white/[0.02] border-l-2 border-red-600">
                  <Award className="text-red-600 shrink-0" size={18} />
                  <p className="text-justify text-[10px] text-gray-400 uppercase tracking-widest leading-relaxed">
                    Cada drop incluye <span className="text-white">Etiquetas de seguridad holográficas</span>, packaging reforzado y merchandising exclusivo para el cliente final.
                  </p>
                </div>
              </section>

              {/* BLOQUE: MODELO DE NEGOCIO (CONSIGNACIÓN + ESCALA) */}
              <section className="space-y-10">
                <div className="flex items-center gap-4 text-red-600">
                  <Zap size={20} />
                  <h3 className="font-black uppercase tracking-tighter text-xl italic">PROTOCOLO DE NEGOCIO</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-neutral-900/50 p-6 border border-white/5">
                    <p className="text-red-600 font-black text-[10px] tracking-[0.3em] uppercase mb-2">Margen de Escala</p>
                    <p className="text-justify text-xs text-gray-400 leading-relaxed uppercase italic">Descuentos progresivos por volumen trimestral y protección de zona (Geo-Exclusivity).</p>
                  </div>
                  
                  <div className="bg-red-600/10 p-6 border border-red-600/20">
                    <p className="text-red-600 font-black text-[10px] tracking-[0.3em] uppercase mb-2">Venta a Consignación</p>
                    <p className="text-justify text-xs text-gray-300 leading-relaxed uppercase italic">Para locales de alto tráfico: rotación de inventario sin riesgo financiero inicial.</p>
                  </div>
                </div>
              </section>

            </div>

            {/* COLUMNA DERECHA: FORMULARIO STICKY */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="bg-neutral-900/50 border border-white/10 p-8 md:p-12 relative overflow-hidden lg:sticky lg:top-32"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-red-600" />
              <div className="mb-8">
                <h2 className="text-2xl font-black uppercase italic tracking-tighter">ENVÍA TU CONSULTA</h2>
                <p className="text-[8px] text-white/30 font-mono mt-1 uppercase tracking-[0.2em]">Retail_Partnership_V2.0 // EST. 2026</p>
              </div>

              <form onSubmit={handleWhatsAppSend} className="space-y-8">
                <div className="space-y-6">
                  {/* Campo Nombre */}
                  <div className="relative border-b border-white/20 focus-within:border-red-600 transition-colors group">
                    <label className="text-[9px] uppercase tracking-widest text-red-600 font-bold">Razon Social / Local</label>
                    <div className="flex items-center gap-3 pb-2">
                      <User size={16} className="text-white/30"/>
                      <input required name="nombre" value={formData.nombre} onChange={handleChange} placeholder="NOMBRE" className="bg-transparent border-none outline-none w-full text-sm uppercase tracking-tighter placeholder:text-white/30"/>
                    </div>
                  </div>

                  {/* Campo Localidad */}
                  <div className="relative border-b border-white/20 focus-within:border-red-600 transition-colors group">
                    <label className="text-[9px] uppercase tracking-widest text-red-600 font-bold">Localidad</label>
                    <div className="flex items-center gap-3 pb-2">
                      <MapPin size={16} className="text-white/30"/>
                      <input required name="localidad" value={formData.localidad} onChange={handleChange} placeholder="CIUDAD, PAIS" className="bg-transparent border-none outline-none w-full text-sm uppercase tracking-tighter placeholder:text-white/30"/>
                    </div>
                  </div>

                  {/* Campo Mensaje */}
                  <div className="relative border-b border-white/20 focus-within:border-red-600 transition-colors group">
                    <div className="flex justify-between items-end">
                      <label className="text-[9px] uppercase tracking-widest text-red-600 font-bold">Propuesta / Consulta</label>
                      <span className="text-[8px] text-white/30">{formData.mensaje.length}/{CHARACTER_LIMIT}</span>
                    </div>
                    <div className="flex items-start gap-3 pb-2 pt-2">
                      <MessageSquare size={16} className="text-white/30 mt-1"/>
                      <textarea required name="mensaje" rows="4" value={formData.mensaje} onChange={handleChange} placeholder="EJ: INTERESADO EN CONSIGNACIÓN Y STANDS MÓVILES..." className="bg-transparent border-none outline-none w-full text-sm uppercase tracking-tighter placeholder:text-white/30 resize-none"/>
                    </div>
                  </div>
                </div>

                <button type="submit" className="group relative w-full bg-white py-5 flex items-center justify-center gap-3 overflow-hidden active:scale-[0.98] transition-all">
                  <div className="absolute inset-0 bg-red-600 translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-300" />
                  <span className="relative z-10 text-black group-hover:text-white font-black italic uppercase text-lg tracking-tighter transition-colors">ENVIAR MENSAJE</span>
                  <Send size={18} className="relative z-10 text-red-600 group-hover:text-white transition-colors" />
                </button>

                <div className="flex items-center justify-center gap-2 pt-4">
                  <CheckCircle2 size={12} className="text-red-600" />
                  <span className="text-[8px] text-white/30 uppercase tracking-[0.2em]">Respuesta técnica en menos de 24hs</span>
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