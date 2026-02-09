import { usePWAInstall } from '../hooks/usePWAInstall';

export default function InstallPrompt({ show, onClose }) {
  const { installPWA, canShowPrompt } = usePWAInstall();

  const handleInstall = async () => {
    const result = await installPWA();
    
    if (result.success) {
      // Solo guardar si instaló exitosamente
      localStorage.setItem('pwa-install-prompt-seen', 'true');
      onClose();
    }
  };

  // No mostrar si no hay prompt disponible o si show es false
  if (!show || !canShowPrompt()) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white text-black rounded-lg shadow-2xl max-w-md w-full p-6 animate-fade-in">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <img 
              src="/nomadv2.svg" 
              alt="NOMAD Logo" 
              className="w-16 h-16"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2">Instala NOMAD® Wear</h3>
            <p className="text-gray-600 text-sm mb-4">
              Accede rápidamente desde tu pantalla de inicio. Sin publicidad, sin distracciones.
            </p>
            <ul className="text-sm text-gray-700 mb-4 space-y-1">
              <li>✓ Acceso instantáneo</li>
              <li>✓ Funciona sin conexión</li>
              <li>✓ Experiencia como app nativa</li>
            </ul>
          </div>
        </div>
        
        <div className="flex gap-3 mt-4">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Ahora no
          </button>
          <button 
            onClick={handleInstall}
            className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold"
          >
            Instalar
          </button>
        </div>
      </div>
    </div>
  );
}