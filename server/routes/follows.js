import express from 'express';
import Follow from '../models/Follow.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { createNotification } from './notifications.js';

const router = express.Router();

router.get('/check', protect, async (req, res) => {
  try {
    const { followingId } = req.query;
    const follow = await Follow.findOne({
      followerId: req.user._id,
      followingId
    });
    res.json({ isFollowing: !!follow });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { followingId } = req.body;

    if (req.user._id.toString() === followingId) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    const existingFollow = await Follow.findOne({
      followerId: req.user._id,
      followingId
    });

    if (existingFollow) {
      return res.status(400).json({ message: 'Already following' });
    }

    const follow = await Follow.create({
      followerId: req.user._id,
      followingId
    });

    await User.findByIdAndUpdate(req.user._id, { $inc: { followingCount: 1 } });
    await User.findByIdAndUpdate(followingId, { $inc: { followersCount: 1 } });

    // Create notification for followed user
    await createNotification(
      followingId,
      'follow',
      req.user._id,
      `@${req.user.username} started following you`
    );

    res.status(201).json(follow);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:followingId', protect, async (req, res) => {
  try {
    const follow = await Follow.findOneAndDelete({
      followerId: req.user._id,
      followingId: req.params.followingId
    });

    if (!follow) {
      return res.status(404).json({ message: 'Follow not found' });
    }

    await User.findByIdAndUpdate(req.user._id, { $inc: { followingCount: -1 } });
    await User.findByIdAndUpdate(req.params.followingId, { $inc: { followersCount: -1 } });

    res.json({ message: 'Unfollowed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
