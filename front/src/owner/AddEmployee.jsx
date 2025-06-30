import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./employeeManagement.css";

const AddEmployee = () => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        contactNumber: "",
        description: ""
    });
    const [formErrors, setFormErrors] = useState({
        username: "",
        email: "",
        password: "",
        contactNumber: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const token = localStorage.getItem("token");
        
        if (!token || !user || user.user?.role !== "owner") {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/");
        }
    }, [navigate]);

    const validateField = (name, value) => {
        let error = "";
        
        switch (name) {
            case "username":
                if (!value.trim()) {
                    error = "Name is required";
                } else if (/[^a-zA-Z\s]/.test(value)) {
                    error = "Name should not contain numbers or special characters";
                }
                break;
            case "email":
                if (!value.trim()) {
                    error = "Email is required";
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    error = "Please enter a valid email address";
                }
                break;
            case "password":
                if (!value.trim()) {
                    error = "Password is required";
                } else if (value.length < 8) {
                    error = "Password must be at least 8 characters";
                }
                break;
            case "contactNumber":
                if (value && !/^[0-9+\- ]+$/.test(value)) {
                    error = "Contact number should only contain numbers and + - symbols";
                }
                break;
            default:
                break;
        }
        
        return error;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Validate the field as user types
        const error = validateField(name, value);
        
        setFormErrors(prev => ({
            ...prev,
            [name]: error
        }));
        
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };  
    
    const validateForm = () => {
        const errors = {};
        let isValid = true;
        
        // Validate all fields
        Object.keys(formData).forEach(key => {
            if (key !== "description") { // description is optional
                const error = validateField(key, formData[key]);
                if (error) {
                    errors[key] = error;
                    isValid = false;
                }
            }
        });
        
        setFormErrors(errors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setLoading(true);
        setError(null);

        try {
            const response = await fetch("http://localhost:5000/api/employees/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    throw new Error("Session expired. Please login again.");
                }
                throw new Error(data.message || `Error: ${response.statusText}`);
            }

            setSuccessMessage("Employee added successfully!");
            setFormData({
                username: "",
                email: "",
                password: "",
                contactNumber: "",
                description: ""
            });

            setTimeout(() => navigate("/owner/employee-management"), 2000);
        } catch (err) {
            console.error("Detailed error:", err);
            setError(err.message || "An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    }
    
    return (
        <div className="employee-management-container">
            <div className="page-header">
                <h1>Add New Employee</h1>
                <button 
                    className="btn-secondary" 
                    onClick={() => navigate("/owner/employee-management")}
                >
                    Back to Employees
                </button>
            </div>

            <div className="form-container">
                {successMessage && (
                    <div className="success-message">{successMessage}</div>
                )}

                {error && (
                    <div className="error-message">{error}</div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username" className="required-field">Name</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            className={`form-control ${formErrors.username ? "is-invalid" : ""}`}
                            value={formData.username}
                            onChange={handleChange}
                            required
                            placeholder="Employee's full name"
                        />
                        {formErrors.username && (
                            <div className="invalid-feedback">{formErrors.username}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="email" className="required-field">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className={`form-control ${formErrors.email ? "is-invalid" : ""}`}
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="employee@example.com"
                        />
                        {formErrors.email && (
                            <div className="invalid-feedback">{formErrors.email}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="required-field">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className={`form-control ${formErrors.password ? "is-invalid" : ""}`}
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Create a secure password (min 8 characters)"
                        />
                        {formErrors.password && (
                            <div className="invalid-feedback">{formErrors.password}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="contactNumber">Contact Number</label>
                        <input
                            type="tel"
                            id="contactNumber"
                            name="contactNumber"
                            className={`form-control ${formErrors.contactNumber ? "is-invalid" : ""}`}
                            value={formData.contactNumber}
                            onChange={handleChange}
                            placeholder="Phone number (optional)"
                        />
                        {formErrors.contactNumber && (
                            <div className="invalid-feedback">{formErrors.contactNumber}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            className="form-control"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Job role, responsibilities, or additional details (optional)"
                        ></textarea>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => navigate("/owner/employee-management")}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                        >
                            {loading ? "Adding..." : "Add Employee"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEmployee;