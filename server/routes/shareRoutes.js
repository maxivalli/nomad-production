const express = require("express");
const router = express.Router();
const shareController = require("../controllers/shareController");

router.get("/:slug", shareController.shareProduct);

module.exports = router;
