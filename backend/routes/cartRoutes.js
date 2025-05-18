const express = require("express");
const router = express.Router();
const {addToCart, getCart,  removeFromCart  }= require("../controllers/cartController");

router.post("/add", addToCart);
router.get("/:customer_id", getCart);
router.delete("/remove/:id", removeFromCart);

module.exports = router;
