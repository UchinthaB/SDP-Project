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
  Snackbar,
  AppBar,
  Toolbar,
  Badge,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Rating,
  TextField,
  Skeleton,
  Fade,
  Divider,
  useTheme,
  useMediaQuery
} from "@mui/material";
import MuiAlert from '@mui/material/Alert';
import { styled } from '@mui/material/styles';
import { 
  ArrowBack as ArrowBackIcon,
  LocalBar as LocalBarIcon,
  ShoppingCart as ShoppingCartIcon,
  Storefront as StorefrontIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Star as StarIcon,
  Info as InfoIcon,
  AddShoppingCart as AddShoppingCartIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import './customer.css';



const ProductCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  borderRadius: '4px',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[5],
  }
}));

const AvailabilityChip = styled(Chip)(({ available, theme }) => ({
  fontWeight: 'bold',
  fontSize: '0.75rem',
  padding: '0 8px',
  height: '24px',
  backgroundColor: available ? theme.palette.success.light : theme.palette.error.light,
  color: available ? theme.palette.success.contrastText : theme.palette.error.contrastText,
  '& .MuiChip-label': {
    padding: '0 8px',
  }
}));

const ProductImage = styled(CardMedia)(({ theme }) => ({
  height: '220px',
  position: 'relative',
  overflow: 'hidden',
  transition: 'transform 0.5s ease',
  '&:hover': {
    transform: 'scale(1.05)',
  }
}));

const PriceTag = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '12px',
  right: '12px',
  background: 'rgba(255, 255, 255, 0.9)',
  color: theme.palette.primary.main,
  padding: '4px 12px',
  borderRadius: '20px',
  fontWeight: 'bold',
  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  zIndex: 2,
}));

const AddToCartButton = styled(Button)(({ theme }) => ({
  borderRadius: '4px',
  padding: '8px 16px',
  fontWeight: 'bold',
  transition: 'all 0.3s ease',
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
  },
  '&.Mui-disabled': {
    backgroundColor: theme.palette.action.disabledBackground,
    color: theme.palette.action.disabled,
  }
}));

const PageHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, #166d67 0%, #4a6fa5 100%)`,
  padding: theme.spacing(3, 0),
  color: 'white',
  marginBottom: theme.spacing(4),
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 3,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}));

const CustomerProducts = () => {
    const [products, setProducts] = useState([]);
    const [juiceBarName, setJuiceBarName] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [loginDialogOpen, setLoginDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [cartCount, setCartCount] = useState(0);
    const [productDialogOpen, setProductDialogOpen] = useState(false);
    const [productDetailOpen, setProductDetailOpen] = useState(false);
    const [detailProduct, setDetailProduct] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    
    
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const queryParams = new URLSearchParams(location.search);
    const juicebarId = queryParams.get("juicebarId");

    useEffect(() => {
        // Check if user is logged in
        const userData = localStorage.getItem("user");
        if (userData) {
            setIsLoggedIn(true);
            fetchCartCount(JSON.parse(userData)?.user?.user_id);
        }

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

    const fetchCartCount = async (customerId) => {
        if (!customerId) return;
        
        try {
            const response = await fetch(`http://localhost:5000/api/cart/${customerId}`);
            if (response.ok) {
                const cartItems = await response.json();
                setCartCount(cartItems.length || 0);
            }
        } catch (err) {
            console.error("Error fetching cart count:", err);
        }
    };

  const handleAddToCart = async (product) => {
  // Check if user is logged in
  const userData = localStorage.getItem("user");
  
  if (!userData) {
    setSelectedProduct(product);
    setLoginDialogOpen(true); // Changed from setLoginModalOpen to setLoginDialogOpen
    
    return;
  }
  
  try {
    const parsedUserData = JSON.parse(userData);
    const customerId = parsedUserData?.user?.user_id;

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
      body: JSON.stringify({ 
        product_id: product.id, 
        customer_id: customerId 
      }),
    });
    
    const result = await response.json();
    if (response.ok) {
      setCartCount(prevCount => prevCount + 1);
      setSnackbarMessage(`${product.name} added to cart successfully!`);
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
    } else {
      setSnackbarMessage(result.message || 'Failed to add to cart');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  } catch (err) {
    console.error("Add to Cart Error:", err);
    setSnackbarMessage('Something went wrong while adding to cart');
    setSnackbarSeverity('error');
    setOpenSnackbar(true);
  }
};

    const handleViewProductDetails = (product) => {
        setDetailProduct(product);
        setProductDetailOpen(true);
    };

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackbar(false);
    };
    
    const handleLoginRedirect = () => {
        setLoginDialogOpen(false);
        navigate("/", { 
            state: { 
                from: location.pathname + location.search,
                productId: selectedProduct?.id
            } 
        });
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsLoggedIn(false);
        setCartCount(0);
        navigate("/login");
    };

    

  const handleaddtocartClick = () => {
    if (isLoggedIn) {
      navigate('/customerprofile');
    } else {
      navigate('/login');
    }
  };

    // Render product skeleton loading state
    const renderSkeletons = () => {
        return Array.from(new Array(6)).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={`skeleton-${index}`}>
                <Card sx={{ height: '100%', borderRadius: '12px' }}>
                    <Skeleton variant="rectangular" height={220} animation="wave" />
                    <CardContent>
                        <Skeleton animation="wave" height={32} width="70%" sx={{ mb: 1 }} />
                        <Skeleton animation="wave" height={20} width="40%" sx={{ mb: 1 }} />
                        <Skeleton animation="wave" height={60} sx={{ mb: 1 }} />
                        <Skeleton animation="wave" height={30} width="30%" sx={{ mb: 1 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                            <Skeleton animation="wave" height={36} width={120} />
                        </Box>
                    </CardContent>
                </Card>
            </Grid>
        ));
    };

    return (
        <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            {/* App Bar */}
            <AppBar position="sticky" sx={{ bgcolor: '#166d67' }}>
                <Toolbar>
                    <IconButton 
                        edge="start" 
                        color="inherit" 
                        onClick={() => navigate("/customer/dashboard")}
                        sx={{ mr: 2 }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                        <LocalBarIcon sx={{ mr: 1 }} />
                        {isMobile ? "Juice Bar" : "Juice Bar - University of Kelaniya"}
                    </Typography>
                    
                    {!isMobile && (
                        <>
                            <Button 
                                color="inherit" 
                                startIcon={<HomeIcon />}
                                onClick={() => navigate("/")}
                                sx={{ mr: 1 }}
                            >
                                Home
                            </Button>
                        </>
                    )}
                    
                    <IconButton 
                        color="inherit" 
                        onClick={() => navigate("/customer/cart")}
                        sx={{ mr: 1 }}
                    >
                        <StyledBadge badgeContent={cartCount} color="secondary">
                            <ShoppingCartIcon />
                        </StyledBadge>
                    </IconButton>
                    
                    {isLoggedIn ? (
                        <IconButton color="inherit" onClick={handleLogout}>
                            <LogoutIcon />
                        </IconButton>
                    ) : (
                        <Button 
                            color="inherit"
                            onClick={() => navigate("/login")}
                        >
                            Login
                        </Button>
                    )}
                </Toolbar>
            </AppBar>

            {/* Hero Section */}
            <PageHeader>
                <Container maxWidth="lg">
                    <Typography 
                        variant="h3" 
                        component="h1" 
                        sx={{ 
                            fontWeight: 'bold',
                            textShadow: '1px 1px 3px rgba(0,0,0,0.3)',
                            mb: 1
                        }}
                    >
                        {juiceBarName || "Juice Bar"}
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: '600px', mb: 3 }}>
                        Explore our refreshing selection of freshly made juices
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="contained"
                            color="secondary"
                            startIcon={<ShoppingCartIcon />}
                            onClick={() => navigate("/customer/cart")}
                            sx={{ 
                                borderRadius: '4px',
                                px: 3,
                                py: 1,
                                fontWeight: 'bold',
                                bgcolor: '#4a6fa5',
                                '&:hover': {
                                    bgcolor: '#3a5f95',
                                }
                            }}
                        >
                            View Cart{cartCount > 0 ? ` (${cartCount})` : ''}
                        </Button>
                        <Button
                            variant="outlined"
                            color="inherit"
                            startIcon={<StorefrontIcon />}
                            onClick={() => navigate("/#locations")}
                            sx={{ 
                                borderRadius: '4px',
                                px: 3,
                                py: 1,
                                fontWeight: 'bold',
                                borderColor: 'white',
                                '&:hover': {
                                    borderColor: 'white',
                                    backgroundColor: 'rgba(255,255,255,0.1)'
                                }
                            }}
                        >
                            Change Juice Bar
                        </Button>
                    </Box>
                </Container>
            </PageHeader>

            <Container maxWidth="lg" sx={{ py: 4 }}>
                {/* Product Listing Section */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Our Fresh Juices
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    
                    {loading ? (
                        <Grid container spacing={3}>
                            {renderSkeletons()}
                        </Grid>
                    ) : error ? (
                        <MuiAlert severity="error" sx={{ mb: 4 }}>
                            {error}
                        </MuiAlert>
                    ) : products.length === 0 ? (
                        <Box sx={{ 
                            textAlign: 'center', 
                            py: 10, 
                            bgcolor: 'rgba(0,0,0,0.02)', 
                            borderRadius: '12px',
                            border: '1px dashed rgba(0,0,0,0.1)'
                        }}>
                            <LocalBarIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h5" gutterBottom color="text.secondary">
                                No products available for this juice bar.
                            </Typography>
                            <Button 
                                variant="contained" 
                                onClick={() => navigate("/customer/dashboard")}
                                sx={{ mt: 2, borderRadius: '30px' }}
                            >
                                Browse Other Juice Bars
                            </Button>
                        </Box>
                    ) : (
                        <Fade in={!loading}>
                            <Grid container spacing={3}>
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
                                                <Box sx={{ position: 'relative' }}>
                                                    <ProductImage
                                                        component="img"
                                                        height="220"
                                                        image={imageUrl || "/placeholder-image.png"}
                                                        alt={product.name}
                                                        onError={(e) => (e.target.src = "/placeholder-image.png")}
                                                        onClick={() => handleViewProductDetails(product)}
                                                        sx={{ cursor: 'pointer' }}
                                                    />
                                                </Box>
                                                <CardContent sx={{ flexGrow: 1, px: 3, py: 2 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                                        <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                                                            {product.name}
                                                        </Typography>
                                                        <AvailabilityChip 
                                                            available={product.is_available} 
                                                            label={product.is_available ? "Available" : "Out of Stock"} 
                                                            size="small" 
                                                        />
                                                    </Box>
                                                    <Typography variant="body2" color="text.secondary" sx={{ 
                                                        mb: 2, 
                                                        display: '-webkit-box',
                                                        overflow: 'hidden',
                                                        WebkitBoxOrient: 'vertical',
                                                        WebkitLineClamp: 2,
                                                        height: '40px'
                                                    }}>
                                                        {product.description}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                                        <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                                                            Rs.{parseFloat(product.price).toFixed(2)}
                                                        </Typography>
                                                        <AddToCartButton 
                                                            onClick={() => handleAddToCart(product)}
                                                            variant="contained" 
                                                            color="primary"
                                                            disabled={!product.is_available}
                                                            endIcon={<AddShoppingCartIcon />}
                                                        >
                                                            Add to Cart
                                                        </AddToCartButton>
                                                    </Box>
                                                </CardContent>
                                            </ProductCard>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        </Fade>
                    )}
                </Box>
            </Container>

            {/* Login Dialog */}
            <Dialog
    open={loginDialogOpen}
    onClose={() => setLoginDialogOpen(false)}
    PaperProps={{
        sx: {
            height: 'auto',  // or set specific height like '200px'
            maxHeight: '300px' // limits maximum height
        }
    }}
>
                <DialogTitle>Login Required</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        You need to be logged in to add items to your cart. Would you like to login now?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setLoginDialogOpen(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleLoginRedirect} color="primary" variant="contained">
                        Login
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Product Detail Dialog */}
            <Dialog
                open={productDetailOpen}
                onClose={() => setProductDetailOpen(false)}
                maxWidth="md"
                fullWidth
            >
                {detailProduct && (
                    <>
                        <DialogTitle>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                {detailProduct.name}
                                <AvailabilityChip 
                                    available={detailProduct.is_available} 
                                    label={detailProduct.is_available ? "Available" : "Out of Stock"} 
                                    size="small" 
                                />
                            </Box>
                        </DialogTitle>
                        <DialogContent>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    {(() => {
                                        let imageUrl = "";
                                        try {
                                            const parsed = detailProduct.img_url ? JSON.parse(detailProduct.img_url) : [];
                                            imageUrl = parsed.length > 0 ? parsed[0] : "";
                                        } catch {
                                            imageUrl = detailProduct.img_url || "";
                                        }
                                        return (
                                            <Box
                                                component="img"
                                                sx={{
                                                    width: '100%',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                                }}
                                                src={imageUrl || "/placeholder-image.png"}
                                                alt={detailProduct.name}
                                                onError={(e) => (e.target.src = "/placeholder-image.png")}
                                            />
                                        );
                                    })()}
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="h6" gutterBottom>
                                        Description
                                    </Typography>
                                    <Typography variant="body1" paragraph>
                                        {detailProduct.description}
                                    </Typography>
                                    <Typography variant="h6" color="primary" gutterBottom>
                                        Rs.{parseFloat(detailProduct.price).toFixed(2)}
                                    </Typography>
                                    <Box sx={{ mt: 3 }}>
                                        <AddToCartButton 
                                            onClick={() => {
                                                handleAddToCart(detailProduct);
                                                setProductDetailOpen(false);
                                            }}
                                            variant="contained" 
                                            color="primary"
                                            fullWidth
                                            disabled={!detailProduct.is_available}
                                            startIcon={<AddShoppingCartIcon />}
                                            sx={{ mb: 2 }}
                                        >
                                            Add to Cart
                                        </AddToCartButton>
                                    </Box>
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setProductDetailOpen(false)} color="primary">
                                Close
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar 
                open={openSnackbar} 
                autoHideDuration={4000} 
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <MuiAlert 
                    onClose={handleCloseSnackbar} 
                    severity={snackbarSeverity} 
                    sx={{ width: '100%', boxShadow: '0 3px 10px rgba(0,0,0,0.2)' }}
                    variant="filled"
                >
                    {snackbarMessage}
                </MuiAlert>
            </Snackbar>
        </Box>
    );
};

export default CustomerProducts;