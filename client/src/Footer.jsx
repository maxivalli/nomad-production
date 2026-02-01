import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="h-[50vh] flex flex-col items-center justify-center gap-6 bg-black border-t border-white/5">
      {/* Logo / Brand Name */}
      <div className="text-center">
        <h3 className="text-2xl md:text-3xl font-black tracking-widest uppercase italic">
          Nomad<span className="text-red-600">.</span>
        </h3>
        <p className="text-gray-600 text-[9px] md:text-[10px] uppercase tracking-[0.5em] mt-2">
          Unbound by territory
        </p>
      </div>

      {/* Copyright & Links */}
      <div className="flex flex-col items-center gap-4">
        <p className="text-gray-600 text-[10px] uppercase tracking-widest">
          © {currentYear} Nomad Wear. Todos los derechos reservado.
        </p>
        
        <div className="admin-access flex gap-6">
          <Link
            to="/login"
            className="text-[11px] uppercase tracking-widest text-gray-500 hover:text-white transition-colors duration-300 border-b border-transparent hover:border-red-600 pb-1"
          >
            Staff Access
          </Link>
          {/* Espacio para más links en el futuro: Privacy, Terms, etc. */}
        </div>
      </div>

      {/* Crédito técnico sutil */}
      <div className="mt-4 opacity-50 hover:opacity-100 transition-opacity">
        <p className="text-[8px] uppercase tracking-tighter text-gray-500">
          Built for the modern nomad
        </p>
      </div>
    </footer>
  );
};

export default Footer;