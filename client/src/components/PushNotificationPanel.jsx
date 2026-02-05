import { useState, useEffect } from 'react';
import { Bell, Send, Users, TrendingUp, Clock, Image as ImageIcon, X, Loader2 } from 'lucide-react';
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
  <div className="max-w-7xl mx-auto space-y-8 pb-20">
    {/* 1. Header & Stats - Grid de 3 columnas */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[
        { label: 'Total Suscriptores', value: stats?.total_subscriptions, icon: Users, color: 'text-white/40' },
        { label: 'Activos', value: stats?.active_subscriptions, icon: TrendingUp, color: 'text-green-500' },
        { label: 'Inactivos', value: stats?.inactive_subscriptions, icon: Bell, color: 'text-white/40' }
      ].map((stat, i) => (
        <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] mb-1 font-bold">
                {stat.label}
              </p>
              <p className="text-white text-3xl font-black italic">
                {loading && !stats ? '...' : (stat.value || 0)}
              </p>
            </div>
            <stat.icon className={stat.color} size={28} />
          </div>
        </div>
      ))}
    </div>

    {/* 2. Main Content Grid: Form vs Preview */}
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* COLUMNA IZQUIERDA: Formulario (7/12) */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-8 w-1 bg-red-600" />
            <h3 className="text-white font-black text-xl uppercase italic tracking-tighter">
              Nueva Notificación
            </h3>
          </div>

          <form onSubmit={handleSend} className="space-y-6">
            {/* Plantillas */}
            <div>
              <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-3">Plantillas Rápidas</p>
              <div className="flex flex-wrap gap-2">
                {templates.map((t) => (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => applyTemplate(t)}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-bold uppercase px-3 py-2 rounded-lg transition-all"
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Título */}
            <div className="space-y-2">
              <label className="text-white/80 text-xs font-bold uppercase">Título del Mensaje</label>
              <div className="flex gap-1 overflow-x-auto pb-2 no-scrollbar">
                {quickEmojis.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setFormData({ ...formData, title: formData.title + emoji })}
                    className="shrink-0 w-9 h-9 bg-white/5 hover:bg-white/10 rounded-lg text-lg transition-colors border border-white/5"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-black/40 border border-white/10 focus:border-red-600 rounded-xl px-4 py-3 text-white outline-none transition-all"
                placeholder="Ej: 🔥 NUEVO DROP DISPONIBLE"
                maxLength={65}
              />
            </div>

            {/* Cuerpo */}
            <div className="space-y-2">
              <label className="text-white/80 text-xs font-bold uppercase">Cuerpo del Mensaje</label>
              <textarea
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                className="w-full bg-black/40 border border-white/10 focus:border-red-600 rounded-xl px-4 py-3 text-white outline-none transition-all resize-none"
                placeholder="Escribe el contenido de la notificación..."
                rows={3}
                maxLength={200}
              />
            </div>

            {/* Imagen Upload */}
            <div className="space-y-2">
              <label className="text-white/80 text-xs font-bold uppercase flex items-center gap-2">
                Multimedia <span className="text-white/20 font-normal">(Opcional)</span>
              </label>
              
              <div className="group relative border-2 border-dashed border-white/10 hover:border-red-600/40 rounded-2xl transition-all bg-white/[0.02] overflow-hidden">
                {formData.image ? (
                  <div className="relative aspect-video">
                    <img src={formData.image} className="w-full h-full object-cover" alt="Upload" />
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        type="button"
                        onClick={removeImage}
                        className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-xl transform transition hover:scale-110"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center py-10 cursor-pointer">
                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3 group-hover:bg-red-600/10 transition-colors">
                      <ImageIcon size={24} className="text-white/40 group-hover:text-red-600" />
                    </div>
                    <span className="text-xs text-white/60 font-medium">Click para subir imagen</span>
                    <span className="text-[10px] text-white/20 mt-1 uppercase tracking-tighter">JPG, PNG o WEBP hasta 2MB</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            {/* URL */}
            <div className="space-y-2">
              <label className="text-white/80 text-xs font-bold uppercase">URL de Destino</label>
              <input
                type="text"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full bg-black/40 border border-white/10 focus:border-red-600 rounded-xl px-4 py-3 text-white outline-none"
                placeholder="/gallery"
              />
            </div>

            <button
              type="submit"
              disabled={sending || !formData.title || !formData.body || stats?.active_subscriptions === 0}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-neutral-800 text-white font-black py-4 rounded-xl transition-all flex items-center justify-center gap-3 uppercase tracking-[0.1em] text-sm shadow-lg shadow-red-600/10"
            >
              {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
              {sending ? 'Procesando...' : `Enviar a ${stats?.active_subscriptions || 0} dispositivos`}
            </button>
          </form>
        </div>
      </div>

      {/* COLUMNA DERECHA: Preview Sticky (5/12) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="lg:sticky lg:top-8">
          <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-4 ml-2">Vista Previa en Dispositivo</p>
          
          <div className="bg-[#1a1a1a] rounded-[2.5rem] p-4 border border-white/10 shadow-2xl overflow-hidden relative">
            {/* Simulación Notch / Dynamic Island */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-20" />
            
            <div className="mt-8 bg-black/80 backdrop-blur-xl border border-white/10 rounded-[1.5rem] p-4 shadow-2xl">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-red-600/20">
                  <Bell size={20} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-white font-bold text-[13px] tracking-tight">NOMAD®</span>
                    <span className="text-white/40 text-[10px]">ahora</span>
                  </div>
                  <p className="text-white font-bold text-sm leading-tight mb-1 truncate">
                    {formData.title || 'Título de la notificación'}
                  </p>
                  <p className="text-white/60 text-xs leading-snug line-clamp-2">
                    {formData.body || 'Escribe un mensaje para previsualizar...'}
                  </p>
                </div>
              </div>
              
              {formData.image && (
                <div className="mt-3 rounded-xl overflow-hidden border border-white/10 aspect-[16/9]">
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* Decoración inferior smartphone */}
            <div className="mt-64 mb-2 flex justify-center">
              <div className="w-32 h-1 bg-white/20 rounded-full" />
            </div>
          </div>

          <div className="mt-6 p-4 bg-red-600/5 border border-red-600/10 rounded-xl">
            <p className="text-red-500 text-[10px] font-bold uppercase leading-relaxed text-center italic">
              "Las notificaciones con imagen tienen un 30% más de click-through rate"
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* 3. Historial (Ancho completo abajo) */}
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Clock className="text-red-600" size={24} />
          <h3 className="text-white font-black text-xl uppercase italic tracking-tighter">Historial de Envíos</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(!history || history.length === 0) ? (
          <p className="text-white/20 text-sm italic col-span-2">No se registran envíos previos...</p>
        ) : (
          history.map((notif) => (
            <div key={notif.id} className="bg-black/40 border border-white/5 rounded-xl p-4 flex gap-4 items-center group hover:border-white/20 transition-all">
              {notif.image && (
                <img src={notif.image} className="w-16 h-16 rounded-lg object-cover shrink-0 border border-white/10" alt="History" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <p className="text-white font-bold text-sm truncate uppercase tracking-tight">{notif.title}</p>
                  <span className="text-[9px] text-white/30 font-mono">
                    {new Date(notif.sent_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-white/40 text-[11px] line-clamp-1 mb-2">{notif.body}</p>
                <div className="flex gap-3 text-[9px] font-black uppercase italic">
                  <span className="text-green-500">S: {notif.success_count}</span>
                  <span className="text-red-500">F: {notif.failure_count}</span>
                  <span className="text-white/20">T: {notif.recipients_count}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>

    {/* Contenedor de Toasts Global */}
    <toast.ToastContainer />
  </div>
);
};

export default PushNotificationPanel;