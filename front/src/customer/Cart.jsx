import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Paper, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  Divider,
  CircularProgress,
  TextField,
  Alert,
  useTheme,
  useMediaQuery,
  Card,
  TableFooter
} from "@mui/material";
import { styled } from '@mui/material/styles';
import { 
  DeleteOutline as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  ShoppingCart as ShoppingCartIcon, 
  Person as PersonIcon, 
  History as HistoryIcon, 
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Home as HomeIcon,
  LocalBar as LocalBarIcon,
  Add as AddIcon,
  Remove as RemoveIcon
} from '@mui/icons-material';
import './customer.css';
import Checkout from "./Checkout";

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 3,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  marginBottom: theme.spacing(4),
  overflow: 'hidden', // Ensures the header background is constrained to the container
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: '#166d67', // Using the teal color from your theme
  '& .MuiTableCell-head': {
    color: 'white',
    fontWeight: 'bold',
    fontSize: '1rem',
    padding: theme.spacing(2),
  }
}));

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [consolidatedItems, setConsolidatedItems] = useState([]);
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
      const customerId = parsedUserData.user?.user_id;
      
      if (!customerId) {
        setError("User ID not found. Please log in again.");
        setLoading(false);
        return;
      }
      
      const response = await fetch(`http://localhost:5000/api/cart/${customerId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch cart items: ${response.status}`);
      }
      
      const data = await response.json();
      setCartItems(data);
      
      // Consolidate items by product_id
      const itemMap = {};
      data.forEach(item => {
        if (itemMap[item.product_id]) {
          itemMap[item.product_id].quantity += 1;
          itemMap[item.product_id].cartIds.push(item.cart_id || item.id);
        } else {
          itemMap[item.product_id] = {
            ...item,
            quantity: 1,
            cartIds: [item.cart_id || item.id],
            totalPrice: parseFloat(item.price)
          };
        }
      });
      
      const consolidatedData = Object.values(itemMap).map(item => ({
        ...item,
        totalPrice: (parseFloat(item.price) * item.quantity).toFixed(2)
      }));
      
      setConsolidatedItems(consolidatedData);
      setError(null);
    } catch (err) {
      console.error("Error fetching cart:", err);
      setError("Failed to load your cart. Please try again later.");
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
  
  const handleRemoveFromCart = async (cartId) => {
    try {
      // For a single cart item
      const response = await fetch(`http://localhost:5000/api/cart/remove/${cartId}`, {
        method: "DELETE"
      });
      
      if (response.ok) {
        // Show success message
        setSnackbarMessage("Item removed from cart");
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
        
        // Refresh cart items
        fetchCartItems();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to remove item from cart");
      }
    } catch (err) {
      console.error("Error removing item:", err);
      setSnackbarMessage(err.message || "Failed to remove item from cart");
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };
  
  const handleRemoveAllFromCart = async (cartIds) => {
    try {
      // Delete all instances of a product
      const deletePromises = cartIds.map(cartId => 
        fetch(`http://localhost:5000/api/cart/remove/${cartId}`, {
          method: "DELETE"
        })
      );
      
      await Promise.all(deletePromises);
      
      // Show success message
      setSnackbarMessage("Items removed from cart");
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      
      // Refresh cart items
      fetchCartItems();
    } catch (err) {
      console.error("Error removing items:", err);
      setSnackbarMessage("Failed to remove items from cart");
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };
  
  const handleUpdateQuantity = async (item, newQuantity) => {
    try {
      if (newQuantity <= 0) {
        // Remove all instances of this product
        await handleRemoveAllFromCart(item.cartIds);
        return;
      }
      
      const currentQuantity = item.quantity;
      
      if (newQuantity > currentQuantity) {
        // Need to add more of this product
        const addCount = newQuantity - currentQuantity;
        const customerId = JSON.parse(localStorage.getItem("user")).user.user_id;
        
        const addPromises = Array(addCount).fill().map(() => 
          fetch("http://localhost:5000/api/cart/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              product_id: item.product_id, 
              customer_id: customerId 
            })
          })
        );
        
        await Promise.all(addPromises);
      } else if (newQuantity < currentQuantity) {
        // Need to remove some of this product
        const removeCount = currentQuantity - newQuantity;
        const cartIdsToRemove = item.cartIds.slice(0, removeCount);
        
        const removePromises = cartIdsToRemove.map(cartId => 
          fetch(`http://localhost:5000/api/cart/remove/${cartId}`, {
            method: "DELETE"
          })
        );
        
        await Promise.all(removePromises);
      }
      
      // Show success message
      setSnackbarMessage("Cart updated");
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      
      // Refresh cart items
      fetchCartItems();
    } catch (err) {
      console.error("Error updating quantity:", err);
      setSnackbarMessage("Failed to update cart");
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };
  
  const calculateTotal = () => {
    return consolidatedItems
      .reduce((sum, item) => sum + parseFloat(item.totalPrice), 0)
      .toFixed(2);
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
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem button onClick={() => navigate("/customer/products")}>
            <ListItemIcon>
              <LocalBarIcon />
            </ListItemIcon>
            <ListItemText primary="Products" />
          </ListItem>
          <ListItem button onClick={() => navigate("/customer/cart")}>
            <ListItemIcon>
              <Badge badgeContent={cartItems.length} color="secondary">
                <ShoppingCartIcon />
              </Badge>
            </ListItemIcon>
            <ListItemText primary="Cart" />
          </ListItem>
          <ListItem button onClick={() => navigate("/customer/order-history")}>
            <ListItemIcon>
              <HistoryIcon />
            </ListItemIcon>
            <ListItemText primary="Order History" />
          </ListItem>
          <ListItem button onClick={() => navigate("/customer/profile")}>
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItem>
          <Divider />
          <ListItem button onClick={handleLogOut}>
            <ListItemIcon>
              <LogoutIcon />
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
            <LocalBarIcon sx={{ mr: 1 }} />
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
              
              
              
              <IconButton 
                color="inherit" 
                onClick={() => navigate("/customer/cart")}
                sx={{ mx: 1 }}
              >
                <StyledBadge badgeContent={cartItems.length} color="secondary">
                  <ShoppingCartIcon />
                </StyledBadge>
              </IconButton>
              
              <Button 
                color="inherit" 
                onClick={handleLogOut}
                sx={{ mx: 1 }}
                startIcon={<LogoutIcon />}
              >
                Logout
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* Cart Header */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #166d67 0%, #4a6fa5 100%)', 
        color: 'white', 
        py: 4, 
        mb: 4,
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
      }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton 
              color="inherit" 
              onClick={() => navigate("/customer/dashboard")}
              size="large"
              sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                flexGrow: 1, 
                fontWeight: 'bold',
                textShadow: '1px 1px 3px rgba(0,0,0,0.2)'
              }}
            >
              Your Cart
            </Typography>
            <Box 
              sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                borderRadius: '50%',
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ShoppingCartIcon sx={{ fontSize: 36 }} />
            </Box>
          </Box>
          {!loading && consolidatedItems.length > 0 && (
            <Typography variant="h6" sx={{ mt: 1, opacity: 0.9 }}>
              {consolidatedItems.length} {consolidatedItems.length === 1 ? 'item' : 'items'} in your cart
            </Typography>
          )}
        </Container>
      </Box>

      {/* Cart Content */}
      <Container maxWidth="lg">
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress size={60} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        ) : consolidatedItems.length === 0 ? (
          <Paper elevation={3} sx={{ 
            p: 5, 
            textAlign: 'center',
            borderRadius: '8px',
            backgroundImage: 'linear-gradient(135deg, #f9f9f9 0%, #f5f5f5 100%)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)'
          }}>
            <Box sx={{
              backgroundColor: 'rgba(22, 109, 103, 0.1)',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <ShoppingCartIcon sx={{ fontSize: 40, color: '#166d67' }} />
            </Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#166d67' }}>
              Your cart is empty
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 4, maxWidth: '80%', mx: 'auto' }}>
              Looks like you haven't added any delicious juices to your cart yet. 
              Browse our fresh selection and add your favorites!
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate("/customer/dashboard")}
              size="large"
              sx={{
                backgroundColor: '#166d67',
                padding: '12px 32px',
                borderRadius: '30px',
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: '#0e4e4a',
                  boxShadow: '0 6px 15px rgba(0,0,0,0.15)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Browse Products
            </Button>
          </Paper>
        ) : (
          <Box>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
              Cart Items ({consolidatedItems.length} {consolidatedItems.length === 1 ? 'item' : 'items'})
            </Typography>
            
            <StyledTableContainer component={Paper}>
              <Table>
                <StyledTableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="center">Price</TableCell>
                    <TableCell align="center">Quantity</TableCell>
                    <TableCell align="right">Subtotal</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </StyledTableHead>
                <TableBody>
                  {consolidatedItems.map((item) => (
                    <TableRow key={item.product_id} sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      '&:hover': { backgroundColor: 'rgba(21, 2, 2, 0.02)' },
                      transition: 'background-color 0.2s ease'
                    }}>
                      <TableCell component="th" scope="row">
                        <Typography variant="subtitle1" sx={{ fontWeight: 'medium', color: '#166d67' }}>
                          {item.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ 
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '300px'
                        }}>
                          {item.description}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          Rs.{parseFloat(item.price).toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                            sx={{ 
                              backgroundColor: '#f5f5f5', 
                              border: '1px solid #e0e0e0',
                              '&:hover': {
                                backgroundColor: '#e0e0e0',
                              }
                            }}
                          >
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                          <Typography sx={{ 
                            mx: 2, 
                            minWidth: '30px', 
                            textAlign: 'center',
                            fontWeight: 'bold',
                            fontSize: '1rem'
                          }}>
                            {item.quantity}
                          </Typography>
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                            sx={{ 
                              backgroundColor: '#166d67', 
                              color: 'white',
                              '&:hover': {
                                backgroundColor: '#0e4e4a',
                              }
                            }}
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                          Rs.{item.totalPrice}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton 
                          color="error" 
                          onClick={() => handleRemoveAllFromCart(item.cartIds)}
                          size="small"
                          sx={{ 
                            backgroundColor: 'rgba(244, 67, 54, 0.1)',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              backgroundColor: 'rgba(244, 67, 54, 0.2)',
                              transform: 'scale(1.1)'
                            }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {/* Total row */}
                  <TableRow sx={{ 
                    backgroundColor: 'rgba(22, 109, 103, 0.08)', 
                    '& td': { 
                      fontWeight: 'bold',
                      fontSize: '1.05rem',
                      borderTop: '2px solid rgba(22, 109, 103, 0.2)'
                    } 
                  }}>
                    <TableCell colSpan={3} align="right">
                      Total:
                    </TableCell>
                    <TableCell align="right">
                      Rs.{calculateTotal()}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            </StyledTableContainer>

            <Box sx={{ mt: 4 }}>
              <Card sx={{ 
                p: 3, 
                mb: 3, 
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                borderRadius: '8px',
                border: '1px solid rgba(0, 0, 0, 0.05)'
              }}>
                <Typography variant="h6" gutterBottom sx={{ 
                  borderBottom: '2px solid #166d67',
                  pb: 1.5, 
                  mb: 2,
                  color: '#166d67',
                  fontWeight: 'bold'
                }}>
                  Order Summary
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">Subtotal:</Typography>
                  <Typography variant="body1" fontWeight="medium">Rs.{calculateTotal()}</Typography>
                </Box>

                {/* <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">Delivery:</Typography>
                  <Typography variant="body1" color="success.main" fontWeight="medium">Free</Typography>
                </Box> */}

                <Divider sx={{ my: 2 }} />

                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  mb: 3,
                  backgroundColor: 'rgba(22, 109, 103, 0.05)',
                  p: 1.5,
                  borderRadius: '4px'
                }}>
                  <Typography variant="h6" fontWeight="bold">Total:</Typography>
                  <Typography variant="h6" color="#166d67" fontWeight="bold">Rs.{calculateTotal()}</Typography>
                </Box>

                <Checkout cartItems={cartItems} totalAmount={calculateTotal()} />
                
                <Button 
                  variant="outlined" 
                  fullWidth 
                  size="large"
                  onClick={() => navigate("/customer/products")}
                  sx={{ 
                    mt: 2,
                    borderColor: '#166d67',
                    color: '#166d67',
                    borderWidth: '2px',
                    borderRadius: '4px',
                    fontWeight: 'medium',
                    '&:hover': {
                      borderColor: '#0e4e4a',
                      borderWidth: '2px',
                      backgroundColor: 'rgba(22, 109, 103, 0.05)'
                    }
                  }}
                >
                  Continue Shopping
                </Button>
              </Card>
            </Box>
          </Box>
        )}
      </Container>

      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={4000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity} 
          sx={{ 
            width: '100%', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            borderRadius: '8px',
            fontWeight: 'medium'
          }}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Cart;