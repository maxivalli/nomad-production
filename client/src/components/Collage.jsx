import React, { useMemo, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const CollageImage = ({ src, index, span = "" }) => {
  const ref = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"]
  });

  const saturate = useTransform(scrollYProgress, [0, 1], ["grayscale(100%)", "grayscale(0%)"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);

  return (
    <motion.div 
      ref={ref}
      style={{ filter: saturate, opacity }}
      className={`relative overflow-hidden group border border-white/5 ${span}`}
    >
      <motion.img 
        src={src} 
        alt={`Nomad Look ${index}`}
        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
      />
      
      {/* Etiquetas decorativas */}
      <div className="absolute bottom-3 left-3 md:top-4 md:left-4 md:bottom-auto">
        <span className="bg-black/50 backdrop-blur-md px-2 py-1 text-[8px] md:text-[10px] tracking-widest uppercase text-white/70">
          {index === 0 ? "Main_Archive" : `Item_0${index + 1}`}
        </span>
      </div>

      {index === 4 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none hidden md:flex">
          <span className="text-white/5 text-8xl font-black italic">NOMAD</span>
        </div>
      )}
    </motion.div>
  );
};

const Collage = ({ items, selectedCollection }) => {
  const images = useMemo(() => {
    if (!items || items.length === 0) return [];
    
    let filtered = [...items];
    if (selectedCollection) {
      const [season, year] = selectedCollection.split("-");
      filtered = items.filter(
        (item) => item.season === season && item.year === parseInt(year)
      );
    }

    const source = filtered.length > 0 ? filtered : items;

    return source
      .map(item => (Array.isArray(item.img) ? item.img[0] : item.img))
      .filter(src => src)
      .slice(0, 5);
  }, [items, selectedCollection]);

  if (images.length === 0) return null;

  return (
    <section className="bg-black w-full py-20 px-4 md:px-10 overflow-hidden">
      <div className="max-w-[1800px] mx-auto">
        <div className="grid grid-cols-12 gap-4 md:gap-6 auto-rows-[250px] md:auto-rows-[400px]">
          
          {/* FOTO 1: Grande siempre */}
          <CollageImage 
            src={images[0]} 
            index={0} 
            span="col-span-12 md:col-span-8 md:row-span-2 row-span-2" 
          />
          
          {/* FOTO 2: En móvil ocupa el 80% y se alinea a la derecha mediante offset */}
          <CollageImage 
            src={images[1]} 
            index={1} 
            span="col-start-3 col-span-10 md:col-start-auto md:col-span-4" 
          />
          
          {/* FOTO 3: En móvil ocupa el 70% y se alinea a la izquierda */}
          <CollageImage 
            src={images[2]} 
            index={2} 
            span="col-span-9 md:col-span-4" 
          />
          
          {/* FOTO 4: Rompe el flujo con un ancho medio */}
          <CollageImage 
            src={images[3]} 
            index={3} 
            span="col-start-2 col-span-11 md:col-start-auto md:col-span-7" 
          />
          
          {/* FOTO 5: Cierre de sección */}
          <CollageImage 
            src={images[4]} 
            index={4} 
            span="col-span-12 md:col-span-5" 
          />

        </div>
      </div>
    </section>
  );
};

export default Collage;