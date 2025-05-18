const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const authenticateToken = require("../middleware/authMiddleware");

// const verifyToken = (req, res, next) => {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];
  
//   if (!token) {
//     return res.status(401).json({ message: 'No token provided' });
//   }

//   jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//     if (err) {
//       return res.status(401).json({ message: 'Invalid token' });
//     }
//     req.user = decoded;
//     next();
//   });
// };


// Create a new order (requires authentication)
router.post("/create", authenticateToken, orderController.createOrder);

// Get orders for a customer (requires authentication)
router.get("/customer/:customer_id", authenticateToken, orderController.getCustomerOrders);

// Get order details (requires authentication)
router.get("/:order_id", authenticateToken, orderController.getOrderDetails);

// Update order status (requires authentication)
router.put("/:order_id/status", authenticateToken, orderController.updateOrderStatus);

// Get pending orders for juice bar owner (requires authentication)
router.get("/pending/list", authenticateToken, orderController.getPendingOrders);

router.delete("/:order_id/cancel", authenticateToken, orderController.cancelOrder);

router.delete("/:order_id/delete", authenticateToken, orderController.deleteOrder);
module.exports = router;