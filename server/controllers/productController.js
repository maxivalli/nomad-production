const pool = require("../config/database");
const { cloudinary } = require("../config/cloudinary");
const { productSchema } = require("../validators/schemas");
const { extractPublicId } = require("../utils/helpers");

const getAllProducts = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM products ORDER BY created_at DESC",
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener productos:", err);
    res.status(500).json({
      error: "Error del servidor",
      message: "No se pudieron obtener los productos",
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(id)) {
      return res.status(400).json({
        error: "ID inválido",
        message: "El ID del producto debe ser un número",
      });
    }

    const result = await pool.query("SELECT * FROM products WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "No encontrado",
        message: "El producto no existe",
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error al obtener producto:", err);
    res.status(500).json({
      error: "Error del servidor",
      message: "No se pudo obtener el producto",
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const { error, value } = productSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Datos inválidos",
        message: error.details[0].message,
      });
    }

    const {
      season,
      year,
      title,
      description,
      img,
      sizes,
      purchase_link,
      color,
      video_url,
    } = value;

    const result = await pool.query(
      `INSERT INTO products (season, year, title, description, img, sizes, purchase_link, color, video_url) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [season, year, title, description, img, sizes, purchase_link, color, video_url],
    );

    res.status(201).json({
      success: true,
      message: "Producto creado exitosamente",
      product: result.rows[0],
    });
  } catch (err) {
    console.error("Error al crear producto:", err);
    res.status(500).json({
      error: "Error del servidor",
      message: "No se pudo crear el producto",
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(id)) {
      return res.status(400).json({
        error: "ID inválido",
        message: "El ID del producto debe ser un número",
      });
    }

    const { error, value } = productSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Datos inválidos",
        message: error.details[0].message,
      });
    }

    const {
      season,
      year,
      title,
      description,
      img,
      sizes,
      purchase_link,
      color,
      video_url,
    } = value;

    // Obtener el producto actual
    const currentProduct = await pool.query(
      "SELECT img, video_url FROM products WHERE id = $1",
      [id]
    );

    if (currentProduct.rows.length === 0) {
      return res.status(404).json({
        error: "No encontrado",
        message: "El producto no existe",
      });
    }

    const oldImages = currentProduct.rows[0].img || [];
    const oldVideoUrl = currentProduct.rows[0].video_url;
    
    // Detectar imágenes eliminadas
    const deletedImages = oldImages.filter(oldImg => !img.includes(oldImg));
    
    console.log(`🔍 [UPDATE] Producto ${id}:`);
    console.log(`   - Imágenes antiguas: ${oldImages.length}`);
    console.log(`   - Imágenes nuevas: ${img.length}`);
    console.log(`   - Imágenes a eliminar: ${deletedImages.length}`);
    
    // Eliminar las imágenes que ya no están en el array
    if (deletedImages.length > 0) {
      console.log(`🗑️ [LIMPIEZA] Eliminando ${deletedImages.length} imágenes de Cloudinary...`);
      
      for (const imageUrl of deletedImages) {
        try {
          const publicId = extractPublicId(imageUrl);
          
          if (publicId) {
            const deleteResult = await cloudinary.uploader.destroy(publicId, {
              resource_type: "image",
            });
            console.log(`   ✅ Imagen eliminada: ${publicId}`, deleteResult);
          } else {
            console.warn(`   ⚠️ No se pudo extraer public_id de: ${imageUrl}`);
          }
        } catch (cloudinaryError) {
          console.error(`   ❌ Error eliminando imagen:`, cloudinaryError.message);
        }
      }
    } else {
      console.log(`   ℹ️ No hay imágenes para eliminar`);
    }
    
    // Manejar el video
    const normalizedVideoUrl = video_url === "" ? null : video_url;
    
    console.log(`🔍 [VIDEO] Estado:`);
    console.log(`   - Video anterior: ${oldVideoUrl ? 'SÍ' : 'NO'}`);
    console.log(`   - Video nuevo: ${normalizedVideoUrl ? 'SÍ' : 'NO'}`);
    
    if (oldVideoUrl && !normalizedVideoUrl) {
      console.log("🗑️ [LIMPIEZA] Detectado eliminación de video, procediendo a borrar...");
      
      try {
        const publicId = extractPublicId(oldVideoUrl);
        
        if (publicId) {
          const deleteResult = await cloudinary.uploader.destroy(publicId, {
            resource_type: "video",
          });
          console.log("   ✅ Video eliminado de Cloudinary:", publicId, deleteResult);
        } else {
          console.warn(`   ⚠️ No se pudo extraer public_id del video: ${oldVideoUrl}`);
        }
      } catch (cloudinaryError) {
        console.error("   ❌ Error eliminando video de Cloudinary:", cloudinaryError.message);
      }
    } else {
      console.log(`   ℹ️ No hay video para eliminar`);
    }

    // Actualizar el producto en la base de datos
    const result = await pool.query(
      `UPDATE products 
       SET season = $1, year = $2, title = $3, description = $4, img = $5, sizes = $6, 
           purchase_link = $7, color = $8, video_url = $9
       WHERE id = $10 RETURNING *`,
      [season, year, title, description, img, sizes, purchase_link, color, normalizedVideoUrl, id],
    );

    console.log(`✅ [UPDATE] Producto ${id} actualizado exitosamente`);

    res.json({
      success: true,
      message: "Producto actualizado exitosamente",
      product: result.rows[0],
      cloudinary_cleanup: {
        deleted_images: deletedImages.length,
        deleted_video: oldVideoUrl && !normalizedVideoUrl,
      }
    });
  } catch (err) {
    console.error("❌ [UPDATE] Error al actualizar producto:", err);
    res.status(500).json({
      error: "Error del servidor",
      message: "No se pudo actualizar el producto",
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(id)) {
      return res.status(400).json({
        error: "ID inválido",
        message: "El ID del producto debe ser un número",
      });
    }

    // Obtener el producto antes de eliminarlo
    const productResult = await pool.query(
      "SELECT img, video_url FROM products WHERE id = $1",
      [id]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({
        error: "No encontrado",
        message: "El producto no existe",
      });
    }

    const product = productResult.rows[0];
    
    console.log(`🗑️ [DELETE] Eliminando producto ${id}...`);
    
    // Eliminar todas las imágenes del producto
    if (product.img && Array.isArray(product.img) && product.img.length > 0) {
      console.log(`   📸 Eliminando ${product.img.length} imágenes de Cloudinary...`);
      
      for (const imageUrl of product.img) {
        try {
          const publicId = extractPublicId(imageUrl);
          
          if (publicId) {
            const deleteResult = await cloudinary.uploader.destroy(publicId, {
              resource_type: "image",
            });
            console.log(`      ✅ Imagen eliminada: ${publicId}`, deleteResult);
          } else {
            console.warn(`      ⚠️ No se pudo extraer public_id de: ${imageUrl}`);
          }
        } catch (cloudinaryError) {
          console.error(`      ❌ Error eliminando imagen:`, cloudinaryError.message);
        }
      }
    } else {
      console.log(`   ℹ️ El producto no tiene imágenes para eliminar`);
    }

    // Eliminar el video si existe
    if (product.video_url) {
      console.log(`   🎬 Eliminando video de Cloudinary...`);
      
      try {
        const publicId = extractPublicId(product.video_url);
        
        if (publicId) {
          const deleteResult = await cloudinary.uploader.destroy(publicId, {
            resource_type: "video",
          });
          console.log(`      ✅ Video eliminado: ${publicId}`, deleteResult);
        } else {
          console.warn(`      ⚠️ No se pudo extraer public_id del video: ${product.video_url}`);
        }
      } catch (cloudinaryError) {
        console.error(`      ❌ Error eliminando video:`, cloudinaryError.message);
      }
    } else {
      console.log(`   ℹ️ El producto no tiene video para eliminar`);
    }

    // Eliminar el producto de la base de datos
    const result = await pool.query(
      "DELETE FROM products WHERE id = $1 RETURNING id",
      [id],
    );

    console.log(`✅ [DELETE] Producto ${id} eliminado completamente`);

    res.json({
      success: true,
      message: "Producto y archivos eliminados exitosamente",
      deleted_images: product.img ? product.img.length : 0,
      deleted_video: product.video_url ? true : false,
    });
  } catch (err) {
    console.error("❌ [DELETE] Error al eliminar producto:", err);
    res.status(500).json({
      error: "Error del servidor",
      message: "No se pudo eliminar el producto",
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
