import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";

// Componentes
import PreLoader from "./PreLoader";
import Navbar from "./Navbar";
import Hero from "./Hero";
import IntroMarque from "./IntroMarque";
import Gallery from "./Gallery";
import Manifest from "./Manifest";
import Packing from "./Packing"
import StudioMarque from "./StudioMarque";
import TheStudio from "./TheStudio";
import Stockists from "./Stockists";
import Contacto from "./Contacto";
import Footer from "./Footer";
import ProductModal from "./ProductModal";

// Hooks
import { useProducts } from "./hooks/useProducts";
import { useToast } from "./components/Toast";

function App() {
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const { products, loading: productsLoading, error, refetch } = useProducts();
  const toast = useToast();

  // Mostrar error si hay problemas cargando productos
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Timer del Loader
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Bloqueo de Scroll global
  useEffect(() => {
    document.body.style.overflow = (loading || selectedItem) ? "hidden" : "auto";
  }, [loading, selectedItem]);

  return (
    <>
      <toast.ToastContainer />
      <PreLoader />

      <div className="bg-black text-white selection:bg-white selection:text-black">
        <Navbar />
        
        <main>
          <Hero />
          
          {/* Mostrar mensaje si hay error */}
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
          
          {/* Mostrar loading o galería */}
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
          <Contacto />
        </main>

        <Footer />

        <AnimatePresence>
          {selectedItem && (
            <ProductModal
              item={selectedItem}
              onClose={() => setSelectedItem(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

export default App;