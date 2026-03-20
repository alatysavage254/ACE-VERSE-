import express from 'express';
import { body } from 'express-validator';
import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('username').trim().notEmpty()
], async (req, res) => {
  try {
    const { email, password, username } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      email,
      password,
      username,
      bio: '',
      photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`
    });

    res.status(201).json({
      _id: user._id,
      email: user.email,
      username: user.username,
      bio: user.bio,
      photoURL: user.photoURL,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        email: user.email,
        username: user.username,
        bio: user.bio,
        photoURL: user.photoURL,
        followersCount: user.followersCount,
        followingCount: user.followingCount,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/google', async (req, res) => {
  try {
    const { uid, email, displayName, photoURL } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user from Google data
      const username = displayName || email.split('@')[0];
      user = await User.create({
        email,
        username,
        bio: '',
        photoURL: photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`,
        googleId: uid,
        // No password needed for Google auth users
        password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
      });
    } else if (!user.googleId) {
      // Link Google account to existing user
      user.googleId = uid;
      if (photoURL && !user.photoURL) {
        user.photoURL = photoURL;
      }
      await user.save();
    }

    res.json({
      _id: user._id,
      email: user.email,
      username: user.username,
      bio: user.bio,
      photoURL: user.photoURL,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
