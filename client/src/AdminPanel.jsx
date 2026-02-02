import React, { useState, useEffect } from "react";
import api from "./services/api";
import { useToast } from "./components/Toast";
import {
  motion as framerMotion,
  AnimatePresence as FramerAnimatePresence,
} from "framer-motion";
import {
  Image as ImageIcon,
  ArrowLeft,
  Trash2,
  Edit2,
  X,
  LogOut,
  Database,
  UploadCloud,
  Zap,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

// ============================================================================
// CONSTANTES Y CONFIGURACIÓN
// ============================================================================

const AVAILABLE_SIZES = ["S", "M", "L", "XL"];
const MAX_IMAGES = 5;

const SEASONS = ["summer", "autumn", "winter", "spring"];
const YEARS = Array.from({ length: 25 }, (_, i) => 2026 + i); // 2026 a 2050

const COLOR_PALETTE = [
  { name: "negro", hex: "#000000" },
  { name: "blanco", hex: "#ffffff" },
  { name: "gris", hex: "#808080" },
  { name: "beige", hex: "#f5f5dc" },
  { name: "rojo", hex: "#dc2626" },
  { name: "azul", hex: "#2563eb" },
];

const COLOR_MAP = {
  negro: "#000000",
  blanco: "#ffffff",
  gris: "#808080",
  beige: "#f5f5dc",
  rojo: "#dc2626",
  azul: "#2563eb",
};

const INITIAL_FORM_STATE = {
  season: "",
  year: "",
  title: "",
  description: "",
  img: [],
  sizes: [],
  purchase_link: "",
  color: [],
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const AdminPanel = () => {
  const navigate = useNavigate();
  const toast = useToast();

  // --------------------------------------------------------------------------
  // ESTADO - Datos de productos y configuración
  // --------------------------------------------------------------------------
  const [products, setProducts] = useState([]);
  const [cloudinaryConfig, setCloudinaryConfig] = useState(null);
  const [launchDate, setLaunchDate] = useState("");
  const [collectionName, setCollectionName] = useState("");

  // --------------------------------------------------------------------------
  // ESTADO - UI y formulario
  // --------------------------------------------------------------------------
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [isEditing, setIsEditing] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingDate, setIsSavingDate] = useState(false);

  // ==========================================================================
  // EFFECTS - Carga inicial de datos
  // ==========================================================================

  /**
   * Carga la configuración de Cloudinary al montar el componente
   */
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

  /**
   * Carga los productos al montar el componente
   */
  useEffect(() => {
    fetchProducts();
  }, []);

  /**
   * Carga la fecha de lanzamiento al montar el componente
   */
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await api.getLaunchDate();
        if (data.date) setLaunchDate(data.date);
      } catch (err) {
        console.error("Error cargando fecha:", err);
        toast.error("No se pudo cargar la fecha de lanzamiento");
      }
    };
    fetchSettings();
  }, []);

  /**
   * Carga el nombre de la colección al montar el componente
   */
  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const data = await api.getCollection();
        setCollectionName(data.value);
      } catch (err) {
        console.error("Error cargando colección:", err);
      }
    };
    fetchCollection();
  }, []);

  // ==========================================================================
  // HANDLERS - Gestión de productos
  // ==========================================================================

  /**
   * Obtiene y normaliza la lista de productos desde el API
   */
  const fetchProducts = async () => {
    try {
      const data = await api.getProducts();
      // Normalizar para asegurar que img siempre sea un array
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

  /**
   * Guarda o actualiza un producto en la base de datos
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // VALIDACIONES OBLIGATORIAS

    // Validación: Temporada
    if (!formData.season || formData.season === "") {
      toast.warning("Debes seleccionar una temporada");
      return;
    }

    // Validación: Año
    if (!formData.year || formData.year === "") {
      toast.warning("Debes seleccionar un año");
      return;
    }

    // Validación: Título
    if (!formData.title || formData.title.trim() === "") {
      toast.warning("El título es obligatorio");
      return;
    }

    // Validación: Descripción
    if (!formData.description || formData.description.trim() === "") {
      toast.warning("La descripción es obligatoria");
      return;
    }

    // Validación: Al menos una imagen
    if (formData.img.length === 0) {
      toast.warning("Debes subir al menos una imagen");
      return;
    }

    // Validación: Al menos una talla
    if (formData.sizes.length === 0) {
      toast.warning("Debes seleccionar al menos una talla");
      return;
    }

    // Validación: Al menos un color
    if (formData.color.length === 0) {
      toast.warning("Debes seleccionar al menos un color");
      return;
    }

    // NOTA: purchase_link es OPCIONAL, no se valida

    setIsLoading(true);

    try {
      if (isEditing) {
        await api.updateProduct(isEditing, formData);
        toast.success("Producto actualizado exitosamente");
      } else {
        await api.createProduct(formData);
        toast.success("Producto creado exitosamente");
      }

      // Reset del formulario y actualización de lista
      setFormData(INITIAL_FORM_STATE);
      setIsEditing(null);
      fetchProducts();
    } catch (error) {
      console.error("Error en la operación:", error);
      toast.error(error.message || "Error al guardar el producto");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Elimina un producto de la base de datos
   */
  const handleDelete = async (id) => {
    if (
      !window.confirm("¿Confirmas la eliminación definitiva de esta pieza?")
    ) {
      return;
    }

    try {
      await api.deleteProduct(id);
      toast.success("Producto eliminado exitosamente");
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error al eliminar:", error);
      toast.error(error.message || "Error al eliminar el producto");
    }
  };

  /**
   * Carga los datos de un producto en el formulario para editarlo
   */
  const startEdit = (item) => {
    // Normalizar datos de color
    const colorData = Array.isArray(item.color)
      ? item.color
      : item.color
        ? [item.color]
        : [];

    setIsEditing(item.id);
    setFormData({
      season: item.season || "",
      year: item.year || "",
      title: item.title,
      description: item.description,
      img: Array.isArray(item.img) ? item.img : [item.img],
      sizes: item.sizes,
      purchase_link: item.purchase_link || "",
      color: colorData,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /**
   * Cancela la edición y resetea el formulario
   */
  const cancelEdit = () => {
    setIsEditing(null);
    setFormData(INITIAL_FORM_STATE);
  };

  // ==========================================================================
  // HANDLERS - Gestión de imágenes (Cloudinary)
  // ==========================================================================

  /**
   * Abre el widget de Cloudinary para subir imágenes
   * Permite hasta 3 imágenes por producto
   */
  const handleOpenWidget = () => {
  if (!cloudinaryConfig) {
    toast.error("Configuración de Cloudinary no disponible");
    return;
  }

  // Validación: Exigir título para poder renombrar
  if (!formData.title.trim()) {
    toast.warning("Escribe un título primero para optimizar el nombre de la imagen");
    return;
  }

  const slotsAvailable = MAX_IMAGES - formData.img.length;
  if (slotsAvailable <= 0) {
    toast.warning(`Límite de ${MAX_IMAGES} imágenes alcanzado`);
    return;
  }

  // Generar un nombre base limpio (SEO Friendly)
  // Ejemplo: "Remera Oversize" -> "nomad-remera-oversize"
  const cleanTitle = formData.title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Quita caracteres especiales
    .replace(/[\s_-]+/g, '-') // Cambia espacios por guiones
    .replace(/^-+|-+$/g, ''); // Quita guiones al inicio o final

  const publicIdBase = `nomad-${cleanTitle}-${Date.now()}`;

  const myWidget = window.cloudinary.createUploadWidget(
    {
      cloudName: cloudinaryConfig.cloudName,
      uploadPreset: cloudinaryConfig.uploadPreset,
      sources: ["local", "url", "camera"],
      multiple: true,
      maxFiles: slotsAvailable,
      // CONFIGURACIÓN DE RENOMBRADO:
      publicId: publicIdBase, // Cloudinary agregará un sufijo automático si hay múltiples
      clientAllowedFormats: ["webp", "jpg", "png"], // Optimización de formato
      
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
          img: [...prev.img, ...newUrls].slice(0, MAX_IMAGES),
        }));
        toast.success("Imágenes optimizadas y subidas");
      }
    },
  );
  myWidget.open();
};

  /**
   * Elimina una imagen del producto
   */
  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      img: prev.img.filter((_, i) => i !== index),
    }));
  };

  // ==========================================================================
  // HANDLERS - Gestión de tallas y colores
  // ==========================================================================

  /**
   * Agrega o quita una talla de la selección
   */
  const handleSizeToggle = (size) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  /**
   * Agrega o quita un color de la selección
   */
  const handleColorToggle = (colorName) => {
    setFormData((prev) => ({
      ...prev,
      color: prev.color.includes(colorName)
        ? prev.color.filter((c) => c !== colorName)
        : [...prev.color, colorName],
    }));
  };

  // ==========================================================================
  // HANDLERS - Configuración general
  // ==========================================================================

  /**
   * Guarda la fecha de lanzamiento de la colección
   */
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

  /**
   * Actualiza el nombre de la colección
   */
  const updateCollectionName = async () => {
    try {
      await api.updateCollection(collectionName);
      toast.success("Nombre de colección actualizado");
    } catch (err) {
      console.error(err);
      toast.error("Error al actualizar la colección");
    }
  };

  /**
   * Cierra la sesión del usuario
   */
  const handleLogout = async () => {
    try {
      await api.logout();
      toast.success("Sesión cerrada");
      navigate("/login");
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
      navigate("/login");
    }
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className="min-h-screen bg-[#050505] text-white antialiased selection:bg-red-600/30 overflow-x-hidden">
      {/* ====================================================================
          NAVBAR - Navegación superior con logo y botones
          ==================================================================== */}
      <nav className="fixed top-0 md:top-5 w-full md:container md:mx-auto md:left-1/2 md:-translate-x-1/2 z-[100] bg-black/95 md:bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="px-4 py-4 md:px-12 md:h-24 flex items-center justify-between relative">
          {/* Botón EXIT - Izquierda */}
          <div className="flex-1 flex justify-start">
            <Link
              to="/"
              className="group relative flex items-center gap-2 py-2 overflow-hidden shrink-0"
            >
              <ArrowLeft
                size={14}
                className="text-neutral-500 group-hover:text-red-500 transition-colors"
              />
              <div className="flex flex-col hidden xs:flex">
                <span className="text-[8px] md:text-[10px] tracking-[0.3em] uppercase font-[900] text-neutral-500 group-hover:text-white transition-colors leading-none">
                  Exit
                </span>
                <span className="h-[1px] w-0 bg-red-600 group-hover:w-full transition-all duration-500 mt-1"></span>
              </div>
            </Link>
          </div>

          {/* Logo - Centro */}
          <div className="flex flex-col items-center text-center absolute left-1/2 -translate-x-1/2 pointer-events-none">
            <h1 className="text-sm md:text-2xl font-[900] italic uppercase tracking-tighter leading-none text-white">
              Nomad<span className="text-red-500">.</span>Admin
            </h1>
            <span className="text-[5px] md:text-[8px] text-red-500 tracking-[0.4em] uppercase font-mono animate-pulse mt-1 font-bold">
              Live_Auth
            </span>
          </div>

          {/* Botón LOGOUT - Derecha */}
          <div className="flex-1 flex justify-end">
            <button
              onClick={handleLogout}
              className="group relative px-3 py-2 md:px-6 md:py-2.5 border border-red-600/30 overflow-hidden shrink-0 bg-red-600/5"
            >
              <div className="absolute inset-0 bg-red-600 translate-y-[101%] group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <div className="relative flex items-center gap-2">
                <LogOut
                  size={12}
                  className="text-red-500 group-hover:text-white transition-colors"
                />
                <span className="hidden md:block text-[9px] font-[900] uppercase tracking-[0.2em] text-red-500 group-hover:text-white transition-colors">
                  End_Session
                </span>
                <span className="md:hidden text-[8px] font-[900] uppercase tracking-[0.1em] text-red-500 group-hover:text-white transition-colors">
                  End
                </span>
              </div>
              <div className="absolute top-0 left-0 w-1 h-1 border-t border-l border-red-500/50"></div>
              <div className="absolute bottom-0 right-0 w-1 h-1 border-b border-r border-red-500/50"></div>
            </button>
          </div>
        </div>
      </nav>

      {/* ====================================================================
          CONFIGURACIÓN GLOBAL - Título de colección y fecha de lanzamiento
          ==================================================================== */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-10 lg:px-16 pt-28 md:pt-40">
        {/* Nombre de la colección */}
        <div className="mb-8 p-6 border border-red-600/20 bg-red-600/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity">
            <Zap size={12} className="text-red-600" />
          </div>

          <label className="text-[10px] uppercase tracking-[0.4em] text-red-600 font-[900] block mb-4">
            Next season title
          </label>

          <div className="flex flex-col md:flex-row gap-4">
            <input
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              placeholder="SPRING COLLECTION 2026"
              className="bg-black/40 border border-white/10 px-4 py-3 flex-1 outline-none uppercase font-[900] italic text-xl md:text-2xl focus:border-red-600 transition-all text-white placeholder:text-neutral-800"
            />
            <button
              onClick={updateCollectionName}
              className="text-[10px] font-[900] tracking-[0.2em] bg-red-600 px-8 py-4 md:py-2 hover:bg-white hover:text-black transition-all shadow-lg shadow-red-600/10"
            >
              SYNC_TITLE
            </button>
          </div>
        </div>

        {/* Fecha de lanzamiento */}
        <div className="bg-white/[0.02] border border-white/10 p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-5 shadow-xl">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="p-2.5 bg-neutral-800 border border-white/10 shrink-0">
              <Database size={18} className="text-neutral-400" />
            </div>
            <div className="min-w-0">
              <h3 className="text-[10px] font-[900] uppercase tracking-[0.3em] text-white">
                Deployment date
              </h3>
              <p className="text-[8px] text-neutral-500 uppercase tracking-widest mt-0.5 font-bold">
                Target release Date
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <input
              type="date"
              value={launchDate}
              onChange={(e) => setLaunchDate(e.target.value)}
              className="w-full md:w-64 bg-black border border-white/10 px-4 py-3 md:py-2 text-[11px] font-mono text-red-500 outline-none focus:border-red-600"
              style={{ colorScheme: "dark" }}
            />
            <button
              onClick={handleSaveDate}
              disabled={isSavingDate}
              className="w-full md:w-auto px-8 py-4 md:py-2 border border-white/10 text-white text-[10px] font-[900] uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all disabled:opacity-50"
            >
              {isSavingDate ? "SYNCING..." : "SET_DATE"}
            </button>
          </div>
        </div>
      </div>

      {/* ====================================================================
          LAYOUT PRINCIPAL - Grid de dos columnas (Editor + Inventario)
          ==================================================================== */}
      <main className="max-w-[1600px] mx-auto p-4 md:p-10 lg:p-16 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 md:gap-16 lg:gap-24">
        {/* ==================================================================
            COLUMNA IZQUIERDA: EDITOR DE PRODUCTOS
            ================================================================== */}
        <section className="space-y-8 md:space-y-12">
          {/* Encabezado del editor */}
          <div className="flex items-center gap-4">
            <div className="h-10 w-1.5 bg-red-600 shrink-0"></div>
            <div className="min-w-0">
              <h2 className="text-3xl md:text-5xl font-[900] uppercase italic leading-none tracking-tighter text-white">
                {isEditing ? "Modify Unit" : "Deploy Asset"}
              </h2>
              <p className="text-neutral-300 text-[9px] md:text-[11px] uppercase tracking-[0.2em] mt-2 font-[900] flex items-center gap-2">
                <Zap size={10} className="text-red-500" />
                {isEditing ? `ID: ${isEditing}` : "Operational Input Required"}
              </p>
            </div>
          </div>

          {/* Formulario de producto */}
          <form
            onSubmit={handleSubmit}
            className="space-y-8 md:space-y-12 bg-white/[0.03] p-5 md:p-10 border border-white/10 relative shadow-2xl"
          >
            {/* Botón cancelar edición (solo visible en modo edición) */}
            {isEditing && (
              <button
                type="button"
                onClick={cancelEdit}
                className="absolute top-4 right-4 text-red-500 hover:text-white flex items-center gap-1 text-[9px] font-[900] tracking-widest z-10 bg-black p-1.5 md:bg-transparent border border-red-600/20 md:border-none"
              >
                ABORT <X size={14} />
              </button>
            )}

            {/* Campos: Temporada y Año */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* Campo: Temporada */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.3em] text-neutral-300 font-[900] block">
                  Season
                </label>
                <select
                  required
                  value={formData.season}
                  onChange={(e) =>
                    setFormData({ ...formData, season: e.target.value })
                  }
                  className="w-full bg-neutral-900/50 border border-white/10 px-4 py-3 text-sm outline-none focus:border-red-500 transition-all uppercase font-[900] text-white appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23dc2626' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 1rem center",
                  }}
                >
                  <option value="" disabled>
                    Select Season
                  </option>
                  {SEASONS.map((season) => (
                    <option key={season} value={season}>
                      {season}
                    </option>
                  ))}
                </select>
              </div>

              {/* Campo: Año */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.3em] text-neutral-300 font-[900] block">
                  Year
                </label>
                <select
                  required
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({ ...formData, year: e.target.value })
                  }
                  className="w-full bg-neutral-900/50 border border-white/10 px-4 py-3 text-sm outline-none focus:border-red-500 transition-all uppercase font-[900] text-white appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23dc2626' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 1rem center",
                  }}
                >
                  <option value="" disabled>
                    Select Year
                  </option>
                  {YEARS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Campo: Título del producto */}
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-[0.3em] text-neutral-300 font-[900] block">
                Designation
              </label>
              <input
                required
                type="text"
                value={formData.title}
                placeholder="BLACK URBAN HOODIE"
                className="w-full bg-transparent border-b border-white/20 py-3 text-2xl md:text-4xl outline-none focus:border-red-500 transition-all uppercase font-[900] text-white placeholder:text-neutral-700"
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            {/* Campo: Imágenes del producto */}
            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-[0.3em] text-neutral-300 font-[900] flex justify-between">
                Visual Assets
                <span className="text-red-500">
                  {formData.img.length}/{MAX_IMAGES}
                </span>
              </label>
              <div className="grid grid-cols-3 gap-3 md:gap-6">
                {/* Imágenes cargadas */}
                {formData.img.map((url, index) => (
                  <div
                    key={index}
                    className="relative aspect-[3/4] border border-white/20 overflow-hidden group bg-neutral-900 shadow-xl"
                  >
                    <img
                      src={url}
                      className="w-full h-full object-cover"
                      alt={`Imagen ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute inset-0 bg-red-600/90 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                    >
                      <Trash2 size={24} className="text-white" />
                      <span className="text-[8px] font-[900] mt-2 text-white tracking-widest">
                        REMOVE
                      </span>
                    </button>
                  </div>
                ))}

                {/* Botón agregar imagen (solo si no se alcanzó el límite) */}
                {formData.img.length < MAX_IMAGES && (
                  <button
                    type="button"
                    onClick={handleOpenWidget}
                    className="aspect-[3/4] border border-dashed border-white/20 flex flex-col items-center justify-center gap-3 hover:border-red-500 hover:bg-red-500/5 transition-all text-neutral-400 hover:text-white group"
                  >
                    <UploadCloud
                      size={28}
                      className="group-hover:scale-110 transition-all"
                    />
                    <span className="text-[8px] font-[900] uppercase tracking-widest">
                      Add File
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Campo: Descripción del producto */}
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-[0.3em] text-neutral-300 font-[900]">
                Technical Specs
              </label>
              <textarea
                required
                value={formData.description}
                placeholder="Composition, cut, and care instructions..."
                className="w-full bg-neutral-900/50 border border-white/10 p-4 h-32 md:h-44 outline-none focus:border-red-500 transition-all text-sm text-neutral-200 italic leading-relaxed placeholder:text-neutral-700"
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            {/* Campo: Tallas disponibles */}
            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-[0.3em] text-neutral-300 font-[900]">
                Size Protocol
              </label>
              <div className="grid grid-cols-4 gap-2 md:gap-4">
                {AVAILABLE_SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleSizeToggle(size)}
                    className={`h-12 md:h-16 border-2 font-[900] transition-all text-[11px] md:text-sm tracking-widest ${
                      formData.sizes.includes(size)
                        ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                        : "border-white/10 text-neutral-400 hover:border-white/40 hover:text-white"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Campo: Colores disponibles */}
            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-[0.3em] text-neutral-300 font-[900]">
                Color Protocol
                <span className="text-red-500 ml-2">
                  ({formData.color.length} Seleccionados)
                </span>
              </label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {COLOR_PALETTE.map((c) => {
                  const isSelected = formData.color.includes(c.name);
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => handleColorToggle(c.name)}
                      className={`relative h-12 flex items-center justify-center border-2 transition-all group ${
                        isSelected
                          ? "border-red-600 bg-red-600/10 shadow-[0_0_15px_rgba(220,38,38,0.2)]"
                          : "border-white/10 bg-black hover:border-white/30"
                      }`}
                    >
                      <div
                        className="w-4 h-4 rounded-full border border-white/20 shadow-inner"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span
                        className={`ml-2 text-[8px] font-[900] uppercase tracking-widest ${
                          isSelected ? "text-white" : "text-neutral-500"
                        }`}
                      >
                        {c.name}
                      </span>
                      {isSelected && (
                        <div className="absolute -top-1 -right-1">
                          <Zap size={8} className="text-white fill-red-600" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Campo: Link de compra */}
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-[0.3em] text-red-500 font-[900] block">
                Direct Purchase Access (URL)
              </label>
              <div className="relative group">
                <input
                  type="url"
                  value={formData.purchase_link}
                  placeholder="https://tienda.com/producto-link"
                  className="w-full bg-neutral-900/50 border border-white/10 px-4 py-3 text-xs outline-none focus:border-red-500 transition-all text-neutral-300 font-mono italic placeholder:text-neutral-800"
                  onChange={(e) =>
                    setFormData({ ...formData, purchase_link: e.target.value })
                  }
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-opacity">
                  <Zap size={14} className="text-red-500" />
                </div>
              </div>
              <p className="text-[7px] text-neutral-600 uppercase tracking-widest font-bold">
                Protocol: External link for payment processing
              </p>
            </div>

            {/* Botón submit */}
            <framerMotion.button
              disabled={isLoading}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className={`w-full py-5 md:py-7 text-[11px] md:text-xs font-[900] uppercase tracking-[0.6em] transition-all shadow-2xl ${
                isLoading
                  ? "bg-neutral-800 text-neutral-500"
                  : "bg-red-600 text-white hover:bg-white hover:text-black"
              }`}
            >
              {isLoading
                ? "SYNCING_CORE..."
                : isEditing
                  ? "UPDATE_DATABASE"
                  : "INITIALIZE_DEPLOYMENT"}
            </framerMotion.button>
          </form>
        </section>

        {/* ==================================================================
            COLUMNA DERECHA: INVENTARIO DE PRODUCTOS
            ================================================================== */}
        <section className="space-y-8 md:space-y-12">
          {/* Encabezado del inventario */}
          <div className="flex items-center gap-4">
            <div className="h-8 md:h-10 w-1.5 bg-neutral-700 shrink-0"></div>
            <h2 className="text-3xl md:text-4xl font-[900] uppercase italic tracking-tighter text-neutral-300">
              Inventory <span className="text-white font-[900]">DB</span>
            </h2>
          </div>

          {/* Lista de productos */}
          <div className="space-y-5 max-h-[70vh] lg:max-h-[1330px] overflow-y-auto pr-3 custom-scrollbar overflow-x-hidden">
            <FramerAnimatePresence mode="popLayout">
              {products.map((item) => (
                <framerMotion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="group flex items-center gap-4 md:gap-6 p-4 md:p-5 bg-neutral-900/40 border border-white/10 hover:border-red-500/50 hover:bg-neutral-900/60 transition-all relative"
                >
                  {/* Imagen del producto */}
                  <div className="w-16 h-24 md:w-24 md:h-32 bg-black shrink-0 border border-white/10 relative overflow-hidden">
                    <img
                      src={item.img[0]}
                      className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                      alt={item.title}
                    />
                  </div>

                  {/* Información del producto */}
                  <div className="flex-1 min-w-0">
                    {/* ID de referencia */}
                    <span className="text-[7px] md:text-[8px] font-mono text-red-500 tracking-[0.2em] mb-1.5 block font-bold">
                      REF_{item.id.toString().slice(-4).toUpperCase()}
                    </span>

                    {/* Temporada y Año */}
                    {item.season && item.year && (
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[7px] md:text-[8px] px-2 py-0.5 bg-red-600/20 border border-red-600/30 text-red-400 font-bold uppercase tracking-wider">
                          {item.season}
                        </span>
                        <span className="text-[7px] md:text-[8px] px-2 py-0.5 bg-neutral-800 border border-white/10 text-neutral-400 font-bold">
                          {item.year}
                        </span>
                      </div>
                    )}

                    {/* Título */}
                    <h3 className="font-[900] uppercase text-xs md:text-base truncate italic text-white tracking-wide">
                      {item.title}
                    </h3>

                    {/* Tallas y colores */}
                    <div className="flex flex-col gap-2.5 mt-3">
                      {/* Tallas */}
                      <div className="flex flex-wrap gap-1.5">
                        {item.sizes.map((s) => (
                          <span
                            key={s}
                            className="text-[7px] md:text-[9px] px-2 py-0.5 border border-white/20 text-neutral-300 font-bold uppercase bg-white/5"
                          >
                            {s}
                          </span>
                        ))}
                      </div>

                      {/* Colores */}
                      {item.color &&
                        Array.isArray(item.color) &&
                        item.color.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1 border-t border-white/5">
                            {item.color.map((c) => (
                              <div
                                key={c}
                                className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full border border-white/20 shadow-sm"
                                style={{
                                  backgroundColor:
                                    COLOR_MAP[c.toLowerCase()] || "#333",
                                }}
                                title={c.toUpperCase()}
                              />
                            ))}
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex flex-col gap-2">
                    {/* Botón editar */}
                    <button
                      onClick={() => startEdit(item)}
                      className="p-3 md:p-4 bg-white/5 text-neutral-300 hover:bg-white hover:text-black transition-all border border-white/10 shadow-lg"
                      title="Editar producto"
                    >
                      <Edit2 size={16} />
                    </button>

                    {/* Botón eliminar */}
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-3 md:p-4 bg-white/5 text-neutral-300 hover:bg-red-600 hover:text-white transition-all border border-white/10 shadow-lg"
                      title="Eliminar producto"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </framerMotion.div>
              ))}
            </FramerAnimatePresence>

            {/* Mensaje cuando no hay productos */}
            {products.length === 0 && (
              <div className="py-24 text-center border-2 border-dashed border-white/10">
                <p className="text-[10px] uppercase tracking-[0.6em] text-neutral-500 font-bold">
                  No Assets Detected
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* ====================================================================
          FOOTER
          ==================================================================== */}
      <footer className="mt-10 md:mt-20 border-t border-white/10 p-8 md:p-12 text-center bg-black/50">
        <p className="text-[8px] md:text-[10px] text-neutral-500 tracking-[0.6em] uppercase font-mono">
          Nomad Wear // Terminal Interface // Secure Node Access
        </p>
      </footer>

      {/* Contenedor de toasts */}
      <toast.ToastContainer />
    </div>
  );
};

export default AdminPanel;
