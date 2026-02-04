import { useState, useEffect } from 'react';
import { Bell, Send, Users, TrendingUp, Clock } from 'lucide-react';
import api from '../services/api';

const PushNotificationPanel = () => {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    url: '/',
    tag: 'nomad-offer'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, historyRes] = await Promise.all([
        api.getPushStats(),
        api.getPushHistory()
      ]);
      
      setStats(statsRes.data);
      setHistory(historyRes.data);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.body) {
      alert('Por favor completa título y mensaje');
      return;
    }

    if (!window.confirm('¿Enviar notificación a todos los suscriptores?')) {
      return;
    }

    setSending(true);
    try {
      const response = await api.sendPushNotification(formData);
      
      alert(`Notificación enviada: ${response.data.successful}/${response.data.total} exitosos`);
      
      // Reset form
      setFormData({
        title: '',
        body: '',
        url: '/',
        tag: 'nomad-offer'
      });
      
      // Reload data
      loadData();
    } catch (error) {
      console.error('Error enviando notificación:', error);
      alert('Error al enviar la notificación');
    } finally {
      setSending(false);
    }
  };

  // Plantillas predefinidas
  const templates = [
    {
      name: 'Nuevo Drop',
      title: '🔥 NUEVO DROP DISPONIBLE',
      body: 'Descubrí la nueva colección NOMAD®. ¡Stock limitado!',
      url: '/'
    },
    {
      name: 'Descuento',
      title: '💥 20% OFF en toda la tienda',
      body: 'Solo por 48hs. Aprovechá esta oportunidad única.',
      url: '/'
    },
    {
      name: 'Restock',
      title: '✨ RESTOCK ALERT',
      body: 'Volvieron tus productos favoritos. No te los pierdas.',
      url: '/'
    },
    {
      name: 'Black Friday',
      title: '🖤 BLACK FRIDAY - 30% OFF',
      body: 'El descuento más grande del año. ¡Solo por tiempo limitado!',
      url: '/'
    }
  ];

  const applyTemplate = (template) => {
    setFormData({
      ...formData,
      title: template.title,
      body: template.body,
      url: template.url
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
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

          <div>
            <label className="block text-white/80 text-sm mb-2">
              URL (opcional)
            </label>
            <input
              type="text"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
              placeholder="/"
            />
          </div>

          <button
            type="submit"
            disabled={sending || !formData.title || !formData.body}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            <Send size={18} />
            {sending ? 'Enviando...' : 'Enviar Notificación'}
          </button>
        </form>
      </div>

      {/* History */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <h3 className="text-white font-bold text-lg mb-4 uppercase tracking-wider flex items-center gap-2">
          <Clock size={20} />
          Historial
        </h3>

        {history.length === 0 ? (
          <p className="text-white/60 text-sm">No hay notificaciones enviadas</p>
        ) : (
          <div className="space-y-3">
            {history.map((notif) => (
              <div
                key={notif.id}
                className="bg-white/5 border border-white/10 rounded p-3"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-white font-bold text-sm">
                      {notif.title}
                    </p>
                    <p className="text-white/60 text-xs mt-1">
                      {notif.body}
                    </p>
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
    </div>
  );
};

export default PushNotificationPanel;
