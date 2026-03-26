import express from 'express';
import Message from '../models/Message.js';
import { protect } from '../middleware/auth.js';
import { createNotification } from './notifications.js';

const router = express.Router();

// Get conversations list (unique users you've chatted with)
router.get('/conversations', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get all messages where user is sender or receiver
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    }).sort({ createdAt: -1 }).populate('senderId receiverId', 'username photoURL');

    // Group by conversation partner
    const conversationsMap = new Map();
    messages.forEach(msg => {
      const partnerId = msg.senderId._id.toString() === userId.toString() 
        ? msg.receiverId._id.toString() 
        : msg.senderId._id.toString();
      
      if (!conversationsMap.has(partnerId)) {
        const partner = msg.senderId._id.toString() === userId.toString() 
          ? msg.receiverId 
          : msg.senderId;
        conversationsMap.set(partnerId, {
          user: partner,
          lastMessage: msg,
          unreadCount: 0
        });
      }
    });

    // Count unread messages
    for (const [partnerId, conv] of conversationsMap) {
      const unread = await Message.countDocuments({
        senderId: partnerId,
        receiverId: userId,
        read: false
      });
      conv.unreadCount = unread;
    }

    const conversations = Array.from(conversationsMap.values());
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get messages with a specific user
router.get('/:userId', protect, async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const otherUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: currentUserId }
      ]
    }).sort({ createdAt: 1 }).populate('senderId receiverId', 'username photoURL');

    // Mark messages as read
    await Message.updateMany(
      { senderId: otherUserId, receiverId: currentUserId, read: false },
      { read: true }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send a message
router.post('/', protect, async (req, res) => {
  try {
    const { receiverId, content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const message = await Message.create({
      senderId: req.user._id,
      receiverId,
      content: content.trim()
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('senderId receiverId', 'username photoURL');

    // Create notification for receiver
    await createNotification(
      receiverId,
      'message',
      req.user._id,
      `@${req.user.username} sent you a message`,
      null,
      null,
      message._id
    );

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark messages as read
router.put('/read/:userId', protect, async (req, res) => {
  try {
    await Message.updateMany(
      { senderId: req.params.userId, receiverId: req.user._id, read: false },
      { read: true }
    );
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a message
router.delete('/:id', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.senderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Message.findByIdAndDelete(req.params.id);
    res.json({ message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
