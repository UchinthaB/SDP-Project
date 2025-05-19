// Complete Cart.jsx with both navigation bar and fixed delete functionality
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Paper, 
  Card,
  CardContent,
  CardMedia,
  Grid,
  Divider,
  CircularProgress,
  IconButton,
  Snackbar,
  AppBar,
  Toolbar,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery
} from "@mui/material";
import MuiAlert from '@mui/material/Alert';
import { styled } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import { 
  Logout, 
  ShoppingCart, 
  Person, 
  History, 
  Menu as MenuIcon,
  Home,
  LocalBar
} from '@mui/icons-material';
import './customer.css';
import Checkout from "./Checkout";

const CartItemCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  marginBottom: theme.spacing(2),
  transition: 'box-shadow 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[4],
  }
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 3,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}));

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const userData = localStorage.getItem("user");
      
      if (!userData) {
        navigate("/login");
        return;
      }
      
      const parsedUserData = JSON.parse(userData);
      console.log("User data:", parsedUserData); // Debugging
      
      const customerId = parsedUserData.user?.user_id;
      console.log("Customer ID:", customerId); // Debugging
      
      if (!customerId) {
        setError("User ID not found. Please log in again.");
        setLoading(false);
        return;
      }
      
      console.log("Fetching cart for customer ID:", customerId); // Debugging
      const response = await fetch(`http://localhost:5000/api/cart/${customerId}`);
      
      console.log("Response status:", response.status); // Debugging
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText); // Debugging
        throw new Error(`Failed to fetch cart items: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log("Cart data:", data); // Debugging
      setCartItems(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching cart:", err);
      setError("Failed to load your cart. Please try again later.");
      // Show error in snackbar
      setSnackbarMessage(err.message || "Failed to load cart items");
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCartItems();
  }, [navigate]);
  
  const handleRemoveFromCart = async (cartItemId) => {
    try {
      // Log the exact item ID that's being sent
      console.log("Removing item with ID:", cartItemId); 
      
      // Make sure we're using the correct parameter in the URL
      const response = await fetch(`http://localhost:5000/api/cart/remove/${cartItemId}`, {
  method: "DELETE"
});

      
      console.log("Remove response status:", response.status); // Debugging
      
      if (response.ok) {
        // Remove the item from the state
        setCartItems(prevItems => prevItems.filter(item => item.id !== cartItemId));
        
        // Show success message
        setSnackbarMessage("Item removed from cart successfully");
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
        
        // Refresh cart items to ensure UI is in sync with server
        fetchCartItems();
      } else {
        const errorData = await response.json();
        console.error("Error response:", errorData); // Debugging
        throw new Error(errorData.message || "Failed to remove item from cart");
      }
    } catch (err) {
      console.error("Error removing item:", err);
      setSnackbarMessage(err.message || "Failed to remove item from cart");
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };
  
  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + parseFloat(item.price), 0).toFixed(2);
  };
  
  const handleCheckout = () => {
    // You can implement checkout logic here
    alert("Checkout functionality will be implemented in the future!");
  };
  
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };
  
  const handleLogOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  

  const mobileMenu = (
    <Drawer
      anchor="left"
      open={mobileMenuOpen}
      onClose={toggleMobileMenu}
    >
      <Box sx={{ width: 250 }} role="presentation" onClick={toggleMobileMenu}>
        <List>
          <ListItem>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Fresh Juice Bar
            </Typography>
          </ListItem>
          <Divider />
          <ListItem button onClick={() => navigate("/customer/dashboard")}>
            <ListItemIcon>
              <Home />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem button onClick={() => navigate("/customer/products")}>
            <ListItemIcon>
              <LocalBar />
            </ListItemIcon>
            <ListItemText primary="Products" />
          </ListItem>
          <ListItem button onClick={() => navigate("/customer/cart")}>
            <ListItemIcon>
              <Badge badgeContent={cartItems.length} color="secondary">
                <ShoppingCart />
              </Badge>
            </ListItemIcon>
            <ListItemText primary="Cart" />
          </ListItem>
          <ListItem button onClick={() => navigate("/customer/order-history")}>
            <ListItemIcon>
              <History />
            </ListItemIcon>
            <ListItemText primary="Order History" />
          </ListItem>
          <ListItem button onClick={() => navigate("/customer/profile")}>
            <ListItemIcon>
              <Person />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItem>
          <Divider />
          <ListItem button onClick={handleLogOut}>
            <ListItemIcon>
              <Logout />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
  
  return (
    <Box sx={{ backgroundColor: '#f5f5f3', minHeight: '100vh', pb: 4 }}>
      {/* Navigation Bar */}
      <AppBar position="sticky" sx={{ backgroundColor: '#166d67' }}>
        <Toolbar>
          {isMobile ? (
            <>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                sx={{ mr: 2 }}
                onClick={toggleMobileMenu}
              >
                <MenuIcon />
              </IconButton>
              {mobileMenu}
            </>
          ) : null}
          
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              display: 'flex', 
              alignItems: 'center',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
            onClick={() => navigate("/customer/dashboard")}
          >
            <LocalBar sx={{ mr: 1 }} />
            Fresh Juice Bar
          </Typography>
          
          {!isMobile && (
            <>
              <Button 
                color="inherit" 
                onClick={() => navigate("/customer/dashboard")}
                sx={{ mx: 1 }}
              >
                Home
              </Button>
              
              <Button 
                color="inherit" 
                onClick={() => navigate("/customer/products")}
                sx={{ mx: 1 }}
              >
                Products
              </Button>
              
              <Button 
                color="inherit" 
                onClick={() => navigate("/customer/order-history")}
                sx={{ mx: 1 }}
              >
                Order History
              </Button>
              
              <Button 
                color="inherit" 
                onClick={() => navigate("/customer/profile")}
                sx={{ mx: 1 }}
              >
                Profile
              </Button>
              
              <IconButton 
                color="inherit" 
                onClick={() => navigate("/customer/cart")}
                sx={{ mx: 1 }}
              >
                <StyledBadge badgeContent={cartItems.length} color="secondary">
                  <ShoppingCart />
                </StyledBadge>
              </IconButton>
              
              <Button 
                color="inherit" 
                onClick={handleLogOut}
                sx={{ mx: 1 }}
                startIcon={<Logout />}
              >
                Logout
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* Cart Header */}
      <Box sx={{ backgroundColor: 'primary.main', color: 'white', py: 3, mb: 4 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton 
              color="inherit" 
              onClick={() => navigate("/customer/dashboard")}
              size="large"
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
              Your Cart
            </Typography>
            <ShoppingBagIcon sx={{ fontSize: 40 }} />
          </Box>
        </Container>
      </Box>

      {/* Cart Content */}
      <Container maxWidth="lg">
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress size={60} />
          </Box>
        ) : error ? (
          <MuiAlert severity="error" sx={{ mb: 4 }}>
            {error}
          </MuiAlert>
        ) : cartItems.length === 0 ? (
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              Your cart is empty
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
              Add some delicious juices to get started!
            </Typography>
            <Button 
  variant="contained" 
  onClick={() => {
    navigate("/#locations");
  }}
  size="large"
>
  Browse Products
</Button>
          </Paper>
        ) : (
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              {cartItems.map(item => {
                // Debug the item structure
                console.log("Cart item:", item);
                
                let imageUrl = "";
                try {
                  const parsedUrl = item.img_url 
                    ? JSON.parse(item.img_url)
                    : [];
                  imageUrl = parsedUrl.length > 0 ? parsedUrl[0] : "";
                } catch (e) {
                  console.log("Error parsing image URL:", e);
                  imageUrl = item.img_url || "";
                }

                return (
                  <CartItemCard key={item.id || item.cart_id}>
                    <CardMedia
                      component="img"
                      sx={{ width: 140 }}
                      image={imageUrl || "/placeholder-image.png"}
                      alt={item.name}
                      onError={(e) => (e.target.src = "/placeholder-image.png")}
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                      <CardContent sx={{ flex: '1 0 auto' }}>
                        <Typography component="div" variant="h6">
                          {item.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {item.description?.substring(0, 100)}
                          {item.description?.length > 100 ? '...' : ''}
                        </Typography>
                        <Typography variant="h6" color="primary">
                          Rs.{parseFloat(item.price).toFixed(2)}
                        </Typography>
                      </CardContent>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', px: 2 }}>
                      <IconButton 
                        aria-label="delete" 
                        onClick={() => handleRemoveFromCart(item.id || item.cart_id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CartItemCard>
                );
              })}
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  Order Summary
                </Typography>
                <Box sx={{ my: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body1">Subtotal ({cartItems.length} items)</Typography>
                    <Typography variant="body1">Rs.{calculateTotal()}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body1">Delivery</Typography>
                    <Typography variant="body1">Free</Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">Total</Typography>
                    <Typography variant="h6">Rs.{calculateTotal()}</Typography>
                  </Box>
                </Box>
               
                <Checkout cartItems={cartItems} totalAmount={calculateTotal()} />
                
                <Button 
                  variant="outlined" 
                  fullWidth 
                  size="large"
                  onClick={() => navigate("/#locations")}
                  sx={{ mt: 2 }}
                >
                  Continue Shopping
                </Button>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Container>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <MuiAlert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default Cart;