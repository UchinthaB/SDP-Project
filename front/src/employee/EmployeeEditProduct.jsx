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
    const [user, setUser] = useState(null);
    const [formErrors, setFormErrors] = useState({
        productName: "",
        productPrice: ""
    });

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

    useEffect(() => {
        // Check if user is logged in and is an employee
        const userData = localStorage.getItem("user");
        if (!userData) {
          navigate("/");
          return;
        }
    
        const user = JSON.parse(userData);
        if (user.user.role !== "employee") {
          navigate("/");
          return;
        }
    
        setUser(user.user);
    }, [navigate]);

    const validateProductName = (name) => {
        if (!name.trim()) {
            return "Product name is required";
        } else if (/[^a-zA-Z\s]/.test(name)) {
            return "Product name should only contain letters and spaces";
        }
        return "";
    };

    const validateProductPrice = (price) => {
        if (!price) {
            return "Product price is required";
        } else if (isNaN(price) || parseFloat(price) <= 0) {
            return "Price must be a positive number";
        }
        return "";
    };

    const handleProductNameChange = (e) => {
        const value = e.target.value;
        setProductName(value);
        setFormErrors(prev => ({
            ...prev,
            productName: validateProductName(value)
        }));
    };

    const handleProductPriceChange = (e) => {
        const value = e.target.value;
        setProductPrice(value);
        setFormErrors(prev => ({
            ...prev,
            productPrice: validateProductPrice(value)
        }));
    };

    const validateForm = () => {
        const nameError = validateProductName(productName);
        const priceError = validateProductPrice(productPrice);
        
        setFormErrors({
            productName: nameError,
            productPrice: priceError
        });

        return !nameError && !priceError;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        
        if (!validateForm()) {
            return;
        }
        
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
            
            setTimeout(() => {
                navigate("/employee/product-management");
            }, 2000);
            
        } catch (err) {
            console.error("Error updating product:", err);
            setError(err.message || "An error occurred while updating the product");
        }
    };

    const handleCancel = () => {
        navigate("/employee/product-management");
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
                {error && <p className="error-message">{error}</p>}

                <form onSubmit={handleSubmit} className="product-form">
                    <div className="form-group">
                        <label htmlFor="productName">Product Name</label>
                        <input
                            type="text"
                            id="productName"
                            name="productName"
                            value={productName}
                            onChange={handleProductNameChange}
                            required
                            className={formErrors.productName ? "is-invalid" : ""}
                        />
                        {formErrors.productName && (
                            <div className="invalid-feedback">{formErrors.productName}</div>
                        )}
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
                            min="0.01"
                            value={productPrice}
                            onChange={handleProductPriceChange}
                            required
                            className={formErrors.productPrice ? "is-invalid" : ""}
                        />
                        {formErrors.productPrice && (
                            <div className="invalid-feedback">{formErrors.productPrice}</div>
                        )}
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