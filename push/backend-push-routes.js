// ==========================================
// CÓDIGO PARA AGREGAR AL server/index.js
// ==========================================

// 1. AGREGAR AL INICIO (después de los requires existentes)
const webpush = require('web-push');

// 2. CONFIGURAR VAPID (después de la configuración de la base de datos)
webpush.setVapidDetails(
  process.env.VAPID_EMAIL || 'mailto:info@nomadwear.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// 3. AGREGAR A LA FUNCIÓN initDB (crear tablas)
const initDB = async () => {
  try {
    // ... tus tablas existentes ...

    // Tabla de suscripciones push
    await pool.query(`
      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id SERIAL PRIMARY KEY,
        endpoint TEXT UNIQUE NOT NULL,
        keys_p256dh TEXT NOT NULL,
        keys_auth TEXT NOT NULL,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        active BOOLEAN DEFAULT true
      );
    `);

    // Tabla de historial de notificaciones
    await pool.query(`
      CREATE TABLE IF NOT EXISTS push_notifications (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        url TEXT,
        icon TEXT,
        tag VARCHAR(100),
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        recipients_count INTEGER DEFAULT 0,
        success_count INTEGER DEFAULT 0,
        failure_count INTEGER DEFAULT 0
      );
    `);

    console.log('✅ Tablas de notificaciones push creadas');
    
    // ... resto de tu código ...
  } catch (error) {
    console.error('Error inicializando DB:', error);
  }
};

// 4. RUTAS DE NOTIFICACIONES PUSH (agregar después de tus rutas existentes)

// Obtener la clave pública VAPID
app.get('/api/push/vapid-public-key', (req, res) => {
  res.json({
    publicKey: process.env.VAPID_PUBLIC_KEY
  });
});

// Suscribirse a notificaciones
app.post('/api/push/subscribe', async (req, res) => {
  try {
    const { endpoint, keys } = req.body;

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return res.status(400).json({ 
        error: 'Datos de suscripción incompletos' 
      });
    }

    const userAgent = req.headers['user-agent'] || 'unknown';

    await pool.query(
      `INSERT INTO push_subscriptions (endpoint, keys_p256dh, keys_auth, user_agent)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (endpoint) 
       DO UPDATE SET 
         last_used = CURRENT_TIMESTAMP,
         active = true`,
      [endpoint, keys.p256dh, keys.auth, userAgent]
    );

    console.log('✅ Nueva suscripción push registrada');

    res.status(201).json({ 
      success: true,
      message: 'Suscripción registrada correctamente' 
    });
  } catch (error) {
    console.error('Error guardando suscripción:', error);
    res.status(500).json({ error: 'Error al registrar suscripción' });
  }
});

// Desuscribirse
app.post('/api/push/unsubscribe', async (req, res) => {
  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({ error: 'Endpoint requerido' });
    }

    await pool.query(
      'UPDATE push_subscriptions SET active = false WHERE endpoint = $1',
      [endpoint]
    );

    console.log('✅ Suscripción desactivada');

    res.json({ 
      success: true,
      message: 'Suscripción cancelada' 
    });
  } catch (error) {
    console.error('Error cancelando suscripción:', error);
    res.status(500).json({ error: 'Error al cancelar suscripción' });
  }
});

// Obtener estadísticas (solo admin)
app.get('/api/push/stats', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_subscriptions,
        COUNT(*) FILTER (WHERE active = true) as active_subscriptions,
        COUNT(*) FILTER (WHERE active = false) as inactive_subscriptions
      FROM push_subscriptions
    `);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// Enviar notificación a todos (solo admin)
app.post('/api/push/send', authenticateToken, async (req, res) => {
  try {
    const { title, body, url, icon, tag } = req.body;

    if (!title || !body) {
      return res.status(400).json({ 
        error: 'Título y mensaje son requeridos' 
      });
    }

    // Obtener todas las suscripciones activas
    const result = await pool.query(
      'SELECT * FROM push_subscriptions WHERE active = true'
    );

    const subscriptions = result.rows;
    
    if (subscriptions.length === 0) {
      return res.json({ 
        message: 'No hay suscriptores activos',
        sent: 0 
      });
    }

    // Payload de la notificación
    const payload = JSON.stringify({
      title,
      body,
      icon: icon || '/icon-192-192.png',
      badge: '/icon-96-96.png',
      url: url || '/',
      tag: tag || 'nomad-notification',
      requireInteraction: false,
      actions: [
        { action: 'open', title: 'Ver más' },
        { action: 'close', title: 'Cerrar' }
      ]
    });

    // Enviar notificaciones
    const promises = subscriptions.map(async (sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.keys_p256dh,
          auth: sub.keys_auth
        }
      };

      try {
        await webpush.sendNotification(pushSubscription, payload);
        return { success: true, endpoint: sub.endpoint };
      } catch (error) {
        console.error('Error enviando a:', sub.endpoint, error);
        
        // Si el endpoint ya no es válido, desactivarlo
        if (error.statusCode === 410 || error.statusCode === 404) {
          await pool.query(
            'UPDATE push_subscriptions SET active = false WHERE endpoint = $1',
            [sub.endpoint]
          );
        }
        
        return { success: false, endpoint: sub.endpoint, error };
      }
    });

    const results = await Promise.all(promises);
    
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    // Guardar registro
    await pool.query(
      `INSERT INTO push_notifications 
       (title, body, url, icon, tag, recipients_count, success_count, failure_count)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [title, body, url, icon, tag, subscriptions.length, successCount, failureCount]
    );

    console.log(`✅ Notificación enviada: ${successCount}/${subscriptions.length} exitosos`);

    res.json({
      success: true,
      message: 'Notificación enviada',
      total: subscriptions.length,
      successful: successCount,
      failed: failureCount
    });
  } catch (error) {
    console.error('Error enviando notificación:', error);
    res.status(500).json({ error: 'Error al enviar notificación' });
  }
});

// Obtener historial (solo admin)
app.get('/api/push/history', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM push_notifications 
       ORDER BY sent_at DESC 
       LIMIT 50`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
});
