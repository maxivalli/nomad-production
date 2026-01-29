// ============================================
// ACTUALIZACIÓN DEL ADMIN PANEL
// ============================================
// Este archivo contiene las modificaciones críticas que debes hacer
// al AdminPanel.jsx para hacerlo más seguro

// 1. IMPORTACIONES ADICIONALES (agregar al inicio del archivo)
import api from "./services/api";
import { useToast } from "./components/Toast";

// 2. DENTRO DEL COMPONENTE AdminPanel, AGREGAR:
const toast = useToast();
const [cloudinaryConfig, setCloudinaryConfig] = useState(null);

// 3. CARGAR CONFIGURACIÓN DE CLOUDINARY AL INICIAR
useEffect(() => {
  const loadCloudinaryConfig = async () => {
    try {
      const config = await api.getCloudinaryConfig();
      setCloudinaryConfig(config);
    } catch (err) {
      console.error("Error cargando config de Cloudinary:", err);
      toast.error("No se pudo cargar la configuración de imágenes");
    }
  };
  loadCloudinaryConfig();
}, []);

// 4. REEMPLAZAR fetchProducts() CON:
const fetchProducts = async () => {
  try {
    const data = await api.getProducts();
    const normalizedData = data.map((item) => ({
      ...item,
      img: Array.isArray(item.img) ? item.img : [item.img],
    }));
    setProducts(normalizedData);
  } catch (err) {
    console.error("Error al obtener productos:", err);
    toast.error("No se pudieron cargar los productos");
  }
};

// 5. ACTUALIZAR handleOpenWidget para usar config del servidor:
const handleOpenWidget = () => {
  if (!cloudinaryConfig) {
    toast.error("Configuración de Cloudinary no disponible");
    return;
  }

  const slotsAvailable = 3 - formData.img.length;

  if (slotsAvailable <= 0) {
    toast.warning("Límite de 3 imágenes alcanzado");
    return;
  }

  const myWidget = window.cloudinary.createUploadWidget(
    {
      cloudName: cloudinaryConfig.cloudName,
      uploadPreset: cloudinaryConfig.uploadPreset,
      sources: ["local", "url", "camera"],
      multiple: true,
      maxFiles: slotsAvailable,
      styles: {
        palette: {
          window: "#000000",
          windowBorder: "#dc2626",
          tabIcon: "#FFFFFF",
          textLight: "#FFFFFF",
          textDark: "#000000",
          inactiveTabIcon: "#555555",
          menuIcons: "#FFFFFF",
          link: "#dc2626",
          action: "#dc2626",
          inProgress: "#dc2626",
          complete: "#16a34a",
          error: "#ea3323",
          sourceBg: "#000000",
        },
      },
    },
    (error, result) => {
      if (!error && result && result.event === "queues-end") {
        const uploadedFiles = result.info.files;
        const newUrls = uploadedFiles.map(
          (file) => file.uploadInfo.secure_url,
        );

        setFormData((prev) => ({
          ...prev,
          img: [...prev.img, ...newUrls].slice(0, 3),
        }));
        toast.success("Imágenes subidas exitosamente");
      }
    },
  );
  myWidget.open();
};

// 6. REEMPLAZAR handleSubmit() CON:
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (formData.img.length === 0) {
    toast.warning("Debes subir al menos una imagen");
    return;
  }

  setIsLoading(true);

  try {
    if (isEditing) {
      await api.updateProduct(isEditing, formData);
      toast.success("Producto actualizado exitosamente");
    } else {
      await api.createProduct(formData);
      toast.success("Producto creado exitosamente");
    }

    setFormData({
      title: "",
      description: "",
      img: [],
      sizes: [],
      purchase_link: "",
      color: "",
    });
    setIsEditing(null);
    fetchProducts();
  } catch (error) {
    console.error("Error en la operación:", error);
    toast.error(error.message || "Error al guardar el producto");
  } finally {
    setIsLoading(false);
  }
};

// 7. REEMPLAZAR handleDelete() CON:
const handleDelete = async (id) => {
  if (!window.confirm("¿Confirmas la eliminación definitiva de esta pieza?")) {
    return;
  }

  try {
    await api.deleteProduct(id);
    toast.success("Producto eliminado exitosamente");
    setProducts(prev => prev.filter(p => p.id !== id));
  } catch (error) {
    console.error("Error al eliminar:", error);
    toast.error(error.message || "Error al eliminar el producto");
  }
};

// 8. REEMPLAZAR handleSaveDate() CON:
const handleSaveDate = async () => {
  setIsSavingDate(true);
  try {
    await api.setLaunchDate(launchDate);
    toast.success("Fecha de lanzamiento actualizada");
  } catch (err) {
    console.error(err);
    toast.error("Error al actualizar la fecha");
  } finally {
    setIsSavingDate(false);
  }
};

// 9. REEMPLAZAR updateCollectionName() CON:
const updateCollectionName = async () => {
  try {
    await api.updateCollection(collectionName);
    toast.success("Nombre de colección actualizado");
  } catch (err) {
    console.error(err);
    toast.error("Error al actualizar la colección");
  }
};

// 10. ACTUALIZAR FETCH DE CONFIGURACIÓN (líneas 68-80):
useEffect(() => {
  const fetchSettings = async () => {
    try {
      const data = await api.getLaunchDate();
      if (data.date) setLaunchDate(data.date);
    } catch (err) {
      console.error("Error cargando fecha");
      toast.error("No se pudo cargar la fecha de lanzamiento");
    }
  };
  fetchSettings();
}, []);

// 11. ACTUALIZAR FETCH DE COLECCIÓN (líneas 82-87):
useEffect(() => {
  const fetchCollection = async () => {
    try {
      const data = await api.getCollection();
      setCollectionName(data.value);
    } catch (err) {
      console.error("Error cargando colección");
    }
  };
  fetchCollection();
}, []);

// 12. AGREGAR FUNCIÓN DE LOGOUT:
const handleLogout = async () => {
  try {
    await api.logout();
    toast.success("Sesión cerrada");
    navigate("/login");
  } catch (err) {
    console.error("Error al cerrar sesión:", err);
    navigate("/login"); // Redirigir de todos modos
  }
};

// 13. EN EL JSX, ACTUALIZAR EL BOTÓN DE LOGOUT (busca el Link con LogOut):
// REEMPLAZAR:
// <Link to="/login" onClick={() => localStorage.removeItem("adminAuth")}>
// CON:
<button onClick={handleLogout}>

// 14. AL FINAL DEL RETURN, ANTES DEL CIERRE, AGREGAR:
<toast.ToastContainer />

// ============================================
// RESUMEN DE CAMBIOS:
// ============================================
// ✅ Eliminadas todas las alertas nativas
// ✅ Implementado sistema de toast
// ✅ Uso de API service centralizado
// ✅ Cloudinary config desde servidor
// ✅ Manejo de errores mejorado
// ✅ Logout seguro con cookie clearing
