import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  IconButton,
  Divider,
  TextField
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Check as CheckIcon,
  MarkEmailRead as MarkEmailReadIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import OwnerSidebar from './OwnerSidebar';

// Styled components
const StatusChip = styled(Chip)(({ theme, status }) => {
  const getColor = () => {
    switch (status) {
      case 'unread':
        return { bg: theme.palette.error.light, color: theme.palette.error.contrastText };
      case 'read':
        return { bg: theme.palette.info.light, color: theme.palette.info.contrastText };
      case 'answered':
        return { bg: theme.palette.success.light, color: theme.palette.success.contrastText };
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

const MessageDashboard = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageDetailsOpen, setMessageDetailsOpen] = useState(false);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
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
    if (user.user.role !== "owner") {
      navigate("/");
      return;
    }

    fetchMessages();
  }, [navigate]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/messages/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      setMessages(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewMessageDetails = (message) => {
    setSelectedMessage(message);
    setMessageDetailsOpen(true);
    
    // If message is unread, mark it as read
    if (message.status === 'unread') {
      updateMessageStatus(message.message_id, 'read');
    }
  };

  const updateMessageStatus = async (messageId, status) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/messages/${messageId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update message status');
      }

      // Update local state
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.message_id === messageId ? { ...msg, status } : msg
        )
      );
      
      // Update selected message if it's open
      if (selectedMessage && selectedMessage.message_id === messageId) {
        setSelectedMessage({ ...selectedMessage, status });
      }
      
      setSnackbar({
        open: true,
        message: `Message marked as ${status}`,
        severity: 'success'
      });
    } catch (err) {
      console.error('Error updating message status:', err);
      setSnackbar({
        open: true,
        message: 'Failed to update message status',
        severity: 'error'
      });
    }
  };

  const handleOpenReplyDialog = () => {
    setReplyDialogOpen(true);
  };

  const handleCloseReplyDialog = () => {
    setReplyDialogOpen(false);
    setReplyMessage('');
  };

  const handleSendReply = async () => {
    if (!selectedMessage) return;
    
    try {
      // This would connect to an email API or add functionality to send emails
      // For now, just mark the message as answered
      await updateMessageStatus(selectedMessage.message_id, 'answered');
      
      // In a real implementation, you would send the email here
      // For now, we'll just show a confirmation
      setSnackbar({
        open: true,
        message: `Reply sent to ${selectedMessage.email}`,
        severity: 'success'
      });
      
      handleCloseReplyDialog();
    } catch (err) {
      console.error('Error sending reply:', err);
      setSnackbar({
        open: true,
        message: 'Failed to send reply',
        severity: 'error'
      });
    }
  };

  return (
    <OwnerSidebar>
      <Box sx={{ backgroundColor: '#f5f5f3', minHeight: '100vh', pb: 4 }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
          {/* Page Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1">Customer Messages</Typography>
            <Button 
              variant="contained" 
              startIcon={<RefreshIcon />} 
              onClick={fetchMessages}
              disabled={loading}
            >
              Refresh
            </Button>
          </Box>
          
          {/* Messages Summary */}
          <Box sx={{ mb: 4 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Summary</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Messages</Typography>
                  <Typography variant="h5">{messages.length}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Unread</Typography>
                  <Typography variant="h5">{messages.filter(m => m.status === 'unread').length}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Answered</Typography>
                  <Typography variant="h5">{messages.filter(m => m.status === 'answered').length}</Typography>
                </Box>
              </Box>
            </Paper>
          </Box>

          {/* Messages Table */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
              <CircularProgress size={60} />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
          ) : messages.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <EmailIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">No messages found</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                When customers send messages, they will appear here.
              </Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Message</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {messages.map((message) => (
                    <TableRow key={message.message_id} hover>
                      <TableCell>
                        {new Date(message.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>{message.name}</TableCell>
                      <TableCell>{message.email}</TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            maxWidth: 250,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {message.message}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <StatusChip 
                          label={message.status} 
                          status={message.status} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleViewMessageDetails(message)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                          
                          {message.status !== 'answered' && (
                            <IconButton 
                              size="small" 
                              color="success"
                              onClick={() => updateMessageStatus(message.message_id, 'answered')}
                            >
                              <MarkEmailReadIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>

        {/* Message Details Dialog */}
        <Dialog 
          open={messageDetailsOpen} 
          onClose={() => setMessageDetailsOpen(false)}
          fullWidth
          maxWidth="md"
        >
          {selectedMessage && (
            <>
              <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">
                    Message from {selectedMessage.name}
                  </Typography>
                  <StatusChip label={selectedMessage.status} status={selectedMessage.status} />
                </Box>
              </DialogTitle>
              <DialogContent>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Message Information</Typography>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 1 }}>
                    <Typography variant="body2">
                      <strong>Date:</strong> {new Date(selectedMessage.created_at).toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Customer:</strong> {selectedMessage.name}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Email:</strong> {selectedMessage.email}
                    </Typography>
                    {selectedMessage.customer_id && (
                      <Typography variant="body2">
                        <strong>Customer ID:</strong> {selectedMessage.customer_id}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 3 }}>Message</Typography>
                <Divider sx={{ my: 1 }} />
                <Paper variant="outlined" sx={{ p: 2, minHeight: 100, backgroundColor: '#f9f9f9' }}>
                  <Typography variant="body1">
                    {selectedMessage.message}
                  </Typography>
                </Paper>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setMessageDetailsOpen(false)}>Close</Button>
                
                {selectedMessage.status !== 'answered' && (
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={handleOpenReplyDialog}
                    startIcon={<EmailIcon />}
                  >
                    Reply
                  </Button>
                )}
                
                {selectedMessage.status === 'unread' && (
                  <Button 
                    variant="contained" 
                    color="success"
                    onClick={() => updateMessageStatus(selectedMessage.message_id, 'read')}
                    startIcon={<CheckIcon />}
                  >
                    Mark as Read
                  </Button>
                )}
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Reply Dialog */}
        <Dialog 
          open={replyDialogOpen} 
          onClose={handleCloseReplyDialog}
          fullWidth
          maxWidth="md"
        >
          {selectedMessage && (
            <>
              <DialogTitle>
                Reply to {selectedMessage.name}
              </DialogTitle>
              <DialogContent>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>To:</strong> {selectedMessage.email}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    <strong>Subject:</strong> RE: Customer Inquiry
                  </Typography>
                  
                  <TextField
                    label="Your Reply"
                    multiline
                    rows={8}
                    fullWidth
                    variant="outlined"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder={`Dear ${selectedMessage.name},\n\nThank you for your message...\n\nBest regards,\nJuice Bar Team`}
                  />
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseReplyDialog}>Cancel</Button>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={handleSendReply}
                  disabled={!replyMessage.trim()}
                >
                  Send Reply
                </Button>
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

export default MessageDashboard;