import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Grid,
  CircularProgress,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  AppBar,
  Toolbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Zoom,
  Fade
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  LocalCafe as LocalCafeIcon,
  Logout as LogoutIcon,
  ArrowBack as ArrowBackIcon
} from "@mui/icons-material";
import { styled } from '@mui/material/styles';
// import "./owner/productManagement.css";

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 20px rgba(0, 0, 0, 0.15)'
  }
}));

const AvailabilityChip = styled(Chip)(({ theme, available }) => ({
  backgroundColor: available ? theme.palette.success.light : theme.palette.error.light,
  color: available ? theme.palette.success.contrastText : theme.palette.error.contrastText,
  fontWeight: 'bold',
  '& .MuiChip-label': {
    textTransform: 'capitalize',
  }
}));

const EmployeeProductManagement = () => {   
    const [products, setProducts] = useState([]);
    const [juiceBars, setJuiceBars] = useState([]);
    const [selectedJuiceBar, setSelectedJuiceBar] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is logged in
        const userData = localStorage.getItem("user");
        if (!userData) {
            navigate("/login");
            return;
        }

        // Check if user is owner
        const user = JSON.parse(userData);
        if (user.user.role !== "employee") {
            navigate("/");
            return;
        }

        fetchData();
    }, [navigate, selectedJuiceBar]);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch juice bars first
            const juiceBarsResponse = await fetch("http://localhost:5000/api/products/juicebars");
            if (!juiceBarsResponse.ok) {
                throw new Error("Failed to fetch juice bars");
            }
            const juiceBarsData = await juiceBarsResponse.json();
            setJuiceBars(juiceBarsData);

            // Fetch products based on selected juice bar (or all if none selected)
            const productsUrl = selectedJuiceBar !== "" && !isNaN(selectedJuiceBar)
                ? `http://localhost:5000/api/products/get?juicebarId=${parseInt(selectedJuiceBar)}`
                : "http://localhost:5000/api/products/get";
            
            const productsResponse = await fetch(productsUrl);
            if (!productsResponse.ok) {
                throw new Error("Failed to fetch products");
            }
            const productsData = await productsResponse.json();
            setProducts(productsData);
        } catch (err) {
            console.error("Failed to fetch data:", err);
            setError(err.message);
            setSnackbar({
                open: true,
                message: `Error: ${err.message}`,
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAddProduct = () => {
        navigate("/owner/add-product");
    };

    const handleEditProduct = (productId) => {
        navigate(`/owner/edit-product/${productId}`);
    };

    const handleDeleteConfirm = (productId) => {
        setConfirmDelete(productId);
    };

    const handleDelete = async () => {
        if (!confirmDelete) return;
        
        try {
            const response = await fetch(
                `http://localhost:5000/api/products/delete/${confirmDelete}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.ok) {
                setProducts(prev => prev.filter(p => p.id !== confirmDelete));
                setSnackbar({
                    open: true,
                    message: 'Product deleted successfully',
                    severity: 'success'
                });
            } else {
                throw new Error("Failed to delete product");
            }
        } catch (err) {
            console.error("Error deleting product:", err);
            setSnackbar({
                open: true,
                message: 'Failed to delete product',
                severity: 'error'
            });
        } finally {
            setConfirmDelete(null);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <Box sx={{ backgroundColor: '#f5f5f3', minHeight: '100vh', pb: 4 }}>
            {/* App Bar */}
            <AppBar position="sticky" sx={{ backgroundColor: '#166d67' }}>
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={() => navigate('/owner/dashboard')}
                        sx={{ mr: 2 }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                        <LocalCafeIcon sx={{ mr: 1 }} /> Product Management
                    </Typography>
                    <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ mt: 4 }}>
                {/* Page Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" component="h1">Product Catalog</Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button 
                            variant="contained" 
                            startIcon={<RefreshIcon />} 
                            onClick={fetchData}
                            disabled={loading}
                            sx={{ backgroundColor: '#2196F3', '&:hover': { backgroundColor: '#1976D2' } }}
                        >
                            Refresh
                        </Button>
                        <Button 
                            variant="contained" 
                            startIcon={<AddIcon />} 
                            onClick={handleAddProduct}
                            sx={{ backgroundColor: '#4CAF50', '&:hover': { backgroundColor: '#45a049' } }}
                        >
                            Add Product
                        </Button>
                    </Box>
                </Box>
                
                {/* Filter Section */}
                <Paper sx={{ p: 3, mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                        <FormControl variant="outlined" sx={{ minWidth: 300 }}>
                            <InputLabel id="juicebar-select-label">Filter by Juice Bar</InputLabel>
                            <Select
                                labelId="juicebar-select-label"
                                id="juicebar-select"
                                value={selectedJuiceBar}
                                onChange={(e) => setSelectedJuiceBar(e.target.value)}
                                label="Filter by Juice Bar"
                            >
                                <MenuItem value="">All Juice Bars</MenuItem>
                                {juiceBars.map(juicebar => (
                                    <MenuItem key={juicebar.juice_bar_id} value={juicebar.juice_bar_id}>
                                        {juicebar.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Typography variant="body2" color="textSecondary" sx={{ ml: 'auto' }}>
                            {products.length} product{products.length !== 1 ? 's' : ''} found
                        </Typography>
                    </Box>
                </Paper>

                {/* Products Grid */}
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                        <CircularProgress size={60} />
                    </Box>
                ) : error ? (
                    <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
                ) : products.length === 0 ? (
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="h6" color="textSecondary">No products found</Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                            {selectedJuiceBar ? 'There are no products for this juice bar.' : 'There are no products in the system.'}
                        </Typography>
                        <Button 
                            variant="contained" 
                            startIcon={<AddIcon />} 
                            onClick={handleAddProduct}
                            sx={{ mt: 3 }}
                        >
                            Add Your First Product
                        </Button>
                    </Paper>
                ) : (
                    <Grid container spacing={3}>
                        {products.map((product, index) => {
                            let imageUrl = "";
                            try {
                                const parsedUrl = product.img_url 
                                    ? JSON.parse(product.img_url)
                                    : [];
                                imageUrl = parsedUrl.length > 0 ? parsedUrl[0] : "";
                            } catch (e) {
                                imageUrl = product.img_url || "";
                            }

                            return (
                                <Grid item xs={12} sm={6} md={4} key={product.id}>
                                    <Fade in={true} timeout={500} style={{ transitionDelay: `${index * 100}ms` }}>
                                        <Zoom in={true} timeout={{ enter: 500 }} style={{ transitionDelay: `${index * 100}ms` }}>
                                            <StyledCard>
                                                <CardMedia
                                                    component="img"
                                                    height="200"
                                                    image={imageUrl || "/placeholder-image.png"}
                                                    alt={product.name}
                                                    onError={(e) => {
                                                        e.target.src = "/placeholder-image.png";
                                                    }}
                                                />
                                                <CardContent sx={{ flexGrow: 1 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                                        <Typography variant="h6" component="h2" gutterBottom>
                                                            {product.name}
                                                        </Typography>
                                                        <AvailabilityChip 
                                                            label={product.is_available === 1 ? "Available" : "Out of Stock"} 
                                                            available={product.is_available === 1}
                                                            size="small" 
                                                        />
                                                    </Box>
                                                    <Typography variant="body2" color="text.secondary" sx={{ 
                                                        mb: 2, 
                                                        height: '3em', 
                                                        overflow: 'hidden', 
                                                        textOverflow: 'ellipsis', 
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical'
                                                    }}>
                                                        {product.description}
                                                    </Typography>
                                                    <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>
                                                        Rs {parseFloat(product.price).toFixed(2)}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Juice Bar: {product.juice_bar_name || 'Unknown'}
                                                    </Typography>
                                                </CardContent>
                                                <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        color="primary"
                                                        startIcon={<EditIcon />}
                                                        onClick={() => handleEditProduct(product.id)}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        color="error"
                                                        startIcon={<DeleteIcon />}
                                                        onClick={() => handleDeleteConfirm(product.id)}
                                                    >
                                                        Delete
                                                    </Button>
                                                </CardActions>
                                            </StyledCard>
                                        </Zoom>
                                    </Fade>
                                </Grid>
                            );
                        })}
                    </Grid>
                )}
            </Container>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={confirmDelete !== null}
                onClose={() => setConfirmDelete(null)}
            >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this product? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDelete(null)}>Cancel</Button>
                    <Button onClick={handleDelete} color="error">Delete</Button>
                </DialogActions>
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
    );
};

export default EmployeeProductManagement;