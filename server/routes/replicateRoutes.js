const express = require("express");
const router = express.Router();
const replicateController = require("../controllers/replicateController");
const authenticateAdmin = require("../middleware/auth");

router.post("/predictions", authenticateAdmin, replicateController.createPrediction);
router.get("/predictions/:id", authenticateAdmin, replicateController.getPrediction);

module.exports = router;
