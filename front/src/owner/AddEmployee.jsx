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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    // Add authentication check
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const token = localStorage.getItem("token");
        
        if (!token || !user || user.user?.role !== "owner") {
            // If not logged in or not an owner, redirect to login
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/");
        }
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };  
    
const handleSubmit = async (e) => {
    e.preventDefault();
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
            // Handle specific error cases
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                throw new Error("Session expired. Please login again.");
            }
            throw new Error(data.message || `Error: ${response.statusText}`);
        }

        setSuccessMessage("Employee added successfully!");
        // Reset form
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
                            className="form-control"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            placeholder="Employee's full name"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email" className="required-field">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="form-control"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="employee@example.com"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="required-field">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="form-control"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Create a secure password"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="contactNumber">Contact Number</label>
                        <input
                            type="tel"
                            id="contactNumber"
                            name="contactNumber"
                            className="form-control"
                            value={formData.contactNumber}
                            onChange={handleChange}
                            placeholder="Phone number (optional)"
                        />
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