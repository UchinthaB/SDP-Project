import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./EditProduct.css";

const EditProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [productName, setProductName] = useState("");
    const [productDescription, setProductDescription] = useState("");
    const [productPrice, setProductPrice] = useState("");
    const [isAvailable, setIsAvailable] = useState(true);
    const [juiceBarId, setJuiceBarId] = useState("");
    const [juiceBarName, setJuiceBarName] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                setLoading(true);
                const response = await fetch(`http://localhost:5000/api/products/${id}`);
                
                if (!response.ok) {
                    throw new Error("Failed to fetch product details");
                }
                
                const product = await response.json();
                
                setProductName(product.name);
                setProductDescription(product.description);
                setProductPrice(product.price);
                setIsAvailable(product.is_available === 1);
                setJuiceBarId(product.juice_bar_id);
                setJuiceBarName(product.juice_bar_name);
                
            } catch (err) {
                console.error("Error fetching product details:", err);
                setError("Failed to load product details. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProductDetails();
        }
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        
        try {
            const response = await fetch(`http://localhost:5000/api/products/update/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    name: productName,
                    description: productDescription,
                    price: productPrice,
                    isAvailable: isAvailable
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update product");
            }

            setSuccessMessage("Product updated successfully!");
            
            // Redirect after a short delay
            setTimeout(() => {
                navigate("/owner/product-management");
            }, 2000);
            
        } catch (err) {
            console.error("Error updating product:", err);
            setError(err.message || "An error occurred while updating the product");
        }
    };

    const handleCancel = () => {
        navigate("/owner/product-management");
    };

    if (loading) {
        return <div className="loading-container">Loading product details...</div>;
    }

    if (error && !loading) {
        return (
            <div className="error-container">
                <p className="error-message">{error}</p>
                <button onClick={handleCancel} className="back-btn">
                    Back to Product Management
                </button>
            </div>
        );
    }

    return (
        <div className="edit-product-page">
            <div className="form-container">
                <h1>Edit Product</h1>
                {successMessage && <p className="success-message">{successMessage}</p>}

                <form onSubmit={handleSubmit} className="product-form">
                    <div className="form-group">
                        <label htmlFor="productName">Product Name</label>
                        <input
                            type="text"
                            id="productName"
                            name="productName"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="productDescription">Product Description</label>
                        <textarea
                            id="productDescription"
                            name="productDescription"
                            value={productDescription}
                            onChange={(e) => setProductDescription(e.target.value)}
                            required
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label htmlFor="productPrice">Product Price</label>
                        <input
                            type="number"
                            id="productPrice"
                            name="productPrice"
                            step="0.01"
                            value={productPrice}
                            onChange={(e) => setProductPrice(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group juice-bar-info">
                        <label>Juice Bar:</label>
                        <span>{juiceBarName}</span>
                        <p className="note">Note: The juice bar cannot be changed. If you need to move this product to another juice bar, please delete it and create a new one.</p>
                    </div>

                    <div className="form-group checkbox-group">
                        <input
                            type="checkbox"
                            id="isAvailable"
                            name="isAvailable"
                            checked={isAvailable}
                            onChange={(e) => setIsAvailable(e.target.checked)}
                        />
                        <label htmlFor="isAvailable">Available</label>
                    </div>

                    <div className="form-buttons">
                        <button type="submit" className="submit-btn">
                            Save Changes
                        </button>
                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={handleCancel}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProduct;