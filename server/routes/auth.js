import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { getStore, saveStore } from '../config/db.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'default_secret_key_12345', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
router.post('/signup', async (req, res) => {
  const { name, email, phone, password, role } = req.body;

  if (!name || !email || !phone || !password || !role) {
    return res.status(400).json({ message: 'Please include all fields' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  if (global.dbFallback) {
    const store = getStore();
    const userExists = store.users.find(u => u.email === normalizedEmail);
    if (userExists) {
      return res.status(400).json({ message: 'User already exists in local database' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      _id: 'u_' + Math.random().toString(36).substr(2, 9),
      name,
      email: normalizedEmail,
      phone,
      password: hashedPassword,
      role,
      points: 0,
      rank: 0,
      badges: [],
      createdAt: new Date().toISOString()
    };

    store.users.push(newUser);
    saveStore(store);

    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      points: newUser.points,
      badges: newUser.badges,
      token: generateToken(newUser._id)
    });
  } else {
    try {
      const userExists = await User.findOne({ email: normalizedEmail });
      if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await User.create({
        name,
        email: normalizedEmail,
        phone,
        password: hashedPassword,
        role,
        points: 0,
        badges: []
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        points: user.points,
        badges: user.badges,
        token: generateToken(user._id)
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  if (global.dbFallback) {
    const store = getStore();
    const user = store.users.find(u => u.email === normalizedEmail);

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        points: user.points,
        badges: user.badges,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } else {
    try {
      const user = await User.findOne({ email: normalizedEmail });

      if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          points: user.points,
          badges: user.badges,
          token: generateToken(user._id)
        });
      } else {
        res.status(401).json({ message: 'Invalid email or password' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  // req.user is already loaded by 'protect' middleware
  res.json(req.user);
});

// @desc    Get leaderboard
// @route   GET /api/auth/leaderboard
// @access  Private
router.get('/leaderboard', protect, async (req, res) => {
  if (global.dbFallback) {
    const store = getStore();
    const sorted = [...store.users]
      .sort((a, b) => b.points - a.points)
      .map((u, idx) => ({
        _id: u._id,
        name: u.name,
        role: u.role,
        points: u.points,
        badges: u.badges,
        rank: idx + 1
      }));
    res.json(sorted);
  } else {
    try {
      const users = await User.find({}).select('name role points badges').sort({ points: -1 });
      const leaderboard = users.map((u, idx) => ({
        _id: u._id,
        name: u.name,
        role: u.role,
        points: u.points,
        badges: u.badges,
        rank: idx + 1
      }));
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
});

export default router;
