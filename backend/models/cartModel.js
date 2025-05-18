const db = require("../config/db"); // Your MySQL connection

const insertCartItem = (product_id, customer_id) => {
    const query = "INSERT INTO cart (product_id, customer_id ) VALUES (?, ? )";
    return db.execute(query, [product_id, customer_id]);
};
const getCartItems =async (customer_id) => {
    const [query] =await db.execute( `
        SELECT 
  cart.cart_id,
  cart.product_id,
  products.name,
  products.description,
  products.price,
  products.img_url
FROM cart
JOIN products ON cart.product_id = products.id
WHERE cart.customer_id = ?

    `, [customer_id]);
    return query;
};

const removeCartItem = (cart_id) => {
    console.log("Removing cart item with ID:", cart_id); // Add logging
    const query = "DELETE FROM cart WHERE cart_id = ?";
    return db.execute(query, [cart_id]);
};


module.exports = {
    insertCartItem,
    getCartItems,
    removeCartItem,
};