import { useState, useEffect } from 'react';
import { Bell, Send, Users, TrendingUp, Clock, Image as ImageIcon, X } from 'lucide-react';
import { useToast } from './Toast';
import api from '../services/api';

const PushNotificationPanel = () => {
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    url: '/',
    image: '', // ✅ NUEVO: URL de la imagen
    tag: 'nomad-offer'
  });

  useEffect(() => {
    loadData();
    
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, historyRes] = await Promise.all([
        api.getPushStats(),
        api.getPushHistory()
      ]);
      
      setStats(statsRes);
      setHistory(historyRes);
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('❌ Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  // ✅ NUEVO: Manejar subida de imagen
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('❌ El archivo debe ser una imagen');
      return;
    }

    // Validar tamaño (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('❌ La imagen debe pesar menos de 2MB');
      return;
    }

    setUploadingImage(true);
    try {
      // Crear FormData para enviar la imagen
      const formDataImg = new FormData();
      formDataImg.append('image', file);

      // Enviar al servidor (debes crear este endpoint)
      const response = await api.uploadPushImage(formDataImg);
      
      // Actualizar formData con la URL de la imagen
      setFormData({ ...formData, image: response.url });
      console.log('🖼️ URL de imagen subida:', response.url);
      toast.success('✅ Imagen subida correctamente');
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      toast.error('❌ Error al subir la imagen');
    } finally {
      setUploadingImage(false);
    }
  };

  // ✅ NUEVO: Remover imagen
  const removeImage = () => {
    setFormData({ ...formData, image: '' });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    
    if (!formData.title?.trim() || !formData.body?.trim()) {
      toast.warning('⚠️ Completa título y mensaje');
      return;
    }

    if (formData.title.trim().length < 3) {
      toast.warning('⚠️ El título debe tener al menos 3 caracteres');
      return;
    }

    if (formData.body.trim().length < 10) {
      toast.warning('⚠️ El mensaje debe tener al menos 10 caracteres');
      return;
    }

    if (!window.confirm('¿Enviar notificación a todos los suscriptores?')) {
      return;
    }

    setSending(true);
    try {
      const response = await api.sendPushNotification(formData);
      
      if (response.total === 0) {
        toast.warning('⚠️ No hay suscriptores activos');
        return;
      }

      if (response.successful === 0) {
        toast.error(`❌ Todas las notificaciones fallaron (${response.failed}/${response.total})`);
        return;
      }

      toast.success(`✅ ${response.successful}/${response.total} notificaciones enviadas`);
      
      // Reset form
      setFormData({
        title: '',
        body: '',
        url: '/',
        image: '',
        tag: 'nomad-offer'
      });
      
      loadData();
    } catch (error) {
      console.error('Error enviando notificación:', error);
      toast.error('❌ Error al enviar la notificación');
    } finally {
      setSending(false);
    }
  };

  // Plantillas predefinidas con imágenes
  const templates = [
    {
      name: 'Nuevo Drop',
      title: '🔥 NUEVO DROP DISPONIBLE',
      body: 'Descubrí la nueva colección NOMAD®. ¡Stock limitado!',
      url: '/',
      image: '' // Puedes poner URLs de imágenes por defecto
    },
    {
      name: 'Descuento',
      title: '💥 20% OFF en toda la tienda',
      body: 'Solo por 48hs. Aprovechá esta oportunidad única.',
      url: '/',
      image: ''
    },
    {
      name: 'Restock',
      title: '✨ RESTOCK ALERT',
      body: 'Volvieron tus productos favoritos. No te los pierdas.',
      url: '/',
      image: ''
    },
    {
      name: 'Black Friday',
      title: '🖤 BLACK FRIDAY - 30% OFF',
      body: 'El descuento más grande del año. ¡Solo por tiempo limitado!',
      url: '/',
      image: ''
    }
  ];

  const applyTemplate = (template) => {
    setFormData({
      ...formData,
      title: template.title,
      body: template.body,
      url: template.url,
      image: template.image || ''
    });
  };

  const quickEmojis = ['🔥', '💥', '✨', '🎉', '⚡', '🖤', '❤️', '🎁'];

  return (
    <div className="space-y-6">
      {/* Stats */}
      {loading && !stats ? (
        <div className="text-white/40 text-sm">Cargando estadísticas...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs uppercase tracking-wider mb-1">
                  Total Suscriptores
                </p>
                <p className="text-white text-2xl font-bold">
                  {stats?.total_subscriptions || 0}
                </p>
              </div>
              <Users className="text-white/40" size={32} />
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs uppercase tracking-wider mb-1">
                  Activos
                </p>
                <p className="text-white text-2xl font-bold">
                  {stats?.active_subscriptions || 0}
                </p>
              </div>
              <TrendingUp className="text-green-500" size={32} />
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs uppercase tracking-wider mb-1">
                  Inactivos
                </p>
                <p className="text-white text-2xl font-bold">
                  {stats?.inactive_subscriptions || 0}
                </p>
              </div>
              <Bell className="text-white/40" size={32} />
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <h3 className="text-white font-bold text-lg mb-4 uppercase tracking-wider">
          Enviar Notificación
        </h3>

        {/* Templates */}
        <div className="mb-4">
          <p className="text-white/60 text-sm mb-2">Plantillas rápidas:</p>
          <div className="flex flex-wrap gap-2">
            {templates.map((template) => (
              <button
                key={template.name}
                onClick={() => applyTemplate(template)}
                className="bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 rounded transition-colors"
              >
                {template.name}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="block text-white/80 text-sm mb-2">
              Título *
            </label>
            
            <div className="flex gap-1 flex-wrap mb-2">
              {quickEmojis.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setFormData({ 
                    ...formData, 
                    title: formData.title + emoji 
                  })}
                  className="w-8 h-8 bg-white/5 hover:bg-white/10 rounded text-lg transition-colors"
                  title={`Agregar ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
              placeholder="Ej: 🔥 NUEVO DROP DISPONIBLE"
              maxLength={65}
            />
            <p className="text-white/40 text-xs mt-1">
              {formData.title.length}/65 caracteres
            </p>
          </div>

          <div>
            <label className="block text-white/80 text-sm mb-2">
              Mensaje *
            </label>
            <textarea
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
              placeholder="Ej: Descubrí la nueva colección NOMAD®"
              rows={3}
              maxLength={200}
            />
            <p className="text-white/40 text-xs mt-1">
              {formData.body.length}/200 caracteres
            </p>
          </div>

          {/* ✅ NUEVO: Upload de imagen */}
          <div>
            <label className="block text-white/80 text-sm mb-2 flex items-center gap-2">
              <ImageIcon size={16} />
              Imagen (opcional - mejora el engagement en 3x)
            </label>
            
            {formData.image ? (
              <div className="relative">
                <img 
                  src={formData.image} 
                  alt="Preview" 
                  className="w-full h-40 object-cover rounded border border-white/20"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors"
                  title="Remover imagen"
                >
                  <X size={16} />
                </button>
                <p className="text-white/60 text-xs mt-2">
                  👆 Click en la X para remover la imagen
                </p>
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  disabled={uploadingImage}
                />
                <label
                  htmlFor="image-upload"
                  className="flex items-center justify-center gap-2 w-full bg-white/10 hover:bg-white/15 border border-white/20 rounded px-4 py-8 text-white cursor-pointer transition-colors"
                >
                  {uploadingImage ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Subiendo...</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon size={20} />
                      <span>Subir imagen</span>
                    </>
                  )}
                </label>
                <p className="text-white/40 text-xs mt-2">
                  Sube una imagen JPG, PNG o WebP (máx. 2MB)
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-white/80 text-sm mb-2">
              URL al hacer click (opcional)
            </label>
            <input
              type="text"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
              placeholder="/"
            />
            <p className="text-white/40 text-xs mt-1">
              Ej: / para home, /gallery para galería
            </p>
          </div>

          {/* Preview mejorado con imagen */}
          {(formData.title || formData.body) && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <p className="text-white/60 text-xs mb-2 uppercase tracking-wider">
                Vista Previa
              </p>
              <div className="bg-black/50 p-3 rounded border border-white/20">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center shrink-0">
                    <Bell size={16} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm">
                      {formData.title || 'Título de la notificación'}
                    </p>
                    <p className="text-white/70 text-xs mt-1">
                      {formData.body || 'Mensaje de la notificación'}
                    </p>
                    {formData.image && (
                      <img 
                        src={formData.image} 
                        alt="Preview" 
                        className="w-full h-32 object-cover rounded mt-2 border border-white/20"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={sending || !formData.title || !formData.body || stats?.active_subscriptions === 0}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            <Send size={18} />
            {sending 
              ? 'Enviando...' 
              : stats?.active_subscriptions 
                ? `Enviar a ${stats.active_subscriptions} suscriptores`
                : 'Enviar Notificación'
            }
          </button>
        </form>
      </div>

      {/* History */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <h3 className="text-white font-bold text-lg mb-4 uppercase tracking-wider flex items-center gap-2">
          <Clock size={20} />
          Historial
        </h3>

        {(!history || history.length === 0) ? (
          <p className="text-white/60 text-sm">No hay notificaciones enviadas</p>
        ) : (
          <div className="space-y-3">
            {history.map((notif) => (
              <div
                key={notif.id}
                className="bg-white/5 border border-white/10 rounded p-3"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="text-white font-bold text-sm">
                      {notif.title}
                    </p>
                    <p className="text-white/60 text-xs mt-1">
                      {notif.body}
                    </p>
                    {notif.image && (
                      <div className="mt-2">
                        <img 
                          src={notif.image} 
                          alt="Notificación" 
                          className="w-24 h-16 object-cover rounded border border-white/20"
                        />
                      </div>
                    )}
                  </div>
                  <p className="text-white/40 text-xs whitespace-nowrap ml-4">
                    {new Date(notif.sent_at).toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="flex gap-4 text-xs">
                  <span className="text-green-500">
                    ✓ {notif.success_count} exitosos
                  </span>
                  <span className="text-red-500">
                    ✗ {notif.failure_count} fallidos
                  </span>
                  <span className="text-white/40">
                    Total: {notif.recipients_count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <toast.ToastContainer />
    </div>
  );
};

export default PushNotificationPanel;