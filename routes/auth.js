const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// In-memory storage for demo (replace with database in production)
const users = [];
const refreshTokens = [];

// Middleware to validate input
const validateInput = (req, res, next) => {
  const { identifier, password, role } = req.body;
  
  if (!identifier || !password) {
    return res.status(400).json({ error: 'Identifier and password are required' });
  }
  
  if (role && !['student', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role specified' });
  }
  
  next();
};

// Generate tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '24h' }
  );

  const refreshToken = jwt.sign(
    { 
      userId: user.id, 
      email: user.email, 
      role: user.role,
      type: 'refresh'
    },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// Login endpoint
router.post('/login', validateInput, async (req, res) => {
  try {
    const { identifier, password, role = 'student' } = req.body;

    // Find user by email or username
    let user = users.find(u => 
      (u.email === identifier || u.username === identifier) && u.role === role
    );

    // Demo accounts for testing
    if (!user) {
      if (role === 'student' && identifier === 'student@example.com' && password === 'student123') {
        user = {
          id: 'demo-student',
          email: 'student@example.com',
          username: 'student',
          name: 'Demo Student',
          role: 'student',
          password: bcrypt.hashSync('student123', 10)
        };
        users.push(user);
      } else if (role === 'admin' && identifier === 'admin@happylivingpg.com' && password === 'admin123') {
        user = {
          id: 'demo-admin',
          email: 'admin@happylivingpg.com',
          username: 'admin',
          name: 'Admin User',
          role: 'admin',
          password: bcrypt.hashSync('admin123', 10)
        };
        users.push(user);
      }
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Store refresh token
    refreshTokens.push(refreshToken);

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      accessToken,
      refreshToken
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Register endpoint
router.post('/register', validateInput, async (req, res) => {
  try {
    const { identifier, password, role = 'student', name, email, username } = req.body;

    // Check if user already exists
    const existingUser = users.find(u => 
      u.email === email || u.username === username
    );

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      id: `user_${Date.now()}`,
      email,
      username,
      name: name || username,
      role,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(newUser);

    // Store refresh token
    refreshTokens.push(refreshToken);

    res.status(201).json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      },
      accessToken,
      refreshToken
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Refresh token endpoint
router.post('/refresh', (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    // Check if refresh token exists
    if (!refreshTokens.includes(refreshToken)) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'fallback_secret');
    
    if (decoded.type !== 'refresh') {
      return res.status(403).json({ error: 'Invalid token type' });
    }

    // Find user
    const user = users.find(u => u.id === decoded.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    // Remove old refresh token and add new one
    const index = refreshTokens.indexOf(refreshToken);
    refreshTokens.splice(index, 1);
    refreshTokens.push(newRefreshToken);

    res.json({
      success: true,
      accessToken,
      refreshToken: newRefreshToken
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(403).json({ error: 'Invalid refresh token' });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken && refreshTokens.includes(refreshToken)) {
      const index = refreshTokens.indexOf(refreshToken);
      refreshTokens.splice(index, 1);
    }

    res.json({ success: true, message: 'Logged out successfully' });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Verify token endpoint
router.get('/verify', (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    // Find user
    const user = users.find(u => u.id === decoded.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(403).json({ error: 'Invalid token' });
  }
});

// Forgot password endpoint
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = users.find(u => u.email === email);
    if (!user) {
      // For security, don't reveal if email exists or not
      return res.json({ 
        success: true, 
        message: 'If the email exists, a reset OTP has been sent' 
      });
    }

    // Generate OTP (in production, send via email)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP (in production, store with expiration)
    user.resetOTP = otp;
    user.resetOTPExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    console.log(`🔐 Password Reset OTP for ${email}: ${otp}`);

    res.json({ 
      success: true, 
      message: 'Password reset OTP sent to your email',
      // Include OTP only for demo purposes
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// Reset password endpoint
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check OTP
    if (user.resetOTP !== otp || !user.resetOTPExpires || user.resetOTPExpires < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // Clear OTP
    delete user.resetOTP;
    delete user.resetOTPExpires;

    res.json({ 
      success: true, 
      message: 'Password reset successfully' 
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

module.exports = router;
