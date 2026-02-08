const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authenticateAdmin = require("../middleware/auth");
const { authLimiter } = require("../config/security");

router.post("/login", authLimiter, authController.login);
router.post("/logout", authController.logout);
router.get("/verify", authenticateAdmin, authController.verify);

module.exports = router;
