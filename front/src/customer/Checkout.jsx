import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Box, 
  Typography, 
  Button, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  TextField,
  CircularProgress,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Snackbar
} from "@mui/material";
import { styled } from '@mui/material/styles';
import './customer.css';

// Updated styling to add white background
const PaymentMethodDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    backgroundColor: '#ffffff',
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[5]
  },
  '& .MuiDialogContent-root': {
    padding: theme.spacing(3),
    backgroundColor: '#ffffff'
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(2),
    backgroundColor: '#ffffff'
  },
  '& .MuiDialogTitle-root': {
    backgroundColor: '#ffffff',
    borderBottom: `1px solid ${theme.palette.divider}`
  }
}));

const PaymentField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const Checkout = ({ cartItems, totalAmount }) => {
  const [open, setOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [token, setToken] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  
  const navigate = useNavigate();
  
  const steps = ['Select Payment Method', 'Process Payment', 'Order Confirmation'];

  useEffect(() => {
    // If no cart items, redirect to cart page
    if (!cartItems || cartItems.length === 0) {
      navigate('/customer/cart');
    }
  }, [cartItems, navigate]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setActiveStep(0);
    setPaymentMethod('cash');
    // Reset payment form fields
    setCardNumber('');
    setCardName('');
    setExpiryDate('');
    setCvv('');
  };

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
  };

  const handleCardNumberChange = (event) => {
    // Only allow numbers and limit to 16 digits
    const value = event.target.value.replace(/[^0-9]/g, '').slice(0, 16);
    setCardNumber(value);
  };

  const handleExpiryDateChange = (event) => {
    // Format as MM/YY
    let value = event.target.value.replace(/[^0-9]/g, '').slice(0, 4);
    if (value.length > 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    setExpiryDate(value);
  };

  const handleCvvChange = (event) => {
    // Only allow numbers and limit to 3-4 digits
    const value = event.target.value.replace(/[^0-9]/g, '').slice(0, 4);
    setCvv(value);
  };

  const validatePaymentDetails = () => {
    if (paymentMethod === 'online') {
      if (!cardNumber || cardNumber.length < 16) {
        setError('Please enter a valid 16-digit card number');
        return false;
      }
      if (!cardName) {
        setError('Please enter the cardholder name');
        return false;
      }
      if (!expiryDate || expiryDate.length < 5) {
        setError('Please enter a valid expiry date (MM/YY)');
        return false;
      }
      if (!cvv || cvv.length < 3) {
        setError('Please enter a valid CVV code');
        return false;
      }
    }
    setError(null);
    return true;
  };

  

  const processPayment = async () => {
  if (!validatePaymentDetails()) {
    return;
  }

  setIsProcessing(true);
  setActiveStep(1);

  try {
    const userData = JSON.parse(localStorage.getItem("user"));
    const customerId = userData?.user?.user_id;
    const token = userData?.token;
    
    if (!customerId || !token) {
      throw new Error('User not found. Please log in again.');
    }
    
    const orderData = {
      customer_id: customerId,
      total_amount: totalAmount,
      payment_method: paymentMethod,
      items: cartItems.map(item => ({
        product_id: item.product_id || item.id,
        quantity: 1,
        price: item.price
      }))
    };
    
    const response = await fetch('http://localhost:5000/api/orders/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create order');
    }
    
    const responseData = await response.json();
    setToken(responseData.token_number);
    setActiveStep(2);
    setOrderPlaced(true);
    await clearCart(customerId, token);
    
    setSnackbarMessage(`Order placed successfully! Your token number is ${responseData.token_number}`);
    setOpenSnackbar(true);
    
  } catch (err) {
    console.error("Error processing payment:", err);
    setError(err.message || 'Failed to process payment. Please try again.');
    setActiveStep(0);
  } finally {
    setIsProcessing(false);
  }
};

const clearCart = async (customerId, token) => {
  try {
    for (const item of cartItems) {
      await fetch(`http://localhost:5000/api/cart/remove/${item.cart_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    }
  } catch (err) {
    console.error("Error clearing cart:", err);
  }
};
  
  const handleProceedToCheckout = () => {
    handleClickOpen();
  };
  
  const handleConfirmPayment = () => {
    processPayment();
  };
  
  const handleViewOrderStatus = () => {
    navigate('/customer/order-history');
    handleClose();
  };
  
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box>
      <Button 
        variant="contained" 
        color="primary" 
        fullWidth 
        size="large"
        onClick={handleProceedToCheckout}
      >
        Proceed to Checkout
      </Button>
      
      <PaymentMethodDialog
        open={open}
        onClose={handleClose}
        aria-labelledby="payment-dialog-title"
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            backgroundColor: '#ffffff',
            boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)'
          }
        }}
      >
        <DialogTitle 
  id="payment-dialog-title" 
  sx={{ 
    backgroundColor: '#008080', // Teal color
    color: '#008080', // White text for contrast
    borderBottom: '1px solid #e0e0e0', 
    py: 2,
    textAlign: 'center', // Optional: center the text
    fontWeight: 'bold' // Optional: make the text bold
  }}
>
  Checkout
</DialogTitle>
        <DialogContent sx={{ backgroundColor: '#ffffff', pt: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {activeStep === 0 && (
            <Box>
              <FormControl component="fieldset" sx={{ width: '100%' }}>
                <FormLabel component="legend">Select Payment Method</FormLabel>
                <RadioGroup
                  aria-label="payment-method"
                  name="payment-method"
                  value={paymentMethod}
                  onChange={handlePaymentMethodChange}
                >
                  <FormControlLabel value="cash" control={<Radio />} label="Pay at Pickup (Cash)" />
                  <FormControlLabel value="online" control={<Radio />} label="Pay Online (Credit/Debit Card)" />
                </RadioGroup>
              </FormControl>
              
              {paymentMethod === 'online' && (
                <Paper elevation={0} sx={{ p: 2, mt: 2, bgcolor: '#f5f5f5' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Credit/Debit Card Information
                  </Typography>
                  
                  <PaymentField
                    label="Card Number"
                    variant="outlined"
                    fullWidth
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="1234 5678 9012 3456"
                    inputProps={{ maxLength: 16 }}
                  />
                  
                  <PaymentField
                    label="Cardholder Name"
                    variant="outlined"
                    fullWidth
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="John Doe"
                  />
                  
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <PaymentField
                      label="Expiry Date"
                      variant="outlined"
                      value={expiryDate}
                      onChange={handleExpiryDateChange}
                      placeholder="MM/YY"
                      inputProps={{ maxLength: 5 }}
                      sx={{ flex: 1 }}
                    />
                    
                    <PaymentField
                      label="CVV"
                      variant="outlined"
                      value={cvv}
                      onChange={handleCvvChange}
                      placeholder="123"
                      type="password"
                      inputProps={{ maxLength: 4 }}
                      sx={{ flex: 1 }}
                    />
                  </Box>
                </Paper>
              )}
              
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
            </Box>
          )}
          
          {activeStep === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
              <CircularProgress size={60} sx={{ mb: 2 }} />
              <Typography variant="h6">
                Processing your payment...
              </Typography>
              <Typography color="text.secondary">
                Please do not close this window.
              </Typography>
            </Box>
          )}
          
          {activeStep === 2 && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Alert severity="success" sx={{ mb: 3 }}>
                Your order has been placed successfully!
              </Alert>
              
              <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                Token: #{token}
              </Typography>
              
              <Typography variant="body1" paragraph>
                Please keep this token number to collect your order. The juice bar staff will notify you when your order is ready.
              </Typography>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Payment Method: {paymentMethod === 'cash' ? 'Pay at Pickup (Cash)' : 'Online Payment (Credit/Debit Card)'}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                Total Amount: Rs.{parseFloat(totalAmount).toFixed(2)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ backgroundColor: '#ffffff', borderTop: '1px solid #e0e0e0', p: 2 }}>
          {activeStep === 0 && (
            <>
              <Button onClick={handleClose} color="inherit">
                Cancel
              </Button>
              <Button onClick={handleConfirmPayment} variant="contained" color="primary">
                Confirm
              </Button>
            </>
          )}
          
          {activeStep === 2 && (
            <>
              <Button onClick={handleClose} color="inherit">
                Close
              </Button>
              <Button onClick={handleViewOrderStatus} variant="contained" color="primary">
                View Order Status
              </Button>
            </>
          )}
        </DialogActions>
      </PaymentMethodDialog>
      
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Checkout;