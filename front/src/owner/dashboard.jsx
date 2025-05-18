import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, Container, Grid, Paper } from "@mui/material";
import { 
  Inventory as InventoryIcon, 
  Receipt as ReceiptIcon, 
  Person as PersonIcon, 
  Settings as SettingsIcon, 
  Logout as LogoutIcon,
  Restaurant as RestaurantIcon
} from "@mui/icons-material";
import "./dashboard.css";
import OwnerSidebar from "../components/OwnerSideBar";

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is logged in and is an owner
        const userData = localStorage.getItem("user");
        if (!userData) {
            navigate("/login");
            return;
        }

        const user = JSON.parse(userData);
        if (user.user.role !== "owner") {
            navigate("/");
            return;
        }

        setUser(user.user);
    }, [navigate]);

    const handleProductManagement = () => {
        navigate("/owner/product-management");
    }

    const handleOrderManagement = () => {
        navigate("/owner/order-management");
    }

    const handleLogOut = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    }

    const handleEmployeeManagement = () => {
        navigate("/owner/employee-management");
    }

    const handleSalesReport = () => {
  navigate("/owner/sales-report");
}

    return (
        <Box sx={{ display: 'flex' }}>
            <OwnerSidebar />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    marginLeft: '240px', // Width of the sidebar
                }}
            >
                <Container className="dashboard-container" maxWidth="lg">
                    <Box className="dashboard-header">
                        <Typography variant="h3" component="h1">
                            Owner Dashboard
                        </Typography>
                        <Typography variant="h6" color="textSecondary">
                            {user ? `Welcome, ${user.username}!` : 'Welcome to the Owner Dashboard!'}
                        </Typography>
                    </Box>

                    <Grid container spacing={4}>
                        <Grid item xs={12} md={6} lg={4}>
                            <Paper className="dashboard-card" onClick={handleProductManagement}>
                                <InventoryIcon className="card-icon" />
                                <Typography variant="h5" component="h2">
                                    Product Management
                                </Typography>
                                <Typography variant="body1">
                                    Add, edit, and delete products in your inventory
                                </Typography>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} md={6} lg={4}>
                            <Paper className="dashboard-card" onClick={handleOrderManagement}>
                                <ReceiptIcon className="card-icon" />
                                <Typography variant="h5" component="h2">
                                    Order Management
                                </Typography>
                                <Typography variant="body1">
                                    View and manage customer orders
                                </Typography>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} md={6} lg={4}>
                            <Paper className="dashboard-card" onClick={handleSalesReport}>
                                <RestaurantIcon className="card-icon" />
                                <Typography variant="h5" component="h2">
                                    Sales Report
                                </Typography>
                                <Typography variant="body1">
                                    View sales statistics and analytics
                                </Typography>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} md={6} lg={4}>
                            <Paper className="dashboard-card" onClick={handleEmployeeManagement}>
                                <PersonIcon className="card-icon" />
                                <Typography variant="h5" component="h2">
                                    Employee Management
                                </Typography>
                                <Typography variant="body1">
                                    Add, edit, and manage employees
                                </Typography>
                            </Paper>
                        </Grid>

                        
                    </Grid>

                    <Box className="logout-container">
                        <Button 
                            variant="contained" 
                            color="error" 
                            size="large"
                            onClick={handleLogOut}
                            startIcon={<LogoutIcon />}
                        >
                            Logout
                        </Button>
                    </Box>
                </Container>
            </Box>
        </Box>
    );
}

export default Dashboard;