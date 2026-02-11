import React, { useEffect, useState, lazy, Suspense, useRef } from "react";
import { useLocation } from "react-router-dom";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App.jsx";
import Login from "./views/Login.jsx";
import Retailers from "./views/Retailers.jsx";
import PreLoader from "./components/PreLoader.jsx";
import api from "./services/api.js";
import { Loader2 } from "lucide-react";
import { PWAProvider } from "./hooks/usePWAInstall.jsx";
import "./index.css";

const AdminPanel = lazy(() => import("./views/AdminPanel.jsx"));

// SW solo en producción - AJUSTAR RUTA PARA BROWSER ROUTER
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => console.log("SW registrado:", reg.scope))
      .catch((err) => console.error("Error SW:", err));
  });
}

const PrivateRoute = ({ children }) => {
  const [authState, setAuthState] = useState({ 
    checking: true, 
    isAuth: false 
  });
  const checkPerformed = useRef(false);

  useEffect(() => {
    if (checkPerformed.current) return;
    checkPerformed.current = true;

    const verify = async () => {
      try {
        await api.verifyAuth();
        setAuthState({ checking: false, isAuth: true });
      } catch {
        setAuthState({ checking: false, isAuth: false });
      }
    };
    verify();
  }, []);

  if (authState.checking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="text-red-600 animate-spin" size={32} />
        <span className="ml-3 text-white text-[10px] uppercase tracking-[0.3em]">
          Verificando...
        </span>
      </div>
    );
  }

  return authState.isAuth ? children : <Navigate to="/login" replace />;
};

const PageLoader = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <Loader2 className="text-red-600 animate-spin" size={32} />
    <span className="ml-3 text-white text-[10px] uppercase tracking-[0.3em]">
      Cargando...
    </span>
  </div>
);

// ✅ SOLUCIÓN: ScrollToTop debe ignorar las rutas de productos
const ScrollToTop = () => {
  const { pathname } = useLocation();
  const prevPathnameRef = useRef(pathname);

  useEffect(() => {
    const prevPath = prevPathnameRef.current;
    const currentPath = pathname;

    // NO hacer scroll si:
    // 1. Vamos de "/" a "/producto/..." (abriendo modal)
    // 2. Vamos de "/producto/..." a "/" (cerrando modal)
    // 3. Vamos de "/producto/..." a "/producto/..." (cambiando producto)
    const isProductRoute = currentPath.startsWith('/producto/') || currentPath.startsWith('/share/');
    const wasProductRoute = prevPath.startsWith('/producto/') || prevPath.startsWith('/share/');
    const isHome = currentPath === '/';
    const wasHome = prevPath === '/';

    // Solo hacer scroll to top en cambios de página reales (no modales)
    const shouldScrollToTop = 
      !isProductRoute && // No estamos yendo a un producto
      !wasProductRoute && // No venimos de un producto
      !(isHome && wasProductRoute) && // No estamos cerrando un modal
      !(wasHome && isProductRoute); // No estamos abriendo un modal

    if (shouldScrollToTop) {
      window.scrollTo(0, 0);
    }

    prevPathnameRef.current = currentPath;
  }, [pathname]);

  return null;
};

const Root = () => {
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    let hasLoaded = false;
    try {
      hasLoaded = sessionStorage.getItem("app_loaded");
    } catch (e) {
      console.warn("Storage no disponible");
    }

    if (!hasLoaded) {
      setShowLoader(true);
      const timer = setTimeout(() => {
        setShowLoader(false);
        import("./views/AdminPanel.jsx").catch(() => {});
        try {
          sessionStorage.setItem("app_loaded", "true");
        } catch (e) {}
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <PWAProvider>
      <BrowserRouter>
        <ScrollToTop />
        {showLoader && <PreLoader />}
        
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/producto/:slug" element={<App />} />
          <Route path="/share/:slug" element={<App />} />
          <Route path="/login" element={<Login />} />
          <Route path="/retailers" element={<Retailers />} />
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <Suspense fallback={<PageLoader />}>
                  <AdminPanel />
                </Suspense>
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </PWAProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);