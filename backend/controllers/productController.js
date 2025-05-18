const { createProduct, getAllProducts, deleteProduct, getAllJuiceBars, getProductsByJuiceBar, getProductById,
    updateProduct} = require("../models/ProductModel");

const addProduct = async (req, res) => {
    const { name, description, price, isAvailable, juicebarId } = req.body;
    
    let imageUrl = null;
    if (req.file) {
        imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }

    const juicebarIdNum = parseInt(juicebarId);
    if (isNaN(juicebarIdNum)) {
        return res.status(400).json({ 
            message: "juicebarId must be a valid number",
            receivedValue: juicebarId
        });
    }

    try {
        const result = await createProduct({ 
            name, 
            description, 
            price, 
            imageUrl: [imageUrl],
            isAvailable: isAvailable === 'true',
            juicebarId: juicebarIdNum
        });
        res.status(201).json({ message: "Product created", productId: result });
    } catch (err) {
        console.error("Error inserting product:", err);
        res.status(500).json({ 
            message: "Database error",
            error: err.message
        });
    }
};

const getProducts = async (req, res) => {
    try {
        const juicebarId = req.query.juicebarId;
        let products;
        
        if (juicebarId) {
            const idNum = parseInt(juicebarId);
            if (isNaN(idNum)) {
                return res.status(400).json({ message: "Invalid juicebarId" });
            }
            products = await getProductsByJuiceBar(idNum);
        } else {
            products = await getAllProducts();
        }
        
        res.status(200).json(products);
    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).json({ message: "Database error" });
    }
};


const removeProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await deleteProduct(id);
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (err) {
        console.error("Error deleting product:", err);
        res.status(500).json({ message: "Failed to delete product" });
    }
};

const getJuiceBars = async (req, res) => {
    try {
        const juiceBars = await getAllJuiceBars();
        res.status(200).json(juiceBars);
    } catch (err) {
        console.error("Error fetching juice bars:", err);
        res.status(500).json({ message: "Database error" });
    }
};

const getProductDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await getProductById(id);
        
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        
        res.status(200).json(product);
    } catch (err) {
        console.error("Error fetching product detail:", err);
        res.status(500).json({ message: "Database error" });
    }
};

const updateProductDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, isAvailable } = req.body;
        
        // First check if the product exists
        const product = await getProductById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        
        // Update the product
        const success = await updateProduct(id, { 
            name, 
            description, 
            price, 
            isAvailable: typeof isAvailable === 'boolean' ? isAvailable : isAvailable === 'true' 
        });
        
        if (success) {
            res.status(200).json({ message: "Product updated successfully" });
        } else {
            res.status(400).json({ message: "Failed to update product" });
        }
    } catch (err) {
        console.error("Error updating product:", err);
        res.status(500).json({ 
            message: "Database error",
            error: err.message
        });
    }
}

module.exports = {
    addProduct,
    getProducts,
    removeProduct, 
    getJuiceBars,
    getProductsByJuiceBar,
    getProductDetail,
    updateProductDetails,

};