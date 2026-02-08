const express = require("express");
const router = express.Router();
const pushController = require("../controllers/pushController");
const pushImageController = require("../controllers/pushImageController");
const authenticateAdmin = require("../middleware/auth");
const { upload } = require("../config/cloudinary");

// Push notifications
router.get("/vapid-public-key", pushController.getVapidPublicKey);
router.post("/subscribe", pushController.subscribe);
router.post("/unsubscribe", pushController.unsubscribe);
router.get("/stats", authenticateAdmin, pushController.getStats);
router.post("/send", authenticateAdmin, pushController.sendNotification);
router.get("/history", authenticateAdmin, pushController.getHistory);

// Push images
router.post(
  "/upload-image",
  authenticateAdmin,
  upload.single("image"),
  pushImageController.uploadImage
);
router.delete(
  "/delete-image/:public_id",
  authenticateAdmin,
  pushImageController.deleteImage
);
router.get("/images", authenticateAdmin, pushImageController.listImages);

module.exports = router;
