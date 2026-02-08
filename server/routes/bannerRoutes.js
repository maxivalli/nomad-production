const express = require("express");
const router = express.Router();
const bannerController = require("../controllers/bannerController");
const authenticateAdmin = require("../middleware/auth");
const { uploadBanner } = require("../config/cloudinary");

router.post(
  "/upload-media",
  authenticateAdmin,
  uploadBanner.single("media"),
  bannerController.uploadMedia
);
router.post("/", authenticateAdmin, bannerController.createBanner);
router.get("/all", authenticateAdmin, bannerController.getAllBanners);
router.get("/active", bannerController.getActiveBanner);
router.put("/:id", authenticateAdmin, bannerController.updateBanner);
router.delete("/:id", authenticateAdmin, bannerController.deleteBanner);

module.exports = router;
