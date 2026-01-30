import React, { useRef, useEffect, useState } from "react";
import { motion, useTransform, useScroll } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom"; // 1. Importamos useNavigate

const Gallery = ({ items, setSelectedItem }) => {
  const targetRef = useRef(null);
  const navigate = useNavigate(); 
  const [collectionName, setCollectionName] = useState("");
  const [loaded, setLoaded] = useState({});

  const optimizeCloudinaryUrl = (url) => {
    if (!url || !url.includes("cloudinary.com")) return url;
    const splitUrl = url.split("/upload/");
    const optimizationParams = "f_auto,q_auto,w_1000";
    return `${splitUrl[0]}/upload/${optimizationParams}/${splitUrl[1]}`;
  };

  useEffect(() => {
    const fetchCollectionName = async () => {
      try {
        const res = await fetch("/api/settings/collection");
        const data = await res.json();
        if (data && data.value) setCollectionName(data.value);
      } catch (err) {
        setCollectionName("NEW COLLECTION");
      }
    };
    fetchCollectionName();
  }, []);

  const handleOpenProduct = (item) => {
    const slug = item.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "") 
      .replace(/\s+/g, "-"); 
    navigate(`/producto/${slug}`);

    setSelectedItem(item);
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
          items.length * cardWidth + (items.length - 1) * gap;
        setTotalScroll(-(contentWidth - window.innerWidth + padding));
      }
    };
    calculateScroll();
    window.addEventListener("resize", calculateScroll);
    return () => window.removeEventListener("resize", calculateScroll);
  }, [items.length]);

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
      className="relative h-[auto] bg-neutral-900/20"
    >
      <div className="sticky top-5 h-screen flex flex-col justify-center overflow-hidden">
        <motion.div
          style={{ x: titleX, opacity }}
          className="relative z-10 px-6 md:px-12 mb-4 md:mb-6 pointer-events-none"
        >
          <motion.span className="text-red-600 text-[9px] md:text-xs font-bold uppercase tracking-[0.6em] block mb-0 pl-1">
            THE CATALOG
          </motion.span>
          <h2 className="text-white text-5xl md:text-5xl font-black uppercase italic tracking-tighter leading-[0.8] flex flex-col py-2">
            {collectionName ? (
              <>
                <span className="block">{collectionName.split(" ")[0]}</span>
                <span className="block text-white">
                  {collectionName.split(" ").slice(1).join(" ")}
                </span>
              </>
            ) : (
              "LOADING..."
            )}
          </h2>
        </motion.div>

        <div className="relative">
          <motion.div
            style={{ x: xPx }}
            className="flex gap-6 md:gap-12 px-6 md:px-12"
          >
            {items.map((item) => {
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

        <div className="absolute bottom-5 left-0 w-full h-[5px] bg-white/10 z-20">
          <motion.div
            style={{ scaleX: scrollYProgress }}
            className="h-full bg-red-600 origin-left"
          />
        </div>
      </div>
    </section>
  );
};

export default Gallery;
