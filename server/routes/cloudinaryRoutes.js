const express = require("express");
const router = express.Router();
const settingsController = require("../controllers/settingsController");
const authenticateAdmin = require("../middleware/auth");

router.post("/signature", authenticateAdmin, settingsController.getCloudinaryConfig);

module.exports = router;
