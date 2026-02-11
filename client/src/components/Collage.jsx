import React, { useMemo, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const CollageImage = ({ src, index, className, delay = 0, span = "" }) => {
  const ref = useRef(null);
  
  // Detectamos el scroll específicamente para este contenedor
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"] // Empieza gris al final de la pantalla, color al llegar al centro
  });

  // Transformamos el progreso del scroll en un filtro de saturación
  // 0% saturación (B&N) -> 100% saturación (Color)
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
      {index === 0 && (
        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 text-[10px] tracking-widest uppercase">
          Main_Archive_V1
        </div>
      )}
      {index === 4 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
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
    <section className="bg-black w-full py-20 px-4 md:px-10">
      <div className="max-w-[1800px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 auto-rows-[300px] md:auto-rows-[400px]">
          
          <CollageImage 
            src={images[0]} 
            index={0} 
            span="md:col-span-8 md:row-span-2" 
          />
          
          <CollageImage 
            src={images[1]} 
            index={1} 
            span="md:col-span-4" 
          />
          
          <CollageImage 
            src={images[2]} 
            index={2} 
            span="md:col-span-4" 
          />
          
          <CollageImage 
            src={images[3]} 
            index={3} 
            span="md:col-span-7" 
          />
          
          <CollageImage 
            src={images[4]} 
            index={4} 
            span="md:col-span-5" 
          />

        </div>
      </div>
    </section>
  );
};

export default Collage;