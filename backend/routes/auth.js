import express from 'express';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import { generateToken } from '../utils/generateToken.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide username and password' });
    }

    const user = await User.findOne({ username }).populate('profileId');

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Get profile data based on role
    let profile = null;
    if (user.role === 'student' && user.profileId) {
      profile = await Student.findById(user.profileId);
    } else if (user.role === 'teacher' && user.profileId) {
      profile = await Teacher.findById(user.profileId);
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        email: user.email,
        phone: user.phone,
        profile: profile
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').populate('profileId');

    let profile = null;
    if (user.role === 'student' && user.profileId) {
      profile = await Student.findById(user.profileId);
    } else if (user.role === 'teacher' && user.profileId) {
      profile = await Teacher.findById(user.profileId);
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        email: user.email,
        phone: user.phone,
        profile: profile
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;



