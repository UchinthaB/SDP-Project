const db = require("../config/db");

const createProduct = async ({ 
    name, 
    description, 
    price, 
    imageUrl = [], 
    isAvailable = true,
    juicebarId 
}) => {
    if (typeof juicebarId !== 'number' || isNaN(juicebarId)) {
        throw new Error(`Invalid juicebarId: ${juicebarId} (type: ${typeof juicebarId})`);
    }

    const sql = `INSERT INTO products 
        (name, description, price, img_url, is_available, juice_bar_id) 
        VALUES (?, ?, ?, ?, ?, ?)`;
    const values = [
        name,
        description,
        parseFloat(price),
        imageUrl.length > 0 ? JSON.stringify(imageUrl) : null,
        Boolean(isAvailable),
        juicebarId
    ];

    try {
        const [result] = await db.execute(sql, values);
        return result.insertId;
    } catch (err) {
        console.error("Database error details:", {
            sql,
            values,
            error: err
        });
        throw err;
    }
};

const getAllProducts = async () => {
    const [rows] = await db.execute(`
        SELECT 
            p.id,
            p.name,
            p.price,
            p.description,
            p.img_url,
            p.is_available,
            p.juice_bar_id,
            j.name AS juice_bar_name
        FROM products p
        LEFT JOIN juice_bars j ON p.juice_bar_id = j.juice_bar_id
    `);
    return rows;
};

const getProductsByJuiceBar = async (juicebarId) => {
    const [rows] = await db.execute(`
        SELECT 
            p.id,
            p.name,
            p.price,
            p.description,
            p.img_url,
            p.is_available,
            p.juice_bar_id,
            j.name AS juice_bar_name
        FROM products p
        LEFT JOIN juice_bars j ON p.juice_bar_id = j.juice_bar_id
        WHERE p.juice_bar_id = ?
    `, [juicebarId]);
    return rows;
};
const deleteProduct = async (productId) => {
    const sql = `DELETE FROM products WHERE id = ?`;
    await db.execute(sql, [productId]);
};

const getAllJuiceBars = async () => {
    const [rows] = await db.execute("SELECT * FROM juice_bars");
    return rows;
};

const getProductById = async (productId) => {
    const [rows] = await db.execute(`
        SELECT 
            p.id,
            p.name,
            p.price,
            p.description,
            p.img_url,
            p.is_available,
            p.juice_bar_id,
            j.name AS juice_bar_name
        FROM products p
        LEFT JOIN juice_bars j ON p.juice_bar_id = j.juice_bar_id
        WHERE p.id = ?
    `, [productId]);
    
    if (rows.length === 0) {
        return null;
    }
    
    return rows[0];
};

const updateProduct = async (productId, { name, description, price, isAvailable }) => {
    const sql = `
        UPDATE products 
        SET 
            name = ?,
            description = ?,
            price = ?,
            is_available = ?
        WHERE id = ?
    `;
    
    const values = [
        name,
        description,
        parseFloat(price),
        isAvailable ? 1 : 0,
        productId
    ];
    
    try {
        const [result] = await db.execute(sql, values);
        return result.affectedRows > 0;
    } catch (err) {
        console.error("Database error details:", {
            sql,
            values,
            error: err
        });
        throw err;
    }
};


module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    getProductsByJuiceBar,
    deleteProduct,
    getAllJuiceBars,
};