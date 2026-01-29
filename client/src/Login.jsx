import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, User } from "lucide-react";
import api from "./services/api";
import { useToast } from "./components/Toast";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    // Verificar si ya está autenticado
    const checkAuth = async () => {
      try {
        await api.verifyAuth();
        navigate('/admin');
      } catch (err) {
        // No está autenticado, continuar en login
      }
    };
    checkAuth();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    setLoading(true);

    try {
      const response = await api.login(username, password);
      
      if (response.success) {
        toast.success("Autenticación exitosa");
        // Esperar un momento para que el usuario vea el mensaje
        setTimeout(() => {
          navigate("/admin");
        }, 500);
      }
    } catch (error) {
      console.error("Error en login:", error);
      toast.error(error.message || "Usuario o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <toast.ToastContainer />
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-2">
              Nomad<span className="text-red-600">.</span>
            </h1>
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 font-bold">
              Admin Terminal
            </p>
          </div>

          {/* Formulario */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleLogin}
            className="space-y-6"
          >
            {/* Username */}
            <div className="relative group">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-red-600 transition-colors">
                <User size={18} />
              </div>
              <input
                type="text"
                placeholder="USUARIO"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                className="w-full bg-transparent border-b border-white/20 py-3 pl-8 outline-none focus:border-red-600 transition-colors text-center font-mono uppercase tracking-[0.3em] text-sm disabled:opacity-50"
                autoComplete="username"
              />
            </div>

            {/* Password */}
            <div className="relative group">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-red-600 transition-colors">
                <Lock size={18} />
              </div>
              <input
                type="password"
                placeholder="CONTRASEÑA"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full bg-transparent border-b border-white/20 py-3 pl-8 outline-none focus:border-red-600 transition-colors text-center font-mono uppercase tracking-[0.3em] text-sm disabled:opacity-50"
                autoComplete="current-password"
              />
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className={`w-full py-4 text-xs font-black uppercase tracking-[0.3em] transition-all shadow-lg ${
                loading
                  ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                  : "bg-white text-black hover:bg-red-600 hover:text-white"
              }`}
            >
              {loading ? "AUTENTICANDO..." : "AUTHENTICATE"}
            </motion.button>
          </motion.form>

          {/* Info adicional */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 text-center"
          >
            <p className="text-[8px] uppercase tracking-[0.4em] text-neutral-600 font-mono">
              Secure Access Only
            </p>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default Login;
