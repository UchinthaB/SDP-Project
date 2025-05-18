// models/EmployeeModel.js
const db = require("../config/db");
const bcrypt = require("bcrypt");

exports.createEmployee = async (userData) => {
    const { username, email, password, contactNumber, description } = userData;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await db.execute(
        `INSERT INTO users (username, email, password, role, contact_number, description) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [username, email, hashedPassword, 'employee', contactNumber || null, description || null]
    );
    
    return result.insertId;
};

exports.getAllEmployees = async () => {
    const [rows] = await db.execute(`
        SELECT user_id, username, email, contact_number, description, created_at, last_login
        FROM users
        WHERE role = 'employee'
        ORDER BY created_at DESC
    `);
    return rows;
};

exports.getEmployeeById = async (employeeId) => {
    const [rows] = await db.execute(`
        SELECT user_id, username, email, contact_number, description, created_at, last_login
        FROM users
        WHERE user_id = ? AND role = 'employee'
    `, [employeeId]);
    
    if (rows.length === 0) {
        return null;
    }
    
    return rows[0];
};

exports.updateEmployeeDetails = async (employeeId, contactNumber, description) => {
    const [result] = await db.execute(`
        UPDATE users 
        SET contact_number = ?, description = ?
        WHERE user_id = ? AND role = 'employee'
    `, [contactNumber, description, employeeId]);
    
    return result.affectedRows > 0;
};

exports.deleteEmployee = async (employeeId) => {
    const [result] = await db.execute(`
        DELETE FROM users
        WHERE user_id = ? AND role = 'employee'
    `, [employeeId]);
    
    return result.affectedRows > 0;
};

exports.getCustomerByEmail = async (email) => {
    const [rows] = await db.execute(`
        SELECT user_id, username, email
        FROM users
        WHERE email = ? AND role = 'customer'
    `, [email]);
    
    if (rows.length === 0) {
        return null;
    }
    
    return rows[0];
};

exports.getCustomerById = async (customerId) => {
    const [rows] = await db.execute(`
        SELECT user_id, username, email
        FROM users
        WHERE user_id = ? AND role = 'customer'
    `, [customerId]);
    
    if (rows.length === 0) {
        return null;
    }
    
    return rows[0];
};

exports.getOrderById = async (orderId) => {
    const [rows] = await db.execute(`
        SELECT o.order_id, o.user_id, o.token_number, o.status, 
               o.total_amount, o.created_at, u.username, u.email
        FROM orders o
        JOIN users u ON o.user_id = u.user_id
        WHERE o.order_id = ?
    `, [orderId]);
    
    if (rows.length === 0) {
        return null;
    }
    
    return rows[0];
};

exports.updateOrderStatus = async (orderId, status) => {
    const [result] = await db.execute(`
        UPDATE orders 
        SET status = ?
        WHERE order_id = ?
    `, [status, orderId]);
    
    return result.affectedRows > 0;
};