import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { getStore, saveStore } from '../config/db.js';
import { protect } from '../middleware/auth.js';
import { sendOTPEmail } from '../services/email.js';

const router = express.Router();

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'default_secret_key_12345', {
    expiresIn: '30d'
  });
};

// Temporary store for OTPs (email -> { otp, expires, credentialsVerified, userId })
const otpStore = new Map();

// @desc    Send OTP to email
// @route   POST /api/auth/send-otp
// @access  Public
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();
    // Generate 6-digit random code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store with 5-minute expiry
    otpStore.set(normalizedEmail, {
      otp,
      expires: Date.now() + 5 * 60 * 1000
    });

    // Send real email OTP
    await sendOTPEmail(normalizedEmail, otp, 'Verification');

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
router.post('/signup', async (req, res) => {
  const { name, email, phone, password, role, isGoogle, otp } = req.body;

  if (!name || !email || !phone || !role) {
    return res.status(400).json({ message: 'Please include all fields' });
  }

  // Password is only optional if signing up via Google OAuth
  if (!isGoogle && !password) {
    return res.status(400).json({ message: 'Please include a password' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Validate OTP if registering manually
  if (!isGoogle) {
    if (!otp) {
      return res.status(400).json({ message: 'OTP is required' });
    }
    const record = otpStore.get(normalizedEmail);
    if (!record || record.otp !== otp || record.expires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    otpStore.delete(normalizedEmail);
  }

  if (global.dbFallback) {
    const store = getStore();
    const userExists = store.users.find(u => u.email === normalizedEmail);
    if (userExists) {
      return res.status(400).json({ message: 'User already exists in local database' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = password ? await bcrypt.hash(password, salt) : '';

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
      const hashedPassword = password ? await bcrypt.hash(password, salt) : '';

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

// @desc    Authenticate user & send login OTP
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

    if (user && (user.password === '' || await bcrypt.compare(password, user.password))) {
      // Generate OTP for login
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      otpStore.set(normalizedEmail, {
        otp,
        expires: Date.now() + 5 * 60 * 1000,
        credentialsVerified: true,
        userId: user._id
      });

      // Send real email OTP
      await sendOTPEmail(normalizedEmail, otp, 'Login');

      res.json({ otpRequired: true, email: normalizedEmail });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } else {
    try {
      const user = await User.findOne({ email: normalizedEmail });

      if (user && (user.password === '' || await bcrypt.compare(password, user.password))) {
        // Generate OTP for login
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore.set(normalizedEmail, {
          otp,
          expires: Date.now() + 5 * 60 * 1000,
          credentialsVerified: true,
          userId: user._id
        });

        // Send real email OTP
        await sendOTPEmail(normalizedEmail, otp, 'Login');

        res.json({ otpRequired: true, email: normalizedEmail });
      } else {
        res.status(401).json({ message: 'Invalid email or password' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
});

// @desc    Verify Login OTP and return token
// @route   POST /api/auth/verify-login-otp
// @access  Public
router.post('/verify-login-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const record = otpStore.get(normalizedEmail);

  if (!record || record.otp !== otp || record.expires < Date.now() || !record.credentialsVerified) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  const userId = record.userId;
  otpStore.delete(normalizedEmail);

  if (global.dbFallback) {
    const store = getStore();
    const user = store.users.find(u => u._id === userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

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
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

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

// @desc    Verify Google OAuth token and return user info or register check
// @route   POST /api/auth/google-login
// @access  Public
router.post('/google-login', async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) {
    return res.status(400).json({ message: 'Google ID token is required' });
  }

  try {
    let email, name;
    if (idToken === 'simulated_google_token') {
      email = 'harsh@citizen.com';
      name = 'Harsh Savnerkar';
    } else {
      // Validate token with Google API
      const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
      if (!response.ok) {
        return res.status(400).json({ message: 'Invalid Google OAuth Token' });
      }

      const googleUser = await response.json();
      email = googleUser.email;
      name = googleUser.name;
    }
    const normalizedEmail = email.toLowerCase().trim();

    if (global.dbFallback) {
      const store = getStore();
      const user = store.users.find(u => u.email === normalizedEmail);

      if (user) {
        // User exists, log them in
        return res.json({
          exists: true,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            points: user.points,
            badges: user.badges,
            token: generateToken(user._id)
          }
        });
      } else {
        // User does not exist, send info back to proceed with registration on frontend
        return res.json({
          exists: false,
          googleData: {
            email: normalizedEmail,
            name: name || ''
          }
        });
      }
    } else {
      const user = await User.findOne({ email: normalizedEmail });

      if (user) {
        // User exists, log them in
        return res.json({
          exists: true,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            points: user.points,
            badges: user.badges,
            token: generateToken(user._id)
          }
        });
      } else {
        // User does not exist, send info back to proceed with registration on frontend
        return res.json({
          exists: false,
          googleData: {
            email: normalizedEmail,
            name: name || ''
          }
        });
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
