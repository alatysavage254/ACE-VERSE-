import express from 'express';
import Post from '../models/Post.js';
import Like from '../models/Like.js';
import Comment from '../models/Comment.js';
import Follow from '../models/Follow.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { createNotification } from './notifications.js';

const router = express.Router();

// Helper function to extract hashtags from text
const extractHashtags = (text) => {
  const hashtagRegex = /#[\w]+/g;
  const matches = text.match(hashtagRegex);
  return matches ? matches.map(tag => tag.toLowerCase()) : [];
};

// Helper function to extract mentions from text
const extractMentions = async (text) => {
  const mentionRegex = /@([\w]+)/g;
  const matches = [...text.matchAll(mentionRegex)];
  const usernames = matches.map(match => match[1]);
  
  if (usernames.length === 0) return [];
  
  const users = await User.find({ username: { $in: usernames } }).select('_id');
  return users.map(u => u._id);
};

router.get('/', async (req, res) => {
  try {
    const { userId, limit = 10, cursor } = req.query;
    const query = {};

    if (userId) {
      const following = await Follow.find({ followerId: userId }).select('followingId');
      const followingIds = following.map(f => f.followingId);
      followingIds.push(userId);
      query.userId = { $in: followingIds };
    }

    if (cursor) {
      query._id = { $lt: cursor };
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { title, description, imageUrl } = req.body;

    // Extract hashtags and mentions
    const fullText = `${title} ${description}`;
    const hashtags = extractHashtags(fullText);
    const mentions = await extractMentions(fullText);

    const post = await Post.create({
      userId: req.user._id,
      username: req.user.username,
      title,
      description,
      imageUrl: imageUrl || '',
      hashtags,
      mentions
    });

    // Create notifications for mentioned users
    for (const mentionedUserId of mentions) {
      await createNotification(
        mentionedUserId,
        'mention',
        req.user._id,
        `@${req.user.username} mentioned you in a post`,
        post._id
      );
    }

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Allow deletion if user is post owner OR admin
    if (post.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Like.deleteMany({ postId: req.params.id });
    await Comment.deleteMany({ postId: req.params.id });
    await Post.findByIdAndDelete(req.params.id);

    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search posts by hashtag
router.get('/hashtag/:tag', async (req, res) => {
  try {
    const { limit = 20, cursor } = req.query;
    const tag = req.params.tag.toLowerCase();
    const query = { hashtags: tag };

    if (cursor) {
      query._id = { $lt: cursor };
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search users
router.get('/search/users', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.json([]);
    }

    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    })
    .select('_id username photoURL bio')
    .limit(parseInt(limit));

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Repost a post
router.post('/:id/repost', protect, async (req, res) => {
  try {
    const originalPost = await Post.findById(req.params.id);
    
    if (!originalPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user already reposted this
    const existingRepost = await Post.findOne({
      userId: req.user._id,
      originalPostId: req.params.id,
      isRepost: true
    });

    if (existingRepost) {
      return res.status(400).json({ message: 'You already reposted this' });
    }

    // Create repost
    const repost = await Post.create({
      userId: req.user._id,
      username: req.user.username,
      title: originalPost.title,
      description: originalPost.description,
      imageUrl: originalPost.imageUrl,
      hashtags: originalPost.hashtags,
      mentions: originalPost.mentions,
      isRepost: true,
      originalPostId: originalPost._id
    });

    // Increment repost count
    await Post.findByIdAndUpdate(req.params.id, {
      $inc: { repostCount: 1 }
    });

    // Notify original poster
    await createNotification(
      originalPost.userId,
      'repost',
      req.user._id,
      `@${req.user.username} reposted your post`,
      originalPost._id
    );

    const populatedRepost = await Post.findById(repost._id)
      .populate('originalPostId');

    res.status(201).json(populatedRepost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete repost
router.delete('/:id/repost', protect, async (req, res) => {
  try {
    const repost = await Post.findOne({
      userId: req.user._id,
      originalPostId: req.params.id,
      isRepost: true
    });

    if (!repost) {
      return res.status(404).json({ message: 'Repost not found' });
    }

    await Post.findByIdAndDelete(repost._id);

    // Decrement repost count
    await Post.findByIdAndUpdate(req.params.id, {
      $inc: { repostCount: -1 }
    });

    res.json({ message: 'Repost deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
