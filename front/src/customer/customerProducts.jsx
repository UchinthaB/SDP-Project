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
  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
  position: 'relative',
  overflow: 'hidden',
  borderRadius: '12px',
  border: '1px solid rgba(0,0,0,0.05)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 10px 20px rgba(0,0,0,0.08)',
  }
}));

const AvailabilityChip = styled(Chip)(({ available, theme }) => ({
  fontWeight: '500',
  fontSize: '0.75rem',
  padding: '0 6px',
  height: '24px',
  backgroundColor: available ? 'rgba(46, 174, 79, 0.1)' : 'rgba(230, 73, 73, 0.1)',
  color: available ? '#2eae4f' : '#e64949',
  border: `1px solid ${available ? 'rgba(46, 174, 79, 0.2)' : 'rgba(230, 73, 73, 0.2)'}`,
  '& .MuiChip-label': {
    padding: '0 6px',
  }
}));

const ProductImage = styled(CardMedia)(({ theme }) => ({
  height: '200px',
  position: 'relative',
  overflow: 'hidden',
  transition: 'transform 0.4s ease',
  '&:hover': {
    transform: 'scale(1.03)',
  }
}));

const PriceTag = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '12px',
  right: '12px',
  background: 'rgba(255, 255, 255, 0.95)',
  color: theme.palette.primary.main,
  padding: '4px 12px',
  borderRadius: '20px',
  fontWeight: '600',
  boxShadow: '0 2px 5px rgba(0,0,0,0.08)',
  zIndex: 2,
}));

const AddToCartButton = styled(Button)(({ theme }) => ({
  borderRadius: '8px',
  padding: '8px 16px',
  fontWeight: '500',
  fontSize: '0.875rem',
  transition: 'all 0.2s ease',
  textTransform: 'none',
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    boxShadow: '0 4px 8px rgba(0,0,0,0.12)',
  },
  '&.Mui-disabled': {
    backgroundColor: theme.palette.action.disabledBackground,
    color: theme.palette.action.disabled,
  }
}));

const PageHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, #166d67 0%, #4a6fa5 100%)`,
  padding: theme.spacing(4, 0),
  color: 'white',
  marginBottom: theme.spacing(4),
  boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 3,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
    backgroundColor: '#FF5555',
  },
}));

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#166d67',
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  [theme.breakpoints.up('md')]: {
    padding: '0 24px',
  }
}));

const HeroButton = styled(Button)(({ theme, color }) => ({
  borderRadius: '8px',
  padding: '10px 20px',
  fontWeight: '500',
  textTransform: 'none',
  boxShadow: '0 3px 6px rgba(0,0,0,0.1)',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
  }
}));

const ProductDetailImage = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '300px',
  objectFit: 'cover',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.02)',
  }
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
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

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
      setLoginDialogOpen(true);
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
    navigate("/");
  };

  // Render product skeleton loading state
  const renderSkeletons = () => {
    return Array.from(new Array(6)).map((_, index) => (
      <Grid item xs={12} sm={6} md={4} key={`skeleton-${index}`}>
        <Card sx={{ height: '100%', borderRadius: '12px' }}>
          <Skeleton variant="rectangular" height={200} animation="wave" />
          <CardContent>
            <Skeleton animation="wave" height={28} width="70%" sx={{ mb: 1 }} />
            <Skeleton animation="wave" height={20} width="40%" sx={{ mb: 1 }} />
            <Skeleton animation="wave" height={48} sx={{ mb: 1 }} />
            <Skeleton animation="wave" height={24} width="30%" sx={{ mb: 1 }} />
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
      <StyledAppBar position="sticky">
        <StyledToolbar>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton 
              edge="start" 
              color="inherit" 
              onClick={() => navigate("/customer/dashboard")}
              sx={{ mr: 1 }}
            >
              <ArrowBackIcon />
            </IconButton>
            
            <Typography variant="h6" component="div" sx={{ 
              fontWeight: 500, 
              fontSize: isMobile ? '1rem' : '1.2rem',
              display: 'flex', 
              alignItems: 'center' 
            }}>
              <LocalBarIcon sx={{ mr: 1 }} />
              {isMobile ? "Juice Bar" : "Juice Bar - University of Kelaniya"}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {!isMobile && (
              <Button 
                color="inherit" 
                startIcon={<HomeIcon />}
                onClick={() => navigate("/")}
                sx={{ mr: 2, textTransform: 'none' }}
              >
                Home
              </Button>
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
                onClick={() => navigate("/")}
                sx={{ textTransform: 'none' }}
              >
                Login
              </Button>
            )}
          </Box>
        </StyledToolbar>
      </StyledAppBar>

      {/* Hero Section */}
      <PageHeader>
        <Container maxWidth="lg">
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ 
              fontWeight: 600,
              fontSize: isMobile ? '2rem' : '2.5rem',
              textShadow: '1px 1px 3px rgba(0,0,0,0.2)',
              mb: 1.5
            }}
          >
            {juiceBarName || "Juice Bar"}
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              opacity: 0.9, 
              maxWidth: '600px', 
              mb: 3,
              fontSize: isMobile ? '1rem' : '1.1rem',
              fontWeight: 400
            }}
          >
            Explore our refreshing selection of freshly made juices
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
            <HeroButton
              variant="contained"
              color="secondary"
              startIcon={<ShoppingCartIcon />}
              onClick={() => navigate("/customer/cart")}
              sx={{ 
                bgcolor: '#4a6fa5',
                '&:hover': {
                  bgcolor: '#3a5f95',
                },
                width: isMobile ? '100%' : 'auto',
                mb: isMobile ? 1 : 0
              }}
            >
              View Cart{cartCount > 0 ? ` (${cartCount})` : ''}
            </HeroButton>
            <HeroButton
              variant="outlined"
              color="inherit"
              startIcon={<StorefrontIcon />}
              onClick={() => navigate("/#locations")}
              sx={{ 
                borderColor: 'rgba(255,255,255,0.7)',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)'
                },
                width: isMobile ? '100%' : 'auto'
              }}
            >
              Change Juice Bar
            </HeroButton>
          </Box>
        </Container>
      </PageHeader>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Product Listing Section */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            component="h2" 
            gutterBottom 
            sx={{ 
              fontWeight: 600, 
              fontSize: isMobile ? '1.75rem' : '2rem',
              mb: 1
            }}
          >
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
              py: 8, 
              bgcolor: 'rgba(0,0,0,0.02)', 
              borderRadius: '12px',
              border: '1px dashed rgba(0,0,0,0.1)'
            }}>
              <LocalBarIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" gutterBottom color="text.secondary" sx={{ fontWeight: 500 }}>
                No products available for this juice bar.
              </Typography>
              <Button 
                variant="contained" 
                onClick={() => navigate("/customer/dashboard")}
                sx={{ 
                  mt: 2, 
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 500
                }}
              >
                Browse Other Juice Bars
              </Button>
            </Box>
          ) : (
            <Fade in={!loading} timeout={500}>
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
                            height="200"
                            image={imageUrl || "/placeholder-image.png"}
                            alt={product.name}
                            onError={(e) => (e.target.src = "/placeholder-image.png")}
                            onClick={() => handleViewProductDetails(product)}
                            sx={{ cursor: 'pointer' }}
                          />
                          <PriceTag>
                            Rs.{parseFloat(product.price).toFixed(2)}
                          </PriceTag>
                        </Box>
                        <CardContent sx={{ flexGrow: 1, px: 2.5, py: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography gutterBottom variant="h6" component="div" sx={{ 
                              fontWeight: 600,
                              fontSize: '1.1rem',
                              marginBottom: 0 
                            }}>
                              {product.name}
                            </Typography>
                            <AvailabilityChip 
                              available={product.is_available} 
                              label={product.is_available ? "Available" : "Out of Stock"} 
                              size="small" 
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ 
                            my: 1.5, 
                            display: '-webkit-box',
                            overflow: 'hidden',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 2,
                            height: '40px',
                            lineHeight: 1.4
                          }}>
                            {product.description}
                          </Typography>
                          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
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
            width: '100%',
            maxWidth: '400px',
            borderRadius: '12px',
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>Login Required</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'text.primary', opacity: 0.8 }}>
            You need to be logged in to add items to your cart. Would you like to login now?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setLoginDialogOpen(false)} 
            color="inherit"
            sx={{ textTransform: 'none', fontWeight: 500 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleLoginRedirect} 
            color="primary" 
            variant="contained"
            sx={{ 
              textTransform: 'none', 
              fontWeight: 500,
              borderRadius: '8px', 
              px: 3 
            }}
          >
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
        PaperProps={{
          sx: {
            borderRadius: '12px',
            overflow: 'hidden'
          }
        }}
      >
        {detailProduct && (
          <>
            <DialogTitle sx={{ py: 2, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {detailProduct.name}
                </Typography>
                <AvailabilityChip 
                  available={detailProduct.is_available} 
                  label={detailProduct.is_available ? "Available" : "Out of Stock"} 
                  size="small" 
                />
              </Box>
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
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
                      <ProductDetailImage
                        component="img"
                        src={imageUrl || "/placeholder-image.png"}
                        alt={detailProduct.name}
                        onError={(e) => (e.target.src = "/placeholder-image.png")}
                      />
                    );
                  })()}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom sx={{ 
                    fontWeight: 600,
                    color: 'text.primary',
                    fontSize: '1.1rem',
                    mb: 1.5
                  }}>
                    Description
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ 
                    color: 'text.secondary',
                    lineHeight: 1.6,
                    mb: 3
                  }}>
                    {detailProduct.description}
                  </Typography>
                  <Typography variant="h5" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
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
                      sx={{ 
                        mb: 2,
                        py: 1.5, 
                        fontWeight: 500,
                        fontSize: '1rem'
                      }}
                    >
                      Add to Cart
                    </AddToCartButton>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
              <Button 
                onClick={() => setProductDetailOpen(false)} 
                color="primary"
                sx={{ 
                  textTransform: 'none', 
                  fontWeight: 500,
                  borderRadius: '8px'
                }}
              >
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
          sx={{ 
            width: '100%', 
            boxShadow: '0 3px 12px rgba(0,0,0,0.15)',
            borderRadius: '8px'
          }}
          variant="filled"
        >
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default CustomerProducts;