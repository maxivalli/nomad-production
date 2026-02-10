import React, { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { useParams, useLocation, useNavigate } from "react-router-dom";

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
  
  // Hooks de router para BrowserRouter
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // 1. MANEJO DE RUTAS ANTIGUAS (HashRouter → BrowserRouter)
  useEffect(() => {
    // Detectar si hay hash en la URL (formato antiguo #/producto/xyz)
    const hash = window.location.hash;
    if (hash && hash.startsWith('#/')) {
      const newPath = hash.substring(1); // Remover el # para obtener /producto/xyz
      console.log('[App] Redirigiendo desde HashRouter:', hash, '→', newPath);
      // Reemplazar la URL sin recargar la página
      window.location.replace(newPath);
      return;
    }
  }, []);

  // 2. DETECTAR PRODUCTO DESDE URL (/producto/:slug o /share/:slug)
  useEffect(() => {
    // No procesar si estamos redirigiendo desde hash
    if (window.location.hash) return;

    let productSlug = slug;
    let isFromShare = false;

    // Si no hay slug en params, verificar si estamos en /share/
    if (!productSlug && location.pathname.includes('/share/')) {
      const shareMatch = location.pathname.match(/\/share\/([^\/]+)/);
      if (shareMatch) {
        productSlug = shareMatch[1];
        isFromShare = true;
      }
    }

    if (productSlug && products.length > 0 && !productsLoading) {
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
        // Si venía de /share/, limpiar la URL a /producto/:slug para SEO/sharing
        if (isFromShare) {
          const cleanPath = `/producto/${productSlug}`;
          window.history.replaceState({}, '', cleanPath);
        }
      } else {
        // Producto no encontrado, podrías mostrar error o redirigir
        console.warn('[App] Producto no encontrado:', productSlug);
      }
    }
  }, [slug, location.pathname, products, productsLoading]);

  // 3. SINCRONIZAR ESTADO DEL MODAL CON URL
  const handleCloseModal = useCallback(() => {
    setSelectedItem(null);
    // Si la URL es /producto/:slug, volver a /
    if (location.pathname.startsWith('/producto/')) {
      navigate('/', { replace: true });
    }
  }, [location.pathname, navigate]);

  // 4. MANEJAR ESCAPE KEY PARA CERRAR MODAL
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && selectedItem) {
        handleCloseModal();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [selectedItem, handleCloseModal]);

  // 5. LOADER - Solo si no viene de main.jsx (fallback)
  useEffect(() => {
    // Verificar si main.jsx ya manejó el loader global
    const mainHandledLoader = sessionStorage.getItem("app_loaded");
    
    if (mainHandledLoader) {
      setLoading(false);
      return;
    }

    // Fallback: manejar loader aquí si main.jsx no lo hizo
    const timer = setTimeout(() => {
      setLoading(false);
      try {
        sessionStorage.setItem("app_loaded", "true");
      } catch (e) {}
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // 6. BLOQUEO DE SCROLL
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = loading || selectedItem ? "hidden" : "auto";
    
    // Cleanup: restaurar overflow original al desmontar
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [loading, selectedItem]);

  const handleCloseInstallPrompt = () => {
    setShowInstallPrompt(false);
    localStorage.setItem("pwa-install-prompt-seen", "true");
  };

  // 8. ERROR HANDLING
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error, toast]);

  // No renderizar nada mientras redirigimos desde hash
  if (window.location.hash) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xs uppercase tracking-widest">
          Redirigiendo...
        </div>
      </div>
    );
  }

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
        <Navbar />

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
            <ProductModal 
              item={selectedItem} 
              onClose={handleCloseModal}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

export default App;