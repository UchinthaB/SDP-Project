import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./employeeDashboard.css";

const EmployeeDashboard = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

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

    const handleProductManagement = () => {
        navigate("/employee/product-management");
    };

    const handleOrderManagement = () => {
        navigate("/employee/order-management");
    }  

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    return (
        <div className="employee-dashboard">
            <div className="dashboard-header">
                <h1>Employee Dashboard</h1>
                <div className="employee-info">
                    {user && <p>Welcome, {user.username}!</p>}
                </div>
            </div>

            <div className="dashboard-content">
                <div className="quick-actions">
                    <h2>Quick Actions</h2>
                    <div className="action-cards">
                        <div className="action-card" onClick={handleProductManagement}>
                            <div className="card-icon product-icon">
                                <i className="fas fa-box"></i>
                            </div>
                            <h3>Product Management</h3>
                            <p>View, add, edit, and delete products</p>
                        </div>
                        
                        <div className="action-card" onClick={handleOrderManagement}>
                            <div className="card-icon orders-icon">
                                <i className="fas fa-receipt"></i>
                            </div>
                            <h3>Order Management</h3>
                            <p>Coming soon - Manage customer orders</p>
                        </div>
                        
                       
                    </div>
                </div>

                <div className="system-info">
                    <h2>System Information</h2>
                    <div className="info-grid">
                        <div className="info-item">
                            <h4>Role</h4>
                            <p>Employee</p>
                        </div>
                        <div className="info-item">
                            <h4>Last Login</h4>
                            <p>{user ? new Date().toLocaleString() : "N/A"}</p>
                        </div>
                        <div className="info-item">
                            <h4>System Status</h4>
                            <p><span className="status-badge">Online</span></p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="dashboard-footer">
                <button 
                    className="button logout-btn" 
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default EmployeeDashboard;