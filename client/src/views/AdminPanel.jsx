import React, { useState, useEffect } from "react";
import api from "../services/api";
import PushNotificationPanel from "../components/PushNotificationPanel";
import AdminBannersPanel from "../components/AdminBannersPanel";
import { useToast } from "../components/Toast";
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
  Bell,
  Monitor,
  Film,
  Loader,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { videoGenerator } from "../services/videoGenerator-replicate";

// ============================================================================
// CONSTANTES Y CONFIGURACIÓN
// ============================================================================

const AVAILABLE_SIZES = ["S", "M", "L", "XL"];
const MAX_IMAGES = 5;
const SIZE_GUIDE_IMAGE = "https://res.cloudinary.com/det2xmstl/image/upload/f_auto,q_auto/v1770840193/guia_talles_ulwnqe.jpg";

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
  video_url: "",
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
  
  // NUEVO: Estado para el modal de notificaciones
  const [isPushModalOpen, setIsPushModalOpen] = useState(false);
  
  // NUEVO: Estado para el modal de banners
  const [isBannersModalOpen, setIsBannersModalOpen] = useState(false);

  // --------------------------------------------------------------------------
  // ESTADO - Generación de videos AI
  // --------------------------------------------------------------------------
  const [videoGenerationState, setVideoGenerationState] = useState({
    isGenerating: false,
    previewUrl: null,
    status: null,
    message: '',
    videoBlob: null,
    progress: 0,
  });

  const [showVideoPreview, setShowVideoPreview] = useState(false);

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

    // NOTA: purchase_link y video_url son OPCIONALES, no se validan

    setIsLoading(true);

    try {
      // NUEVO: Preparar el array de imágenes con la guía de talles al final
      const imagesWithSizeGuide = [...formData.img];
      
      // Solo agregar la guía de talles si no está ya en el array
      if (!imagesWithSizeGuide.includes(SIZE_GUIDE_IMAGE)) {
        imagesWithSizeGuide.push(SIZE_GUIDE_IMAGE);
      }

      // Crear el objeto de datos con la guía de talles incluida
      const productData = {
        ...formData,
        img: imagesWithSizeGuide
      };

      if (isEditing) {
        await api.updateProduct(isEditing, productData);
        toast.success("Producto actualizado exitosamente");
      } else {
        await api.createProduct(productData);
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

    // NUEVO: Filtrar la guía de talles del array de imágenes al editar
    const imagesWithoutSizeGuide = Array.isArray(item.img) 
      ? item.img.filter(img => img !== SIZE_GUIDE_IMAGE)
      : [item.img].filter(img => img !== SIZE_GUIDE_IMAGE);

    setIsEditing(item.id);
    setFormData({
      season: item.season || "",
      year: item.year || "",
      title: item.title,
      description: item.description,
      img: imagesWithoutSizeGuide,
      sizes: item.sizes,
      purchase_link: item.purchase_link || "",
      color: colorData,
      video_url: item.video_url || "",
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
      toast.warning(
        "Escribe un título primero para optimizar el nombre de la imagen",
      );
      return;
    }

    // MODIFICADO: Restar 1 al límite de slots para dejar espacio a la guía de talles
    const slotsAvailable = (MAX_IMAGES - 1) - formData.img.length;
    if (slotsAvailable <= 0) {
      toast.warning(`Límite de ${MAX_IMAGES - 1} imágenes de producto alcanzado (se reserva 1 espacio para la guía de talles)`);
      return;
    }

    // Generar un nombre base limpio (SEO Friendly)
    // Ejemplo: "Remera Oversize" -> "nomad-remera-oversize"
    const cleanTitle = formData.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Quita caracteres especiales
      .replace(/[\s_-]+/g, "-") // Cambia espacios por guiones
      .replace(/^-+|-+$/g, ""); // Quita guiones al inicio o final

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
            img: [...prev.img, ...newUrls].slice(0, MAX_IMAGES - 1), // MODIFICADO: Dejar espacio para la guía
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
  // HANDLERS - Generación de videos AI
  // ==========================================================================

  /**
   * Genera un video AI a partir de la primera imagen del producto
   */
  const handleGenerateVideo = async () => {
    if (!formData.img || formData.img.length === 0) {
      toast.warning("Necesitas al menos una imagen para generar el video");
      return;
    }

    setVideoGenerationState({
      isGenerating: true,
      previewUrl: null,
      status: 'loading',
      message: 'Iniciando generación...',
      videoBlob: null,
      progress: 0,
    });

    setShowVideoPreview(true);

    const result = await videoGenerator.generateVideoFromImage(
      formData.img[0],
      (progressData) => {
        setVideoGenerationState(prev => ({
          ...prev,
          status: progressData.status,
          message: progressData.message,
          progress: progressData.progress || prev.progress,
        }));
      }
    );

    if (result.success) {
      setVideoGenerationState({
        isGenerating: false,
        previewUrl: result.videoUrl,
        status: 'complete',
        message: 'Video generado con éxito',
        videoBlob: result.videoBlob,
        progress: 100,
      });
    } else {
      setVideoGenerationState({
        isGenerating: false,
        previewUrl: null,
        status: 'error',
        message: result.error,
        videoBlob: null,
        progress: 0,
      });
    }
  };

  /**
   * Acepta el video y lo sube a Cloudinary
   */
  const handleAcceptVideo = async () => {
    if (!videoGenerationState.videoBlob) {
      toast.error("No hay video para subir");
      return;
    }

    if (!cloudinaryConfig) {
      toast.error("Configuración de Cloudinary no disponible");
      return;
    }

    setVideoGenerationState(prev => ({
      ...prev,
      status: 'uploading',
      message: 'Subiendo video a Cloudinary...',
      progress: 0,
    }));

    try {
      const videoUrl = await videoGenerator.uploadVideoToCloudinary(
        videoGenerationState.videoBlob,
        cloudinaryConfig,
        formData.title
      );

      // Agregar el video al formData
      setFormData(prev => ({
        ...prev,
        video_url: videoUrl,
      }));

      toast.success("Video agregado al producto exitosamente");
      
      // Cerrar el preview
      setShowVideoPreview(false);
      setVideoGenerationState({
        isGenerating: false,
        previewUrl: null,
        status: null,
        message: '',
        videoBlob: null,
        progress: 0,
      });

    } catch (error) {
      console.error("Error subiendo video:", error);
      toast.error("Error al subir el video a Cloudinary");
      
      setVideoGenerationState(prev => ({
        ...prev,
        status: 'error',
        message: 'Error al subir el video',
        progress: 0,
      }));
    }
  };

  /**
   * Descarta el video generado
   */
  const handleDiscardVideo = () => {
    if (videoGenerationState.previewUrl) {
      URL.revokeObjectURL(videoGenerationState.previewUrl);
    }
    
    setShowVideoPreview(false);
    setVideoGenerationState({
      isGenerating: false,
      previewUrl: null,
      status: null,
      message: '',
      videoBlob: null,
      progress: 0,
    });
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
          <div className="flex-1 flex justify-start gap-3">
            <Link
              to="/"
              className="group relative flex items-center gap-2 py-2 overflow-hidden shrink-0"
            >
              <ArrowLeft
                size={24}
                className="text-neutral-500 group-hover:text-red-500 transition-colors"
              />
              <div className="flex flex-col hidden xs:flex">
                <span className="text-[8px] md:text-[10px] tracking-[0.3em] uppercase font-[900] text-neutral-500 group-hover:text-white transition-colors leading-none">
                  Exit
                </span>
                <span className="h-[1px] w-0 bg-red-600 group-hover:w-full transition-all duration-500 mt-1"></span>
              </div>
            </Link>

            {/* NUEVO: Botón de notificaciones push */}
            <button
              onClick={() => setIsPushModalOpen(true)}
              className="group relative flex items-center gap-2 py-2 overflow-hidden shrink-0"
            >
              <Bell
                size={24}
                className="text-neutral-500 group-hover:text-red-500 transition-colors animate-pulse"
              />
              <div className="flex flex-col hidden xs:flex">
                <span className="text-[8px] md:text-[10px] tracking-[0.3em] uppercase font-[900] text-neutral-500 group-hover:text-white transition-colors leading-none">
                  Push
                </span>
                <span className="h-[1px] w-0 bg-red-600 group-hover:w-full transition-all duration-500 mt-1"></span>
              </div>
            </button>

            {/* NUEVO: Botón de banners publicitarios */}
            <button
              onClick={() => setIsBannersModalOpen(true)}
              className="group relative flex items-center gap-2 py-2 overflow-hidden shrink-0"
            >
              <Monitor
                size={24}
                className="text-neutral-500 group-hover:text-red-500 transition-colors"
              />
              <div className="flex flex-col hidden xs:flex">
                <span className="text-[8px] md:text-[10px] tracking-[0.3em] uppercase font-[900] text-neutral-500 group-hover:text-white transition-colors leading-none">
                  Ads
                </span>
                <span className="h-[1px] w-0 bg-red-600 group-hover:w-full transition-all duration-500 mt-1"></span>
              </div>
            </button>
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
          MODAL DE NOTIFICACIONES PUSH
          ==================================================================== */}
      <FramerAnimatePresence>
        {isPushModalOpen && (
          <framerMotion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
            onClick={() => setIsPushModalOpen(false)}
          >
            <framerMotion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="bg-black border-2 border-red-600/30 w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar relative shadow-2xl shadow-red-600/20"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header del modal */}
              <div className="sticky top-0 bg-black/95 backdrop-blur-xl border-b border-red-600/30 p-4 md:p-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-red-600/10 border border-red-600/30">
                    <Bell size={20} className="text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-[900] uppercase italic tracking-tight text-white">
                      Push Notifications
                    </h2>
                    <p className="text-[8px] md:text-[10px] text-neutral-400 uppercase tracking-widest font-bold mt-1">
                      Broadcast Control Panel
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPushModalOpen(false)}
                  className="group p-3 hover:bg-red-600 transition-colors border border-white/10"
                >
                  <X size={20} className="text-white group-hover:rotate-90 transition-transform" />
                </button>
              </div>

              {/* Contenido del modal */}
              <div className="p-4 md:p-8">
                <PushNotificationPanel />
              </div>
            </framerMotion.div>
          </framerMotion.div>
        )}
      </FramerAnimatePresence>

      {/* ====================================================================
          MODAL DE BANNERS PUBLICITARIOS
          ==================================================================== */}
      <FramerAnimatePresence>
        {isBannersModalOpen && (
          <framerMotion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
            onClick={() => setIsBannersModalOpen(false)}
          >
            <framerMotion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="bg-black border-2 border-red-600/30 w-full max-w-6xl max-h-[90vh] overflow-y-auto custom-scrollbar relative shadow-2xl shadow-red-600/20"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header del modal */}
              <div className="sticky top-0 bg-black/95 backdrop-blur-xl border-b border-red-600/30 p-4 md:p-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-red-600/10 border border-red-600/30">
                    <Monitor size={20} className="text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-[900] uppercase italic tracking-tight text-white">
                      Banners Publicitarios
                    </h2>
                    <p className="text-[8px] md:text-[10px] text-neutral-400 uppercase tracking-widest font-bold mt-1">
                      Advertising Management Panel
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsBannersModalOpen(false)}
                  className="group p-3 hover:bg-red-600 transition-colors border border-white/10"
                >
                  <X size={20} className="text-white group-hover:rotate-90 transition-transform" />
                </button>
              </div>

              {/* Contenido del modal */}
              <div className="p-4 md:p-8">
                <AdminBannersPanel />
              </div>
            </framerMotion.div>
          </framerMotion.div>
        )}
      </FramerAnimatePresence>

      {/* ====================================================================
          MODAL DE PREVIEW DE VIDEO AI
          ==================================================================== */}
      <FramerAnimatePresence>
        {showVideoPreview && (
          <framerMotion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
            onClick={handleDiscardVideo}
          >
            <framerMotion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="bg-gradient-to-br from-neutral-900 to-black border-2 border-purple-600/30 w-full max-w-3xl relative shadow-2xl shadow-purple-600/20 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-black/95 backdrop-blur-xl border-b border-purple-600/30 p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-purple-600/10 border border-purple-600/30">
                    <Film size={20} className="text-purple-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-[900] uppercase italic tracking-tight text-white">
                      AI Video Preview
                    </h2>
                    <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold mt-1">
                      Powered by Replicate AI
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDiscardVideo}
                  className="group p-3 hover:bg-red-600 transition-colors border border-white/10"
                >
                  <X size={20} className="text-white group-hover:rotate-90 transition-transform" />
                </button>
              </div>

              {/* Contenido */}
              <div className="p-8">
                {/* Estados de carga */}
                {videoGenerationState.isGenerating && (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader className="w-12 h-12 text-purple-500 animate-spin mb-6" />
                    <p className="text-sm text-neutral-300 uppercase tracking-widest font-bold mb-2">
                      {videoGenerationState.message}
                    </p>
                    {videoGenerationState.progress !== undefined && (
                      <p className="text-xs text-purple-400 mb-4">
                        {Math.round(videoGenerationState.progress)}%
                      </p>
                    )}
                    <div className="mt-4 w-64 h-2 bg-neutral-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300"
                        style={{ width: `${videoGenerationState.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Preview del video */}
                {videoGenerationState.status === 'complete' && videoGenerationState.previewUrl && (
                  <div className="space-y-6">
                    <div className="relative aspect-video bg-black border border-purple-600/30 overflow-hidden">
                      <video
                        src={videoGenerationState.previewUrl}
                        controls
                        autoPlay
                        loop
                        muted
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-4">
                      <button
                        onClick={handleAcceptVideo}
                        className="flex-1 group relative flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 overflow-hidden transition-all active:scale-95"
                      >
                        <div className="absolute inset-0 bg-white/20 translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-300" />
                        <CheckCircle size={20} className="relative z-10" />
                        <span className="relative z-10 text-sm font-[900] uppercase tracking-wider">
                          Agregar
                        </span>
                      </button>

                      <button
                        onClick={handleDiscardVideo}
                        className="flex-1 group relative flex items-center justify-center gap-3 bg-gradient-to-r from-red-600 to-rose-600 px-6 py-4 overflow-hidden transition-all active:scale-95"
                      >
                        <div className="absolute inset-0 bg-white/20 translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-300" />
                        <XCircle size={20} className="relative z-10" />
                        <span className="relative z-10 text-sm font-[900] uppercase tracking-wider">
                          Descartar
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Estado de subida */}
                {videoGenerationState.status === 'uploading' && (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader className="w-12 h-12 text-purple-500 animate-spin mb-6" />
                    <p className="text-sm text-neutral-300 uppercase tracking-widest font-bold">
                      {videoGenerationState.message}
                    </p>
                  </div>
                )}

                {/* Error */}
                {videoGenerationState.status === 'error' && (
                  <div className="flex flex-col items-center justify-center py-20">
                    <XCircle className="w-16 h-16 text-red-500 mb-6" />
                    <p className="text-sm text-red-400 uppercase tracking-widest font-bold mb-4">
                      {videoGenerationState.message}
                    </p>
                    <button
                      onClick={handleDiscardVideo}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-[900] uppercase tracking-widest transition-all"
                    >
                      Cerrar
                    </button>
                  </div>
                )}
              </div>
            </framerMotion.div>
          </framerMotion.div>
        )}
      </FramerAnimatePresence>

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
              <div className="flex justify-between items-center">
                <label className="text-[10px] uppercase tracking-[0.3em] text-neutral-300 font-[900]">
                  Visual Assets
                  <span className="text-red-500 ml-2">
                    {formData.img.length}/{MAX_IMAGES - 1}
                  </span>
                  <span className="text-neutral-500 text-[8px] ml-2">
                    (+1 guía talles)
                  </span>
                </label>
                
                {/* NUEVO: Botón para generar video AI (solo si no hay video ya) */}
                {formData.img.length > 0 && !formData.video_url && (
                  <button
                    type="button"
                    onClick={handleGenerateVideo}
                    disabled={videoGenerationState.isGenerating}
                    className="group relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[8px] font-[900] uppercase tracking-widest overflow-hidden transition-all hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-300" />
                    <Film size={14} className="relative z-10" />
                    <span className="relative z-10">
                      {videoGenerationState.isGenerating ? 'Generando...' : 'Generate AI Video'}
                    </span>
                  </button>
                )}
              </div>
              
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
                {formData.img.length < (MAX_IMAGES - 1) && (
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

              {/* Indicador de guía de talles */}
              <div className="mt-3 p-3 bg-green-600/10 border border-green-600/30 flex items-center gap-3">
                <ImageIcon size={16} className="text-green-500" />
                <div className="flex-1">
                  <p className="text-[8px] uppercase tracking-widest text-green-400 font-bold">
                    Guía de talles automática
                  </p>
                  <p className="text-[7px] text-neutral-500 mt-0.5">
                    Se agregará automáticamente al guardar el producto
                  </p>
                </div>
              </div>

              {/* Preview y controles del video AI */}
              {formData.video_url && (
                <div className="mt-6 space-y-3">
                  {/* Video preview */}
                  <div className="relative aspect-video bg-black border-2 border-purple-600/30 overflow-hidden group shadow-2xl shadow-purple-600/20">
                    <video
                      src={formData.video_url}
                      controls
                      loop
                      muted
                      className="w-full h-full object-contain"
                    />
                    
                    {/* Badge AI Video */}
                    <div className="absolute top-3 left-3 flex items-center gap-2 bg-purple-600/90 backdrop-blur-sm px-3 py-1.5 border border-purple-400/30">
                      <Film size={12} className="text-white" />
                      <span className="text-[8px] font-bold uppercase tracking-widest text-white">
                        AI Generated
                      </span>
                    </div>

                    {/* Botón eliminar video (aparece al hacer hover) */}
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('¿Confirmas eliminar el video AI de este producto?')) {
                          setFormData(prev => ({ ...prev, video_url: '' }));
                          toast.success('Video eliminado');
                        }
                      }}
                      className="absolute inset-0 bg-red-600/95 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                    >
                      <Trash2 size={32} className="text-white mb-2" />
                      <span className="text-xs font-[900] text-white tracking-widest uppercase">
                        Eliminar Video
                      </span>
                    </button>
                  </div>

                  {/* Info del video */}
                  <div className="flex items-center justify-between p-3 bg-purple-600/10 border border-purple-600/30">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                      <span className="text-[9px] uppercase tracking-widest text-purple-300 font-bold">
                        Video AI activo en este producto
                      </span>
                    </div>
                    <span className="text-[8px] text-purple-400/60 font-mono">
                      {formData.video_url.length > 40 
                        ? formData.video_url.substring(0, 40) + '...' 
                        : formData.video_url}
                    </span>
                  </div>
                </div>
              )}
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

                    {/* Indicador de video */}
                    {item.video_url && (
                      <div className="mt-2 flex items-center gap-1.5">
                        <Film size={10} className="text-purple-500" />
                        <span className="text-[7px] text-purple-400 uppercase tracking-wider font-bold">
                          AI Video
                        </span>
                      </div>
                    )}
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