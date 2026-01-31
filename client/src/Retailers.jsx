import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { 
  Send, MapPin, User, MessageSquare, ArrowRight, 
  ShieldCheck, Zap, Globe, Percent, Package 
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

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black text-white pt-32 md:pt-48 pb-20 px-6 md:px-12 selection:bg-red-600">
        <div className="max-w-7xl mx-auto">
          
          {/* HEADER SECT */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24 items-end">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <span className="text-red-600 text-[10px] font-black uppercase tracking-[0.6em] block mb-4">
                RETAIL PARTNERSHIP PROGRAM
              </span>
              <h1 className="text-7xl md:text-9xl font-black italic uppercase leading-[0.8] tracking-tighter">
                SCALE THE <br /> <span className="text-red-600">IMPACT.</span>
              </h1>
            </motion.div>
            
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="text-gray-500 uppercase text-xs md:text-sm tracking-widest leading-relaxed italic border-l border-white/10 pl-6">
              Buscamos socios estratégicos, no puntos de venta. NOMAD ofrece una infraestructura de diseño técnico y logística optimizada para locales que entienden el lenguaje de la calle.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            
            {/* INFORMACIÓN DETALLADA */}
            <div className="space-y-16">
              
              {/* Bloque 1: Calidad y Tech */}
              <section className="space-y-6">
                <div className="flex items-center gap-4 text-red-600">
                  <ShieldCheck size={20} />
                  <h3 className="font-black uppercase tracking-tighter text-xl italic">Premium Tech Specs</h3>
                </div>
                <p className="text-gray-400 text-sm uppercase leading-relaxed tracking-wider">
                  Nuestras prendas utilizan textiles de alta densidad (Premium Cotton 24.1) y costuras reforzadas. El fit es testeado para durabilidad extrema, manteniendo la forma tras múltiples ciclos de lavado.
                </p>
              </section>

              {/* Bloque 2: Exclusividad y Descuentos */}
              <section className="space-y-6">
                <div className="flex items-center gap-4 text-red-600">
                  <Zap size={20} />
                  <h3 className="font-black uppercase tracking-tighter text-xl italic">Margen & Escala</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-neutral-900/50 p-4 border-l-2 border-red-600">
                    <p className="text-[10px] text-red-600 font-bold mb-1 tracking-widest uppercase">Volume Discount</p>
                    <p className="text-xs text-gray-300">Escalas de descuento progresivas según volumen de compra trimestral.</p>
                  </div>
                  <div className="bg-neutral-900/50 p-4 border-l-2 border-red-600">
                    <p className="text-[10px] text-red-600 font-bold mb-1 tracking-widest uppercase">Geo-Exclusivity</p>
                    <p className="text-xs text-gray-300">Protección de zona: un solo retailer autorizado por radio de influencia.</p>
                  </div>
                </div>
              </section>

              {/* Bloque 3: Consignación */}
              <section className="bg-red-600/5 p-8 border border-red-600/20">
                <div className="flex items-center gap-4 text-red-600 mb-4">
                  <Package size={20} />
                  <h3 className="font-black uppercase tracking-tighter text-xl italic">Venta a Consignación</h3>
                </div>
                <p className="text-gray-300 text-sm uppercase tracking-wide leading-relaxed">
                  Para locales seleccionados de alto tráfico, ofrecemos un modelo de <span className="text-white font-bold">Stock por Consignación</span>. Rotación de inventario sin riesgo inicial, ideal para lanzamientos de temporada o pop-up stores.
                </p>
              </section>
            </div>

            {/* FORMULARIO (Mantenemos tu lógica pero retocamos visual) */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-neutral-900/50 border border-white/10 p-8 md:p-12 relative overflow-hidden sticky top-32">
              <div className="absolute top-0 left-0 w-full h-1 bg-red-600" />
              <h2 className="text-2xl font-black uppercase italic mb-8 tracking-tighter">Apply for Access_</h2>

              <form onSubmit={handleWhatsAppSend} className="space-y-8">
                <div className="space-y-6">
                  <div className="relative border-b border-white/20 focus-within:border-red-600 transition-colors group">
                    <label className="text-[9px] uppercase tracking-widest text-red-600 font-bold">Razon Social / Local</label>
                    <div className="flex items-center gap-3 pb-2"><User size={16} className="text-white/20"/><input required name="nombre" value={formData.nombre} onChange={handleChange} placeholder="NOMBRE" className="bg-transparent border-none outline-none w-full text-sm uppercase tracking-tighter placeholder:text-white/5"/></div>
                  </div>

                  <div className="relative border-b border-white/20 focus-within:border-red-600 transition-colors group">
                    <label className="text-[9px] uppercase tracking-widest text-red-600 font-bold">Localidad</label>
                    <div className="flex items-center gap-3 pb-2"><MapPin size={16} className="text-white/20"/><input required name="localidad" value={formData.localidad} onChange={handleChange} placeholder="CIUDAD, PAIS" className="bg-transparent border-none outline-none w-full text-sm uppercase tracking-tighter placeholder:text-white/5"/></div>
                  </div>

                  <div className="relative border-b border-white/20 focus-within:border-red-600 transition-colors group">
                    <div className="flex justify-between items-end">
                      <label className="text-[9px] uppercase tracking-widest text-red-600 font-bold">Propuesta / Stock</label>
                      <span className="text-[8px] text-white/30">{formData.mensaje.length}/{CHARACTER_LIMIT}</span>
                    </div>
                    <div className="flex items-start gap-3 pb-2 pt-2"><MessageSquare size={16} className="text-white/20 mt-1"/><textarea required name="mensaje" rows="4" value={formData.mensaje} onChange={handleChange} placeholder="EJ: INTERESADO EN CONSIGNACIÓN..." className="bg-transparent border-none outline-none w-full text-sm uppercase tracking-tighter placeholder:text-white/5 resize-none"/></div>
                  </div>
                </div>

                <button type="submit" className="group relative w-full bg-white py-5 flex items-center justify-center gap-3 overflow-hidden active:scale-[0.98] transition-all">
                  <div className="absolute inset-0 bg-red-600 translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-300" />
                  <span className="relative z-10 text-black group-hover:text-white font-black italic uppercase text-lg tracking-tighter">SUBMIT APPLICATION</span>
                  <Send size={18} className="relative z-10 text-red-600 group-hover:text-white" />
                </button>
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