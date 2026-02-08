const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const authenticateAdmin = require("../middleware/auth");

router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);
router.post("/", authenticateAdmin, productController.createProduct);
router.put("/:id", authenticateAdmin, productController.updateProduct);
router.delete("/:id", authenticateAdmin, productController.deleteProduct);

module.exports = router;
