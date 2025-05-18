const db = require('./db');

async function initDatabase() {
    try {
        // Create cart table if it doesn't exist
        await db.execute(`
            CREATE TABLE IF NOT EXISTS cart (
                id INT PRIMARY KEY AUTO_INCREMENT,
                product_id INT NOT NULL,
                customer_id INT NOT NULL,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        
        console.log('Database tables initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
    } finally {
        process.exit();
    }
}

initDatabase();
