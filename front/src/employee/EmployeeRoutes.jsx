// First, let's create EmployeeRoutes.js to add proper routes for employee functions
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import EmployeeProductManagement from './EmployeeProductManagement'
import EmployeeDashboard from './EmployeeDashboard';
import EmployeeOrdertManagement from './EmployeeOrderManagement';

// This component will handle all employee routes with proper authentication
const EmployeeRoutes = () => {
  const isAuthenticated = () => {
    const userData = localStorage.getItem("user");
    if (!userData) return false;
    
    const user = JSON.parse(userData);
    return user.user && user.user.role === "employee";
  };

  if (!isAuthenticated()) {
    return <Navigate to="/login" />;

  }

  return (
    <Routes>
      <Route path="/dashboard" element={<EmployeeDashboard />} />
      <Route path="/product-management" element={<EmployeeProductManagement />} />
      <Route path="/order-management" element={<EmployeeOrdertManagement />} />
      {/* Add other employee routes here */}
    </Routes>
  );
};

export default EmployeeRoutes;