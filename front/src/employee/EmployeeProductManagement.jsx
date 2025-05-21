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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Zoom,
  Fade,
  TextField,
  InputAdornment,
  Divider,
  useTheme,
  Tooltip
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterAlt as FilterAltIcon,
  LocalCafe as LocalCafeIcon,
  AttachMoney as AttachMoneyIcon,
  Store as StoreIcon
} from "@mui/icons-material";
import { styled } from '@mui/material/styles';
import EmployeeSidebar from "./EmployeeSidebar";

// Styled components with modern design principles
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 6px 15px rgba(0, 0, 0, 0.08)',
  '&:hover': {
    transform: 'translateY(-6px)',
    boxShadow: '0 12px 20px rgba(0, 0, 0, 0.12)'
  }
}));

const CardHeader = styled(Box)({
  position: 'relative',
  height: '220px',
  overflow: 'hidden'
});

const CardOverlay = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: '60px',
  background: 'linear-gradient(to bottom, rgba(0,0,0,0.4), transparent)',
  zIndex: 1
});

const CardTitle = styled(Typography)({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  padding: '16px',
  background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
  color: 'white',
  fontWeight: '600',
  textShadow: '0 1px 2px rgba(0,0,0,0.4)',
  zIndex: 1
});

const AvailabilityChip = styled(Chip)(({ available }) => ({
  position: 'absolute',
  top: '12px',
  right: '12px',
  zIndex: 2,
  backgroundColor: available ? '#4caf50' : '#f44336',
  color: 'white',
  fontWeight: 'bold',
  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  '& .MuiChip-label': {
    textTransform: 'capitalize',
  }
}));

const PriceChip = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '12px',
  left: '12px',
  zIndex: 2,
  backgroundColor: 'white',
  color: theme.palette.primary.main,
  fontWeight: 'bold',
  padding: '4px 10px',
  borderRadius: '20px',
  display: 'flex',
  alignItems: 'center',
  boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
  '& svg': {
    fontSize: '16px',
    marginRight: '4px'
  }
}));

const SearchBox = styled(Paper)(({ theme }) => ({
  padding: '6px 16px',
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  borderRadius: '28px',
  boxShadow: '0 3px 8px rgba(0,0,0,0.08)',
  transition: 'all 0.3s ease',
  border: '1px solid #e0e0e0',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
    borderColor: theme.palette.primary.main,
  },
  '&:focus-within': {
    boxShadow: '0 4px 12px rgba(22, 109, 103, 0.15)',
    borderColor: theme.palette.primary.main,
  }
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  borderRadius: '28px',
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#e0e0e0',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
  },
  '& .MuiSelect-select': {
    paddingRight: '32px !important',
  }
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  '& .MuiInputLabel-root': {
    color: '#666',
    '&.Mui-focused': {
      color: theme.palette.primary.main,
    }
  }
}));

const EmptyStateBox = styled(Paper)(({ theme }) => ({
  padding: '40px',
  textAlign: 'center',
  borderRadius: '16px',
  boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px dashed #ccc',
  backgroundColor: '#fafafa'
}));

const EmptyStateIcon = styled(Box)(({ theme }) => ({
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  backgroundColor: '#f1f8f7',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '24px',
  '& svg': {
    fontSize: '40px',
    color: theme.palette.primary.main
  }
}));

const ActionButton = styled(Button)(({ theme, color = 'primary', variant = 'contained' }) => ({
  borderRadius: '28px',
  boxShadow: variant === 'contained' ? '0 4px 10px rgba(0,0,0,0.15)' : 'none',
  padding: '8px 20px',
  fontWeight: '600',
  textTransform: 'none',
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: variant === 'contained' ? '0 6px 15px rgba(0,0,0,0.2)' : 'none',
    transform: 'translateY(-2px)'
  }
}));

const CountBadge = styled(Box)(({ theme }) => ({
  padding: '6px 16px',
  backgroundColor: '#f1f8f7',
  borderRadius: '28px',
  color: theme.palette.primary.main,
  fontWeight: 'bold',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.08)',
  border: '1px solid #d0e6e4',
  fontSize: '14px'
}));

const EmployeeProductManagement = () => {   
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [juiceBars, setJuiceBars] = useState([]);
    const [selectedJuiceBar, setSelectedJuiceBar] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const navigate = useNavigate();
    const theme = useTheme();

    useEffect(() => {
        // Check if user is logged in
        const userData = localStorage.getItem("user");
        if (!userData) {
            navigate("/");
            return;
        }

        // Check if user is employee
        const user = JSON.parse(userData);
        if (user.user.role !== "employee") {
            navigate("/");
            return;
        }

        fetchData();
    }, [navigate, selectedJuiceBar]);

    // Filter products when search term or products change
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredProducts(products);
        } else {
            const searchTermLower = searchTerm.toLowerCase();
            const filtered = products.filter(product => 
                product.name.toLowerCase().includes(searchTermLower) || 
                (product.description && product.description.toLowerCase().includes(searchTermLower))
            );
            setFilteredProducts(filtered);
        }
    }, [searchTerm, products]);

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
            setFilteredProducts(productsData);
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
        navigate("/employee/add-product");
    };

    const handleEditProduct = (productId) => {
        navigate(`/employee/edit-product/${productId}`);
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
                setFilteredProducts(prev => prev.filter(p => p.id !== confirmDelete));
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

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const clearSearch = () => {
        setSearchTerm("");
    };

    return (
        <EmployeeSidebar>
        <Box sx={{ 
            backgroundColor: '#f8f9fa', 
            minHeight: '100vh', 
            pb: 6,
            pt: 3
        }}>
            <Container maxWidth="lg">
                {/* Page Header with modern design */}
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', md: 'row' },
                    justifyContent: 'space-between', 
                    alignItems: { xs: 'flex-start', md: 'center' }, 
                    mb: 4,
                    gap: 2
                }}>
                    <Box>
                        <Typography 
                            variant="h4" 
                            component="h1" 
                            sx={{ 
                                fontWeight: 700, 
                                color: '#2d3748',
                                mb: 1 
                            }}
                        >
                            Product Catalog
                        </Typography>
                        <Typography 
                            variant="body1" 
                            sx={{ 
                                color: '#718096',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <LocalCafeIcon sx={{ mr: 1, fontSize: 20 }} />
                            Manage your juice bar products
                        </Typography>
                    </Box>
                    <Box sx={{ 
                        display: 'flex', 
                        gap: 2,
                        mt: { xs: 2, md: 0 }
                    }}>
                        <Tooltip title="Refresh product list">
                            <ActionButton
                                variant="outlined"
                                startIcon={<RefreshIcon />}
                                onClick={fetchData}
                                disabled={loading}
                                color="primary"
                                sx={{ borderColor: theme.palette.primary.main }}
                            >
                                Refresh
                            </ActionButton>
                        </Tooltip>
                        <Tooltip title="Add a new product">
                            <ActionButton
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleAddProduct}
                                color="primary"
                                sx={{ bgcolor: theme.palette.primary.main }}
                            >
                                Add Product
                            </ActionButton>
                        </Tooltip>
                    </Box>
                </Box>
                
                {/* Search and Filter Section - Simplified Design */}
                <Paper sx={{ 
                    p: 3, 
                    mb: 4, 
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                    <Box sx={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: 2,
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        {/* Search Bar - Simple Design */}
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            border: '1px solid #e0e0e0',
                            borderRadius: '4px',
                            p: '2px 8px',
                            width: { xs: '100%', sm: '300px' },
                            '&:focus-within': {
                                borderColor: theme.palette.primary.main,
                                boxShadow: `0 0 0 1px ${theme.palette.primary.main}`
                            }
                        }}>
                            <SearchIcon color="action" fontSize="small" sx={{ mr: 1 }} />
                            <TextField
                                fullWidth
                                placeholder="Search products..."
                                variant="standard"
                                size="small"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                InputProps={{
                                    disableUnderline: true,
                                    endAdornment: searchTerm && (
                                        <InputAdornment position="end">
                                            <IconButton onClick={clearSearch} edge="end" size="small">
                                                <ClearIcon fontSize="small" />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ 
                                    '& input': { py: 1 }
                                }}
                            />
                        </Box>

                        {/* Middle Section with Filter Dropdown - Simple Design */}
                        <Box sx={{ 
                            width: { xs: '100%', sm: 'auto' },
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <FormControl
                                variant="outlined"
                                size="small"
                                sx={{ width: { xs: '100%', sm: '240px' } }}
                            >
                                <Select
                                    value={selectedJuiceBar}
                                    onChange={(e) => setSelectedJuiceBar(e.target.value)}
                                    displayEmpty
                                    startAdornment={
                                        <InputAdornment position="start">
                                            <FilterAltIcon fontSize="small" sx={{ color: 'action.active', mr: 0.5 }} />
                                        </InputAdornment>
                                    }
                                    renderValue={(selected) => {
                                        if (selected === "") {
                                            return "All Juice Bars";
                                        }
                                        const selectedBar = juiceBars.find(bar => bar.juice_bar_id.toString() === selected.toString());
                                        return selectedBar ? selectedBar.name : "All Juice Bars";
                                    }}
                                    MenuProps={{
                                        PaperProps: {
                                            style: {
                                                maxHeight: 300,
                                                width: 280
                                            }
                                        }
                                    }}
                                >
                                    <MenuItem value="">All Juice Bars</MenuItem>
                                    <Divider sx={{ my: 0.5 }} />
                                    {juiceBars.map(juicebar => (
                                        <MenuItem 
                                            key={juicebar.juice_bar_id} 
                                            value={juicebar.juice_bar_id}
                                            sx={{ whiteSpace: 'normal', wordBreak: 'break-word' }}
                                        >
                                            {juicebar.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>

                        {/* Count Badge - Simple Design */}
                        <Box sx={{ 
                            ml: { xs: 0, sm: 'auto' },
                            backgroundColor: '#f5f5f5',
                            borderRadius: '4px',
                            px: 2,
                            py: 1,
                            display: 'flex',
                            alignItems: 'center',
                            border: '1px solid #e0e0e0'
                        }}>
                            <Typography variant="body2" fontWeight="medium">
                                {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                            </Typography>
                        </Box>
                    </Box>
                </Paper>

                {/* Products Grid with modern cards */}
                {loading ? (
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        py: 10,
                        flexDirection: 'column',
                        gap: 3
                    }}>
                        <CircularProgress size={50} sx={{ color: theme.palette.primary.main }} />
                        <Typography variant="body1" color="textSecondary">Loading products...</Typography>
                    </Box>
                ) : error ? (
                    <Alert 
                        severity="error" 
                        sx={{ 
                            mt: 2, 
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                        }}
                    >
                        {error}
                    </Alert>
                ) : filteredProducts.length === 0 ? (
                    <EmptyStateBox>
                        <EmptyStateIcon>
                            <LocalCafeIcon />
                        </EmptyStateIcon>
                        <Typography variant="h6" color="textSecondary" gutterBottom>
                            {searchTerm 
                                ? `No products found matching "${searchTerm}"` 
                                : selectedJuiceBar 
                                    ? 'No products available for this juice bar.' 
                                    : 'No products in the system.'
                            }
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 3, maxWidth: 500 }}>
                            {searchTerm 
                                ? 'Try a different search term or clear your search.' 
                                : 'Add your first product to get started with inventory management.'
                            }
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            {searchTerm ? (
                                <ActionButton
                                    variant="outlined"
                                    onClick={clearSearch}
                                    startIcon={<ClearIcon />}
                                >
                                    Clear Search
                                </ActionButton>
                            ) : null}
                            <ActionButton
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleAddProduct}
                                sx={{ bgcolor: theme.palette.primary.main }}
                            >
                                Add First Product
                            </ActionButton>
                        </Box>
                    </EmptyStateBox>
                ) : (
                    <Grid container spacing={3}>
                        {filteredProducts.map((product, index) => {
                            let imageUrl = "";
                            try {
                                const parsedUrl = product.img_url 
                                    ? JSON.parse(product.img_url)
                                    : [];
                                imageUrl = parsedUrl.length > 0 ? parsedUrl[0] : "";
                            } catch (e) {
                                imageUrl = product.img_url || "";
                            }

                            // Calculate the delay based on position in the grid
                            const rowIndex = Math.floor(index / 3);
                            const colIndex = index % 3;
                            const delayMs = (rowIndex * 100) + (colIndex * 50);

                            return (
                                <Grid item xs={12} sm={6} md={4} key={product.id}>
                                    <Fade in={true} timeout={600} style={{ transitionDelay: `${delayMs}ms` }}>
                                        <Zoom in={true} timeout={{ enter: 500 }} style={{ transitionDelay: `${delayMs}ms` }}>
                                            <StyledCard>
                                                <CardHeader>
                                                    <CardOverlay />
                                                    <AvailabilityChip 
                                                        label={product.is_available === 1 ? "Available" : "Out of Stock"} 
                                                        available={product.is_available === 1}
                                                        size="small" 
                                                    />
                                                    <PriceChip>
                                                        <AttachMoneyIcon />
                                                        Rs {parseFloat(product.price).toFixed(2)}
                                                    </PriceChip>
                                                    <CardMedia
                                                        component="img"
                                                        height="220"
                                                        image={imageUrl || "/placeholder-image.png"}
                                                        alt={product.name}
                                                        onError={(e) => {
                                                            e.target.src = "/placeholder-image.png";
                                                        }}
                                                        sx={{ 
                                                            height: '100%',
                                                            objectFit: 'cover',
                                                            transition: 'transform 0.3s ease',
                                                            '&:hover': {
                                                                transform: 'scale(1.05)'
                                                            }
                                                        }}
                                                    />
                                                    <CardTitle variant="h6">
                                                        {product.name}
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent sx={{ flexGrow: 1, pt: 2 }}>
                                                    <Typography variant="body2" color="text.secondary" sx={{ 
                                                        mb: 2, 
                                                        minHeight: '40px',
                                                        overflow: 'hidden', 
                                                        textOverflow: 'ellipsis', 
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical'
                                                    }}>
                                                        {product.description || "No description available"}
                                                    </Typography>
                                                    <Box sx={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center',
                                                        mt: 'auto' 
                                                    }}>
                                                        <StoreIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main, opacity: 0.7 }} />
                                                        <Typography variant="body2" color="text.secondary" fontWeight="medium">
                                                            {product.juice_bar_name || 'Unknown Location'}
                                                        </Typography>
                                                    </Box>
                                                </CardContent>
                                                <Divider sx={{ mx: 2 }} />
                                                <CardActions sx={{ p: 2, justifyContent: 'space-between' }}>
                                                    <ActionButton
                                                        size="small"
                                                        variant="outlined"
                                                        color="primary"
                                                        startIcon={<EditIcon />}
                                                        onClick={() => handleEditProduct(product.id)}
                                                        sx={{ borderColor: theme.palette.primary.main }}
                                                    >
                                                        Edit
                                                    </ActionButton>
                                                    <ActionButton
                                                        size="small"
                                                        variant="outlined"
                                                        color="error"
                                                        startIcon={<DeleteIcon />}
                                                        onClick={() => handleDeleteConfirm(product.id)}
                                                        sx={{ 
                                                            borderColor: theme.palette.error.main,
                                                            color: theme.palette.error.main
                                                        }}
                                                    >
                                                        Delete
                                                    </ActionButton>
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
                PaperProps={{
                    style: {
                        borderRadius: '16px',
                        padding: '12px'
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 600 }}>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this product? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={() => setConfirmDelete(null)}
                        sx={{ 
                            borderRadius: '28px', 
                            textTransform: 'none',
                            fontWeight: 500
                        }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleDelete} 
                        color="error"
                        variant="contained"
                        sx={{ 
                            borderRadius: '28px', 
                            textTransform: 'none',
                            fontWeight: 500,
                            boxShadow: '0 3px 8px rgba(244, 67, 54, 0.2)'
                        }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={() => setSnackbar({ ...snackbar, open: false })} 
                    severity={snackbar.severity}
                    sx={{ 
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                        width: '100%'
                    }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
        </EmployeeSidebar>
    );
};

export default EmployeeProductManagement;