import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useParams } from "react-router-dom";
import { useServiceWorker } from "./hooks/useServiceWorker";

// Componentes
import Navbar from "./Navbar";
import Hero from "./Hero";
import IntroMarque from "./IntroMarque";
import Gallery from "./Gallery";
import Manifest from "./Manifest";
import Packing from "./Packing";
import StudioMarque from "./StudioMarque";
import TheStudio from "./TheStudio";
import Stockists from "./Stockists";
import MeliSection from "./MeliSection";
import Contacto from "./Contacto";
import Footer from "./Footer";
import ProductModal from "./ProductModal";
import InstallPrompt from "./InstallPrompt";

// Hooks
import { useProducts } from "./hooks/useProducts";
import { useToast } from "./components/Toast";

function App() {
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const { products, loading: productsLoading, error, refetch } = useProducts();
  const toast = useToast();
  useServiceWorker();

  const { slug } = useParams();

  // Detectar links compartidos (cuando entran con /share/slug)
  useEffect(() => {
    // Obtener el slug desde useParams (para react-router) o desde window.location
    let productSlug = slug;
    
    // Si no hay slug en params, buscar en la URL actual
    if (!productSlug) {
      const path = window.location.pathname;
      const shareMatch = path.match(/\/share\/([^\/]+)/);
      if (shareMatch) {
        productSlug = shareMatch[1];
      }
    }

    if (productSlug && products.length > 0) {
      const product = products.find((p) => {
        const cleanTitle = p.title
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-");

        return cleanTitle === productSlug;
      });

      if (product) {
        setSelectedItem(product);
      }
    }
  }, [slug, products]);

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  const handleShowInstallPrompt = () => {
    const hasSeenPrompt = localStorage.getItem("pwa-install-prompt-seen");
    if (!hasSeenPrompt) {
      setShowInstallPrompt(true);
    }
  };

  const handleCloseInstallPrompt = () => {
  setShowInstallPrompt(false);
};

  // Mostrar error si hay problemas cargando productos
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error, toast]);

  // Timer del Loader
  // Dentro de App.js
  useEffect(() => {
    const hasLoaded = sessionStorage.getItem("app_loaded");

    if (hasLoaded) {
      setLoading(false); // Si ya cargó antes, lo desactivamos instantáneamente
    } else {
      const timer = setTimeout(() => {
        setLoading(false);
        sessionStorage.setItem("app_loaded", "true");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Bloqueo de Scroll global
  useEffect(() => {
    document.body.style.overflow = loading || selectedItem ? "hidden" : "auto";
  }, [loading, selectedItem]);

  return (
    <>
      <toast.ToastContainer />
      <InstallPrompt
        show={showInstallPrompt}
        onClose={handleCloseInstallPrompt}
      />
      <div className="bg-black text-white selection:bg-white selection:text-black">
        <Navbar onContactClick={handleShowInstallPrompt} />

        <main>
          <Hero />

          {error && (
            <div className="container mx-auto px-6 py-12">
              <div className="bg-red-900/20 border border-red-500 p-6 rounded text-center">
                <p className="text-red-400 mb-4">{error}</p>
                <button
                  onClick={refetch}
                  className="bg-red-600 text-white px-6 py-2 text-sm uppercase tracking-wider hover:bg-red-700 transition-colors"
                >
                  Reintentar
                </button>
              </div>
            </div>
          )}

          {productsLoading ? (
            <div className="min-h-[50vh] flex items-center justify-center">
              <p className="text-neutral-500 text-sm uppercase tracking-wider">
                Cargando productos...
              </p>
            </div>
          ) : (
            <Gallery items={products} setSelectedItem={setSelectedItem} />
          )}

          <Manifest />
          <IntroMarque />
          <Packing />
          <StudioMarque />
          <TheStudio />
          <Stockists />
          <MeliSection />
          <Contacto />
        </main>

        <Footer />

        <AnimatePresence>
          {selectedItem && (
            <ProductModal item={selectedItem} onClose={handleCloseModal} />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

export default App;
