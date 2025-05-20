const messageModel = require('../models/MessageModel');

exports.createMessage = async (req, res) => {
  const { name, email, message } = req.body;
  const customerId = req.user.user_id;

  try {
    if (!customerId) {
      return res.status(401).json({ message: 'You must be logged in to send a message' });
    }

    const result = await messageModel.createMessage(customerId, name, email, message);
    
    res.status(201).json({
      message: 'Message sent successfully',
      messageId: result.insertId
    });
  } catch (err) {
    console.error('Error creating message:', err);
    res.status(500).json({ message: 'Failed to send message' });
  }
};

exports.getAllMessages = async (req, res) => {
  try {
    // Check if user is owner
    if (req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Unauthorized access' });
    }
    
    const messages = await messageModel.getAllMessages();
    res.status(200).json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
};

exports.getMessageById = async (req, res) => {
  try {
    const { messageId } = req.params;
    
    // Check if user is owner
    if (req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Unauthorized access' });
    }
    
    const message = await messageModel.getMessageById(messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    res.status(200).json(message);
  } catch (err) {
    console.error('Error fetching message:', err);
    res.status(500).json({ message: 'Failed to fetch message' });
  }
};

exports.updateMessageStatus = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { status } = req.body;
    
    // Check if user is owner
    if (req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Unauthorized access' });
    }
    
    await messageModel.updateMessageStatus(messageId, status);
    
    res.status(200).json({ message: 'Message status updated successfully' });
  } catch (err) {
    console.error('Error updating message status:', err);
    res.status(500).json({ message: 'Failed to update message status' });
  }
};