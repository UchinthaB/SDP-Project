// Update these imports in customerProducts.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia,
  Container,
  CircularProgress,
  Chip,
  IconButton,
  Snackbar
} from "@mui/material";
import MuiAlert from '@mui/material/Alert';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocalBarIcon from '@mui/icons-material/LocalBar';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import './customer.css';

// Use MuiAlert directly instead of creating a custom Alert component
// Remove this code:
// const Alert = React.forwardRef(function Alert(props, ref) {
//   return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
// });

// And replace any usage of <Alert> with <MuiAlert>
// For example, change:
// <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
//   {snackbarMessage}
// </Alert>

// To:
// <MuiAlert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
//   {snackbarMessage}
// </MuiAlert>

const ProductCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[6],
  },
}));

const AvailabilityChip = styled(Chip)(({ available, theme }) => ({
  backgroundColor: available ? theme.palette.success.light : theme.palette.error.light,
  color: available ? theme.palette.success.contrastText : theme.palette.error.contrastText,
}));

const CustomerProducts = () => {
    const [products, setProducts] = useState([]);
    const [juiceBarName, setJuiceBarName] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const navigate = useNavigate();
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const juicebarId = queryParams.get("juicebarId");

    useEffect(() => {
        const fetchProducts = async () => {
            if (!juicebarId) {
                setError("No juice bar selected.");
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(`http://localhost:5000/api/products/get?juicebarId=${juicebarId}`);
                if (!res.ok) throw new Error("Failed to fetch products");
                const data = await res.json();
                setProducts(data);
                if (data.length > 0) setJuiceBarName(data[0].juice_bar_name);
                setError(null);
            } catch (err) {
                console.error("Error fetching products:", err);
                setError("Something went wrong while fetching products.");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [juicebarId]);

    const handleAddToCart = async (productId) => {
        try {
            const loginData = JSON.parse(localStorage.getItem("user"));
            const customerId = loginData?.user?.user_id;

            if (!customerId) {
                setSnackbarMessage('Please login to add items to cart');
                setSnackbarSeverity('error');
                setOpenSnackbar(true);
                return;
            }
      
            const response = await fetch("http://localhost:5000/api/cart/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ product_id: productId, customer_id: customerId }),
            });
            
            const result = await response.json();
            if (response.ok) {
                setSnackbarMessage('Product added to cart!');
                setSnackbarSeverity('success');
                setOpenSnackbar(true);
            } else {
                setSnackbarMessage(result.message || 'Failed to add to cart');
                setSnackbarSeverity('error');
                setOpenSnackbar(true);
            }
        } catch (err) {
            console.error("Add to Cart Error:", err);
            setSnackbarMessage('Something went wrong!');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
        }
    };

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackbar(false);
    };

    return (
        <Box sx={{ backgroundColor: '#f5f5f3', minHeight: '100vh' }}>
            <Box sx={{ backgroundColor: 'primary.main', color: 'white', py: 3 }}>
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
                            {juiceBarName || "Juice Bar"} Products
                        </Typography>
                        <Button
                            variant="contained"
                            color="secondary"
                            startIcon={<ShoppingCartIcon />}
                            onClick={() => navigate("/customer/cart")}
                            sx={{ ml: 'auto', mr: 2 }}
                        >
                            Go to Cart
                        </Button>
                        <LocalBarIcon sx={{ fontSize: 40 }} />
                    </Box>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ py: 4 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                        <CircularProgress size={60} />
                    </Box>
                ) : error ? (
                    <MuiAlert severity="error" sx={{ mb: 4 }}>
                        {error}
                    </MuiAlert>
                ) : products.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 10 }}>
                        <Typography variant="h5" gutterBottom>
                            No products available for this juice bar.
                        </Typography>
                        <Button 
                            variant="contained" 
                            onClick={() => navigate("/customer/dashboard")}
                            sx={{ mt: 2 }}
                        >
                            Back to Dashboard
                        </Button>
                    </Box>
                ) : (
                    <Grid container spacing={4}>
                        {products.map(product => {
                            let imageUrl = "";
                            try {
                                const parsed = product.img_url ? JSON.parse(product.img_url) : [];
                                imageUrl = parsed.length > 0 ? parsed[0] : "";
                            } catch {
                                imageUrl = product.img_url || "";
                            }

                            return (
                                <Grid item xs={12} sm={6} md={4} key={product.id}>
                                    <ProductCard>
                                        <CardMedia
                                            component="img"
                                            height="220"
                                            image={imageUrl || "/placeholder-image.png"}
                                            alt={product.name}
                                            onError={(e) => (e.target.src = "/placeholder-image.png")}
                                        />
                                        <CardContent sx={{ flexGrow: 1 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                <Typography gutterBottom variant="h5" component="div">
                                                    {product.name}
                                                </Typography>
                                                <AvailabilityChip 
                                                    available={product.is_available} 
                                                    label={product.is_available ? "Available" : "Out of Stock"} 
                                                    size="small" 
                                                />
                                            </Box>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                {product.description}
                                            </Typography>
                                            <Typography variant="h6" color="primary">
                                                Rs.{parseFloat(product.price).toFixed(2)}
                                            </Typography>
                                        </CardContent>
                                        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                            <Button 
                                                onClick={() => handleAddToCart(product.id)}
                                                variant="contained" 
                                                size="small"
                                                disabled={!product.is_available}
                                            >
                                                Add to Cart
                                            </Button>
                                        </Box>
                                    </ProductCard>
                                </Grid>
                            );
                        })}
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

export default CustomerProducts;