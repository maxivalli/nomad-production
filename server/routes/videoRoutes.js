const express = require("express");
const router = express.Router();
const videoController = require("../controllers/videoController");
const authenticateAdmin = require("../middleware/auth");
const { uploadVideo } = require("../config/cloudinary");

router.post(
  "/upload-ai-video",
  authenticateAdmin,
  uploadVideo.single("video"),
  videoController.uploadVideo
);
router.delete(
  "/delete-ai-video/:public_id",
  authenticateAdmin,
  videoController.deleteVideo
);
router.get("/ai-videos", authenticateAdmin, videoController.listVideos);

module.exports = router;
