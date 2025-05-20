import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./employeeDashboard.css";
import EmployeeSidebar from "./EmployeeSidebar";

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
     <EmployeeSidebar>   
        <div className="employee-dashboard">
            <div className="dashboard-header">
                <h1>Employee Dashboard</h1>
                <div className="employee-info">
                    {user && <p>Welcome, {user.username}!</p>}
                </div>
            </div>

            <div className="dashboard-content">
                

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

           
        </div>
       </EmployeeSidebar>   
    );
};

export default EmployeeDashboard;