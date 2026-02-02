import React, { useRef, useEffect, useState } from "react";
import { motion, useTransform, useScroll, AnimatePresence } from "framer-motion";
import { Loader2, Filter, ChevronUp, ChevronDown } from "lucide-react";

const Gallery = ({ items, setSelectedItem }) => {
  const targetRef = useRef(null);
  const [collectionName, setCollectionName] = useState(""); 
  const [loaded, setLoaded] = useState({});
  const [availableCollections, setAvailableCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [filteredItems, setFilteredItems] = useState([]);
  
  // NUEVO: Estado para detectar gesto horizontal incorrecto
  const [showVerticalGuidance, setShowVerticalGuidance] = useState(false);

  const optimizeCloudinaryUrl = (url) => {
    if (!url || !url.includes("cloudinary.com")) return url;
    const splitUrl = url.split("/upload/");
    const optimizationParams = "f_auto,q_auto,w_1000";
    return `${splitUrl[0]}/upload/${optimizationParams}/${splitUrl[1]}`;
  };

  // NUEVA FUNCIÓN: Detector de dirección de scroll en móvil
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      const touchX = e.touches[0].clientX;
      const touchY = e.touches[0].clientY;
      
      const deltaX = Math.abs(touchX - touchStartX);
      const deltaY = Math.abs(touchY - touchStartY);

      // Si el usuario arrastra más de 30px hacia los lados y poco hacia arriba/abajo
      if (deltaX > deltaY && deltaX > 30) {
        setShowVerticalGuidance(true);
      } else if (deltaY > 10) {
        // Si empieza a scrollear bien (vertical), ocultamos la guía
        setShowVerticalGuidance(false);
      }
    };

    const handleTouchEnd = () => {
      // Opcional: ocultar con delay al soltar
      setTimeout(() => setShowVerticalGuidance(false), 1500);
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  // 1. Extraer colecciones únicas y ordenar (Tu lógica original)
  useEffect(() => {
    if (items && items.length > 0) {
      const collections = items
        .filter((item) => item.season && item.year)
        .map((item) => ({
          season: item.season,
          year: item.year,
          label: `${item.season.charAt(0).toUpperCase() + item.season.slice(1)} ${item.year}`,
          id: `${item.season}-${item.year}`,
        }));

      const uniqueCollections = Array.from(
        new Map(collections.map((c) => [c.id, c])).values()
      );

      const seasonOrder = { summer: 1, autumn: 2, winter: 3, spring: 4 };
      uniqueCollections.sort((a, b) => {
        if (b.year !== a.year) return b.year - a.year;
        return (seasonOrder[b.season] || 0) - (seasonOrder[a.season] || 0);
      });

      setAvailableCollections(uniqueCollections);

      if (uniqueCollections.length > 0 && !selectedCollection) {
        setSelectedCollection(uniqueCollections[0].id);
      }
    }
  }, [items]);

  // 2. Actualizar collectionName basado en la selección (Tu lógica original)
  useEffect(() => {
    if (selectedCollection && items) {
      const [season, year] = selectedCollection.split("-");
      const formattedName = `${season} COLLECTION ${year}`.toUpperCase();
      setCollectionName(formattedName);

      const filtered = items.filter(
        (item) => item.season === season && item.year === parseInt(year)
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(items);
    }
  }, [selectedCollection, items]);

  const handleOpenProduct = (item) => {
    setSelectedItem(item);
    window.history.pushState({ modal: true, itemId: item.id }, '', window.location.href);
  };

  const { scrollYProgress } = useScroll({ target: targetRef });
  const [totalScroll, setTotalScroll] = useState(0);

  useEffect(() => {
    const calculateScroll = () => {
      if (typeof window !== "undefined") {
        const isMobile = window.innerWidth < 768;
        const cardWidth = isMobile ? 340 : 450;
        const gap = isMobile ? 24 : 48;
        const padding = isMobile ? 48 : 96;
        const contentWidth = filteredItems.length * cardWidth + (filteredItems.length - 1) * gap;
        setTotalScroll(-(contentWidth - window.innerWidth + padding));
      }
    };
    calculateScroll();
    window.addEventListener("resize", calculateScroll);
    return () => window.removeEventListener("resize", calculateScroll);
  }, [filteredItems.length]);

  const xPx = useTransform(scrollYProgress, [0, 1], ["0px", `${totalScroll}px`]);
  const titleX = useTransform(scrollYProgress, [0, 1], ["0px", "-300px"]);
  const opacity = useTransform(scrollYProgress, [0, 0.05, 0.9, 1], [1, 1, 0.5, 0]);

  return (
    <section id="colecciones" ref={targetRef} className="relative h-[600vh] bg-neutral-900/20">
      <div className="sticky top-5 h-screen flex flex-col justify-center overflow-hidden">
        
        {/* OVERLAY DE CORRECCIÓN VERTICAL - Solo aparece si el usuario intenta scroll lateral */}
        <AnimatePresence>
          {showVerticalGuidance && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center pointer-events-none"
            >
              <motion.div 
                animate={{ y: [-30, 30, -30] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="flex flex-col items-center"
              >
                <ChevronUp size={100} className="text-red-600 mb-[-20px]" strokeWidth={1.5} />
                <div className="flex flex-col items-center py-10">
                  <span className="text-white font-black italic text-4xl tracking-tighter uppercase leading-none">Scroll</span>
                  <span className="text-red-600 font-black italic text-6xl tracking-tighter uppercase leading-none">Vertical</span>
                </div>
                <ChevronDown size={100} className="text-red-600 mt-[-20px]" strokeWidth={1.5} />
              </motion.div>
              <p className="text-white/40 text-[10px] font-bold tracking-[0.5em] uppercase mt-8">Navegación Técnica Nomad</p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div style={{ x: titleX, opacity }} className="relative z-10 px-6 md:px-12 mb-4 md:mb-6 pointer-events-auto">
          <motion.span className="text-red-600 text-[9px] md:text-xs font-bold uppercase tracking-[0.6em] block mb-0 pl-1">
            EL CATÁLOGO
          </motion.span>
          
          <h2 className="text-white text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-[0.8] flex flex-col py-2">
            {collectionName ? (
              <>
                <span className="block text-red-600">{collectionName.split(" ")[0]}</span>
                <span className="block text-white">
                  {collectionName.split(" ").slice(1).join(" ")}
                </span>
              </>
            ) : (
              "NOMAD CORE"
            )}
          </h2>

          {availableCollections.length > 0 && (
            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2.5 bg-neutral-900/50 border border-white/10">
                <Filter size={14} className="text-red-600" />
                <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-400">
                  Filtro
                </span>
              </div>
              <select
                value={selectedCollection || ""}
                onChange={(e) => setSelectedCollection(e.target.value)}
                className="bg-black/80 border border-white/20 px-4 py-2 text-xs md:text-sm outline-none focus:border-red-500 transition-all uppercase font-bold text-white cursor-pointer appearance-none pr-10"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23dc2626' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 0.75rem center",
                }}
              >
                {availableCollections.map((collection) => (
                  <option key={collection.id} value={collection.id}>
                    {collection.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </motion.div>

        <div className="relative">
          <motion.div style={{ x: xPx }} className="flex gap-6 md:gap-12 px-6 md:px-12">
            {filteredItems.map((item) => {
              const rawImage = Array.isArray(item.img) ? item.img[0] : item.img;
              const isImgLoaded = loaded[item.id];

              return (
                <div
                  key={item.id}
                  onClick={() => handleOpenProduct(item)}
                  className="group relative h-[442px] w-[340px] md:h-[550px] md:w-[450px] flex-none overflow-hidden bg-neutral-800 shrink-0 cursor-pointer shadow-2xl transition-transform duration-500"
                >
                  {!isImgLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-neutral-900 z-0">
                      <Loader2 className="text-red-600 animate-spin" size={48} strokeWidth={1} />
                    </div>
                  )}

                  <img
                    src={optimizeCloudinaryUrl(rawImage)}
                    alt={item.title}
                    loading="lazy"
                    onLoad={() => setLoaded((prev) => ({ ...prev, [item.id]: true }))}
                    className={`h-full w-full object-cover transition-all duration-1000 group-hover:scale-110 ${isImgLoaded ? "opacity-100" : "opacity-0"}`}
                  />
                  <div className="absolute inset-0 group-hover:bg-black/10 transition-colors duration-500" />
                  
                  <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full bg-gradient-to-t from-black via-transparent to-transparent">
                    <p className="text-xl md:text-2xl font-black uppercase italic tracking-tighter group-hover:text-red-600 transition-colors text-white">
                      {item.title}
                    </p>
                    <p className="text-[9px] uppercase tracking-[0.3em] text-white/50 mt-1 font-bold">
                      DETALLES +
                    </p>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>

        <div className="absolute bottom-5 left-0 w-full h-[5px] bg-white/10 z-20">
          <motion.div style={{ scaleX: scrollYProgress }} className="h-full bg-red-600 origin-left" />
        </div>
      </div>
    </section>
  );
};

export default Gallery;