import express from 'express';
import passport from 'passport';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticateJWT, refreshToken } from '../middleware/auth.js';

const router = express.Router();

// Generate JWT tokens
const generateTokens = (user) => {
  const payload = { id: user._id, email: user.email, role: user.role };
  
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY
  });
  
  const refreshTokenValue = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY
  });
  
  return { accessToken, refreshToken: refreshTokenValue };
};

// Set token cookies
const setTokenCookies = (res, tokens) => {
  res.cookie('accessToken', tokens.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 2 * 60 * 60 * 1000, // 2 hours
    sameSite: 'lax'
  });
  
  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: 'lax'
  });
};

// Register with email/password
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, university, major, graduationYear, company, jobTitle } = req.body;
    
    // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ 
        message: 'Name, email, password, and role are required' 
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long' 
      });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const userData = {
      name,
      email,
      password: hashedPassword,
      role
    };
    
    // Add role-specific fields
    if (role === 'student') {
      userData.university = university;
      userData.major = major;
      userData.graduationYear = graduationYear;
    } else if (role === 'recruiter') {
      userData.company = company;
      userData.jobTitle = jobTitle;
    }
    
    const user = new User(userData);
    await user.save();
    
    // Generate tokens
    const tokens = generateTokens(user);
    setTokenCookies(res, tokens);
    
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        university: user.university,
        major: user.major,
        company: user.company,
        jobTitle: user.jobTitle
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Login with email/password
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: 'Authentication error' });
    }
    
    if (!user) {
      return res.status(401).json({ message: info.message || 'Invalid credentials' });
    }
    
    // Generate tokens
    const tokens = generateTokens(user);
    setTokenCookies(res, tokens);
    
    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        university: user.university,
        major: user.major,
        company: user.company,
        jobTitle: user.jobTitle,
        avatar: user.avatar
      }
    });
  })(req, res, next);
});

// Google OAuth routes
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/google/callback', 
  passport.authenticate('google', { session: false }),
  (req, res) => {
    // Generate tokens
    const tokens = generateTokens(req.user);
    setTokenCookies(res, tokens);
    
    // Redirect to frontend
    res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  }
);

// Get current user
router.get('/me', authenticateJWT, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      university: req.user.university,
      major: req.user.major,
      company: req.user.company,
      jobTitle: req.user.jobTitle,
      avatar: req.user.avatar,
      resumeId: req.user.resumeId
    }
  });
});

// Refresh access token
router.post('/refresh', refreshToken, (req, res) => {
  res.json({ message: 'Token refreshed successfully' });
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
});

export default router;