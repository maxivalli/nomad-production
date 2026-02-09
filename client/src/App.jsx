import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useParams, useNavigate, useLocation } from "react-router-dom";

// Componentes
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import IntroMarque from "./components/IntroMarque";
import Gallery from "./components/Gallery";
import Manifest from "./components/Manifest";
import Packing from "./components/Packing";
import StudioMarque from "./components/StudioMarque";
import TheStudio from "./components/TheStudio";
import Stockists from "./components/Stockists";
import MeliSection from "./components/MeliSection";
import Contacto from "./components/Contacto";
import Footer from "./components/Footer";
import ProductModal from "./components/ProductModal";
import InstallPrompt from "./components/InstallPrompt";
import PushNotificationPrompt from "./components/PushNotificationPrompt";
import BannerModal from "./components/BannerModal";

// Hooks
import { useProducts } from "./hooks/useProducts";
import { useToast } from "./components/Toast";

function App() {
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const { products, loading: productsLoading, error, refetch } = useProducts();
  const toast = useToast();

  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Detectar links compartidos y abrir modal automáticamente
  useEffect(() => {
    if (slug && products.length > 0) {
      const product = products.find((p) => {
        const cleanTitle = p.title
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-");

        return cleanTitle === slug;
      });

      if (product) {
        setSelectedItem(product);
        // Agregar estado al historial para manejar el botón "atrás"
        if (!location.state?.fromModal) {
          window.history.replaceState({ modal: true }, '');
        }
      } else {
        // Si no se encuentra el producto, redirigir al home
        navigate('/', { replace: true });
      }
    }
  }, [slug, products, navigate, location.state]);

  // Función para abrir modal y actualizar URL
  const handleOpenModal = (product) => {
    const productSlug = product.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    
    setSelectedItem(product);
    navigate(`/producto/${productSlug}`, { state: { fromModal: true } });
  };

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setSelectedItem(null);
    // Volver a la página principal sin el parámetro de producto
    if (slug) {
      navigate('/', { replace: true });
    }
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
  useEffect(() => {
    const hasLoaded = sessionStorage.getItem("app_loaded");

    if (hasLoaded) {
      setLoading(false);
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
      <PushNotificationPrompt />
      <BannerModal />
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
            <Gallery items={products} setSelectedItem={handleOpenModal} />
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
