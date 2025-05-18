const db = require('../config/db');

exports.createUser = async (username, email, hashedPassword, role) => {
  const [result] = await db.execute(
    `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`,
    [username, email, hashedPassword, role]
  );
  return result;
};

exports.findUserByEmail = async (email) => {
  const [rows] = await db.execute(`SELECT * FROM users WHERE email = ?`, [email]);
  return rows[0];
};
exports.updateLastLogin = async (userId) => {
  await db.execute(`UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?`, [userId]);
};