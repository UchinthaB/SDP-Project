import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import Dashboard from './owner/dashboard';
import ProductManagement from './owner/ProductManagement';
import AddProduct from './owner/AddProduct';
import CustomerDashboard from './customer/CustomerDashBoard';
import CustomerProducts from './customer/customerProducts';
import Cart from './customer/Cart';
import EditProduct from './owner/EditProduct';
import EmployeeManagement from './owner/EmployeeManagement';
import AddEmployee from './owner/AddEmployee';
import EditEmployee from './owner/EditEmployee';
import EmployeeDashboard from './employee/EmployeeDashboard';
import EmployeeProductManagement from './employee/EmployeeProductManagement';
import OrderHistory from './customer/CustomerOrderHistory';
import OrderManagement from './owner/OrderManagement';
import EmployeeOrderManagement from './employee/EmployeeOrderMangement';  
import CustomerOrderHistory from './customer/CustomerOrderHistory';
import SalesReport from './owner/SalesReport';
import MessageDashboard from './owner/MessageDashboard';
import EmployeeAddProduct from './employee/EmployeeAddProduct';
import EmployeeEditProduct from './employee/EmployeeEditProduct';



const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
      
      {/* Owner Routes */}
      <Route path="/owner/dashboard" element={<Dashboard />} />
      <Route path="/owner/product-management" element={<ProductManagement />} />
      <Route path="/owner/add-product" element={<AddProduct />} />
      <Route path="/owner/edit-product/:id" element={<EditProduct />} />
      <Route path="/owner/employee-management" element={<EmployeeManagement />} />
      <Route path="/owner/add-employee" element={<AddEmployee />} />
      <Route path="/owner/edit-employee/:id" element={<EditEmployee />} />
      <Route path="/owner/order-management" element={<OrderManagement />} />
      <Route path="/owner/sales-report" element={<SalesReport />} />
      <Route path="/owner/messages" element={<MessageDashboard />} />
      
      {/* Customer Routes */}
      <Route path="/customer/dashboard" element={<CustomerDashboard />} />
      <Route path="/customer/products" element={<CustomerProducts />} />
      <Route path="/customer/cart" element={<Cart />} />
      <Route path="/customer/orders" element={<OrderHistory />} />
      <Route path="/customer/order-history" element={<OrderHistory />} />
      
      {/* Employee Routes */}
      <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
      <Route path="/employee/product-management" element={<EmployeeProductManagement />} />
      <Route path="/employee/order-management" element={<EmployeeOrderManagement />} />
      <Route path="/employee/add-product" element={<EmployeeAddProduct />} />
      <Route path="/employee/edit-product/:id" element={<EmployeeEditProduct />} />
      
      {/* Add other routes here */}
      
      {/* Redirect to home if no match */}
      
      
    </Routes>
  );
};

export default App;