import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Instagram, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const menuLinks = [
    "Colecciones",
    "Manifiesto",
    "Packing",
    "Studio",
    "Tiendas",
    "Retailers",
    "Contacto",
  ];

  const handleLinkClick = (item) => {
    // 1. Caso especial: Si ya estás en Retailers y haces clic en Retailers, no hace nada
    if (item === "Retailers" && window.location.hash.includes("/retailers")) {
      setIsMenuOpen(false);
      return;
    }

    // 2. Navegar a la página de Retailers
    if (item === "Retailers") {
      navigate("/retailers");
      setIsMenuOpen(false);
      return;
    }

    // 3. Si quieres ir a una sección de la Home pero estás en otra ruta (como Retailers)
    const isHome = window.location.hash === "#/" || window.location.hash === "";

    if (!isHome) {
      // Primero volvemos a la Home
      navigate("/");

      // Esperamos a que el componente App se monte para buscar el ID
      setTimeout(() => {
        const element = document.getElementById(item.toLowerCase());
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 300); // Un delay un poco más largo para asegurar la carga
    } else {
      // Si ya estamos en Home, scroll normal
      const element = document.getElementById(item.toLowerCase());
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }

    setIsMenuOpen(false);
  };

  useEffect(() => {
    if (isMenuOpen) {
      // Desactiva el scroll y evita saltos visuales de la barra de scroll
      document.body.style.overflow = "hidden";
    } else {
      // Restablece el scroll cuando se cierra
      document.body.style.overflow = "unset";
    }

    // Limpieza al desmontar el componente (importante)
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  return (
    <>
      {/* NAV PRINCIPAL */}
      <nav className="fixed top-0 w-full p-6 md:p-10 flex justify-between items-center z-50 mix-blend-difference isolate">
        {/* LOGO */}
        <div className="flex-1">
          <Link to="/">
            <motion.h1
              initial="initial"
              whileHover="hover"
              className="text-2xl md:text-3xl font-black tracking-tighter italic uppercase cursor-pointer w-fit text-white flex items-center group"
            >
              <motion.span
                variants={{
                  initial: { x: 0, opacity: 0.9 },
                  hover: {
                    x: -3,
                    opacity: 1,
                    transition: { type: "spring", stiffness: 400, damping: 10 },
                  },
                }}
              >
                Nomad
              </motion.span>

              <div className="relative ml-0.5">
                <motion.span
                  variants={{
                    initial: { scale: 1, opacity: 1 },
                    hover: {
                      scale: [1, 1.8, 1],
                      opacity: [1, 0.5, 1],
                      transition: {
                        repeat: Infinity,
                        duration: 0.8,
                        ease: "easeInOut",
                      },
                    },
                  }}
                  className="text-red-600 inline-block relative z-10"
                >
                  .
                </motion.span>
                <motion.span
                  variants={{
                    initial: { scale: 0, opacity: 0 },
                    hover: {
                      scale: 3,
                      opacity: [0, 0.4, 0],
                      transition: {
                        repeat: Infinity,
                        duration: 0.8,
                        ease: "easeOut",
                      },
                    },
                  }}
                  className="absolute inset-0 bg-red-600 rounded-full blur-[2px] z-0"
                />
              </div>
            </motion.h1>
          </Link>
        </div>

        {/* DESKTOP LINKS */}
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 gap-8 items-center">
          {menuLinks.map((item) => (
            <motion.button
              key={item}
              onClick={() => handleLinkClick(item)} // Cambiamos a la nueva función
              initial="initial"
              whileHover="hover"
              className="relative py-2 text-[10px] tracking-[0.4em] uppercase font-medium cursor-pointer text-white"
            >
              <motion.span
                variants={{
                  initial: { opacity: 1 },
                  hover: { opacity: 0.6 },
                }}
                className={item === "Retailers" ? "text-red-600 font-bold" : ""} // Opcional: Destacar Retailers
              >
                {item}
              </motion.span>
              <motion.span
                variants={{
                  initial: { width: "0%", left: "50%" },
                  hover: { width: "100%", left: "0%" },
                }}
                className="absolute bottom-0 h-[1px] bg-red-600"
              />
            </motion.button>
          ))}
        </div>

        {/* REDES Y MENÚ MÓVIL */}
        <div className="flex-1 flex justify-end gap-6 items-center">
          <motion.a
            href="https://instagram.com/nomadwearok"
            target="_blank"
            className="text-white"
            whileHover={{ color: "#dc2626", scale: 1.2, rotate: 12 }}
            whileTap={{ scale: 0.9 }}
          >
            <Instagram size={22} />
          </motion.a>

          <button
            onClick={() => setIsMenuOpen(true)}
            className="md:hidden text-white p-1"
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 200 }}
            className="fixed inset-0 z-[200] bg-black flex flex-col p-10"
          >
            <div className="flex justify-end">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMenuOpen(false)}
                className="text-white p-2"
              >
                <X size={42} strokeWidth={1} />
              </motion.button>
            </div>

            <div className="flex flex-col gap-5 mt-16">
              {menuLinks.map((item, idx) => (
                <motion.button
                  key={item}
                  onClick={() => handleLinkClick(item)}
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 * idx }}
                  className={`text-4xl font-black uppercase italic tracking-tighter hover:text-red-600 transition-colors text-left flex items-baseline ${
                    item === "Retailers" ? "text-red-600" : "text-white"
                  }`}
                >
                  {item}
                  {/* PUNTO ROJO MÓVIL CON PULSO SUTIL */}
                  <motion.span
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-red-600 ml-1"
                  >
                    .
                  </motion.span>
                </motion.button>
              ))}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-xs uppercase tracking-[0.4em] text-gray-500 mt-10 ml-1 block hover:text-white transition-colors"
                >
                  Staff Access
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
