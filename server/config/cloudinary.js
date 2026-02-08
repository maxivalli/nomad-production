const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage de Cloudinary para imágenes push
const pushImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "push-images",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
    transformation: [{ width: 1200, height: 630, crop: "limit" }],
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      return "push-" + uniqueSuffix;
    },
  },
});

// Storage de Cloudinary para banners publicitarios
const bannerStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "banners",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "gif", "mp4", "mov"],
    resource_type: "auto",
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      return "banner-" + uniqueSuffix;
    },
  },
});

// Storage de Cloudinary para videos AI
const aiVideoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "ai-videos",
    allowed_formats: ["mp4", "mov", "avi", "webm"],
    resource_type: "video",
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      return "ai-video-" + uniqueSuffix;
    },
  },
});

const upload = multer({
  storage: pushImageStorage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB máximo
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten imágenes (JPG, PNG, WebP, GIF)"), false);
    }
  },
});

const uploadBanner = multer({
  storage: bannerStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo para banners
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "video/mp4",
      "video/quicktime",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Solo se permiten imágenes (JPG, PNG, WebP, GIF) o videos (MP4, MOV)"
        ),
        false
      );
    }
  },
});

const uploadVideo = multer({
  storage: aiVideoStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB máximo para videos
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "video/mp4",
      "video/quicktime",
      "video/x-msvideo",
      "video/webm",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten videos (MP4, MOV, AVI, WebM)"), false);
    }
  },
});

module.exports = {
  cloudinary,
  upload,
  uploadBanner,
  uploadVideo,
};
