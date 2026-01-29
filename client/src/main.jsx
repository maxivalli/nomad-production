import React, { useEffect, useState, lazy, Suspense } from 'react' // 1. Agregamos lazy y Suspense
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import App from './App.jsx'
import Login from './Login.jsx'
import api from './services/api.js'
import { Loader2 } from 'lucide-react' // Opcional: para el spinner
import './index.css'

// 2. Cargamos AdminPanel de forma perezosa (Lazy Load)
const AdminPanel = lazy(() => import('./AdminPanel.jsx'));

// --- COMPONENTE DE PROTECCIÓN MEJORADO ---
const PrivateRoute = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

// 3. Componente de carga para el Suspense (Fallback)
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

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route 
          path="/admin" 
          element={
            <PrivateRoute>
              {/* 4. Envolvemos el componente lazy en Suspense */}
              <Suspense fallback={<PageLoader />}>
                <AdminPanel />
              </Suspense>
            </PrivateRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>,
)