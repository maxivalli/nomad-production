const express = require("express");
const router = express.Router();
const settingsController = require("../controllers/settingsController");
const authenticateAdmin = require("../middleware/auth");

// Launch date
router.get("/launch-date", settingsController.getLaunchDate);
router.post("/launch-date", authenticateAdmin, settingsController.setLaunchDate);

// Collection
router.get("/collection", settingsController.getCollection);
router.put("/collection", authenticateAdmin, settingsController.updateCollection);

module.exports = router;
