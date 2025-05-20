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
  useTheme,
  Stack,
  Divider
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
  Twitter as TwitterIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon
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
    background: 'linear-gradient(to right, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.5) 100%)',
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
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
  overflow: 'hidden',
  padding: 0
}));

// Location card with hover effect
const LocationCard = styled(Card)(({ theme, selected }) => ({
  height: '100%',
  borderRadius: 16,
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  cursor: 'pointer',
  border: selected ? `2px solid ${theme.palette.primary.main}` : 'none',
  transform: selected ? 'translateY(-8px)' : 'translateY(0)',
  boxShadow: selected 
    ? '0 14px 28px rgba(0,0,0,0.18), 0 10px 10px rgba(0,0,0,0.15)' 
    : '0 3px 6px rgba(0,0,0,0.08), 0 3px 6px rgba(0,0,0,0.1)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 14px 28px rgba(0,0,0,0.18), 0 10px 10px rgba(0,0,0,0.15)'
  }
}));

// Styled buttons with hover effect
const ActionButton = styled(Button)(({ theme, variant }) => ({
  borderRadius: 30,
  padding: '12px 30px',
  fontSize: '1rem',
  fontWeight: 500,
  textTransform: 'none',
  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  boxShadow: variant === 'contained' ? '0 4px 10px rgba(0,0,0,0.15)' : 'none',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: variant === 'contained' 
      ? '0 6px 14px rgba(0,0,0,0.2)' 
      : '0 3px 8px rgba(255,255,255,0.15)'
  }
}));

// Feature card
const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: 16,
  overflow: 'hidden',
  transition: 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  boxShadow: '0 3px 6px rgba(0,0,0,0.08), 0 3px 6px rgba(0,0,0,0.1)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 10px 20px rgba(0,0,0,0.15), 0 6px 6px rgba(0,0,0,0.1)'
  }
}));

// Section Container
const SectionContainer = styled(Container)(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
  }
}));

// Modal Form Styling
const ModalHeader = styled(Box)(({ theme }) => ({
  borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
  padding: theme.spacing(3),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const ModalBody = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
}));

const ModalFooter = styled(Box)(({ theme }) => ({
  borderTop: '1px solid rgba(0, 0, 0, 0.08)',
  padding: theme.spacing(3),
  textAlign: 'center',
}));

// Form Button
const FormButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  padding: '10px 0',
  fontSize: '1rem',
  fontWeight: 500,
  textTransform: 'none',
}));

// Location Badge
const LocationBadge = styled(Box)(({ theme, selected }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '6px 12px',
  borderRadius: 50,
  backgroundColor: selected ? theme.palette.primary.main : 'rgba(0, 0, 0, 0.06)',
  color: selected ? theme.palette.primary.contrastText : theme.palette.text.secondary,
  fontWeight: 500,
  fontSize: '0.875rem',
  marginBottom: theme.spacing(1)
}));

// Section Title
const SectionTitle = styled(Typography)(({ theme }) => ({
  position: 'relative',
  display: 'inline-block',
  marginBottom: theme.spacing(1),
  fontWeight: 700,
  '&:after': {
    content: '""',
    position: 'absolute',
    bottom: -8,
    left: 0,
    width: 60,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.palette.primary.main
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
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  
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

  // Scroll to locations section if hash is present
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
    // Check if user is logged in
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        // Auto-fill the email field with logged in user's email
        setContactEmail(user.user.email || '');
        // Optionally auto-fill name field if you have username
        setContactName(user.user.username || '');
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }
    
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
 
  // Contact Modal
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is logged in
    const userData = localStorage.getItem("user");
    if (!userData) {
      // Show registration prompt if not logged in
      alert("Please register or login before sending a message.");
      handleContactClose();
      handleRegisterOpen();
      return;
    }
    
    try {
      const parsedUserData = JSON.parse(userData);
      const token = localStorage.getItem("token");
      
      const response = await fetch('http://localhost:5000/api/messages/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          message: contactMessage
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      // Clear form and show success message
      setContactName('');
      setContactEmail('');
      setContactMessage('');
      alert("Thank you for your message! We will get back to you soon.");
      handleContactClose();
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message. Please try again later.');
    }
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
                      fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
                      lineHeight: 1.2,
                      textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                    }}
                  >
                    Fresh & Healthy Juice Bar
                  </Typography>
                  <Typography 
                    variant="h5" 
                    color="white" 
                    sx={{ 
                      mb: 4, 
                      opacity: 0.95,
                      maxWidth: '600px',
                      fontWeight: 400,
                      lineHeight: 1.5,
                      textShadow: '0 1px 3px rgba(0,0,0,0.2)'
                    }}
                  >
                    Experience the refreshing taste of freshly squeezed juices made from premium quality ingredients at University of Kelaniya.
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 4 }}>
                    <ActionButton 
                      variant="contained" 
                      sx={{
                        backgroundColor: '#00a896',
                        '&:hover': {
                          backgroundColor: '#008f83'
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
                        borderColor: 'rgba(255,255,255,0.7)',
                        '&:hover': {
                          borderColor: 'white',
                          backgroundColor: 'rgba(255,255,255,0.1)'
                        }
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
          py: { xs: 8, md: 12 }, 
          px: 2,
          backgroundColor: '#f8f9fa'
        }}
      >
        <SectionContainer maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
            <SectionTitle 
              variant="h2" 
              component="h2" 
              sx={{ 
                fontWeight: 700, 
                mb: 3,
                display: 'inline-block',
                position: 'relative',
                '&:after': {
                  left: '50%',
                  transform: 'translateX(-50%)'
                }
              }}
            >
              Our Locations
            </SectionTitle>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ 
                maxWidth: 700, 
                mx: 'auto',
                fontSize: '1.1rem',
                lineHeight: 1.6,
                fontWeight: 400
              }}
            >
              Select one of our convenient juice bar locations to browse our menu and place your order.
            </Typography>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            alignItems: 'center', 
            flexDirection: { xs: 'column', md: 'row' },
            gap: 4,
            maxWidth: 1000,
            mx: 'auto'
          }}>
            {juiceBars.length > 0 ? (
              juiceBars.map((juiceBar) => (
                <Box 
                  key={juiceBar.juice_bar_id} 
                  sx={{ 
                    width: '100%', 
                    maxWidth: { xs: '100%', sm: '450px' } 
                  }}
                >
                  <Grow in={true} timeout={1000} style={{ transformOrigin: '0 0 0' }}>
                    <LocationCard 
                      onClick={() => setSelectedJuiceBar(juiceBar.juice_bar_id)}
                      selected={selectedJuiceBar === juiceBar.juice_bar_id}
                    >
                      <Box sx={{ position: 'relative' }}>
                        <Box sx={{ position: 'relative', height: 250, overflow: 'hidden' }}>
                        <CardMedia
                          component="img"
                          height="250"
                          image={juiceBar.juice_bar_id === 1 
                            ? "https://images.unsplash.com/photo-1622597467836-f3e6707e1ad7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" // Fresh tropical juice selection
                            : "https://images.unsplash.com/photo-1600271886742-f049cd451bba?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" // Fruit juice bar counter
                          }
                          alt={juiceBar.name}
                          sx={{
                            transition: 'transform 0.5s ease',
                            '&:hover': {
                              transform: 'scale(1.05)'
                            }
                          }}
                        />
                        <Box sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: '50%',
                          background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
                          display: 'flex',
                          alignItems: 'flex-end',
                          padding: 2,
                        }}>
                          <Typography 
                            color="white" 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 600,
                              textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                            }}
                          >
                            {juiceBar.juice_bar_id === 1 ? "Premium Fresh Juice Selection" : "Handcrafted Fruit Juices"}
                          </Typography>
                        </Box>
                      </Box>
                        {selectedJuiceBar === juiceBar.juice_bar_id && (
                          <Box sx={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            backgroundColor: 'primary.main',
                            color: 'white',
                            borderRadius: '50%',
                            width: 40,
                            height: 40,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                          }}>
                            <CheckCircleIcon />
                          </Box>
                        )}
                      </Box>
                      <CardContent sx={{ p: 3 }}>
                        <LocationBadge selected={selectedJuiceBar === juiceBar.juice_bar_id}>
                          <LocationOnIcon sx={{ mr: 0.5, fontSize: 16 }} />
                          {juiceBar.name}
                        </LocationBadge>
                        <Typography 
                          variant="h5" 
                          component="h3" 
                          fontWeight={600}
                          sx={{ mb: 1 }}
                        >
                          {juiceBar.location}
                        </Typography>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          color: 'text.secondary',
                          mb: 2
                        }}>
                          <ScheduleIcon sx={{ mr: 1, fontSize: 18 }} />
                          <Typography variant="body2">
                            {juiceBar.opening_hours} - {juiceBar.closing_hours}
                          </Typography>
                        </Box>
                        <Button 
                          variant={selectedJuiceBar === juiceBar.juice_bar_id ? "contained" : "outlined"}
                          color="primary"
                          fullWidth
                          sx={{ 
                            mt: 1,
                            textTransform: 'none',
                            borderRadius: 2,
                            py: 1
                          }}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent event bubbling
                            handleJuiceBarSelect(juiceBar.juice_bar_id);
                            if (selectedJuiceBar === juiceBar.juice_bar_id) {
                              handleExploreMenu();
                            }
                          }}
                        >
                          {selectedJuiceBar === juiceBar.juice_bar_id ? "Browse Menu" : "Select Location"}
                        </Button>
                      </CardContent>
                    </LocationCard>
                  </Grow>
                </Box>
              ))
            ) : (
              <Box sx={{ 
                p: 4, 
                textAlign: 'center', 
                width: '100%',
                borderRadius: 2,
                backgroundColor: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}>
                <Typography variant="h6" color="text.secondary">
                  Loading juice bar locations...
                </Typography>
              </Box>
            )}
          </Box>
        </SectionContainer>
      </Box>

      {/* Features Section */}
      <Box sx={{ 
        py: { xs: 8, md: 12 }, 
        px: 2, 
        backgroundColor: 'white',
        background: 'linear-gradient(180deg, white 0%, #f3f7fa 100%)'
      }}>
        <SectionContainer maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
            <SectionTitle 
              variant="h2" 
              component="h2" 
              sx={{ 
                fontWeight: 700, 
                mb: 3,
                display: 'inline-block',
                position: 'relative',
                '&:after': {
                  left: '50%',
                  transform: 'translateX(-50%)'
                }
              }}
            >
              Why Choose Us
            </SectionTitle>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ 
                maxWidth: 700, 
                mx: 'auto',
                fontSize: '1.1rem',
                lineHeight: 1.6,
                fontWeight: 400
              }}
            >
              Experience the best fresh juice service with these amazing features
            </Typography>
          </Box>
          
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} sm={6} md={4}>
              <FeatureCard>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Box 
                    sx={{ 
                      mb: 3, 
                      width: 80, 
                      height: 80, 
                      backgroundColor: 'rgba(0, 168, 150, 0.1)', 
                      borderRadius: '50%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      mx: 'auto'
                    }}
                  >
                    <LocalBarIcon sx={{ fontSize: 40, color: '#00a896' }} />
                  </Box>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                    Fresh Ingredients
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    We use only the freshest, high-quality ingredients in our juices for maximum nutrition and taste.
                  </Typography>
                </CardContent>
              </FeatureCard>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <FeatureCard sx={{ transform: { md: 'translateY(-16px)' } }}>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Box 
                    sx={{ 
                      mb: 3, 
                      width: 80, 
                      height: 80, 
                      backgroundColor: 'rgba(0, 122, 255, 0.1)', 
                      borderRadius: '50%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      mx: 'auto'
                    }}
                  >
                    <span className="material-icons" style={{ fontSize: 40, color: '#007aff' }}>
                      done_all
                    </span>
                  </Box>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                    Online Ordering
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
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
                      backgroundColor: 'rgba(255, 149, 0, 0.1)', 
                      borderRadius: '50%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      mx: 'auto'
                    }}
                  >
                    <span className="material-icons" style={{ fontSize: 40, color: '#ff9500' }}>
                      star
                    </span>
                  </Box>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                    Customer Reviews
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    Leave and read reviews to share your experience and discover our most popular offerings.
                  </Typography>
                </CardContent>
              </FeatureCard>
            </Grid>
          </Grid>
        </SectionContainer>
      </Box>

      {/* Call to Action */}
      <Box 
        sx={{ 
          py: { xs: 8, md: 12 }, 
          px: 2,
          background: 'linear-gradient(135deg, #00a896 0%, #028090 100%)',
          color: 'white',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&:before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%)',
            backgroundSize: '120% 120%',
            backgroundPosition: 'center',
            zIndex: 0
          }
        }}
      >
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography 
            variant="h3" 
            component="h2" 
            sx={{ 
              fontWeight: 700, 
              mb: 3,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              textShadow: '0 2px 6px rgba(0,0,0,0.1)'
            }}
          >
            Ready to enjoy fresh juice?
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 4, 
              opacity: 0.95,
              maxWidth: 700,
              mx: 'auto',
              lineHeight: 1.6,
              fontWeight: 400
            }}
          >
            Create an account now to start ordering from our delicious range of fresh juices
          </Typography>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            justifyContent="center"
            sx={{ mt: 4 }}
          >
            <ActionButton 
              variant="contained" 
              color="secondary" 
              size="large"
              sx={{
                backgroundColor: 'white',
                color: '#00a896',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.9)',
                }
              }}
              onClick={handleRegisterOpen}
            >
              Create an Account
            </ActionButton>
            <ActionButton 
              variant="outlined" 
              sx={{ 
                color: 'white', 
                borderColor: 'rgba(255,255,255,0.7)',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
              size="large"
              onClick={handleContactOpen}
            >
              Contact Us
            </ActionButton>
          </Stack>
        </Container>
      </Box>

      {/* Footer */}
      <Box 
        sx={{ 
          py: 8, 
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
              <Typography variant="body2" sx={{ mb: 3, opacity: 0.8, lineHeight: 1.8 }}>
                Serving fresh, healthy juices made from the finest ingredients at our conveniently located juice bars at the University of Kelaniya.
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
                <IconButton 
                  color="inherit" 
                  sx={{ 
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      transform: 'translateY(-3px)'
                    }
                  }}
                >
                  <FacebookIcon fontSize="small" />
                </IconButton>
                <IconButton 
                  color="inherit" 
                  sx={{ 
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      transform: 'translateY(-3px)'
                    }
                  }}
                >
                  <InstagramIcon fontSize="small" />
                </IconButton>
                <IconButton 
                  color="inherit" 
                  sx={{ 
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      transform: 'translateY(-3px)'
                    }
                  }}
                >
                  <TwitterIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Quick Links
              </Typography>
              <Stack spacing={1.5}>
                <Button 
                  color="inherit" 
                  onClick={handleLoginOpen} 
                  sx={{ 
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    opacity: 0.8,
                    '&:hover': {
                      opacity: 1,
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                  startIcon={<LoginIcon />}
                >
                  Login
                </Button>
                <Button 
                  color="inherit" 
                  onClick={handleRegisterOpen} 
                  sx={{ 
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    opacity: 0.8,
                    '&:hover': {
                      opacity: 1,
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                  startIcon={<RegisterIcon />}
                >
                  Register
                </Button>
                <Button 
                  color="inherit" 
                  onClick={handleContactOpen} 
                  sx={{ 
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    opacity: 0.8,
                    '&:hover': {
                      opacity: 1,
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                  startIcon={<EmailIcon />}
                >
                  Contact Us
                </Button>
              </Stack>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Contact Information
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <LocationOnIcon sx={{ mt: 0.5, mr: 1.5, opacity: 0.7, fontSize: 20 }} />
                  <Typography variant="body2" sx={{ opacity: 0.8, lineHeight: 1.6 }}>
                    University of Kelaniya, Dalugama, Kelaniya
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <EmailIcon sx={{ mt: 0.5, mr: 1.5, opacity: 0.7, fontSize: 20 }} />
                  <Typography variant="body2" sx={{ opacity: 0.8, lineHeight: 1.6 }}>
                    info@freshjuicebar.com
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <PhoneIcon sx={{ mt: 0.5, mr: 1.5, opacity: 0.7, fontSize: 20 }} />
                  <Typography variant="body2" sx={{ opacity: 0.8, lineHeight: 1.6 }}>
                    +94 712 345 678
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              © {new Date().getFullYear()} Fresh Juice Bar. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Login Modal */}
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
          <ModalContent>
            <ModalHeader>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                Sign In
              </Typography>
              <IconButton onClick={handleLoginClose} edge="end" aria-label="close">
                <CloseIcon />
              </IconButton>
            </ModalHeader>
            
            <ModalBody>
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
                <FormButton
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  sx={{ mb: 1 }}
                >
                  Login
                </FormButton>
              </form>
            </ModalBody>
            
            <ModalFooter>
              <Typography variant="body2">
                Don't have an account?{' '}
                <Button
                  color="primary"
                  onClick={() => {
                    handleLoginClose();
                    handleRegisterOpen();
                  }}
                  sx={{ p: 0, minWidth: 'auto', fontWeight: 500 }}
                >
                  Sign Up
                </Button>
              </Typography>
            </ModalFooter>
          </ModalContent>
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
          <ModalContent>
            <ModalHeader>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                Create an Account
              </Typography>
              <IconButton onClick={handleRegisterClose} edge="end" aria-label="close">
                <CloseIcon />
              </IconButton>
            </ModalHeader>
            
            <ModalBody>
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
                <FormButton
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                >
                  Register
                </FormButton>
              </form>
            </ModalBody>
            
            <ModalFooter>
              <Typography variant="body2">
                Already have an account?{' '}
                <Button 
                  color="primary" 
                  onClick={() => {
                    handleRegisterClose();
                    handleLoginOpen();
                  }}
                  sx={{ p: 0, minWidth: 'auto', fontWeight: 500 }}
                >
                  Sign In
                </Button>
              </Typography>
            </ModalFooter>
          </ModalContent>
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
            <ModalHeader>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                Contact Us
              </Typography>
              <IconButton onClick={handleContactClose} edge="end" aria-label="close">
                <CloseIcon />
              </IconButton>
            </ModalHeader>
            
            <ModalBody>
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
                <FormButton
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                >
                  Send Message
                </FormButton>
              </form>
            </ModalBody>
          </ModalContent>
        </Fade>
      </Modal>
    </Box>
  );
};

export default Home;