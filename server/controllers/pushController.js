const pool = require("../config/database");
const webpush = require("../config/webpush");

const getVapidPublicKey = (req, res) => {
  res.json({
    publicKey: process.env.VAPID_PUBLIC_KEY,
  });
};

const subscribe = async (req, res) => {
  try {
    const { endpoint, keys } = req.body;

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return res.status(400).json({
        error: "Datos de suscripción incompletos",
      });
    }

    const userAgent = req.headers["user-agent"] || "unknown";

    await pool.query(
      `INSERT INTO push_subscriptions (endpoint, keys_p256dh, keys_auth, user_agent)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (endpoint) 
       DO UPDATE SET 
         last_used = CURRENT_TIMESTAMP,
         active = true`,
      [endpoint, keys.p256dh, keys.auth, userAgent],
    );

    res.status(201).json({
      success: true,
      message: "Suscripción registrada correctamente",
    });
  } catch (error) {
    console.error("Error guardando suscripción:", error);
    res.status(500).json({ error: "Error al registrar suscripción" });
  }
};

const unsubscribe = async (req, res) => {
  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({ error: "Endpoint requerido" });
    }

    await pool.query(
      "UPDATE push_subscriptions SET active = false WHERE endpoint = $1",
      [endpoint],
    );

    res.json({
      success: true,
      message: "Suscripción cancelada",
    });
  } catch (error) {
    console.error("Error cancelando suscripción:", error);
    res.status(500).json({ error: "Error al cancelar suscripción" });
  }
};

const getStats = async (req, res) => {
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
    console.error("Error obteniendo estadísticas:", error);
    res.status(500).json({ error: "Error al obtener estadísticas" });
  }
};

const sendNotification = async (req, res) => {
  try {
    const { title, body, url, icon, image, tag } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        error: "Título y mensaje son requeridos",
      });
    }

    if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
      console.error("❌ [PUSH] Claves VAPID no configuradas");
      return res.status(500).json({
        error: "Configuración de VAPID incompleta",
      });
    }

    const result = await pool.query(
      "SELECT * FROM push_subscriptions WHERE active = true",
    );

    const subscriptions = result.rows;

    if (subscriptions.length === 0) {
      return res.json({
        message: "No hay suscriptores activos",
        sent: 0,
      });
    }

    const payload = JSON.stringify({
      title,
      body,
      icon: icon || "/icon-192-192.png",
      badge: "/badge-96.png",
      image: image || null,
      url: url || "/",
      tag: tag || "nomad-notification",
      requireInteraction: false,
      actions: [
        { action: "open", title: "Ver más" },
        { action: "close", title: "Cerrar" },
      ],
    });

    const promises = subscriptions.map(async (sub, index) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.keys_p256dh,
          auth: sub.keys_auth,
        },
      };

      try {
        const response = await webpush.sendNotification(
          pushSubscription,
          payload,
        );
        
        return {
          success: true,
          endpoint: sub.endpoint,
          statusCode: response.statusCode,
        };
      } catch (error) {
        console.error(`❌ [PUSH] Error en suscripción ${index + 1}:`, {
          endpoint: sub.endpoint.substring(0, 50) + "...",
          statusCode: error.statusCode,
          message: error.message,
        });

        if (error.statusCode === 410 || error.statusCode === 404) {
          await pool.query(
            "UPDATE push_subscriptions SET active = false WHERE endpoint = $1",
            [sub.endpoint],
          );
        }

        return {
          success: false,
          endpoint: sub.endpoint,
          error: error.message,
          statusCode: error.statusCode,
        };
      }
    });

    const results = await Promise.all(promises);

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    await pool.query(
      `INSERT INTO push_notifications 
       (title, body, url, icon, image, tag, recipients_count, success_count, failure_count)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        title,
        body,
        url,
        icon,
        image,
        tag,
        subscriptions.length,
        successCount,
        failureCount,
      ],
    );

    res.json({
      success: true,
      message: "Notificación enviada",
      total: subscriptions.length,
      successful: successCount,
      failed: failureCount,
    });
  } catch (error) {
    console.error("❌ [PUSH] Error enviando notificación:", error);
    res.status(500).json({ error: "Error al enviar notificación" });
  }
};

const getHistory = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM push_notifications 
       ORDER BY sent_at DESC 
       LIMIT 50`,
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error obteniendo historial:", error);
    res.status(500).json({ error: "Error al obtener historial" });
  }
};

module.exports = {
  getVapidPublicKey,
  subscribe,
  unsubscribe,
  getStats,
  sendNotification,
  getHistory,
};
