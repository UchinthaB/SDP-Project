import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { 
  Box, 
  Typography, 
  Button, 
  Select, 
  MenuItem, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia,
  Container,
  Avatar,
  Paper,
  Badge
} from "@mui/material";
import { styled } from '@mui/material/styles';
import { Logout, ShoppingBag, Person, History, ShoppingCart } from '@mui/icons-material';
import juiceBarHero from '../assets/juice-bar.jpeg';
import freshJuice from '../assets/fresh-juice.jpeg';
import healthyLiving from '../assets/healthy-living.jpg';
import './customer.css';

const HeroSection = styled(Box)(({ theme }) => ({
  height: '400px',
  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${juiceBarHero})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  color: 'white',
  textAlign: 'center',
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.03)',
    boxShadow: theme.shadows[6],
  },
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 3,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}));

const CustomerDashboard = () => {
    const [user, setUser] = useState(null);
    const [juiceBars, setJuiceBars] = useState([]);
    const [selectedJuiceBar, setSelectedJuiceBar] = useState("");
    const [cartItemCount, setCartItemCount] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            setUser(JSON.parse(userData));
        } else {
            navigate("/");
        }
    }, [location.pathname]);

    useEffect(() => {
        const fetchJuiceBars = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/products/juicebars");
                if (!res.ok) throw new Error("Failed to fetch juice bars");
                const data = await res.json();
                setJuiceBars(data);
            } catch (error) {
                console.error("Error fetching juice bars:", error);
            }
        };

        fetchJuiceBars();
    }, []);

    useEffect(() => {
        // Fetch cart items to show count
        const fetchCartItems = async () => {
            try {
                const userData = localStorage.getItem("user");
                if (!userData) return;
                
                const parsedUserData = JSON.parse(userData);
                const customerId = parsedUserData.user?.user_id;
                
                if (!customerId) return;
                
                const response = await fetch(`http://localhost:5000/api/cart/${customerId}`);
                
                if (!response.ok) return;
                
                const data = await response.json();
                setCartItemCount(data.length);
            } catch (err) {
                console.error("Error fetching cart:", err);
            }
        };

        fetchCartItems();
    }, []);

    const handleLogOut = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    const handleViewProducts = () => {
        if (selectedJuiceBar) {
            navigate(`/customer/products?juicebarId=${selectedJuiceBar}`);
        } else {
            alert("Please select a juice bar.");
        }
    };

    return (
        <Box sx={{ backgroundColor: '#f9f9f7' }}>
            <HeroSection>
                <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Welcome, {user?.username || "Customer"}!
                </Typography>
                <Typography variant="h5" component="p" sx={{ mb: 4 }}>
                    Discover fresh, healthy juices from local juice bars
                </Typography>
                
                <Paper elevation={3} sx={{ p: 3, backgroundColor: 'rgba(255, 255, 255, 0.9)', width: '80%', maxWidth: '600px' }}>
                    <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                        Select a Juice Bar to explore their products
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexDirection: { xs: 'column', sm: 'row' } }}>
                        <Select
                            value={selectedJuiceBar}
                            onChange={(e) => setSelectedJuiceBar(e.target.value)}
                            displayEmpty
                            fullWidth
                            sx={{ backgroundColor: 'white' }}
                        >
                            <MenuItem value="">-- Select Juice Bar --</MenuItem>
                            {juiceBars.map((bar) => (
                                <MenuItem key={bar.juice_bar_id} value={bar.juice_bar_id}>
                                    {bar.name}
                                </MenuItem>
                            ))}
                        </Select>
                        <Button 
                            variant="contained" 
                            onClick={handleViewProducts}
                            size="large"
                            sx={{ whiteSpace: 'nowrap' }}
                        >
                            View Products
                        </Button>
                    </Box>
                </Paper>
            </HeroSection>

            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Typography variant="h4" component="h2" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold', mb: 4 }}>
                    Why Choose Fresh Juice?
                </Typography>
                
                <Grid container spacing={4}>
                    <Grid item xs={12} md={4}>
                        <FeatureCard className="juice-bar-feature">
                            <CardMedia
                                component="img"
                                height="200"
                                image={freshJuice}
                                alt="Fresh Ingredients"
                            />
                            <CardContent>
                                <Typography gutterBottom variant="h5" component="div">
                                    Fresh Ingredients
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Our juice bars use only the freshest fruits and vegetables, sourced locally whenever possible.
                                </Typography>
                            </CardContent>
                        </FeatureCard>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <FeatureCard className="juice-bar-feature">
                            <CardMedia
                                component="img"
                                height="200"
                                image={healthyLiving}
                                alt="Health Benefits"
                            />
                            <CardContent>
                                <Typography gutterBottom variant="h5" component="div">
                                    Health Benefits
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Packed with vitamins and nutrients, our juices help boost your immune system and energy levels.
                                </Typography>
                            </CardContent>
                        </FeatureCard>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <FeatureCard className="juice-bar-feature">
                            <CardMedia
                                component="img"
                                height="200"
                                image="https://images.unsplash.com/photo-1603569283847-aa295f0d016a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
                                alt="Variety of Options"
                            />
                            <CardContent>
                                <Typography gutterBottom variant="h5" component="div">
                                    Variety of Options
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    From classic orange juice to exotic blends, we have something for every taste preference.
                                </Typography>
                            </CardContent>
                        </FeatureCard>
                    </Grid>
                </Grid>
            </Container>

            <Box sx={{ backgroundColor: 'primary.main', color: 'white', py: 6 }}>
                <Container maxWidth="lg">
                    <Grid container spacing={4} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Typography variant="h3" component="h2" gutterBottom>
                                Ready to Order?
                            </Typography>
                            <Typography variant="body1" gutterBottom sx={{ mb: 3 }}>
                                Select a juice bar above to browse their menu and place your order for pickup or delivery.
                            </Typography>
                            <Button 
                                variant="contained" 
                                color="secondary" 
                                size="large"
                                onClick={() => selectedJuiceBar ? handleViewProducts() : null}
                                disabled={!selectedJuiceBar}
                            >
                                Browse Products
                            </Button>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                <Avatar 
                                    src="https://images.unsplash.com/photo-1603569283847-aa295f0d016a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
                                    sx={{ width: 300, height: 300, border: '4px solid white' }}
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Button 
                        variant="outlined" 
                        startIcon={<History />}
                        onClick={() => navigate("/customer/order-history")}
                        size="large"
                    >
                        Order History
                    </Button>
                    <Button 
                        variant="outlined" 
                        startIcon={<Person />}
                        onClick={() => navigate("/customer/profile")}
                        size="large"
                    >
                        Profile
                    </Button>
                    <Button 
                        variant="outlined" 
                        onClick={() => navigate("/customer/cart")}
                        size="large"
                        color="primary"
                        startIcon={
                            <StyledBadge badgeContent={cartItemCount} color="secondary">
                                <ShoppingCart />
                            </StyledBadge>
                        }
                    >
                        View Cart
                    </Button>
                    <Button 
                        variant="outlined" 
                        startIcon={<Logout />}
                        onClick={handleLogOut}
                        size="large"
                        color="error"
                    >
                        Logout
                    </Button>
                </Box>
            </Container>
        </Box>
    );
};

export default CustomerDashboard;