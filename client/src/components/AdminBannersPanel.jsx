import { useState, useEffect } from "react";
import {
  Image as ImageIcon,
  Video,
  Upload,
  Trash2,
  Calendar,
  Play,
  X,
} from "lucide-react";
import { useToast } from "./Toast";
import api from "../services/api";

const AdminBannersPanel = () => {
  const toast = useToast();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState({
    media_url: "",
    media_type: "",
    start_date: "",
    end_date: "",
  });

  const [previewFile, setPreviewFile] = useState(null);
  const [fileDimensions, setFileDimensions] = useState(null);

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    setLoading(true);
    try {
      const data = await api.getAllBanners();
      setBanners(data);
    } catch (error) {
      console.error("Error cargando banners:", error);
      toast.error("❌ Error al cargar banners");
    } finally {
      setLoading(false);
    }
  };

  // Validar dimensiones del archivo
  const validateDimensions = (file) => {
    return new Promise((resolve, reject) => {
      const isVideo = file.type.startsWith("video/");

      if (isVideo) {
        const video = document.createElement("video");
        video.preload = "metadata";

        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src);
          const width = video.videoWidth;
          const height = video.videoHeight;

          if (width === 720 && height === 1080) {
            resolve({ width, height, valid: true });
          } else {
            reject(
              new Error(
                `El video debe ser 1080x720px. Dimensiones actuales: ${width}x${height}px`,
              ),
            );
          }
        };

        video.onerror = () => {
          reject(new Error("Error al cargar el video"));
        };

        video.src = URL.createObjectURL(file);
      } else {
        const img = new Image();

        img.onload = () => {
          const width = img.width;
          const height = img.height;

          if (width === 720 && height === 1080) {
            resolve({ width, height, valid: true });
          } else {
            reject(
              new Error(
                `La imagen debe ser 1080x720px. Dimensiones actuales: ${width}x${height}px`,
              ),
            );
          }
        };

        img.onerror = () => {
          reject(new Error("Error al cargar la imagen"));
        };

        img.src = URL.createObjectURL(file);
      }
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      toast.error("❌ El archivo debe ser una imagen o video");
      return;
    }

    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("❌ El archivo debe pesar menos de 10MB");
      return;
    }

    setUploading(true);
    try {
      // Validar dimensiones ANTES de subir
      const dimensions = await validateDimensions(file);
      setFileDimensions(dimensions);

      // Crear FormData para enviar el archivo
      const formDataFile = new FormData();
      formDataFile.append("media", file);

      // Enviar al servidor
      const response = await api.uploadBannerMedia(formDataFile);

      // Actualizar formData con la URL del archivo
      setFormData({
        ...formData,
        media_url: response.url,
        media_type: response.type,
      });

      // Guardar preview
      setPreviewFile(URL.createObjectURL(file));

      toast.success("✅ Archivo subido correctamente");
    } catch (error) {
      console.error("Error subiendo archivo:", error);
      toast.error(error.message || "❌ Error al subir el archivo");
      // Limpiar el input
      e.target.value = "";
      setPreviewFile(null);
      setFileDimensions(null);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFormData({
      ...formData,
      media_url: "",
      media_type: "",
    });
    setPreviewFile(null);
    setFileDimensions(null);
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!formData.media_url || !formData.start_date || !formData.end_date) {
      toast.warning("⚠️ Completa todos los campos");
      return;
    }

    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);

    if (endDate <= startDate) {
      toast.warning(
        "⚠️ La fecha de fin debe ser posterior a la fecha de inicio",
      );
      return;
    }

    setCreating(true);
    try {
      await api.createBanner(formData);

      toast.success("✅ Banner creado correctamente");

      // Reset form
      setFormData({
        media_url: "",
        media_type: "",
        start_date: "",
        end_date: "",
      });
      setPreviewFile(null);
      setFileDimensions(null);

      loadBanners();
    } catch (error) {
      console.error("Error creando banner:", error);
      toast.error("❌ Error al crear el banner");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este banner?")) {
      return;
    }

    try {
      await api.deleteBanner(id);
      toast.success("✅ Banner eliminado");
      loadBanners();
    } catch (error) {
      console.error("Error eliminando banner:", error);
      toast.error("❌ Error al eliminar el banner");
    }
  };

  const handleToggleActive = async (banner) => {
    try {
      await api.updateBanner(banner.id, {
        active: !banner.active,
      });
      toast.success(`✅ Banner ${banner.active ? "desactivado" : "activado"}`);
      loadBanners();
    } catch (error) {
      console.error("Error actualizando banner:", error);
      toast.error("❌ Error al actualizar el banner");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isActive = (banner) => {
    const now = new Date();
    const start = new Date(banner.start_date);
    const end = new Date(banner.end_date);
    return banner.active && now >= start && now <= end;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header con título */}
      <div className="flex items-center gap-4">
        <div className="h-10 w-1.5 bg-red-600 shrink-0"></div>
        <h2 className="text-4xl font-[900] uppercase italic tracking-tighter text-white">
          Banners <span className="text-red-600">Publicitarios</span>
        </h2>
      </div>

      {/* Grid de dos columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* COLUMNA IZQUIERDA: Formulario (7/12) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-8">
              <Upload className="text-red-600" size={24} />
              <h3 className="text-white font-black text-xl uppercase italic tracking-tighter">
                Crear Nuevo Banner
              </h3>
            </div>

            <form onSubmit={handleCreate} className="space-y-6">
              {/* Upload de archivo */}
              <div className="space-y-2">
                <label className="text-white/80 text-xs font-bold uppercase flex items-center gap-2">
                  Imagen o Video <span className="text-red-500">*</span>
                  <span className="text-white/40 font-normal text-[10px]">
                    (1080 x 720px)
                  </span>
                </label>

                <div className="group relative border-2 border-dashed border-white/10 hover:border-red-600/40 rounded-2xl transition-all bg-white/[0.02] overflow-hidden">
                  {previewFile ? (
                    <div className="relative">
                      {formData.media_type === "video" ? (
                        <div className="relative aspect-[1080/720]">
                          <video
                            src={previewFile}
                            className="w-full h-full object-cover"
                            controls
                          />
                          <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-xs text-white flex items-center gap-1">
                            <Video size={12} />
                            Video
                          </div>
                        </div>
                      ) : (
                        <div className="relative aspect-[1080/720]">
                          <img
                            src={previewFile}
                            className="w-full h-full object-cover"
                            alt="Preview"
                          />
                          <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-xs text-white flex items-center gap-1">
                            <ImageIcon size={12} />
                            Imagen
                          </div>
                        </div>
                      )}
                      {fileDimensions && (
                        <div className="absolute bottom-2 left-2 bg-green-600/80 px-2 py-1 rounded text-xs text-white font-bold">
                          ✓ {fileDimensions.width}x{fileDimensions.height}px
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={removeFile}
                          className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-xl transform transition hover:scale-110"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center py-16 cursor-pointer">
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 group-hover:bg-red-600/10 transition-colors">
                        {uploading ? (
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                        ) : (
                          <Upload
                            size={32}
                            className="text-white/40 group-hover:text-red-600"
                          />
                        )}
                      </div>
                      <span className="text-sm text-white/60 font-medium mb-1">
                        {uploading ? "Subiendo..." : "Click para subir archivo"}
                      </span>
                      <span className="text-xs text-white/40">
                        1080x720px - JPG, PNG, MP4 (max 10MB)
                      </span>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Fecha de inicio */}
              <div className="space-y-2">
                <label className="text-white/80 text-xs font-bold uppercase flex items-center gap-2">
                  <Calendar size={14} />
                  Fecha de Inicio <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                  className="w-full bg-black/40 border border-white/10 focus:border-red-600 rounded-xl px-4 py-3 text-white outline-none transition-all"
                  required
                />
              </div>

              {/* Fecha de fin */}
              <div className="space-y-2">
                <label className="text-white/80 text-xs font-bold uppercase flex items-center gap-2">
                  <Calendar size={14} />
                  Fecha de Fin <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData({ ...formData, end_date: e.target.value })
                  }
                  className="w-full bg-black/40 border border-white/10 focus:border-red-600 rounded-xl px-4 py-3 text-white outline-none transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={
                  creating ||
                  !formData.media_url ||
                  !formData.start_date ||
                  !formData.end_date
                }
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-neutral-800 text-white font-black py-4 rounded-xl transition-all flex items-center justify-center gap-3 uppercase tracking-[0.1em] text-sm shadow-lg"
              >
                {creating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creando...
                  </>
                ) : (
                  <>
                    <Upload size={20} />
                    Crear Banner
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* COLUMNA DERECHA: Preview & Info (5/12) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="lg:sticky lg:top-8">
            <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-4 ml-2">
              Vista Previa del Modal
            </p>

            <div className="bg-[#1a1a1a] rounded-[2.5rem] p-4 border border-white/10 shadow-2xl overflow-hidden relative max-w-sm mx-auto">
              {/* Simulación Notch */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-20" />

              <div className="mt-8 bg-black/90 backdrop-blur-xl border border-white/10 rounded-[1.5rem] p-4 shadow-2xl">
                {previewFile ? (
                  <div className="space-y-3">
                    {formData.media_type === "video" ? (
                      <div
                        className="relative w-full rounded-xl overflow-hidden"
                        style={{ aspectRatio: "720/1080" }}
                      >
                        <video
                          src={previewFile}
                          className="w-full h-full object-cover"
                          autoPlay
                          muted
                          loop
                        />
                        <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded-lg flex items-center gap-1">
                          <Play size={12} className="text-white" />
                          <span className="text-white text-[10px] font-bold">
                            VIDEO
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="relative w-full rounded-xl overflow-hidden"
                        style={{ aspectRatio: "720/1080" }}
                      >
                        <img
                          src={previewFile}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <button className="w-full bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg text-xs font-bold transition-colors">
                      Cerrar
                    </button>
                  </div>
                ) : (
                  <div
                    className="w-full border-2 border-dashed border-white/10 rounded-xl"
                    style={{ aspectRatio: "720/1080" }}
                  >
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <ImageIcon
                          size={40}
                          className="text-white/20 mx-auto mb-2"
                        />
                        <p className="text-white/40 text-xs">
                          Sube un archivo para previsualizar
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Decoración inferior smartphone */}
              <div className="mt-8 mb-2 flex justify-center">
                <div className="w-32 h-1 bg-white/20 rounded-full" />
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-600/5 border border-yellow-600/20 rounded-xl">
              <p className="text-yellow-500 text-[10px] font-bold uppercase leading-relaxed text-center">
                ⚠️ Dimensiones requeridas: 1080 x 720 píxeles (vertical)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Listado de banners */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
        <div className="flex items-center gap-3 mb-8">
          <ImageIcon className="text-red-600" size={24} />
          <h3 className="text-white font-black text-xl uppercase italic tracking-tighter">
            Banners Registrados
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              <p className="text-white/40 text-sm italic">
                Sincronizando base de datos...
              </p>
            </div>
          ) : banners.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-xl">
              <p className="text-white/20 text-sm italic font-serif">
                No se encontraron campañas publicitarias registradas
              </p>
            </div>
          ) : (
            banners.map((banner) => (
              <div
                key={banner.id}
                className={`group relative bg-black/40 border ${
                  isActive(banner)
                    ? "border-green-500/30 bg-green-500/5"
                    : "border-white/5"
                } rounded-xl p-4 flex flex-col sm:flex-row gap-5 items-start sm:items-center transition-all duration-300 hover:bg-white/[0.03]`}
              >
                {/* 1. Preview: Grande en móvil, miniatura en PC */}
                <div className="w-full sm:w-32 h-48 sm:h-20 rounded-lg overflow-hidden border border-white/10 shrink-0 relative bg-neutral-900">
                  {banner.media_type === "video" ? (
                    <div className="relative h-full w-full">
                      <video
                        src={banner.media_url}
                        className="w-full h-full object-cover"
                        muted
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <Play size={24} className="text-white opacity-80" />
                      </div>
                    </div>
                  ) : (
                    <img
                      src={banner.media_url}
                      className="w-full h-full object-cover"
                      alt="Banner"
                    />
                  )}
                  {/* Badge de tipo de archivo siempre visible en el preview */}
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-black text-white uppercase tracking-tighter border border-white/10">
                    {banner.media_type}
                  </div>
                </div>

                {/* 2. Info: Grid para organizar fechas en móvil */}
                <div className="flex-1 min-w-0 w-full space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {isActive(banner) ? (
                      <span className="flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full uppercase font-black bg-green-500/10 text-green-400 border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        Campañana Activa
                      </span>
                    ) : (
                      <span className="text-[10px] px-2.5 py-1 rounded-full uppercase font-black bg-white/5 text-white/40 border border-white/10">
                        {new Date() > new Date(banner.end_date)
                          ? "Finalizado"
                          : "Programado"}
                      </span>
                    )}
                    {!banner.active && (
                      <span className="text-[10px] px-2.5 py-1 rounded-full uppercase font-black bg-red-600/10 text-red-500 border border-red-600/20">
                        Pausado Manualmente
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-1">
                    <div className="space-y-0.5">
                      <p className="text-[9px] text-white/30 uppercase font-black tracking-widest">
                        Fecha Inicio
                      </p>
                      <p className="text-xs text-white/80 font-medium">
                        {formatDate(banner.start_date)}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[9px] text-white/30 uppercase font-black tracking-widest">
                        Fecha Fin
                      </p>
                      <p className="text-xs text-white/80 font-medium">
                        {formatDate(banner.end_date)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. Acciones: Botones grandes en móvil */}
                <div className="flex sm:flex-col flex-row w-full sm:w-auto gap-2 pt-4 sm:pt-0 border-t sm:border-t-0 border-white/5">
                  <button
                    onClick={() => handleToggleActive(banner)}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 sm:p-2.5 transition-all duration-200 border rounded-lg ${
                      banner.active
                        ? "bg-amber-600/10 hover:bg-amber-600/20 text-amber-500 border-amber-600/20"
                        : "bg-green-600/10 hover:bg-green-600/20 text-green-500 border-green-600/20"
                    }`}
                    title={banner.active ? "Pausar campaña" : "Activar campaña"}
                  >
                    {banner.active ? (
                      <Play size={16} className="rotate-90" />
                    ) : (
                      <Play size={16} />
                    )}
                    <span className="text-[10px] font-black uppercase sm:hidden">
                      {banner.active ? "Pausar" : "Activar"}
                    </span>
                  </button>

                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 sm:p-2.5 bg-red-600/10 hover:bg-red-600/20 text-red-500 transition-all border border-red-600/20 rounded-lg"
                    title="Eliminar banner"
                  >
                    <Trash2 size={16} />
                    <span className="text-[10px] font-black uppercase sm:hidden">
                      Eliminar
                    </span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Contenedor de Toasts */}
      <toast.ToastContainer />
    </div>
  );
};

export default AdminBannersPanel;
