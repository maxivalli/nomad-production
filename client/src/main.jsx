import React, { useEffect, useState, lazy, Suspense } from "react";
import { useLocation, useParams } from "react-router-dom";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App.jsx";
import Login from "./views/Login.jsx";
import Retailers from "./views/Retailers.jsx";
import PreLoader from "./components/PreLoader.jsx";
import api from "./services/api.js";
import { Loader2 } from "lucide-react";
import "./index.css";

const AdminPanel = lazy(() => import("./views/AdminPanel.jsx"));

// ← AGREGAR ESTE COMPONENTE NUEVO
const ShareRedirect = () => {
  const { slug } = useParams();
  return <Navigate to={`/producto/${slug}`} replace />;
};

const PrivateRoute = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => console.log("SW registrado:", registration))
        .catch((error) => console.log("Error SW:", error));
    });
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await api.verifyAuth();
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setIsChecking(false);
      }
    };
    checkAuth();
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="text-red-600 animate-spin" size={32} />
          <p className="text-white text-[10px] uppercase tracking-[0.3em]">
            Verificando acceso...
          </p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PageLoader = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="text-red-600 animate-spin" size={32} />
      <p className="text-white text-[10px] uppercase tracking-[0.3em]">
        Cargando Panel...
      </p>
    </div>
  </div>
);

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const Root = () => {
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    let hasLoadedBefore = false;
    try {
      hasLoadedBefore = sessionStorage.getItem("app_loaded");
    } catch (e) {
      console.warn("Storage access not allowed, loader will show every time.");
    }

    if (!hasLoadedBefore) {
      setShowLoader(true);
      const timer = setTimeout(() => {
        setShowLoader(false);
        try {
          sessionStorage.setItem("app_loaded", "true");
        } catch (e) {}
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <BrowserRouter>
      <ScrollToTop />
      {showLoader && <PreLoader />}

      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/producto/:slug" element={<App />} />
        <Route path="/share/:slug" element={<ShareRedirect />} /> {/* ← CAMBIO AQUÍ */}
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
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);