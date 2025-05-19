import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  IconButton,
  useMediaQuery,
  useTheme,
  Avatar
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  Receipt as ReceiptIcon,
  Person as PersonIcon,
  BarChart as BarChartIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Home as HomeIcon,
  LocalCafe as LocalCafeIcon
} from "@mui/icons-material";
import "./sidebar.css";

// The width of the drawer
const drawerWidth = 260;

const OwnerSidebar = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // Check if user is logged in and is an owner
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setUser(user.user);
    }
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const menuItems = [
    {
      text: "Dashboard",
      icon: <DashboardIcon />,
      path: "/owner/dashboard",
      active: isActive("/owner/dashboard"),
    },
    {
      text: "Products",
      icon: <InventoryIcon />,
      path: "/owner/product-management",
      active: isActive("/owner/product-management"),
    },
    {
      text: "Orders",
      icon: <ReceiptIcon />,
      path: "/owner/order-management",
      active: isActive("/owner/order-management"),
    },
    {
      text: "Employees",
      icon: <PersonIcon />,
      path: "/owner/employee-management",
      active: isActive("/owner/employee-management"),
    },
    {
      text: "Sales Reports",
      icon: <BarChartIcon />,
      path: "/owner/sales-report",
      active: isActive("/owner/sales-report"),
    }
  ];

  const drawer = (
    <div className="sidebar-container">
      <div className="sidebar-header">
        <Avatar className="logo-avatar">
          <LocalCafeIcon />
        </Avatar>
        <Typography variant="h6" className="sidebar-title">
          Fresh Juice Bar
        </Typography>
      </div>
      
      <Divider />
      
      {user && (
        <div className="user-profile">
          <Avatar className="user-avatar">
            {user.username ? user.username.charAt(0).toUpperCase() : "O"}
          </Avatar>
          <div className="user-info">
            <Typography variant="subtitle1">{user.username}</Typography>
            <Typography variant="body2" color="textSecondary">
              Owner
            </Typography>
          </div>
        </div>
      )}
      
      <Divider />
      
      <List className="menu-list">
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              className={item.active ? "menu-item-active" : "menu-item"}
              onClick={() => {
                navigate(item.path);
                if (isMobile) {
                  setMobileOpen(false);
                }
              }}
            >
              <ListItemIcon className={item.active ? "icon-active" : "icon"}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <div className="logout-section">
        <Divider />
        <ListItem disablePadding>
          <ListItemButton className="logout-button" onClick={handleLogOut}>
            <ListItemIcon className="logout-icon">
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </div>
    </div>
  );

  return (
    <Box sx={{ display: "flex" }}>
      {/* Mobile drawer toggle */}
      {isMobile && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ 
            position: "fixed", 
            top: 10, 
            left: 10, 
            zIndex: 1199,
            backgroundColor: "white",
            boxShadow: "0 0 10px rgba(0,0,0,0.1)",
            "&:hover": {
              backgroundColor: "white",
            }
          }}
        >
          <MenuIcon />
        </IconButton>
      )}
      
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { 
            boxSizing: "border-box", 
            width: drawerWidth,
            backgroundColor: "#ffffff"
          },
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": { 
            boxSizing: "border-box", 
            width: drawerWidth,
            backgroundColor: "#ffffff",
            borderRight: "1px solid rgba(0, 0, 0, 0.12)"
          },
        }}
        open
      >
        {drawer}
      </Drawer>
      
      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          minHeight: "100vh",
          backgroundColor: "#f5f5f5"
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default OwnerSidebar;