import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography,
  Divider,
  IconButton,
  useMediaQuery,
  AppBar,
  Toolbar,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  ShoppingCart as OrdersIcon,
  Logout as LogoutIcon,
  LocalCafe as LocalCafeIcon,
} from "@mui/icons-material";
import { styled, useTheme } from "@mui/material/styles";
import "../owner/sidebar.css";

const drawerWidth = 240;

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  })
);

const EmployeeSidebar = ({ children }) => {
  const [open, setOpen] = useState(true);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    // Check if screen size changes and adjust drawer accordingly
    if (isMobile) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  }, [isMobile]);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.user && parsedUser.user.role === "employee") {
        setUser(parsedUser.user);
      } else {
        // Redirect to login if not employee
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const menuItems = [
    {
      text: "Dashboard",
      icon: <DashboardIcon />,
      path: "/employee/dashboard",
    },
    {
      text: "Product Management",
      icon: <InventoryIcon />,
      path: "/employee/product-management",
    },
    {
      text: "Order Management",
      icon: <OrdersIcon />,
      path: "/employee/order-management",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const drawer = (
    <div className="sidebar-container">
      <div className="sidebar-header">
        <Avatar className="logo-avatar">
          <LocalCafeIcon />
        </Avatar>
        <Typography variant="h6" className="sidebar-title">
          Juice Bar System
        </Typography>
      </div>

      <Divider />

      {user && (
        <div className="user-profile">
          <Avatar className="user-avatar">
            {user.username ? user.username.charAt(0).toUpperCase() : "E"}
          </Avatar>
          <div className="user-info">
            <Typography variant="subtitle1">{user.username}</Typography>
            <Typography variant="body2" color="textSecondary">
              Employee
            </Typography>
          </div>
        </div>
      )}

      <Divider />

      <List className="menu-list">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem
              button
              key={item.text}
              onClick={() => navigate(item.path)}
              className={isActive ? "menu-item-active" : "menu-item"}
            >
              <ListItemIcon className={isActive ? "icon-active" : "icon"}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: isActive ? "medium" : "normal",
                }}
              />
            </ListItem>
          );
        })}
      </List>

      <div className="logout-section">
        <Divider />
        <ListItem button onClick={handleLogout} className="logout-button">
          <ListItemIcon className="logout-icon">
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </div>
    </div>
  );

  return (
    <Box sx={{ display: "flex" }}>
      {isMobile && (
        <AppBar
          position="fixed"
          sx={{
            width: { sm: `calc(100% - ${open ? drawerWidth : 0}px)` },
            ml: { sm: `${open ? drawerWidth : 0}px` },
            backgroundColor: "#166d67",
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              Employee Portal
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        open={open}
        onClose={isMobile ? handleDrawerToggle : null}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        {drawer}
      </Drawer>

      <Main open={open && !isMobile}>
        {isMobile && <Toolbar />} {/* Space for the AppBar if mobile */}
        {!isMobile && (
          <IconButton
            onClick={handleDrawerToggle}
            sx={{
              position: "fixed",
              left: open ? drawerWidth : 10,
              top: 10,
              zIndex: 1201,
              bgcolor: "#fff",
              boxShadow: 2,
              "&:hover": {
                bgcolor: "#f5f5f5",
              },
            }}
          >
            <MenuIcon />
          </IconButton>
        )}
        {children}
      </Main>
    </Box>
  );
};

export default EmployeeSidebar;