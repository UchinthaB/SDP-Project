import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./employeeManagement.css";

const EmployeeManagement = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await fetch("http://localhost:5000/api/employees/list", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch employees");
            }

            const data = await response.json();
            setEmployees(data);
            setError(null);
        } catch (err) {
            console.error("Error fetching employees:", err);
            setError("Failed to load employees. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddEmployee = () => {
        navigate("/owner/add-employee");
    };

    const handleEditEmployee = (employeeId) => {
        navigate(`/owner/edit-employee/${employeeId}`);
    };

    const handleDeleteEmployee = async (employeeId, employeeName) => {
        if (window.confirm(`Are you sure you want to delete ${employeeName}?`)) {
            try {
                const response = await fetch(`http://localhost:5000/api/employees/delete/${employeeId}`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to delete employee");
                }

                setSuccessMessage(`${employeeName} has been deleted successfully.`);
                setEmployees(employees.filter(emp => emp.user_id !== employeeId));

                // Clear success message after 3 seconds
                setTimeout(() => {
                    setSuccessMessage("");
                }, 3000);
            } catch (err) {
                console.error("Error deleting employee:", err);
                setError("Failed to delete employee. Please try again.");
            }
        }
    };

    return (
        <div className="employee-management-container">
            <div className="page-header">
                <div>
                    <h1>Employee Management</h1>
                    <p>Manage your juice bar employees</p>
                </div>
                <div className="action-buttons">
                    <button 
                        className="btn-secondary" 
                        onClick={() => navigate("/owner/dashboard")}
                    >
                        Back to Dashboard
                    </button>
                    <button 
                        className="btn-primary" 
                        onClick={handleAddEmployee}
                    >
                        Add New Employee
                    </button>
                </div>
            </div>

            {successMessage && (
                <div className="success-message">{successMessage}</div>
            )}

            {error && (
                <div className="error-message">{error}</div>
            )}

            {loading ? (
                <div className="loading-spinner">Loading employee data...</div>
            ) : employees.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">👥</div>
                    <h2>No Employees Found</h2>
                    <p>Add your first employee by clicking the "Add New Employee" button above.</p>
                </div>
            ) : (
                <div className="employees-grid">
                    {employees.map((employee) => (
                        <div className="employee-card" key={employee.user_id}>
                            <h3>{employee.username}</h3>
                            <div className="employee-details">
                                <div className="detail-row">
                                    <div className="detail-label">Email:</div>
                                    <div className="detail-value">{employee.email}</div>
                                </div>
                                <div className="detail-row">
                                    <div className="detail-label">Contact:</div>
                                    <div className="detail-value">
                                        {employee.contact_number || "Not provided"}
                                    </div>
                                </div>
                                {employee.description && (
                                    <div className="detail-row">
                                        <div className="detail-label">Description:</div>
                                        <div className="detail-value">{employee.description}</div>
                                    </div>
                                )}
                                <div className="detail-row">
                                    <div className="detail-label">Added On:</div>
                                    <div className="detail-value">
                                        {new Date(employee.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                            <div className="card-actions">
                                <button
                                    className="btn-secondary"
                                    onClick={() => handleEditEmployee(employee.user_id)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="btn-danger"
                                    onClick={() => handleDeleteEmployee(employee.user_id, employee.username)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EmployeeManagement;