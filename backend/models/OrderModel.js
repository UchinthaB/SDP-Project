const db = require("../config/db");

// Create a new order
const createOrder = async ({ customer_id, total_amount, payment_method, token_number, order_status = 'pending' }) => {
    // First, get the juice bar ID (using the first one for simplicity, this can be modified)
    const [juiceBars] = await db.execute('SELECT juice_bar_id FROM juice_bars LIMIT 1');
    const juice_bar_id = juiceBars[0].juice_bar_id;
    
    const [result] = await db.execute(
        `INSERT INTO orders (user_id, juice_bar_id, token_number,payment_method, status, total_amount) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [customer_id, juice_bar_id, token_number,payment_method, order_status, total_amount]
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
            'cash' AS payment_method
        FROM orders o
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
            o.token_number,
            o.total_amount,
            'cash' AS payment_method,
            o.status,
            o.created_at,
            o.completed_at
        FROM orders o
        WHERE o.order_id = ?
    `, [order_id]);
    
    if (orderRows.length === 0) {
        return null;
    }
    
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
const getPendingOrders = async () => {
    const [rows] = await db.execute(`
        SELECT 
            o.order_id,
            o.user_id AS customer_id,
            u.username AS customer_name,
            o.token_number,
            o.total_amount,
            'cash' AS payment_method,
            o.status ,
            o.created_at
        FROM orders o
        JOIN users u ON o.user_id = u.user_id
        WHERE o.status IN ('pending', 'processing', 'cancelled')
        ORDER BY 
            CASE 
                WHEN o.status = 'pending' THEN 0 
                WHEN o.status = 'processing' THEN 1
                WHEN o.status = 'cancelled' THEN 2

            END,
            o.created_at ASC
    `);
    
    return rows;
};

// Generate a unique token number
const generateTokenNumber = async () => {
    try {
        // Start transaction
        await db.execute('START TRANSACTION');
        
        // Get or create today's sequence
        const [result] = await db.execute(`
            INSERT INTO token_sequences (date, last_token) 
            VALUES (CURRENT_DATE, 1)
            ON DUPLICATE KEY UPDATE last_token = last_token + 1
        `);
        
        // Get the updated token
        const [rows] = await db.execute(`
            SELECT last_token FROM token_sequences
            WHERE date = CURRENT_DATE
        `);
        
        // Commit transaction
        await db.execute('COMMIT');
        
        return rows[0].last_token.toString();
    } catch (error) {
        await db.execute('ROLLBACK');
        console.error('Error generating token number:', error);
        return Date.now().toString();
    }
};

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


module.exports = {
    createOrder,
    addOrderItems,
    getCustomerOrders,
    getOrderById,
    updateOrderStatus,
    getPendingOrders,
    generateTokenNumber,
    cancelOrder,
    deleteOrder
    
};