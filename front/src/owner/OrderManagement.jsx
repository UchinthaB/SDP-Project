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
  Snackbar,
  Alert,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  TextField,
  InputAdornment
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Check as CheckIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  Clear as ClearIcon
} from "@mui/icons-material";
import { styled } from '@mui/material/styles';
import OwnerSidebar from "./OwnerSidebar";

// Styled components
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
        return { bg: theme.palette.primary.light, color: theme.palette.primary.contrastText };
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

// Main component
const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [juiceBars, setJuiceBars] = useState([]);
  const [selectedJuiceBar, setSelectedJuiceBar] = useState('all');
  const [loadingJuiceBars, setLoadingJuiceBars] = useState(true);
  const [searchToken, setSearchToken] = useState('');
  
  const navigate = useNavigate();

  // Fetch juice bar locations
  const fetchJuiceBars = async () => {
    try {
      setLoadingJuiceBars(true);
      const response = await fetch('http://localhost:5000/api/products/juicebars', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch juice bar locations');
      }

      const data = await response.json();
      setJuiceBars(data);
    } catch (err) {
      console.error('Error fetching juice bar locations:', err);
      setSnackbar({
        open: true,
        message: 'Failed to load juice bar locations',
        severity: 'error'
      });
    } finally {
      setLoadingJuiceBars(false);
    }
  };

  // Fetch all pending orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/orders/pending/list', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/");
      return;
    }

    // Check if user is owner or employee
    const user = JSON.parse(userData);
    if (user.user.role !== "owner" && user.user.role !== "employee") {
      navigate("/");
      return;
    }

    fetchJuiceBars();
    fetchOrders();
    
    // Set up polling for new orders (every 30 seconds)
    const intervalId = setInterval(fetchOrders, 30000);
    
    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, [navigate]);

  // Handle order status update including email notification
 const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setLoading(true);
      console.log(`Updating order ${orderId} status to ${newStatus}`);
      
      // First update the order status in the database
      const statusResponse = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!statusResponse.ok) {
        throw new Error('Failed to update order status');
      }

      // Only send email notification if the new status is 'ready'
      if (newStatus.toLowerCase() === 'ready') {
        console.log(`Sending email notification for order ${orderId} with status ${newStatus}`);
        const emailResponse = await fetch('http://localhost:5000/api/employees/notify-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ orderId, status: newStatus })
        });

        if (!emailResponse.ok) {
          console.warn('Email notification could not be sent, but order status was updated');
        } else {
          const emailData = await emailResponse.json();
          console.log('Email notification sent:', emailData);
        }
      }

      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.order_id === orderId ? { ...order, status: newStatus } : order
        )
      );

      // If order details dialog is open and it's the updated order, update it
      if (selectedOrder && selectedOrder.order_id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }

      // Show success message
      setSnackbar({
        open: true,
        message: newStatus.toLowerCase() === 'ready' 
          ? `Order #${orderId} updated to ${newStatus} and notification sent`
          : `Order #${orderId} updated to ${newStatus}`,
        severity: 'success'
      });
    } catch (err) {
      console.error('Error updating order status:', err);
      setSnackbar({
        open: true,
        message: 'Failed to update order status',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle viewing order details
  const handleViewOrderDetails = async (orderId) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }

      const data = await response.json();
      setSelectedOrder(data);
      setOrderDetailsOpen(true);
    } catch (err) {
      console.error('Error fetching order details:', err);
      setSnackbar({
        open: true,
        message: 'Failed to load order details',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle juice bar filter change
  const handleJuiceBarChange = (event) => {
    setSelectedJuiceBar(event.target.value);
  };

  // Handle search input change
  const handleSearchChange = (event) => {
    // Only allow numeric input
    const value = event.target.value;
    if (value === '' || /^[0-9]+$/.test(value)) {
      setSearchToken(value);
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchToken('');
  };

  // Filter orders based on tab value, selected juice bar, and search token
  const filteredOrders = orders.filter(order => {
    // First filter by order status tab
    const statusMatch = tabValue === 0 ? true : 
                        tabValue === 1 ? order.status === 'pending' :
                        tabValue === 2 ? order.status === 'processing' :
                        tabValue === 3 ? order.status === 'ready' : false;
    
    // Then filter by juice bar if a specific one is selected
    const juiceBarMatch = selectedJuiceBar === 'all' ? true : 
                          parseInt(order.juice_bar_id) === parseInt(selectedJuiceBar);
    
    // Then filter by token number search
    const searchMatch = searchToken === '' ? true :
                        order.token_number.toString().includes(searchToken);
    
    return statusMatch && juiceBarMatch && searchMatch;
  });

  // Get count of orders by status
  const getOrderCountByStatus = (status) => {
    return orders.filter(o => 
      o.status === status && 
      (selectedJuiceBar === 'all' || parseInt(o.juice_bar_id) === parseInt(selectedJuiceBar))
    ).length;
  };

  // Get total order count for current juice bar filter
  const getTotalOrderCount = () => {
    return orders.filter(o => 
      selectedJuiceBar === 'all' || parseInt(o.juice_bar_id) === parseInt(selectedJuiceBar)
    ).length;
  };

  // Get juice bar name by ID
  const getJuiceBarName = (id) => {
    const juiceBar = juiceBars.find(jb => jb.juice_bar_id === parseInt(id));
    return juiceBar ? juiceBar.name : 'Unknown Location';
  };

  return (
    <OwnerSidebar>
      <Box className="order-management-container" sx={{ backgroundColor: '#f5f5f3', minHeight: '100vh', pb: 4 }}>
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          {/* Page Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1">Order Dashboard</Typography>
            <Button 
              variant="contained" 
              startIcon={<RefreshIcon />} 
              onClick={fetchOrders}
              disabled={loading}
            >
              Refresh Orders
            </Button>
          </Box>
          
          {/* Filters Section */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1, md: 0 } }}>
                  <FilterListIcon sx={{ mr: 1 }} /> Filter Orders
                </Typography>
              </Grid>
              <Grid item xs={12} md={5}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel id="juice-bar-filter-label">Juice Bar Location</InputLabel>
                  <Select
                    labelId="juice-bar-filter-label"
                    id="juice-bar-filter"
                    value={selectedJuiceBar}
                    onChange={handleJuiceBarChange}
                    label="Juice Bar Location"
                    disabled={loadingJuiceBars}
                  >
                    <MenuItem value="all">All Locations</MenuItem>
                    {juiceBars.map((juiceBar) => (
                      <MenuItem key={juiceBar.juice_bar_id} value={juiceBar.juice_bar_id}>
                        {juiceBar.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Search by token number"
                  value={searchToken}
                  onChange={handleSearchChange}
                  type="text"
                  inputProps={{
                    inputMode: 'numeric',
                    pattern: '[0-9]*'
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: searchToken && (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="clear search"
                          onClick={handleClearSearch}
                          edge="end"
                          size="small"
                        >
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </Paper>
          
          {/* Status Filter Tabs */}
          <Paper sx={{ mb: 3 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab label={`All Orders (${getTotalOrderCount()})`} />
              <Tab label={`Pending (${getOrderCountByStatus('pending')})`} />
              <Tab label={`Processing (${getOrderCountByStatus('processing')})`} />
              <Tab label={`Ready (${getOrderCountByStatus('ready')})`} />
            </Tabs>
          </Paper>

          {/* Selected Location Display */}
          {selectedJuiceBar !== 'all' && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">
                Showing orders for: <Chip label={getJuiceBarName(selectedJuiceBar)} color="primary" size="small" />
              </Typography>
            </Box>
          )}

          {/* Search Results Display */}
          {searchToken && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">
                Search results for token: <Chip label={searchToken} color="secondary" size="small" />
                {filteredOrders.length > 0 
                  ? ` (${filteredOrders.length} ${filteredOrders.length === 1 ? 'result' : 'results'} found)`
                  : ' (No matching orders found)'}
              </Typography>
            </Box>
          )}

          {/* Orders Table */}
          {loading && !filteredOrders.length ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
              <CircularProgress size={60} />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
          ) : filteredOrders.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="textSecondary">No orders found</Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {searchToken 
                  ? `No orders found matching token number: ${searchToken}`
                  : selectedJuiceBar !== 'all' 
                    ? `There are no ${tabValue === 0 ? '' : tabValue === 1 ? 'pending ' : tabValue === 2 ? 'processing ' : 'ready '}orders for ${getJuiceBarName(selectedJuiceBar)}.`
                    : tabValue === 0 ? 'There are no orders in the system.' : `There are no ${tabValue === 1 ? 'pending' : tabValue === 2 ? 'processing' : 'ready'} orders.`}
              </Typography>
              {searchToken && (
                <Button 
                  variant="outlined" 
                  onClick={handleClearSearch}
                  startIcon={<ClearIcon />}
                  sx={{ mt: 2 }}
                >
                  Clear Search
                </Button>
              )}
            </Paper>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Token #</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.order_id} hover>
                      <TableCell>
                        <Typography 
                          variant="subtitle2" 
                          sx={{
                            fontWeight: searchToken && order.token_number.toString().includes(searchToken) ? 'bold' : 'normal',
                            color: searchToken && order.token_number.toString().includes(searchToken) ? 'primary.main' : 'inherit'
                          }}
                        >
                          #{order.token_number}
                        </Typography>
                      </TableCell>
                      <TableCell>{order.customer_name}</TableCell>
                      <TableCell>
                        <Chip 
                          label={getJuiceBarName(order.juice_bar_id)} 
                          size="small" 
                          variant="outlined"
                          color="primary"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(order.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>Rs.{parseFloat(order.total_amount).toFixed(2)}</TableCell>
                      <TableCell>
                        <OrderStatusChip 
                          label={order.status} 
                          status={order.status} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleViewOrderDetails(order.order_id)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                          
                          {order.status === 'pending' && (
                            <Button 
                              size="small" 
                              variant="outlined" 
                              color="primary"
                              onClick={() => updateOrderStatus(order.order_id, 'processing')}
                              disabled={loading}
                            >
                              Process
                            </Button>
                          )}
                          
                          {order.status === 'processing' && (
                            <Button 
                              size="small" 
                              variant="outlined" 
                              color="success"
                              onClick={() => updateOrderStatus(order.order_id, 'ready')}
                              disabled={loading}
                            >
                              Mark Ready
                            </Button>
                          )}
                          
                          {order.status === 'ready' && (
                            <Button 
                              size="small" 
                              variant="outlined" 
                              color="success"
                              startIcon={<CheckIcon />}
                              onClick={() => updateOrderStatus(order.order_id, 'completed')}
                              disabled={loading}
                            >
                              Complete
                            </Button>
                          )}
                        </Box>
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
          onClose={() => setOrderDetailsOpen(false)}
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
                  <OrderStatusChip label={selectedOrder.status} status={selectedOrder.status} />
                </Box>
              </DialogTitle>
              <DialogContent>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1">Order Information</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 1 }}>
                    <Typography variant="body2">
                      <strong>Order ID:</strong> {selectedOrder.order_id}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Date:</strong> {new Date(selectedOrder.created_at).toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Location:</strong> {getJuiceBarName(selectedOrder.juice_bar_id)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Payment Method:</strong> {selectedOrder.payment_method === 'cash' ? 'Cash on Pickup' : 'Online Payment'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Total Amount:</strong> Rs.{parseFloat(selectedOrder.total_amount).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1">Customer Information</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 1 }}>
                    <Typography variant="body2">
                      <strong>Name:</strong> {selectedOrder.customer_name}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Email:</strong> {selectedOrder.customer_email}
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
                <Button onClick={() => setOrderDetailsOpen(false)}>Close</Button>
                
                {selectedOrder.status === 'pending' && (
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => {
                      updateOrderStatus(selectedOrder.order_id, 'processing');
                      setOrderDetailsOpen(false);
                    }}
                    disabled={loading}
                  >
                    Process Order
                  </Button>
                )}
                
                {selectedOrder.status === 'processing' && (
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => {
                      updateOrderStatus(selectedOrder.order_id, 'ready');
                      setOrderDetailsOpen(false);
                    }}
                    disabled={loading}
                  >
                    Mark as Ready
                  </Button>
                )}
                
                {selectedOrder.status === 'ready' && (
                  <Button 
                    variant="contained" 
                    color="success"
                    onClick={() => {
                      updateOrderStatus(selectedOrder.order_id, 'completed');
                      setOrderDetailsOpen(false);
                    }}
                    disabled={loading}
                  >
                    Complete Order
                  </Button>
                )}
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
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
        </Snackbar>
      </Box>
    </OwnerSidebar>
  );
};

export default OrderManagement;