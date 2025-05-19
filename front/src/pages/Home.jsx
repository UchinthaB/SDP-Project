import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Paper,
  Tabs,
  Tab,
  Modal,
  IconButton,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Fade,
  Grow,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Close as CloseIcon,
  ArrowForward as ArrowForwardIcon,
  LocalBar as LocalBarIcon,
  LocationOn as LocationOnIcon,
  Login as LoginIcon,
  AppRegistration as RegisterIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Instagram as InstagramIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon
} from '@mui/icons-material';
import './Home.css';

// Hero section background with overlay
const HeroSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  backgroundImage: 'url(https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 0
  }
}));

// Modal style with solid background
const ModalContent = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '100%',
  maxWidth: 400,
  backgroundColor: 'white',
  borderRadius: 8,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  border: '2px solid #008080',
  padding: theme.spacing(4),
  outline: 'none',
  overflow: 'hidden'
}));

// Location card with hover effect
const LocationCard = styled(Card)(({ theme, selected }) => ({
  height: '100%',
  borderRadius: 12,
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  border: selected ? `3px solid ${theme.palette.primary.main}` : 'none',
  transform: selected ? 'scale(1.03)' : 'scale(1)',
  boxShadow: selected ? theme.shadows[8] : theme.shadows[2],
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: theme.shadows[10]
  }
}));

// Styled buttons with hover effect
const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: 30,
  padding: '12px 30px',
  fontSize: '1rem',
  fontWeight: 600,
  textTransform: 'none',
  transition: 'all 0.3s ease',
  boxShadow: theme.shadows[3],
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: theme.shadows[6]
  }
}));

// Feature card
const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: 12,
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-8px)'
  }
}));

const Home = () => {
  const [selectedJuiceBar, setSelectedJuiceBar] = useState(null);
  const [juiceBars, setJuiceBars] = useState([]);
  const [openLoginModal, setOpenLoginModal] = useState(false);
  const [openRegisterModal, setOpenRegisterModal] = useState(false);
  const [openContactModal, setOpenContactModal] = useState(false);
  const [modalTab, setModalTab] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Fetch juice bars data when component mounts
  useEffect(() => {
    const fetchJuiceBars = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/products/juicebars');
        if (!response.ok) {
          throw new Error('Failed to fetch juice bars');
        }
        const data = await response.json();
        setJuiceBars(data);
      } catch (error) {
        console.error('Error fetching juice bars:', error);
      }
    };
    
    fetchJuiceBars();
  }, []);

  // In Home.jsx
useEffect(() => {
  if (window.location.hash === '#locations') {
    const locationsElement = document.getElementById('locations-section');
    if (locationsElement) {
      locationsElement.scrollIntoView({ behavior: 'smooth' });
    }
  }
}, []);
  
  const handleJuiceBarSelect = (juiceBarId) => {
  setSelectedJuiceBar(juiceBarId);
};
  
const handleExploreMenu = () => {
  if (selectedJuiceBar) {
    // Store selected juice bar in localStorage for use after login
    localStorage.setItem('selectedJuiceBar', selectedJuiceBar);
    navigate(`/customer/products?juicebarId=${selectedJuiceBar}`);
  } else {
    // Scroll to location selection with animation if no juice bar selected
    const locationsSection = document.getElementById('locations-section');
    if (locationsSection) {
      locationsSection.scrollIntoView({ behavior: 'smooth' });
    }
    
  }
};
  
  const handleLoginOpen = () => {
    setOpenLoginModal(true);
    setModalTab(0);
  };
  
  const handleRegisterOpen = () => {
    setOpenRegisterModal(true);
  };
  
  const handleContactOpen = () => {
    setOpenContactModal(true);
  };
  
  const handleLoginClose = () => {
    setOpenLoginModal(false);
  };
  
  const handleRegisterClose = () => {
    setOpenRegisterModal(false);
  };
  
  const handleContactClose = () => {
    setOpenContactModal(false);
  };
  
  const handleTabChange = (event, newValue) => {
    setModalTab(newValue);
  };
  
  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('token', data.token);
      
      // Redirect based on user role
      const userRole = data.user.role;
      if (userRole === 'customer') {
        navigate(handleExploreMenu);
      } else if (userRole === 'owner') {
        navigate('/owner/dashboard');
      } else if (userRole === 'employee') {
        navigate('/employee/dashboard');
      } else {
        navigate('/');
      }
      
      handleLoginClose();
    } catch (err) {
      console.error('Login failed:', err);
      alert('Login failed. Please check your credentials.');
    }
  };
  
  const handleRegister = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
          role: 'customer',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Signup failed');
      }

      alert('Registration successful! You can now log in.');
      handleRegisterClose();
      handleLoginOpen();
    } catch (err) {
      console.error('Registration failed:', err);
      alert(err.message || 'Registration failed. Please try again.');
    }
  };
  
  const handleContactSubmit = (e) => {
    e.preventDefault();
    // This would connect to your backend API to send the contact message
    alert(`Thank you for your message, ${contactName}! We will get back to you soon.`);
    handleContactClose();
  };

  return (
    <Box className="landing-page">
      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: 8 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Fade in={true} timeout={1000}>
                <Box>
                  <Typography 
                    variant="h1" 
                    component="h1" 
                    color="white" 
                    sx={{ 
                      fontWeight: 800, 
                      mb: 2,
                      fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' }
                    }}
                  >
                    Juice Bar - University of Kelaniya
                  </Typography>
                  <Typography 
                    variant="h5" 
                    color="white" 
                    sx={{ 
                      mb: 4, 
                      opacity: 0.9,
                      maxWidth: '600px'
                    }}
                  >
                    Experience the refreshing taste of freshly squeezed juices made from quality ingredients at our premium juice bars.
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 4 }}>
                    <ActionButton 
                      variant="contained" 
                      sx={{
                        backgroundColor: '#008080',
                        '&:hover': {
                          backgroundColor: '#006666'
                        }
                      }}
                      size="large"
                      endIcon={<ArrowForwardIcon />}
                      onClick={handleExploreMenu}
                      className="pulse-animation"
                    >
                      Explore Our Menu
                    </ActionButton>
                    <ActionButton 
                      variant="outlined" 
                      sx={{ 
                        color: 'white', 
                        borderColor: 'white',
                        borderRadius: '30px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                      }}
                      size="large"
                      onClick={handleLoginOpen}
                    >
                      Sign In
                    </ActionButton>
                  </Box>
                </Box>
              </Fade>
            </Grid>
          </Grid>
        </Container>
      </HeroSection>

      {/* Locations Section */}
      <Box 
        id="locations-section"
        sx={{ 
          py: 10, 
          px: 2,
          backgroundColor: '#f9f9f7'
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h2" component="h2" sx={{ fontWeight: 700, mb: 2 }}>
              Our Locations
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
              Select one of our two convenient juice bar locations to browse our menu and place your order.
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {juiceBars.length > 0 ? (
              juiceBars.map((juiceBar) => (
                <Grid item xs={12} md={6} key={juiceBar.juice_bar_id}>
                  <Grow in={true} timeout={1000} style={{ transformOrigin: '0 0 0' }}>
                    <LocationCard 
  onClick={() => setSelectedJuiceBar(juiceBar.juice_bar_id)}
  selected={selectedJuiceBar === juiceBar.juice_bar_id}
>
                      <CardMedia
                        component="img"
                        height="250"
                        image={juiceBar.juice_bar_id === 1 
                          ? "https://images.unsplash.com/photo-1589365278144-c9e705f843ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                          : "https://images.unsplash.com/photo-1563304997-8b6f97fb5c74?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                        }
                        alt={juiceBar.name}
                      />
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <LocationOnIcon color="primary" sx={{ mr: 1 }} />
                          <Typography variant="h5" component="h3" fontWeight={600}>
                            {juiceBar.name}
                          </Typography>
                        </Box>
                        <Typography variant="body1" color="text.secondary" paragraph>
                          {juiceBar.location}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Hours:</strong> {juiceBar.opening_hours} - {juiceBar.closing_hours}
                        </Typography>
                        {selectedJuiceBar === juiceBar.juice_bar_id && (
    <Button 
      variant="contained" 
      color="primary"
      sx={{ mt: 2 }}
      onClick={(e) => {
        e.stopPropagation(); // Prevent event bubbling
        handleExploreMenu();
      }}
    >
      Select This Location
    </Button>
                        )}
                      </CardContent>
                    </LocationCard>
                  </Grow>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary">
                    Loading juice bar locations...
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 10, px: 2, backgroundColor: 'white' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h2" component="h2" sx={{ fontWeight: 700, mb: 2 }}>
              Why Choose Us
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
              Experience the best fresh juice service with these amazing features
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={4}>
              <FeatureCard>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Box 
                    sx={{ 
                      mb: 3, 
                      width: 80, 
                      height: 80, 
                      backgroundColor: 'primary.light', 
                      borderRadius: '50%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      mx: 'auto'
                    }}
                  >
                    <LocalBarIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                  </Box>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                    Fresh Ingredients
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    We use only the freshest, high-quality ingredients in our juices for maximum nutrition and taste.
                  </Typography>
                </CardContent>
              </FeatureCard>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <FeatureCard>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Box 
                    sx={{ 
                      mb: 3, 
                      width: 80, 
                      height: 80, 
                      backgroundColor: 'success.light', 
                      borderRadius: '50%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      mx: 'auto'
                    }}
                  >
                    <span className="material-icons" style={{ fontSize: 40, color: theme.palette.success.main }}>
                      done_all
                    </span>
                  </Box>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                    Online Ordering
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Conveniently order your favorite juices online and receive a digital token for quick pickup.
                  </Typography>
                </CardContent>
              </FeatureCard>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <FeatureCard>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Box 
                    sx={{ 
                      mb: 3, 
                      width: 80, 
                      height: 80, 
                      backgroundColor: 'warning.light', 
                      borderRadius: '50%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      mx: 'auto'
                    }}
                  >
                    <span className="material-icons" style={{ fontSize: 40, color: theme.palette.warning.main }}>
                      star
                    </span>
                  </Box>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                    Customer Reviews
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Leave and read reviews to share your experience and discover our most popular offerings.
                  </Typography>
                </CardContent>
              </FeatureCard>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Call to Action */}
      <Box 
        sx={{ 
          py: 10, 
          px: 2,
          backgroundColor: 'primary.main',
          color: 'white',
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" component="h2" sx={{ fontWeight: 700, mb: 3 }}>
            Ready to enjoy fresh juice?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Create an account now to start ordering from our delicious range of fresh juices
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <ActionButton 
              variant="contained" 
              color="secondary" 
              size="large"
              onClick={handleRegisterOpen}
            >
              Create an Account
            </ActionButton>
            <ActionButton 
              variant="outlined" 
              sx={{ color: 'white', borderColor: 'white' }}
              size="large"
              onClick={handleContactOpen}
            >
              Contact Us
            </ActionButton>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box 
        sx={{ 
          py: 6, 
          px: 2,
          backgroundColor: '#1a1a1a',
          color: 'white'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                Fresh Juice Bar
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, opacity: 0.7 }}>
                Serving fresh, healthy juices made from the finest ingredients at our conveniently located juice bars.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <IconButton color="inherit">
                  <FacebookIcon />
                </IconButton>
                <IconButton color="inherit">
                  <InstagramIcon />
                </IconButton>
                <IconButton color="inherit">
                  <TwitterIcon />
                </IconButton>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Quick Links
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button color="inherit" onClick={handleLoginOpen} sx={{ justifyContent: 'flex-start' }}>
                  Login
                </Button>
                <Button color="inherit" onClick={handleRegisterOpen} sx={{ justifyContent: 'flex-start' }}>
                  Register
                </Button>
                <Button color="inherit" onClick={handleContactOpen} sx={{ justifyContent: 'flex-start' }}>
                  Contact Us
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Contact Information
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOnIcon sx={{ mr: 1, opacity: 0.7 }} />
                  <Typography variant="body2">
                    University of Kelaniya, Dalugama, Kelaniya
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EmailIcon sx={{ mr: 1, opacity: 0.7 }} />
                  <Typography variant="body2">
                    info@freshjuicebar.com
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PhoneIcon sx={{ mr: 1, opacity: 0.7 }} />
                  <Typography variant="body2">
                    +94 712 345 678
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 6, pt: 4, borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              © {new Date().getFullYear()} Fresh Juice Bar. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>

   <Modal
  open={openLoginModal}
  onClose={handleLoginClose}
  closeAfterTransition
  BackdropProps={{
    timeout: 500,
    style: {
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
  }}
>
  <Fade in={openLoginModal}>
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'white', // Full modal content will be white
        borderRadius: 2,
        boxShadow: 24,
        p: 4,
      }}
    >
      {/* All modal content goes inside this Box */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          Sign In
        </Typography>
        <IconButton onClick={handleLoginClose} edge="end">
          <CloseIcon />
        </IconButton>
      </Box>

      <form onSubmit={handleLogin}>
        <TextField
          label="Email"
          type="email"
          fullWidth
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          sx={{ mb: 2 }}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          sx={{ mb: 3 }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          sx={{ mb: 2 }}
        >
          Login
        </Button>
      </form>

      <Typography variant="body2" align="center" sx={{ mt: 2 }}>
        Don't have an account?{' '}
        <Button
          color="primary"
          onClick={() => {
            handleLoginClose();
            handleRegisterOpen();
          }}
          sx={{ p: 0, minWidth: 'auto' }}
        >
          Sign Up
        </Button>
      </Typography>
    </Box>
  </Fade>
</Modal>


      {/* Register Modal */}
      <Modal
  open={openRegisterModal}
  onClose={handleRegisterClose}
  closeAfterTransition
  BackdropProps={{
    timeout: 500,
    style: { 
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
    }
  }}
>
  <Fade in={openRegisterModal}>
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'white',
        borderRadius: 2,
        boxShadow: 24,
        p: 4,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          Create an Account
        </Typography>
        <IconButton onClick={handleRegisterClose} edge="end">
          <CloseIcon />
        </IconButton>
      </Box>
      
      <form onSubmit={handleRegister}>
        <TextField
          label="Username"
          type="text"
          fullWidth
          variant="outlined"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          sx={{ mb: 2 }}
        />
        <TextField
          label="Email"
          type="email"
          fullWidth
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          sx={{ mb: 2 }}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          sx={{ mb: 3 }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          sx={{ mb: 2 }}
        >
          Register
        </Button>
      </form>
      
      <Typography variant="body2" align="center" sx={{ mt: 2 }}>
        Already have an account?{' '}
        <Button 
          color="primary" 
          onClick={() => {
            handleRegisterClose();
            handleLoginOpen();
          }}
          sx={{ p: 0, minWidth: 'auto' }}
        >
          Sign In
        </Button>
      </Typography>
    </Box>
  </Fade>
</Modal>

      {/* Contact Modal */}
      <Modal
        open={openContactModal}
        onClose={handleContactClose}
        closeAfterTransition
        BackdropProps={{
          timeout: 500,
          style: { 
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
          }
        }}
      >
        <Fade in={openContactModal}>
          <ModalContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                Contact Us
              </Typography>
              <IconButton onClick={handleContactClose} edge="end">
                <CloseIcon />
              </IconButton>
            </Box>
            
            <form onSubmit={handleContactSubmit}>
              <TextField
                label="Your Name"
                type="text"
                fullWidth
                variant="outlined"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                label="Email"
                type="email"
                fullWidth
                variant="outlined"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                label="Message"
                multiline
                rows={4}
                fullWidth
                variant="outlined"
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                required
                sx={{ mb: 3 }}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
              >
                Send Message
              </Button>
            </form>
          </ModalContent>
        </Fade>
      </Modal>
    </Box>
  );
};

export default Home;