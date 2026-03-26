import express from 'express';
import Like from '../models/Like.js';
import Post from '../models/Post.js';
import { protect } from '../middleware/auth.js';
import { createNotification } from './notifications.js';

const router = express.Router();

router.get('/post/:postId', async (req, res) => {
  try {
    const likes = await Like.find({ postId: req.params.postId });
    res.json(likes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { postId } = req.body;

    const existingLike = await Like.findOne({
      postId,
      userId: req.user._id
    });

    if (existingLike) {
      return res.status(400).json({ message: 'Already liked' });
    }

    const like = await Like.create({
      postId,
      userId: req.user._id
    });

    await Post.findByIdAndUpdate(postId, { $inc: { likesCount: 1 } });

    // Create notification for post owner
    const post = await Post.findById(postId);
    if (post) {
      await createNotification(
        post.userId,
        'like',
        req.user._id,
        `@${req.user.username} liked your post`,
        postId
      );
    }

    res.status(201).json(like);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:postId', protect, async (req, res) => {
  try {
    const like = await Like.findOneAndDelete({
      postId: req.params.postId,
      userId: req.user._id
    });

    if (!like) {
      return res.status(404).json({ message: 'Like not found' });
    }

    await Post.findByIdAndUpdate(req.params.postId, { $inc: { likesCount: -1 } });

    res.json({ message: 'Like removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
