const db = require("../config/db");

// Create a new order
const createOrder = async ({ customer_id, total_amount, payment_method, token_number, juice_bar_id, order_status = 'pending' }) => {
    // Use the provided juice_bar_id or get the first one if not provided
    let selectedJuiceBarId = juice_bar_id;
    if (!selectedJuiceBarId) {
        const [juiceBars] = await db.execute('SELECT juice_bar_id FROM juice_bars LIMIT 1');
        selectedJuiceBarId = juiceBars[0].juice_bar_id;
    }
    
    const [result] = await db.execute(
        `INSERT INTO orders (user_id, juice_bar_id, token_number, payment_method, status, total_amount) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [customer_id, selectedJuiceBarId, token_number, payment_method, order_status, total_amount]
    );
    
    return result.insertId;
};

// Add order items
const addOrderItems = async (order_id, items) => {
    const values = items.map(item => [
        order_id,
        item.product_id,
        item.quantity,
        item.price,
        item.quantity * item.price
    ]);
    
    const placeholders = items.map(() => '(?, ?, ?, ?, ?)').join(',');
    
    const [result] = await db.execute(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal) 
         VALUES ${placeholders}`,
        values.flat()
    );
    
    return result.affectedRows;
};

// Get orders for a customer
const getCustomerOrders = async (customer_id) => {
    const [rows] = await db.execute(`
        SELECT 
            o.order_id,
            o.token_number,
            o.total_amount,
            o.status,
            o.created_at,
            o.completed_at,
            o.payment_method,
            o.juice_bar_id,
            j.name AS juice_bar_name
        FROM orders o
        LEFT JOIN juice_bars j ON o.juice_bar_id = j.juice_bar_id
        WHERE o.user_id = ?
        ORDER BY o.created_at DESC
    `, [customer_id]);
    
    return rows;
};

// Get order details by order ID
const getOrderById = async (order_id) => {
    // Get order header
    const [orderRows] = await db.execute(`
        SELECT 
            o.order_id,
            o.user_id AS customer_id,
            o.juice_bar_id,
            j.name AS juice_bar_name,
            o.token_number,
            o.total_amount,
            o.payment_method,
            o.status,
            o.created_at,
            o.completed_at
        FROM orders o
        LEFT JOIN juice_bars j ON o.juice_bar_id = j.juice_bar_id
        WHERE o.order_id = ?
    `, [order_id]);
    
    if (orderRows.length === 0) {
        return null;
    }
    
    // Get customer info
    const [customerRows] = await db.execute(`
        SELECT username, email
        FROM users
        WHERE user_id = ?
    `, [orderRows[0].customer_id]);
    
    // Get order items
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
    
    return {
        ...orderRows[0],
        customer_name: customerRows.length > 0 ? customerRows[0].username : 'Unknown',
        customer_email: customerRows.length > 0 ? customerRows[0].email : 'Unknown',
        items: itemRows
    };
};

// Update order status
const updateOrderStatus = async (order_id, order_status) => {
    let query = `UPDATE orders SET status = ? WHERE order_id = ?`;
    let params = [order_status, order_id];
    
    // If status is 'completed', update completed_at timestamp
    if (order_status === 'completed') {
        query = `UPDATE orders SET status = ?, completed_at = NOW() WHERE order_id = ?`;
    }
    
    const [result] = await db.execute(query, params);
    
    return result.affectedRows > 0;
};

// Get orders for juice bar owner to process (pending orders first)
const getPendingOrders = async (juice_bar_id = null) => {
    let query = `
        SELECT 
            o.order_id,
            o.user_id AS customer_id,
            u.username AS customer_name,
            o.juice_bar_id,
            j.name AS juice_bar_name,
            o.token_number,
            o.total_amount,
            o.payment_method,
            o.status,
            o.created_at
        FROM orders o
        JOIN users u ON o.user_id = u.user_id
        LEFT JOIN juice_bars j ON o.juice_bar_id = j.juice_bar_id
        WHERE o.status IN ('pending', 'processing', 'ready')
    `;
    
    const params = [];
    
    // If a specific juice bar is requested, filter for that
    if (juice_bar_id) {
        query += ` AND o.juice_bar_id = ?`;
        params.push(juice_bar_id);
    }
    
    query += `
        ORDER BY 
            CASE 
                WHEN o.status = 'pending' THEN 0 
                WHEN o.status = 'processing' THEN 1
                WHEN o.status = 'ready' THEN 2
            END,
            o.created_at ASC
    `;
    
    const [rows] = await db.execute(query, params);
    
    return rows;
};

// Generate a unique token number
const generateTokenNumber = async () => {
    // Get the max token number from the current day
    const [rows] = await db.execute(`
        SELECT MAX(token_number) AS max_token
        FROM orders
        WHERE DATE(created_at) = CURRENT_DATE
    `);
    
    let maxToken = rows[0].max_token || 0;
    
    // If it's a string, convert to number
    if (typeof maxToken === 'string') {
        maxToken = parseInt(maxToken, 10) || 0;
    }
    
    // Increment by 1 for the new token
    return (maxToken + 1).toString();
};

// Cancel an order
const cancelOrder = async (orderId) => {
    const sql = `UPDATE orders SET status = 'cancelled', completed_at = NOW() WHERE order_id = ?`;
    
    try {
        const [result] = await db.execute(sql, [orderId]);
        return result.affectedRows > 0;
    } catch (err) {
        console.error("Database error cancelling order:", err);
        throw err;
    }
};

// Delete an order
const deleteOrder = async (orderId) => {
    try {
        // First delete order items
        await db.execute('DELETE FROM order_items WHERE order_id = ?', [orderId]);
        
        // Then delete the order
        const [result] = await db.execute('DELETE FROM orders WHERE order_id = ?', [orderId]);
        
        return result.affectedRows > 0;
    } catch (err) {
        console.error("Database error deleting order:", err);
        throw err;
    }
};

// Get orders by juice bar
const getOrdersByJuiceBar = async (juice_bar_id) => {
    const [rows] = await db.execute(`
        SELECT 
            o.order_id,
            o.user_id AS customer_id,
            u.username AS customer_name,
            o.juice_bar_id,
            j.name AS juice_bar_name,
            o.token_number,
            o.total_amount,
            o.payment_method,
            o.status,
            o.created_at,
            o.completed_at
        FROM orders o
        JOIN users u ON o.user_id = u.user_id
        LEFT JOIN juice_bars j ON o.juice_bar_id = j.juice_bar_id
        WHERE o.juice_bar_id = ?
        ORDER BY o.created_at DESC
    `, [juice_bar_id]);
    
    return rows;
};

module.exports = {
    createOrder,
    addOrderItems,
    getCustomerOrders,
    getOrderById,
    updateOrderStatus,
    getPendingOrders,
    generateTokenNumber,
    cancelOrder,
    deleteOrder,
    getOrdersByJuiceBar
};