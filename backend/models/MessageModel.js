const db = require('../config/db');

exports.createMessage = async (customerId, name, email, message) => {
  const [result] = await db.execute(
    `INSERT INTO messages (customer_id, name, email, message, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [customerId, name, email, message]
  );
  return result;
};

exports.getAllMessages = async () => {
  const [rows] = await db.execute(
    `SELECT m.*, u.username as customer_name 
     FROM messages m 
     LEFT JOIN users u ON m.customer_id = u.user_id 
     ORDER BY m.created_at DESC`
  );
  return rows;
};

exports.getMessageById = async (messageId) => {
  const [rows] = await db.execute(
    `SELECT m.*, u.username as customer_name 
     FROM messages m 
     LEFT JOIN users u ON m.customer_id = u.user_id 
     WHERE m.message_id = ?`,
    [messageId]
  );
  return rows[0];
};

exports.updateMessageStatus = async (messageId, status) => {
  const [result] = await db.execute(
    `UPDATE messages SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE message_id = ?`,
    [status, messageId]
  );
  return result;
};