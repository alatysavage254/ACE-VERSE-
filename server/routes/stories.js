import express from 'express';
import Story from '../models/Story.js';
import StoryView from '../models/StoryView.js';
import Follow from '../models/Follow.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Create story
router.post('/', protect, async (req, res) => {
  try {
    const { mediaUrl, mediaType, thumbnail } = req.body;
    
    const story = await Story.create({
      userId: req.user._id,
      username: req.user.username,
      mediaUrl,
      mediaType,
      thumbnail: thumbnail || '',
      viewsCount: 0,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });
    
    res.status(201).json(story);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get feed stories (stories from followed users)
router.get('/feed', protect, async (req, res) => {
  try {
    const currentUserId = req.user._id;
    
    // Get users that current user follows
    const follows = await Follow.find({ followerId: currentUserId });
    const followingIds = [currentUserId, ...follows.map(f => f.followingId)];
    
    // Fetch active stories from followed users
    const stories = await Story.find({
      userId: { $in: followingIds },
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });
    
    // Get user's views
    const views = await StoryView.find({
      viewerId: currentUserId,
      storyId: { $in: stories.map(s => s._id) }
    });
    
    const viewedIds = new Set(views.map(v => v.storyId.toString()));
    
    // Group by user and mark viewed
    const grouped = stories.reduce((acc, story) => {
      const key = story.userId.toString();
      if (!acc[key]) {
        acc[key] = {
          userId: story.userId,
          username: story.username,
          stories: [],
          hasUnviewed: false
        };
      }
      
      const hasViewed = viewedIds.has(story._id.toString());
      acc[key].stories.push({ ...story.toObject(), hasViewed });
      
      if (!hasViewed) {
        acc[key].hasUnviewed = true;
      }
      
      return acc;
    }, {});
    
    res.json(Object.values(grouped));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get stories by user ID
router.get('/user/:userId', protect, async (req, res) => {
  try {
    const stories = await Story.find({
      userId: req.params.userId,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });
    
    res.json(stories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Record story view
router.post('/:id/view', protect, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }
    
    // Don't record if viewing own story
    if (story.userId.toString() === req.user._id.toString()) {
      return res.json({ recorded: false, viewsCount: story.viewsCount });
    }
    
    // Try to create view (unique constraint prevents duplicates)
    try {
      await StoryView.create({
        storyId: req.params.id,
        viewerId: req.user._id,
        viewerUsername: req.user.username,
        viewedAt: new Date()
      });
      
      // Increment views count
      story.viewsCount += 1;
      await story.save();
      
      res.json({ recorded: true, viewsCount: story.viewsCount });
    } catch (error) {
      if (error.code === 11000) {
        // Duplicate view
        res.json({ recorded: false, viewsCount: story.viewsCount });
      } else {
        throw error;
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get story viewers (only for story owner)
router.get('/:id/viewers', protect, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }
    
    // Only story owner can see viewers
    if (story.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const viewers = await StoryView.find({ storyId: req.params.id })
      .sort({ viewedAt: -1 });
    
    res.json(viewers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete story
router.delete('/:id', protect, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }
    
    // Only story owner or admin can delete
    if (story.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await Story.findByIdAndDelete(req.params.id);
    await StoryView.deleteMany({ storyId: req.params.id });
    
    res.json({ message: 'Story deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
