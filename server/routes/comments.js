import express from 'express';
import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import { protect } from '../middleware/auth.js';
import { createNotification } from './notifications.js';

const router = express.Router();

router.get('/post/:postId', async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId })
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { postId, text } = req.body;

    const comment = await Comment.create({
      postId,
      userId: req.user._id,
      username: req.user.username,
      text
    });

    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

    // Create notification for post owner
    const post = await Post.findById(postId);
    if (post) {
      await createNotification(
        post.userId,
        'comment',
        req.user._id,
        `@${req.user.username} commented on your post`,
        postId,
        comment._id
      );
    }

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
