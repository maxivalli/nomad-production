import React, { useRef, useEffect, useState } from "react";
import {
  motion,
  useTransform,
  useScroll,
  AnimatePresence,
} from "framer-motion";
import { Loader2, Filter } from "lucide-react";

const Gallery = ({ items, setSelectedItem }) => {
  const targetRef = useRef(null);
  const [collectionName, setCollectionName] = useState("");
  const [loaded, setLoaded] = useState({});
  const [availableCollections, setAvailableCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [filteredItems, setFilteredItems] = useState([]);

  // Estado para detectar gesto horizontal incorrecto
  const [showVerticalGuidance, setShowVerticalGuidance] = useState(false);

  const optimizeCloudinaryUrl = (url) => {
    if (!url || !url.includes("cloudinary.com")) return url;
    const splitUrl = url.split("/upload/");
    const optimizationParams = "f_auto,q_auto,w_1000";
    return `${splitUrl[0]}/upload/${optimizationParams}/${splitUrl[1]}`;
  };

  // Detector de dirección de scroll en móvil
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

      if (deltaX > deltaY && deltaX > 30) {
        setShowVerticalGuidance(true);
      } else if (deltaY > 10) {
        setShowVerticalGuidance(false);
      }
    };

    const handleTouchEnd = () => {
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

  // 1. Lógica de colecciones original
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
        new Map(collections.map((c) => [c.id, c])).values(),
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

  // 2. Lógica de nombre y filtrado original
  useEffect(() => {
    if (selectedCollection && items) {
      const [season, year] = selectedCollection.split("-");
      const formattedName = `${season} COLLECTION ${year}`.toUpperCase();
      setCollectionName(formattedName);

      const filtered = items.filter(
        (item) => item.season === season && item.year === parseInt(year),
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(items);
    }
  }, [selectedCollection, items]);

  const handleOpenProduct = (item) => {
    setSelectedItem(item);
    window.history.pushState(
      { modal: true, itemId: item.id },
      "",
      window.location.href,
    );
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
        const contentWidth =
          filteredItems.length * cardWidth + (filteredItems.length - 1) * gap;
        setTotalScroll(-(contentWidth - window.innerWidth + padding));
      }
    };
    calculateScroll();
    window.addEventListener("resize", calculateScroll);
    return () => window.removeEventListener("resize", calculateScroll);
  }, [filteredItems.length]);

  const xPx = useTransform(
    scrollYProgress,
    [0, 1],
    ["0px", `${totalScroll}px`],
  );
  const titleX = useTransform(scrollYProgress, [0, 1], ["0px", "-300px"]);
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.05, 0.9, 1],
    [1, 1, 0.5, 0],
  );

  return (
    <section
      id="colecciones"
      ref={targetRef}
      className="relative h-[600vh] bg-neutral-900/20"
    >
      <div className="sticky top-0 h-screen w-full flex flex-col overflow-hidden">
        <div className="flex-1 flex flex-col justify-center translate-y-0 md:translate-y-0">
          {/* Título y Filtros */}
          <motion.div
            style={{ x: titleX, opacity }}
            className="relative z-10 px-6 md:px-12 mb-4 md:mb-6 pointer-events-auto"
          >
            <motion.span className="text-red-600 text-[9px] md:text-xs font-bold uppercase tracking-[0.6em] block mb-0 pl-1">
              EL CATÁLOGO
            </motion.span>

            <h2 className="text-white text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-[0.8] flex flex-col py-2">
              {collectionName ? (
                <>
                  <span className="block text-red-600">
                    {collectionName.split(" ")[0]}
                  </span>
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
                {/* Etiqueta Filtro */}
                <div className="flex items-center gap-2 px-3 py-2.5 bg-neutral-900/50 border border-white/10">
                  <Filter size={14} className="text-red-600" />
                  <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-400">
                    Filtro
                  </span>
                </div>

                {/* Selector de Colección */}
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

                {/* Contador de Items */}
                <div className="flex items-center border-l border-white/20 pl-3 h-9 ml-1">
                  <span className="text-red-600 text-[10px] md:text-xs font-black italic uppercase tracking-tighter flex items-center gap-1.5">
                    {filteredItems.length.toString().padStart(2, "0")} - ITEMS
                  </span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Galería Horizontal */}
          <div className="relative">
            <motion.div
              style={{ x: xPx }}
              className="flex gap-6 md:gap-12 px-6 md:px-12"
            >
              {filteredItems.map((item) => {
                const rawImage = Array.isArray(item.img)
                  ? item.img[0]
                  : item.img;
                const isImgLoaded = loaded[item.id];

                return (
                  <div
                    key={item.id}
                    onClick={() => handleOpenProduct(item)}
                    className="group relative h-[442px] w-[340px] md:h-[550px] md:w-[450px] flex-none overflow-hidden bg-neutral-800 shrink-0 cursor-pointer shadow-2xl transition-transform duration-500"
                  >
                    {!isImgLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center bg-neutral-900 z-0">
                        <Loader2
                          className="text-red-600 animate-spin"
                          size={48}
                          strokeWidth={1}
                        />
                      </div>
                    )}

                    <img
                      src={optimizeCloudinaryUrl(rawImage)}
                      alt={item.title}
                      loading="lazy"
                      onLoad={() =>
                        setLoaded((prev) => ({ ...prev, [item.id]: true }))
                      }
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
        </div>

        {/* BARRA DE PROGRESO: Pegada al borde inferior real de la pantalla */}
        <div className="absolute bottom-0 left-0 w-full h-[5px] bg-white/10 z-[60]">
          <motion.div
            style={{ scaleX: scrollYProgress }}
            className="h-full bg-red-600 origin-left"
          />
        </div>

        {/* OVERLAY DE GUÍA (Z-index alto para cubrir todo) */}
        <AnimatePresence>
          {showVerticalGuidance && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 z-[100] bg-black/85 backdrop-blur-xl flex flex-col items-center justify-center pointer-events-none"
            >
              <div className="flex flex-col items-center px-6 -translate-y-[15vh] scale-90">
                <div className="relative h-56 w-40 flex items-center justify-center">
                  <motion.div
                    animate={{ y: [40, -40, 40] }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                      ease: "easeInOut",
                    }}
                  >
                    <svg
                      width="110"
                      height="110"
                      viewBox="0 0 116.91 122.88"
                      className="fill-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.6)]"
                    >
                      <path d="M40.75,67.62c-0.15-0.07-0.33-0.18-0.48-0.29c-1.95-1.55-4.09-3.28-5.93-4.79c-2.69-2.21-5.78-4.75-7.95-6.55 c-1.47-1.21-3.17-2.06-4.75-2.39c-1.03-0.18-1.95-0.18-2.69,0.11c-0.59,0.26-1.1,0.74-1.44,1.47c-0.44,0.99-0.66,2.39-0.55,4.31 c0.11,1.69,0.7,3.53,1.47,5.34c1.14,2.61,2.72,5.04,3.9,6.59c0.07,0.11,0.15,0.18,0.18,0.29l23.3,33.28 c0.29,0.44,0.48,0.92,0.52,1.4c0.48,3.83,1.29,6.74,2.47,8.54c0.88,1.33,1.99,1.99,3.42,1.95H88.9c2.28-0.04,4.34-0.7,6.26-2.02 c2.1-1.44,3.98-3.68,5.71-6.7c0.04-0.04,0.07-0.11,0.11-0.15c0.66-1.14,1.55-2.61,2.39-4.01c3.72-6.11,6.96-11.45,7.33-19.03 l-0.22-10.45c-0.04-0.15-0.04-0.29-0.04-0.44c0-0.15,0-1.14,0.04-2.47c0.07-6.92,0.18-15.46-6.15-16.53h-4.09 c-0.04,1.95-0.15,3.94-0.26,5.85c-0.11,1.73-0.22,3.35-0.22,4.93c0,1.69-1.36,3.06-3.06,3.06s-3.06-1.36-3.06-3.06 c0-1.58,0.11-3.42,0.22-5.34c0.41-6.52,0.88-13.99-4.31-14.91h-4.05c-0.22,0-0.44-0.04-0.66-0.07c0.04,2.36-0.11,4.79-0.26,7.14 c-0.11,1.73-0.22,3.35-0.22,4.93c0,1.69-1.36,3.06-3.06,3.06s-3.06-1.36-3.06-3.06c0-1.58,0.11-3.42,0.22-5.34 c0.4,6.52,0.88-13.99-4.31-14.91h-4.05c-0.29,0-0.55-0.04-0.81-0.11v11.89c0,1.69-1.36,3.06-3.06,3.06s-3.06-1.36-3.06-3.06V17.23 c0-5.34-2.17-8.72-4.97-10.12c-1.03-0.52-2.14-0.77-3.2-0.77c-1.07,0-2.17,0.26-3.2,0.77c-2.76,1.4-4.9,4.79-4.9,10.27v55.92 c0,1.69-1.36,3.06-3.06,3.06s-3.06-1.36-3.06-3.06v-5.67H40.75L40.75,67.62z M0.81,12.28c-1.04,0.99-1.08,2.64-0.09,3.68 C1.71,17,3.35,17.04,4.4,16.05l7.69-7.35v22.08c0,1.44,1.17,2.61,2.61,2.61s2.61-1.17,2.61-2.61V8.68l7.73,7.37 c1.04,0.99,2.69,0.95,3.68-0.09c0.99-1.04,0.95-2.69-0.09-3.68L16.49,0.72c-1-0.95-2.58-0.96-3.59,0L0.81,12.28L0.81,12.28z M69.32,31.33c0.26-0.07,0.52-0.11,0.81-0.11h4.23c0.22,0,0.48,0.04,0.7,0.07c5.63,0.88,8.17,4.16,9.2,8.43 c0.4-0.18,0.85-0.29,1.29-0.29h4.23c0.22,0,0.48,0.04,0.7,0.07c6.07,0.96,8.5,4.67,9.39,9.39c0.15-0.04,0.29-0.04,0.48-0.04h4.23 c0.22,0,0.48,0.04,0.7,0.07c11.63,1.8,11.49,13.36,11.37,22.68v2.43l0.26,10.75v0.33c-0.44,9.17-4.05,15.09-8.21,21.94 c-0.7,1.14-1.4,2.32-2.36,3.94c-0.04,0.04-0.04,0.07-0.07,0.11c-2.17,3.79-4.67,6.7-7.55,8.69c-2.91,2.02-6.15,3.06-9.68,3.09 H52.42c-3.64,0.07-6.48-1.51-8.58-4.64c-1.69-2.5-2.8-6.04-3.39-10.45L17.63,75.17l-0.11-0.11c-1.36-1.8-3.2-4.64-4.6-7.77 c-1.03-2.36-1.8-4.9-1.99-7.4c-0.18-2.98,0.22-5.34,1.07-7.22c1.03-2.32,2.72-3.83,4.75-4.64c1.88-0.77,4.01-0.88,6.15-0.44 c2.58,0.52,5.23,1.8,7.47,3.68c1.84,1.55,4.93,4.05,7.95,6.52l2.5,2.06V17.41c0-8.14,3.61-13.36,8.28-15.72 c1.88-0.96,3.9-1.44,5.96-1.44c2.06,0,4.09,0.48,5.96,1.44c4.68,2.36,8.36,7.62,8.36,15.61v14.06L69.32,31.33z" />
                    </svg>
                  </motion.div>
                </div>

                <div className="mt-4 text-center">
                  <p className="text-red-600 font-black italic text-4xl tracking-tighter uppercase leading-none">
                    SCROLL
                  </p>
                  <p className="text-white font-black italic text-4xl tracking-tighter uppercase leading-none">
                    VERTICAL
                  </p>
                  <div className="h-[2px] w-12 bg-red-600 mx-auto my-4" />
                  <p className="text-white/40 text-[9px] font-bold tracking-[0.5em] uppercase">
                    Mueve el dedo arriba o abajo
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Gallery;
