//const {insertCartItem }= require("../models/cartModel");
const { insertCartItem, getCartItems, removeCartItem } = require("../models/cartModel");

const addToCart = async (req, res) => {
    const { product_id, customer_id } = req.body;
    console.log("Add to Cart Request:", req.body);

    if (!product_id || !customer_id) {
        return res.status(400).json({ message: "Product ID and Customer ID are required" });
    }

    try {
        await insertCartItem(product_id, customer_id);
        res.status(200).json({ message: "Product added to cart" });
    } catch (err) {
        console.error("Cart Add Error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getCart = async (req, res) => {
    const { customer_id } = req.params;
    console.log("Get Cart Request:", req.params);
    
    if (!customer_id) {
        return res.status(400).json({ message: "Customer ID is required" });
    }

    try {
        const cartItems = await getCartItems(customer_id);
        res.status(200).json(cartItems);
    } catch (err) {
        console.error("Get Cart Error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

const removeFromCart = async (req, res) => {
  const cartItemId = req.params.id;  // ✅ Correct way
  console.log("Remove from cart request for item ID:", cartItemId);


    if (!cartItemId) {
        return res.status(400).json({ message: "Cart ID is required" });
    }

    try {
        await removeCartItem(cartItemId);
        console.log("Item successfully removed from cart:", cartItemId );
        res.status(200).json({ message: "Item removed from cart" });
    } catch (err) {
        console.error("Remove Cart Item Error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    addToCart,
    getCart,
    removeFromCart
};