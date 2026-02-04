import { useState, useEffect } from 'react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    });
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`Usuario ${outcome === 'accepted' ? 'aceptó' : 'rechazó'} la instalación`);
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-black text-white p-4 rounded-lg shadow-lg z-50">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold">Instala NOMAD® Wear</h3>
          <p className="text-sm">Acceso rápido desde tu pantalla de inicio</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowPrompt(false)}
            className="px-3 py-1 text-gray-400"
          >
            Ahora no
          </button>
          <button 
            onClick={handleInstall}
            className="px-4 py-2 bg-white text-black rounded font-bold"
          >
            Instalar
          </button>
        </div>
      </div>
    </div>
  );
}