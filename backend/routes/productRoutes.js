const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { addProduct, getProducts, removeProduct, getJuiceBars, getProductDetail, updateProductDetails, } = require("../controllers/productController");
const authenticateToken = require("../middleware/authMiddleware");

// Configure Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

router.post("/add", upload.single("image"), addProduct);
router.get("/get", getProducts);
router.delete("/delete/:id", removeProduct);
router.get("/juicebars", getJuiceBars);
router.get("/:id", getProductDetail);
router.put("/update/:id", updateProductDetails);

module.exports = router;