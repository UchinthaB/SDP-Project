import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AddProduct.css";

const AddProduct = () => {
    const [productName, setProductName] = useState("");
    const [productDescription, setProductDescription] = useState("");
    const [productPrice, setProductPrice] = useState("");
    const [productImage, setProductImage] = useState(null);
    const [isAvailable, setIsAvailable] = useState(true);
    const [juiceBars, setJuiceBars] = useState([]);
    const [selectedJuiceBar, setSelectedJuiceBar] = useState(""); 
    const [user, setUser] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [errors, setErrors] = useState({
        productName: "",
        productPrice: ""
    });
    
    const navigate = useNavigate();

    useEffect(() => {
        const fetchJuiceBars = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/products/juicebars");
                if (!response.ok) throw new Error("Failed to fetch juice bars");
                const data = await response.json();
                console.log("Juice Bars: ", data);
                setJuiceBars(data);
            } catch (error) {
                console.error("Error fetching juice bars:", error);
            }
        };
        fetchJuiceBars();
    }, []);

    useEffect(() => {
        // Check if user is logged in and is an owner
        const userData = localStorage.getItem("user");
        if (!userData) {
            navigate("/");
            return;
        }

        const user = JSON.parse(userData);
        if (user.user.role !== "owner") {
            navigate("/");
            return;
        }

        setUser(user.user);
    }, [navigate]);

    const validateProductName = (name) => {
        if (!name.trim()) {
            return "Product name is required";
        } else if (/[^a-zA-Z\s]/.test(name)) {
            return "Product name should not contain numbers or special characters";
        }
        return "";
    };

    const validateProductPrice = (price) => {
        if (!price) {
            return "Product price is required";
        } else if (isNaN(price) || parseFloat(price) < 0) {
            return "Price must be a positive number";
        }
        return "";
    };

    const handleProductNameChange = (e) => {
        const value = e.target.value;
        setProductName(value);
        setErrors(prev => ({
            ...prev,
            productName: validateProductName(value)
        }));
    };

    const handleProductPriceChange = (e) => {
        const value = e.target.value;
        setProductPrice(value);
        setErrors(prev => ({
            ...prev,
            productPrice: validateProductPrice(value)
        }));
    };

    const validateForm = () => {
        const nameError = validateProductName(productName);
        const priceError = validateProductPrice(productPrice);
        
        setErrors({
            productName: nameError,
            productPrice: priceError
        });

        return !nameError && !priceError;
    };

    const handleProductManagement = () => {
        navigate("/owner/product-management");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        const formData = new FormData();
        formData.append("name", productName);
        formData.append("description", productDescription);
        formData.append("price", productPrice);
        formData.append("image", productImage);
        formData.append("isAvailable", isAvailable);
        formData.append("juicebarId", selectedJuiceBar);

        console.log("Selected Juice Bar ID:", selectedJuiceBar);
        try {
            const response = await fetch("http://localhost:5000/api/products/add", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: formData,
            });

            if (!response.ok) throw new Error("Failed to add product");
            const data = await response.json();
            console.log("Product added: ", data);
            setSuccessMessage("Product added successfully!");

            // Reset form fields
            setProductName("");
            setProductDescription("");
            setProductPrice("");
            setProductImage(null);
            setIsAvailable(true);
            setSelectedJuiceBar("");

            setTimeout(() => {
                navigate("/owner/product-management");
            }, 2000);
        } catch (error) {
            console.error("Error: ", error);
        }
    };

    const handleSelectChange = (e) => {
        setSelectedJuiceBar(e.target.value);
        console.log("Updated selectedJuiceBar:", e.target.value);
    };

    return (
        <div className="add-product-page">
            <div className="form-container">
                <h1>Add Product</h1>
                {successMessage && <p className="success-message">{successMessage}</p>}

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
                            placeholder="Enter product name"
                            className={errors.productName ? "is-invalid" : ""}
                        />
                        {errors.productName && (
                            <div className="invalid-feedback">{errors.productName}</div>
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
                            placeholder="Enter product description"
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label htmlFor="productPrice">Product Price</label>
                        <input
                            type="number"
                            id="productPrice"
                            name="productPrice"
                            value={productPrice}
                            onChange={handleProductPriceChange}
                            required
                            placeholder="Enter product price"
                            min="0"
                            step="0.01"
                            className={errors.productPrice ? "is-invalid" : ""}
                        />
                        {errors.productPrice && (
                            <div className="invalid-feedback">{errors.productPrice}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="juiceBar">Juice Bar</label>
                        <select
                            id="juiceBar"
                            name="juiceBar"
                            value={selectedJuiceBar}
                            onChange={handleSelectChange}
                            required
                        >
                            <option value="">Select a juice bar</option>
                            {juiceBars.map((juiceBar) => (
                                <option key={juiceBar.juice_bar_id} value={juiceBar.juice_bar_id}>
                                    {juiceBar.name} (ID: {juiceBar.juice_bar_id})
                                </option>
                            ))}
                        </select>
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

                    <div className="form-group">
                        <label htmlFor="productImage">Product Image</label>
                        <input
                            type="file"
                            id="productImage"
                            name="productImage"
                            accept="image/*"
                            onChange={(e) => setProductImage(e.target.files[0])}
                            required
                        />
                    </div>

                    <div className="form-buttons">
                        <button type="submit" className="submit-btn">Add Product</button>
                        <button
                            type="button"
                            className="back-btn"
                            onClick={handleProductManagement}
                        >
                            Back to Product Management
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProduct;