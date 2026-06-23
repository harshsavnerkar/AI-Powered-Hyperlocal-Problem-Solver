import express from 'express';
import Notification from '../models/Notification.js';
import { getStore, saveStore } from '../config/db.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
router.get('/', protect, async (req, res) => {
  if (global.dbFallback) {
    const store = getStore();
    const myNotifs = store.notifications
      .filter(n => n.userId === req.user._id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(myNotifs);
  } else {
    try {
      const notifs = await Notification.find({ userId: req.user._id })
        .sort({ createdAt: -1 });
      res.json(notifs);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
});

// @desc    Mark all user notifications as read
// @route   PATCH /api/notifications/read
// @access  Private
router.patch('/read', protect, async (req, res) => {
  if (global.dbFallback) {
    const store = getStore();
    store.notifications = store.notifications.map(n => {
      if (n.userId === req.user._id) {
        n.read = true;
      }
      return n;
    });
    saveStore(store);
    res.json({ message: 'All notifications marked as read' });
  } else {
    try {
      await Notification.updateMany(
        { userId: req.user._id, read: false },
        { $set: { read: true } }
      );
      res.json({ message: 'All notifications marked as read' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
});

export default router;
