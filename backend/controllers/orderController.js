const jwt = require('jsonwebtoken');
const db = require('../config/db'); // Using your existing db configuration
require('dotenv').config();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = decoded;
    next();
  });
};

// Create a new order
const createOrder = async (req, res) => {
    try {
        const { customer_id, total_amount, payment_method, items, juice_bar_id = null } = req.body;
        
        // Verify the requesting user matches the customer_id
        if (req.user.user_id !== parseInt(customer_id)) {
            return res.status(403).json({ message: "Unauthorized to create order for this customer" });
        }
        
        if (!customer_id || !total_amount || !payment_method || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Invalid order data. Please check all required fields." });
        }
        
        // Determine juice bar ID from first product if not specified
        let selectedJuiceBarId = juice_bar_id;
        if (!selectedJuiceBarId && items.length > 0) {
            // Try to get juice bar ID from the first product
            const [productRows] = await db.execute(
                `SELECT juice_bar_id FROM products WHERE id = ?`,
                [items[0].product_id]
            );
            
            if (productRows.length > 0) {
                selectedJuiceBarId = productRows[0].juice_bar_id;
            }
        }
        
        // If still no juice bar ID, use the first one in the database
        if (!selectedJuiceBarId) {
            const [juiceBars] = await db.execute('SELECT juice_bar_id FROM juice_bars LIMIT 1');
            selectedJuiceBarId = juiceBars[0].juice_bar_id;
        }
        
        // Get the max token number for today
        const [tokenRows] = await db.execute(`
            SELECT MAX(token_number) AS max_token 
            FROM orders 
            WHERE DATE(created_at) = CURRENT_DATE
        `);
        const token_number = (tokenRows[0].max_token || 0) + 1;
        
        // Create order header
        const [result] = await db.execute(
            `INSERT INTO orders (user_id, juice_bar_id, token_number, payment_method, status, total_amount) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [customer_id, selectedJuiceBarId, token_number, payment_method, 'pending', total_amount]
        );
        
        const order_id = result.insertId;
        
        // Add order items
        const values = items.map(item => [
            order_id,
            item.product_id,
            item.quantity || 1,
            item.price,
            (item.quantity || 1) * item.price
        ]);
        
        const placeholders = items.map(() => '(?, ?, ?, ?, ?)').join(',');
        
        await db.execute(
            `INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal) 
             VALUES ${placeholders}`,
            values.flat()
        );
        
        // Fetch the complete order with items
        const [orderRows] = await db.execute(`
            SELECT 
                o.order_id,
                o.user_id AS customer_id,
                o.juice_bar_id,
                o.token_number,
                o.total_amount,
                o.payment_method,
                o.status,
                o.created_at,
                o.completed_at
            FROM orders o
            WHERE o.order_id = ?
        `, [order_id]);
        
        const [itemRows] = await db.execute(`
            SELECT 
                oi.order_item_id,
                oi.product_id,
                p.name AS product_name,
                oi.quantity,
                oi.unit_price,
                oi.subtotal
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        `, [order_id]);
        
        const order = {
            ...orderRows[0],
            items: itemRows
        };
        
        res.status(201).json({
            message: "Order created successfully",
            order_id,
            token_number,
            order
        });
    } catch (err) {
        console.error("Error creating order:", err);
        res.status(500).json({ message: "Server error while creating order" });
    }
};

// Get orders for a customer
const getCustomerOrders = async (req, res) => {
    try {
        const { customer_id } = req.params;
        
        if (!customer_id) {
            return res.status(400).json({ message: "Customer ID is required" });
        }
        
        // Verify the requesting user matches the customer_id
        if (req.user.user_id !== parseInt(customer_id) && req.user.role !== 'admin' && req.user.role !== 'owner') {
            return res.status(403).json({ message: "Unauthorized to view these orders" });
        }
        
        const [rows] = await db.execute(`
            SELECT 
                o.order_id,
                o.token_number,
                o.total_amount,
                o.status,
                o.created_at,
                o.completed_at,
                o.payment_method,
                o.juice_bar_id
            FROM orders o
            WHERE o.user_id = ?
            ORDER BY o.created_at DESC
        `, [customer_id]);
        
        res.status(200).json(rows);
    } catch (err) {
        console.error("Error fetching customer orders:", err);
        res.status(500).json({ message: "Server error while fetching orders" });
    }
};

// Get order details
const getOrderDetails = async (req, res) => {
    try {
        const { order_id } = req.params;
        
        if (!order_id) {
            return res.status(400).json({ message: "Order ID is required" });
        }
        
        const [orderRows] = await db.execute(`
            SELECT 
                o.order_id,
                o.user_id AS customer_id,
                o.juice_bar_id,
                o.token_number,
                o.total_amount,
                o.payment_method,
                o.status,
                o.created_at,
                o.completed_at
            FROM orders o
            WHERE o.order_id = ?
        `, [order_id]);
        
        if (orderRows.length === 0) {
            return res.status(404).json({ message: "Order not found" });
        }
        
        // Verify the requesting user owns the order or is admin/owner/employee
        if (req.user.user_id !== orderRows[0].customer_id && 
            req.user.role !== 'admin' && 
            req.user.role !== 'owner' && 
            req.user.role !== 'employee') {
            return res.status(403).json({ message: "Unauthorized to view this order" });
        }
        
        // Get customer name and email
        const [customerRows] = await db.execute(`
            SELECT username as customer_name, email as customer_email
            FROM users
            WHERE user_id = ?
        `, [orderRows[0].customer_id]);
        
        const [itemRows] = await db.execute(`
            SELECT 
                oi.order_item_id,
                oi.product_id,
                p.name AS product_name,
                oi.quantity,
                oi.unit_price,
                oi.subtotal
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        `, [order_id]);
        
        const order = {
            ...orderRows[0],
            customer_name: customerRows.length > 0 ? customerRows[0].customer_name : 'Unknown',
            customer_email: customerRows.length > 0 ? customerRows[0].customer_email : 'Unknown',
            items: itemRows
        };
        
        res.status(200).json(order);
    } catch (err) {
        console.error("Error fetching order details:", err);
        res.status(500).json({ message: "Server error while fetching order details" });
    }
};

// Update order status
const updateOrderStatus = async (req, res) => {
    try {
        const { order_id } = req.params;
        const { status } = req.body;
        
        if (!order_id || !status) {
            return res.status(400).json({ message: "Order ID and status are required" });
        }
        
        // Only admin, owner or employee can update order status
        if (req.user.role === 'customer') {
            return res.status(403).json({ message: "Unauthorized to update order status" });
        }
        
        // Validate status value
        const validStatuses = ['pending', 'processing', 'ready', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }
        
        let query = `UPDATE orders SET status = ? WHERE order_id = ?`;
        let params = [status, order_id];
        
        // If status is 'completed', update completed_at timestamp
        if (status === 'completed') {
            query = `UPDATE orders SET status = ?, completed_at = NOW() WHERE order_id = ?`;
        }
        
        const [result] = await db.execute(query, params);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Order not found or status not updated" });
        }
        
        res.status(200).json({ message: "Order status updated successfully" });
    } catch (err) {
        console.error("Error updating order status:", err);
        res.status(500).json({ message: "Server error while updating order status" });
    }
};

// Get pending orders for juice bar owner/employee
const getPendingOrders = async (req, res) => {
    try {
        // Only admin, owner or employee can view pending orders
        if (req.user.role === 'customer') {
            return res.status(403).json({ message: "Unauthorized to view pending orders" });
        }
        
        const [rows] = await db.execute(`
            SELECT 
                o.order_id,
                o.user_id AS customer_id,
                u.username AS customer_name,
                o.juice_bar_id,
                o.token_number,
                o.total_amount,
                o.payment_method,
                o.status,
                o.created_at
            FROM orders o
            JOIN users u ON o.user_id = u.user_id
            WHERE o.status IN ('pending', 'processing', 'ready')
            ORDER BY 
                CASE 
                    WHEN o.status = 'pending' THEN 0 
                    WHEN o.status = 'processing' THEN 1
                    WHEN o.status = 'ready' THEN 2
                END,
                o.created_at ASC
        `);
        
        res.status(200).json(rows);
    } catch (err) {
        console.error("Error fetching pending orders:", err);
        res.status(500).json({ message: "Server error while fetching pending orders" });
    }
};

const cancelOrder = async (req, res) => {
    try {
        const { order_id } = req.params;
        
        if (!order_id) {
            return res.status(400).json({ message: "Order ID is required" });
        }
        
        // First get the order to verify ownership
        const [orderRows] = await db.execute(
            'SELECT user_id, status FROM orders WHERE order_id = ?',
            [order_id]
        );
        
        if (orderRows.length === 0) {
            return res.status(404).json({ message: "Order not found" });
        }
        
        // Verify the requesting user owns the order or is admin/owner
        if (req.user.user_id !== orderRows[0].user_id && 
            req.user.role !== 'admin' && 
            req.user.role !== 'owner') {
            return res.status(403).json({ message: "Unauthorized to cancel this order" });
        }
        
        // Check if order can be cancelled (only pending or processing orders)
        const currentStatus = orderRows[0].status;
        if (['completed', 'cancelled', 'ready'].includes(currentStatus)) {
            return res.status(400).json({ 
                message: `Order cannot be cancelled as it's already ${currentStatus}`
            });
        }
        
        // Cancel the order
        const [result] = await db.execute(
            'UPDATE orders SET status = "cancelled", completed_at = NOW() WHERE order_id = ?',
            [order_id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(400).json({ message: "Order could not be cancelled" });
        }
        
        res.status(200).json({ message: "Order cancelled successfully" });
    } catch (err) {
        console.error("Error cancelling order:", err);
        res.status(500).json({ message: "Server error while cancelling order" });
    }
};

const deleteOrder = async (req, res) => {
    try {
        const { order_id } = req.params;
        
        if (!order_id) {
            return res.status(400).json({ message: "Order ID is required" });
        }
        
        // Only admin or owner can delete orders
        if (req.user.role !== 'admin' && req.user.role !== 'owner') {
            return res.status(403).json({ message: "Unauthorized to delete orders" });
        }
        
        // First check if order is cancelled
        const [orderRows] = await db.execute(
            'SELECT status FROM orders WHERE order_id = ?',
            [order_id]
        );
        
        if (orderRows.length === 0) {
            return res.status(404).json({ message: "Order not found" });
        }
        
        if (orderRows[0].status !== 'cancelled') {
            return res.status(400).json({ 
                message: "Only cancelled orders can be deleted" 
            });
        }
        
        // Delete order items first to maintain referential integrity
        await db.execute(
            'DELETE FROM order_items WHERE order_id = ?',
            [order_id]
        );
        
        // Then delete the order
        const [result] = await db.execute(
            'DELETE FROM orders WHERE order_id = ?',
            [order_id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(400).json({ message: "Order could not be deleted" });
        }
        
        res.status(200).json({ message: "Order deleted successfully" });
    } catch (err) {
        console.error("Error deleting order:", err);
        res.status(500).json({ message: "Server error while deleting order" });
    }
};



module.exports = {
    verifyToken,
    createOrder,
    getCustomerOrders,
    getOrderDetails,
    updateOrderStatus,
    getPendingOrders,
    cancelOrder,
    deleteOrder
};