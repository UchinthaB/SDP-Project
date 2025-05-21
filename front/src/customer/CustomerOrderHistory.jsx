import React, { useState, useEffect } from "react";
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
  Chip, 
  CircularProgress, 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Divider, 
  Alert,
  AppBar,
  Toolbar
} from "@mui/material";
import { styled } from '@mui/material/styles';
import { 
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  LocalCafe as LocalCafeIcon,
  Home as HomeIcon,
  Visibility as VisibilityIcon,
  Receipt as ReceiptIcon,
  Logout,
  ShoppingCart
} from '@mui/icons-material';

const OrderStatusChip = styled(Chip)(({ theme, status }) => {
  const getColor = () => {
    switch (status) {
      case 'pending':
        return { bg: theme.palette.warning.light, color: theme.palette.warning.contrastText };
      case 'processing':
        return { bg: theme.palette.info.light, color: theme.palette.info.contrastText };
      case 'ready':
        return { bg: theme.palette.success.light, color: theme.palette.success.contrastText };
      case 'completed':
        return { bg: theme.palette.success.main, color: theme.palette.success.contrastText };
      case 'cancelled':
        return { bg: theme.palette.error.light, color: theme.palette.error.contrastText };
      default:
        return { bg: theme.palette.grey[500], color: theme.palette.getContrastText(theme.palette.grey[500]) };
    }
  };

  const colorObj = getColor();
  return {
    backgroundColor: colorObj.bg,
    color: colorObj.color,
    fontWeight: 'bold',
    '& .MuiChip-label': {
      textTransform: 'capitalize',
    }
  };
});

const CustomerOrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
});

  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  // const fetchOrders = async () => {
  //   try {
  //     setLoading(true);
      
  //     // Get the customer ID from local storage
  //     const userData = localStorage.getItem("user");
  //     if (!userData) {
  //       navigate("/login");
  //       return;
  //     }
      
  //     const parsedUserData = JSON.parse(userData);
  //     const customerId = parsedUserData.user?.user_id;
      
  //     if (!customerId) {
  //       setError("User ID not found. Please log in again.");
  //       setLoading(false);
  //       return;
  //     }
      
  //     // Fetch orders from the API
  //     const response = await fetch(`http://localhost:5000/api/orders/customer/${customerId}`);
      
  //     if (!response.ok) {
  //       throw new Error(`Failed to fetch orders: ${response.status}`);
  //     }
      
  //     const data = await response.json();
  //     setOrders(data);
  //     setError(null);
  //   } catch (err) {
  //     console.error("Error fetching orders:", err);
  //     setError("Failed to load your order history. Please try again later.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

const fetchOrders = async () => {
  try {
    setLoading(true);
    
    // Get the customer ID and token from local storage
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    
    if (!userData || !token) {
      navigate("/");
      return;
    }
    
    const parsedUserData = JSON.parse(userData);
    const customerId = parsedUserData.user?.user_id;
    
    if (!customerId) {
      setError("User ID not found. Please log in again.");
      setLoading(false);
      return;
    }
    
    // Fetch orders from the API with authorization header
    const response = await fetch(`http://localhost:5000/api/orders/customer/${customerId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch orders: ${response.status}`);
    }
    
    const data = await response.json();
    setOrders(data);
    setError(null);
  } catch (err) {
    console.error("Error fetching orders:", err);
    setError("Failed to load your order history. Please try again later.");
  } finally {
    setLoading(false);
  }
};

  // const handleViewOrderDetails = async (orderId) => {
  //   try {
  //     const response = await fetch(`http://localhost:5000/api/orders/${orderId}`);
      
  //     if (!response.ok) {
  //       throw new Error(`Failed to fetch order details: ${response.status}`);
  //     }
      
  //     const data = await response.json();
  //     setSelectedOrder(data);
  //     setOrderDetailsOpen(true);
  //   } catch (err) {
  //     console.error("Error fetching order details:", err);
  //     alert("Failed to load order details. Please try again.");
  //   }
  // };

const handleViewOrderDetails = async (orderId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch order details: ${response.status}`);
    }
    
    const data = await response.json();
    setSelectedOrder(data);
    setOrderDetailsOpen(true);
  } catch (err) {
    console.error("Error fetching order details:", err);
    alert("Failed to load order details. Please try again.");
  }
};
  
  const handleCloseOrderDetails = () => {
    setOrderDetailsOpen(false);
  };

  const handleLogOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const getStatusDescription = (status) => {
    switch (status) {
      case 'pending':
        return 'Your order has been received and is waiting to be processed.';
      case 'processing':
        return 'Your order is being prepared by the juice bar staff.';
      case 'ready':
        return 'Your order is ready for pickup! Please collect it from the juice bar.';
      case 'completed':
        return 'Your order has been completed and picked up.';
      case 'cancelled':
        return 'This order has been cancelled.';
      default:
        return '';
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
        return;
    }

    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:5000/api/orders/${orderId}/cancel`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to cancel order');
        }

        setSnackbar({
            open: true,
            message: 'Order cancelled successfully',
            severity: 'success'
        });

        // Refresh orders
        fetchOrders();
        
        // Close details dialog if open
        if (selectedOrder && selectedOrder.order_id === orderId) {
            setOrderDetailsOpen(false);
        }
    } catch (err) {
        console.error('Error cancelling order:', err);
        setSnackbar({
            open: true,
            message: 'Failed to cancel order',
            severity: 'error'
        });
    }
};

  return (
    <Box sx={{ backgroundColor: '#f5f5f3', minHeight: '100vh', pb: 4 }}>
      {/* App Bar */}
      <AppBar position="sticky" sx={{ backgroundColor: '#166d67' }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/customer/dashboard')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <ReceiptIcon sx={{ mr: 1 }} /> Order History
          </Typography>
          <Button color="inherit" onClick={() => navigate("/customer/dashboard")} sx={{ mx: 1 }}>
            <HomeIcon sx={{ mr: 1 }} /> Home
          </Button>
          <Button color="inherit" onClick={() => navigate("/customer/cart")} sx={{ mx: 1 }}>
            <ShoppingCart sx={{ mr: 1 }} /> Cart
          </Button>
          <Button color="inherit" onClick={handleLogOut} startIcon={<Logout />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Your Order History
        </Typography>
        
        <Button 
          variant="outlined" 
          onClick={fetchOrders} 
          sx={{ mb: 3 }}
        >
          Refresh Orders
        </Button>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress size={60} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        ) : orders.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              No orders found
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
              You haven't placed any orders yet.
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate("/customer/dashboard")}
              size="large"
            >
              Browse Products
            </Button>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Token #</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Payment Method</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.order_id} hover>
                    <TableCell>
                      <Typography variant="subtitle2">#{order.token_number}</Typography>
                    </TableCell>
                    <TableCell>
                      {new Date(order.created_at).toLocaleDateString()} {' '}
                      {new Date(order.created_at).toLocaleTimeString()}
                    </TableCell>
                    <TableCell>Rs.{parseFloat(order.total_amount).toFixed(2)}</TableCell>
                    <TableCell>
                      {order.payment_method === 'cash' ? 'Cash on Pickup' : 'Online Payment'}
                    </TableCell>
                    <TableCell>
                      <OrderStatusChip 
                        label={order.order_status || order.status} 
                        status={order.order_status || order.status} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleViewOrderDetails(order.order_id)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>

      {/* Order Details Dialog */}
      <Dialog 
        open={orderDetailsOpen} 
        onClose={handleCloseOrderDetails}
        fullWidth
        maxWidth="md"
      >
        {selectedOrder && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  Order Details (Token #{selectedOrder.token_number})
                </Typography>
                <OrderStatusChip 
                  label={selectedOrder.order_status || selectedOrder.status} 
                  status={selectedOrder.order_status || selectedOrder.status} 
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 3 }}>
                <Alert severity={
                  (selectedOrder.order_status || selectedOrder.status) === 'ready' ? 'success' : 
                  (selectedOrder.order_status || selectedOrder.status) === 'processing' ? 'info' : 
                  (selectedOrder.order_status || selectedOrder.status) === 'pending' ? 'warning' : 
                  (selectedOrder.order_status || selectedOrder.status) === 'completed' ? 'success' : 
                  'info'
                }>
                  {getStatusDescription(selectedOrder.order_status || selectedOrder.status)}
                </Alert>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1">Order Information</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
                  <Typography variant="body2">
                    <strong>Order ID:</strong> {selectedOrder.order_id}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Date:</strong> {new Date(selectedOrder.created_at).toLocaleString()}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Payment Method:</strong> {selectedOrder.payment_method === 'cash' ? 'Cash on Pickup' : 'Online Payment'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Total Amount:</strong> Rs.{parseFloat(selectedOrder.total_amount).toFixed(2)}
                  </Typography>
                </Box>
              </Box>

              <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>Order Items</Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Subtotal</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedOrder.items && selectedOrder.items.map((item) => (
                      <TableRow key={item.order_item_id}>
                        <TableCell>{item.product_name}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">Rs.{parseFloat(item.unit_price).toFixed(2)}</TableCell>
                        <TableCell align="right">Rs.{parseFloat(item.subtotal).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold' }}>Total:</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        Rs.{parseFloat(selectedOrder.total_amount).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </DialogContent>
            <DialogActions>
              {selectedOrder && (selectedOrder.status === 'pending' || selectedOrder.status === 'processing') && (
    <Button 
        variant="contained" 
        color="error"
        onClick={() => handleCancelOrder(selectedOrder.order_id)}
    >
        Cancel Order
    </Button>
)}
              <Button onClick={handleCloseOrderDetails}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      <snackbar
    open={snackbar.open}
    autoHideDuration={6000}
    onClose={() => setSnackbar({ ...snackbar, open: false })}
>
    <Alert 
        onClose={() => setSnackbar({ ...snackbar, open: false })} 
        severity={snackbar.severity}
    >
        {snackbar.message}
    </Alert>
</snackbar>

    </Box>
  );
};

export default CustomerOrderHistory;