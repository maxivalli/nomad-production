const pool = require("../config/database");
const bcrypt = require("bcrypt");

const initDB = async () => {
  try {
    // Función para actualizar updated_at
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Tabla de productos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        season VARCHAR(50) CHECK (season IN ('spring', 'summer', 'autumn', 'winter')),
        year INTEGER CHECK (year >= 2026 AND year <= 2050),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        img TEXT[] NOT NULL,
        sizes VARCHAR(10)[] NOT NULL,
        purchase_link TEXT DEFAULT '',
        color TEXT[] NOT NULL,
        video_url TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Agregar columna video_url si no existe
    await pool.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'products' 
          AND column_name = 'video_url'
        ) THEN
          ALTER TABLE products ADD COLUMN video_url TEXT DEFAULT NULL;
          RAISE NOTICE 'Columna video_url agregada a la tabla products';
        END IF;
      END $$;
    `);

    // Trigger para products
    await pool.query(`
      DROP TRIGGER IF EXISTS update_products_updated_at ON products;
      CREATE TRIGGER update_products_updated_at
        BEFORE UPDATE ON products
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    // Tabla de notificaciones push
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
        image TEXT,
        tag VARCHAR(100),
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        recipients_count INTEGER DEFAULT 0,
        success_count INTEGER DEFAULT 0,
        failure_count INTEGER DEFAULT 0
      );
    `);

    // Tabla de configuración
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insertar valores iniciales
    await pool.query(`
      INSERT INTO settings (key, value) VALUES ('current_collection', 'AUTUMN COLLECTION 2026')
      ON CONFLICT (key) DO NOTHING;
    `);

    await pool.query(`
      INSERT INTO settings (key, value) VALUES ('launch_date', '')
      ON CONFLICT (key) DO NOTHING;
    `);

    // Tabla de banners publicitarios
    await pool.query(`
      CREATE TABLE IF NOT EXISTS banners (
        id SERIAL PRIMARY KEY,
        media_url TEXT NOT NULL,
        media_type VARCHAR(10) CHECK (media_type IN ('image', 'video')) NOT NULL,
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Trigger para banners
    await pool.query(`
      DROP TRIGGER IF EXISTS update_banners_updated_at ON banners;
      CREATE TRIGGER update_banners_updated_at
        BEFORE UPDATE ON banners
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    // Tabla de administradores
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Crear usuario admin por defecto
    const adminExists = await pool.query(
      "SELECT * FROM admins WHERE username = 'admin'",
    );
    if (adminExists.rows.length === 0 && process.env.DEFAULT_ADMIN_PASSWORD) {
      const hashedPassword = await bcrypt.hash(
        process.env.DEFAULT_ADMIN_PASSWORD,
        12,
      );
      await pool.query(
        "INSERT INTO admins (username, password_hash) VALUES ($1, $2)",
        ["admin", hashedPassword],
      );
      console.log("✅ Usuario admin creado");
    }

    console.log("✅ Sistema de Base de Datos Sincronizado");
  } catch (err) {
    console.error("❌ Error en inicialización de DB:", err);
  }
};

module.exports = initDB;
