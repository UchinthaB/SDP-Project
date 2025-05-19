// owner/EditEmployee.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./employeeManagement.css";

const EditEmployee = () => {
    const [formData, setFormData] = useState({
        contactNumber: "",
        description: ""
    });
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
    fetchEmployeeDetails();
    }, [id]);

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

    const fetchEmployeeDetails = async () => {
    try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/employees/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch employee details");
        }

        const data = await response.json();
        setEmployee(data);
        setFormData({
            contactNumber: data.contact_number || "",
            description: data.description || ""
        });
    } catch (err) {
        console.error("Error fetching employee details:", err);
        setError("Failed to load employee details. Please try again.");
    } finally {
        setLoading(false);
    }
};

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const response = await fetch(`http://localhost:5000/api/employees/update/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to update employee");
            }

            setSuccessMessage("Employee updated successfully!");
            
            // Navigate back to employee list after 2 seconds
            setTimeout(() => {
                navigate("/owner/employee-management");
            }, 2000);
        } catch (err) {
            console.error("Error updating employee:", err);
            setError(err.message || "An error occurred while updating the employee.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="employee-management-container">
                <div className="loading-spinner">Loading employee details...</div>
            </div>
        );
    }

    if (!employee && !loading) {
        return (
            <div className="employee-management-container">
                <div className="error-message">Employee not found. Please return to the employee list.</div>
                <button 
                    className="btn-secondary" 
                    onClick={() => navigate("/owner/employee-management")}
                >
                    Back to Employees
                </button>
            </div>
        );
    }

    return (
        <div className="employee-management-container">
            <div className="page-header">
                <h1>Edit Employee: {employee.username}</h1>
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
                        <label>Name:</label>
                        <div>{employee.username}</div>
                    </div>

                    <div className="form-group">
                        <label>Email:</label>
                        <div>{employee.email}</div>
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
                            disabled={saving}
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditEmployee;