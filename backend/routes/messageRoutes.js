const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authenticateToken = require('../middleware/authMiddleware');

// Create new message
router.post('/create', authenticateToken, messageController.createMessage);

// Get all messages (owner only)
router.get('/all', authenticateToken, messageController.getAllMessages);

// Get message by ID (owner only)
router.get('/:messageId', authenticateToken, messageController.getMessageById);

// Update message status (owner only)
router.put('/:messageId/status', authenticateToken, messageController.updateMessageStatus);

module.exports = router;