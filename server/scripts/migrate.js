// scripts/migrate.js
// Script para migrar la base de datos a la nueva estructura

require('dotenv').config({ path: '../.env' });
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const readline = require('readline');

// En scripts/migrate.js
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  // Desactivamos SSL para local
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false,
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function migrate() {
  console.log('🔄 Iniciando migración de base de datos...\n');

  try {
    // 1. Verificar conexión
    console.log('✓ Conectando a la base de datos...');
    await pool.query('SELECT NOW()');
    console.log('✓ Conexión exitosa\n');

    // 2. Crear tabla de administradores
    console.log('📋 Creando tabla de administradores...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Tabla de administradores creada\n');

    // 3. Verificar si ya existe un admin
    const existingAdmin = await pool.query("SELECT * FROM admins WHERE username = 'admin'");
    
    if (existingAdmin.rows.length === 0) {
      console.log('🔐 No se encontró un administrador...');
      const password = await question('Ingresa la contraseña para el usuario admin: ');
      
      if (!password || password.length < 6) {
        console.log('❌ La contraseña debe tener al menos 6 caracteres');
        process.exit(1);
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      await pool.query(
        "INSERT INTO admins (username, password_hash) VALUES ($1, $2)",
        ['admin', hashedPassword]
      );
      console.log('✓ Usuario admin creado exitosamente\n');
    } else {
      console.log('✓ El usuario admin ya existe\n');
      const update = await question('¿Deseas actualizar la contraseña? (s/n): ');
      
      if (update.toLowerCase() === 's') {
        const newPassword = await question('Ingresa la nueva contraseña: ');
        
        if (!newPassword || newPassword.length < 6) {
          console.log('❌ La contraseña debe tener al menos 6 caracteres');
          process.exit(1);
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);
        await pool.query(
          "UPDATE admins SET password_hash = $1 WHERE username = 'admin'",
          [hashedPassword]
        );
        console.log('✓ Contraseña actualizada exitosamente\n');
      }
    }

    // 4. Agregar campos faltantes a products
    console.log('📋 Actualizando tabla de productos...');
    await pool.query(`
      ALTER TABLE products 
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);
    console.log('✓ Tabla de productos actualizada\n');

    // 5. Actualizar tabla de configuración (REFORZADO)
    console.log('📋 Sincronizando tabla de configuración...');
    
    // Primero: Crear la tabla si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Segundo: Por si la tabla existía pero no tenía la columna updated_at
    await pool.query(`
      ALTER TABLE settings 
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);

    // Tercero: Insertar la colección inicial si la tabla está vacía
    await pool.query(`
      INSERT INTO settings (key, value) 
      VALUES ('current_collection', 'AUTUMN COLLECTION 2026')
      ON CONFLICT (key) DO NOTHING;
    `);
    
    console.log('✓ Tabla de configuración sincronizada\n');

    // 6. Resumen
    console.log('✅ MIGRACIÓN COMPLETADA EXITOSAMENTE\n');
    console.log('📊 Resumen:');
    
    const productsCount = await pool.query('SELECT COUNT(*) FROM products');
    console.log(`   - Productos: ${productsCount.rows[0].count}`);
    
    const adminsCount = await pool.query('SELECT COUNT(*) FROM admins');
    console.log(`   - Administradores: ${adminsCount.rows[0].count}`);
    
    console.log('\n🎉 Tu base de datos está lista para usar con la nueva versión de Nomad Wear');
    console.log('🔒 No olvides guardar tu contraseña de admin en un lugar seguro\n');

  } catch (error) {
    console.error('\n❌ Error durante la migración:', error.message);
    console.error('Detalle:', error);
    process.exit(1);
  } finally {
    rl.close();
    await pool.end();
  }
}

// Ejecutar migración
migrate();
